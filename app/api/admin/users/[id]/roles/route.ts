import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog, getUserRoles } from '@/lib/rbac'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const roles = await getUserRoles(supabase, id)
  return NextResponse.json(roles)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role_id, expires_at } = await request.json()
  if (!role_id) {
    return NextResponse.json({ error: 'role_id is required' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  const { data: existing } = await adminSupabase
    .from('user_roles')
    .select('id')
    .eq('user_id', targetUserId)
    .eq('role_id', role_id)
    .eq('is_active', true)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'User already has this role' }, { status: 409 })
  }

  const { data, error } = await adminSupabase
    .from('user_roles')
    .insert({
      user_id: targetUserId,
      role_id,
      assigned_by: user.id,
      assigned_at: new Date().toISOString(),
      expires_at: expires_at || null,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(supabase, {
    actor_id: user.id,
    actor_username: user.email,
    target_user_id: targetUserId,
    action: 'assign_role',
    resource: 'roles',
    resource_id: role_id,
    new_value: data,
  })

  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role_id } = await request.json()
  if (!role_id) {
    return NextResponse.json({ error: 'role_id is required' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  const { data: oldRecord } = await adminSupabase
    .from('user_roles')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('role_id', role_id)
    .eq('is_active', true)
    .single()

  if (!oldRecord) {
    return NextResponse.json({ error: 'Role assignment not found' }, { status: 404 })
  }

  const { error } = await adminSupabase
    .from('user_roles')
    .update({ is_active: false })
    .eq('user_id', targetUserId)
    .eq('role_id', role_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(supabase, {
    actor_id: user.id,
    actor_username: user.email,
    target_user_id: targetUserId,
    action: 'revoke_role',
    resource: 'roles',
    resource_id: role_id,
    old_value: oldRecord,
  })

  return NextResponse.json({ success: true })
}
