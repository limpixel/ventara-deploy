import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/rbac'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: permissions, error } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(permissions)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { resource, action, name, description } = await request.json()

  if (!resource || !action) {
    return NextResponse.json({ error: 'resource and action are required' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('permissions')
    .insert({ resource, action, name: name || null, description: description || null })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Permission already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await createAuditLog(supabase, {
    actor_id: user.id,
    actor_username: user.email,
    action: 'create',
    resource: 'permissions',
    resource_id: data.id,
    new_value: data,
  })

  return NextResponse.json(data, { status: 201 })
}
