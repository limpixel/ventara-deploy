import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/rbac'
import { NextResponse } from 'next/server'

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

  const { data: oldPerm } = await adminSupabase
    .from('permissions')
    .select('*')
    .eq('id', id)
    .single()

  const { data, error } = await adminSupabase
    .from('permissions')
    .update({
      name: body.name,
      description: body.description,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(supabase, {
    actor_id: user.id,
    actor_username: user.email,
    action: 'update',
    resource: 'permissions',
    resource_id: id,
    old_value: oldPerm,
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

  await adminSupabase.from('role_permissions').delete().eq('permission_id', id)
  await adminSupabase.from('user_permission_overrides').delete().eq('permission_id', id)

  const { error } = await adminSupabase.from('permissions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(supabase, {
    actor_id: user.id,
    actor_username: user.email,
    action: 'delete',
    resource: 'permissions',
    resource_id: id,
  })

  return NextResponse.json({ success: true })
}
