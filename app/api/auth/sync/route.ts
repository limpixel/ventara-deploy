import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, email, name, role, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: username, email, password' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminClient()

    let authUserId: string

    const { data: existingUsers } = await adminSupabase.auth.admin.listUsers()
    const existingAuthUser = existingUsers?.users.find(u => u.email === email)

    if (existingAuthUser) {
      authUserId = existingAuthUser.id
      await adminSupabase.auth.admin.updateUserById(authUserId, {
        password,
        user_metadata: { username, full_name: name, role },
      })
    } else {
      const { data, error } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, full_name: name, role },
      })

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      authUserId = data.user.id
    }

    const { data: existingPublicUser } = await adminSupabase
      .from('users')
      .select('id')
      .eq('id', authUserId)
      .maybeSingle()

    if (!existingPublicUser) {
      await adminSupabase.from('users').insert({
        id: authUserId,
        username,
        email,
        display_name: name || username,
        tier: 'gratis',
        storage_limit_bytes: 10 * 1024 * 1024,
        storage_used_bytes: 0,
        is_active: true,
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    const { data: userRoles } = await adminSupabase
      .from('user_roles')
      .select('id')
      .eq('user_id', authUserId)
      .eq('is_active', true)

    if (!userRoles || userRoles.length === 0) {
      const targetRole = role === 'admin' ? 'admin' : 'user'

      const { data: defaultRole } = await adminSupabase
        .from('roles')
        .select('id')
        .eq('name', targetRole)
        .eq('is_active', true)
        .maybeSingle()

      if (defaultRole) {
        await adminSupabase.from('user_roles').insert({
          user_id: authUserId,
          role_id: defaultRole.id,
          is_active: true,
          assigned_at: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      user_id: authUserId,
    })
  } catch (error) {
    console.error('Auth sync error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
