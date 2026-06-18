import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/rbac'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roles, error } = await supabase
    .from('roles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(roles)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, display_name, description } = await request.json()

  if (!name || !display_name) {
    return NextResponse.json({ error: 'Name and display_name are required' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  const { data, error } = await adminSupabase
    .from('roles')
    .insert({
      name,
      display_name,
      description: description || null,
      is_system: false,
      is_active: true,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await createAuditLog(supabase, {
    actor_id: user.id,
    actor_username: user.email,
    action: 'create',
    resource: 'roles',
    resource_id: data.id,
    new_value: data,
  })

  return NextResponse.json(data, { status: 201 })
}
