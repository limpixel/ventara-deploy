import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/rbac'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(role)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const adminSupabase = createAdminClient()

  const { data: oldRole } = await adminSupabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .single()

  const { data, error } = await adminSupabase
    .from('roles')
    .update({
      name: body.name,
      display_name: body.display_name,
      description: body.description,
      is_active: body.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(supabase, {
    actor_id: user.id,
    actor_username: user.email,
    action: 'update',
    resource: 'roles',
    resource_id: id,
    old_value: oldRole,
    new_value: data,
  })

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminSupabase = createAdminClient()

  const { data: role } = await adminSupabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .single()

  if (role?.is_system) {
    return NextResponse.json({ error: 'Cannot delete system role' }, { status: 400 })
  }

  await adminSupabase.from('role_permissions').delete().eq('role_id', id)
  await adminSupabase.from('user_roles').delete().eq('role_id', id)

  const { error } = await adminSupabase.from('roles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(supabase, {
    actor_id: user.id,
    actor_username: user.email,
    action: 'delete',
    resource: 'roles',
    resource_id: id,
    old_value: role,
  })

  return NextResponse.json({ success: true })
}
