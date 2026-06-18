import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog, getRolePermissions } from '@/lib/rbac'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permissions = await getRolePermissions(supabase, id)
  return NextResponse.json(permissions)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { permission_ids } = await request.json()
  if (!Array.isArray(permission_ids)) {
    return NextResponse.json({ error: 'permission_ids must be an array' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  const oldPermissions = await getRolePermissions(supabase, id)

  await adminSupabase.from('role_permissions').delete().eq('role_id', id)

  if (permission_ids.length > 0) {
    const inserts = permission_ids.map((permission_id: string) => ({
      role_id: id,
      permission_id,
      granted_by: user.id,
      granted_at: new Date().toISOString(),
    }))

    const { error } = await adminSupabase.from('role_permissions').insert(inserts)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await createAuditLog(supabase, {
    actor_id: user.id,
    actor_username: user.email,
    action: 'update',
    resource: 'roles',
    resource_id: id,
    old_value: oldPermissions,
    new_value: permission_ids,
    metadata: { type: 'permissions_update' },
  })

  return NextResponse.json({ success: true })
}
