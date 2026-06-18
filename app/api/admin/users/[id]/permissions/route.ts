import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/rbac'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const permissions = await getUserPermissions(supabase, id)
  return NextResponse.json(permissions)
}
