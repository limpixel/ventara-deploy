import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/rbac'
import { NextResponse } from 'next/server'

type RoleDef = { name: string; display_name: string; description: string; is_system: boolean }
type PermDef = { resource: string; action: string; description: string }

const ROLES: RoleDef[] = [
  { name: 'superadmin', display_name: 'Super Administrator', description: 'Akses penuh ke seluruh sistem termasuk konfigurasi.', is_system: true },
  { name: 'admin',      display_name: 'Administrator',       description: 'Kelola user, billing, dan pantau semua aktivitas.', is_system: true },
  { name: 'analyst',    display_name: 'Analyst',             description: 'Dapat training model dan generate forecast.', is_system: true },
  { name: 'viewer',     display_name: 'Viewer',              description: 'Hanya bisa melihat forecast dan data historis.', is_system: true },
  { name: 'user',       display_name: 'User',                description: 'Role default. Akses ke resource milik sendiri saja.', is_system: true },
]

const ALL_PERMISSIONS: PermDef[] = [
  { resource: 'users',           action: 'create',   description: 'Buat user baru' },
  { resource: 'users',           action: 'read',     description: 'Lihat data user' },
  { resource: 'users',           action: 'update',   description: 'Edit profil user' },
  { resource: 'users',           action: 'delete',   description: 'Hapus user' },
  { resource: 'users',           action: 'manage',   description: 'Kelola semua aspek user' },
  { resource: 'roles',           action: 'create',   description: 'Buat role baru' },
  { resource: 'roles',           action: 'read',     description: 'Lihat daftar role & permission' },
  { resource: 'roles',           action: 'update',   description: 'Edit role & permission' },
  { resource: 'roles',           action: 'delete',   description: 'Hapus role' },
  { resource: 'roles',           action: 'manage',   description: 'Kelola semua aspek RBAC' },
  { resource: 'datasets',        action: 'create',   description: 'Upload dataset' },
  { resource: 'datasets',        action: 'read',     description: 'Lihat dataset milik sendiri' },
  { resource: 'datasets',        action: 'update',   description: 'Edit metadata dataset' },
  { resource: 'datasets',        action: 'delete',   description: 'Hapus dataset milik sendiri' },
  { resource: 'datasets',        action: 'manage',   description: 'Kelola dataset semua user' },
  { resource: 'datasets',        action: 'export',   description: 'Export / download dataset' },
  { resource: 'historical_data', action: 'read',     description: 'Lihat data historis milik sendiri' },
  { resource: 'historical_data', action: 'export',   description: 'Export data historis' },
  { resource: 'historical_data', action: 'manage',   description: 'Kelola data historis semua user' },
  { resource: 'training_jobs',   action: 'create',   description: 'Jalankan training baru' },
  { resource: 'training_jobs',   action: 'read',     description: 'Lihat status training job' },
  { resource: 'training_jobs',   action: 'update',   description: 'Cancel / retry training job' },
  { resource: 'training_jobs',   action: 'delete',   description: 'Hapus training job' },
  { resource: 'training_jobs',   action: 'manage',   description: 'Kelola training job semua user' },
  { resource: 'model_registry',  action: 'read',     description: 'Lihat model yang tersedia' },
  { resource: 'model_registry',  action: 'delete',   description: 'Hapus model' },
  { resource: 'model_registry',  action: 'manage',   description: 'Kelola model semua user' },
  { resource: 'generation_jobs', action: 'create',   description: 'Jalankan forecast baru' },
  { resource: 'generation_jobs', action: 'read',     description: 'Lihat status generation job' },
  { resource: 'generation_jobs', action: 'update',   description: 'Cancel generation job' },
  { resource: 'generation_jobs', action: 'manage',   description: 'Kelola generation job semua user' },
  { resource: 'forecast_results',action: 'read',     description: 'Lihat hasil forecast milik sendiri' },
  { resource: 'forecast_results',action: 'delete',   description: 'Hapus hasil forecast' },
  { resource: 'forecast_results',action: 'export',   description: 'Download hasil forecast' },
  { resource: 'forecast_results',action: 'manage',   description: 'Kelola forecast semua user' },
  { resource: 'billing',         action: 'read',     description: 'Lihat info tier & penggunaan storage' },
  { resource: 'billing',         action: 'update',   description: 'Upgrade / downgrade tier user' },
  { resource: 'billing',         action: 'manage',   description: 'Kelola billing semua user' },
  { resource: 'system',          action: 'read',     description: 'Lihat konfigurasi sistem' },
  { resource: 'system',          action: 'manage',   description: 'Kelola konfigurasi sistem (superadmin)' },
]

const ADMIN_PERMS: [string, string][] = [
  ['users',           'manage'],
  ['roles',           'read'],
  ['datasets',        'manage'],
  ['historical_data', 'manage'],
  ['training_jobs',   'manage'],
  ['model_registry',  'manage'],
  ['generation_jobs', 'manage'],
  ['forecast_results','manage'],
  ['billing',         'manage'],
  ['system',          'read'],
]

const ANALYST_PERMS: [string, string][] = [
  ['datasets',        'create'],
  ['datasets',        'read'],
  ['datasets',        'update'],
  ['datasets',        'delete'],
  ['datasets',        'export'],
  ['historical_data', 'read'],
  ['historical_data', 'export'],
  ['training_jobs',   'create'],
  ['training_jobs',   'read'],
  ['training_jobs',   'update'],
  ['model_registry',  'read'],
  ['model_registry',  'delete'],
  ['generation_jobs', 'create'],
  ['generation_jobs', 'read'],
  ['generation_jobs', 'update'],
  ['forecast_results','read'],
  ['forecast_results','delete'],
  ['forecast_results','export'],
  ['billing',         'read'],
]

const VIEWER_PERMS: [string, string][] = [
  ['historical_data', 'read'],
  ['historical_data', 'export'],
  ['model_registry',  'read'],
  ['forecast_results','read'],
  ['forecast_results','export'],
  ['billing',         'read'],
]

const USER_PERMS: [string, string][] = [
  ['datasets',        'create'],
  ['datasets',        'read'],
  ['datasets',        'update'],
  ['datasets',        'delete'],
  ['historical_data', 'read'],
  ['training_jobs',   'create'],
  ['training_jobs',   'read'],
  ['training_jobs',   'update'],
  ['model_registry',  'read'],
  ['generation_jobs', 'create'],
  ['generation_jobs', 'read'],
  ['generation_jobs', 'update'],
  ['forecast_results','read'],
  ['forecast_results','delete'],
  ['billing',         'read'],
]

async function getOrCreateRole(adminSupabase: any, role: RoleDef, actorId: string): Promise<string | null> {
  const { data: existing } = await adminSupabase.from('roles').select('id').eq('name', role.name).maybeSingle()
  if (existing) return existing.id

  const { data, error } = await adminSupabase
    .from('roles')
    .insert({ ...role, is_active: true, created_by: actorId })
    .select('id')
    .single()

  if (error) { console.error(`Role ${role.name}:`, error); return null }
  return data.id
}

async function getOrCreatePermission(adminSupabase: any, perm: PermDef): Promise<string | null> {
  const { data: existing } = await adminSupabase
    .from('permissions')
    .select('id')
    .eq('resource', perm.resource)
    .eq('action', perm.action)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await adminSupabase
    .from('permissions')
    .insert({ resource: perm.resource, action: perm.action, description: perm.description })
    .select('id')
    .single()

  if (error) { console.error(`Perm ${perm.resource}:${perm.action}:`, error); return null }
  return data.id
}

async function ensurePerm(adminSupabase: any, roleId: string, permissionId: string) {
  const { data: existing } = await adminSupabase
    .from('role_permissions')
    .select('id')
    .eq('role_id', roleId)
    .eq('permission_id', permissionId)
    .maybeSingle()

  if (!existing) {
    await adminSupabase.from('role_permissions').insert({
      role_id: roleId,
      permission_id: permissionId,
      granted_at: new Date().toISOString(),
    })
  }
}

async function assignPerms(adminSupabase: any, roleId: string, perms: [string, string][], permIds: Record<string, string>) {
  for (const [resource, action] of perms) {
    const pid = permIds[`${resource}:${action}`]
    if (pid) await ensurePerm(adminSupabase, roleId, pid)
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminSupabase = createAdminClient()
    const results: Record<string, any> = {}

    // ── Roles ──
    const roleIds: Record<string, string> = {}
    for (const role of ROLES) {
      const id = await getOrCreateRole(adminSupabase, role, user.id)
      if (id) roleIds[role.name] = id
    }
    results.roles = Object.keys(roleIds)

    // ── Permissions ──
    const permIds: Record<string, string> = {}
    for (const perm of ALL_PERMISSIONS) {
      const id = await getOrCreatePermission(adminSupabase, perm)
      if (id) permIds[`${perm.resource}:${perm.action}`] = id
    }
    results.permissions = Object.keys(permIds).length

    // ── Assignments ──
    if (roleIds.superadmin) {
      for (const pid of Object.values(permIds)) {
        await ensurePerm(adminSupabase, roleIds.superadmin, pid)
      }
    }
    if (roleIds.admin)   await assignPerms(adminSupabase, roleIds.admin, ADMIN_PERMS, permIds)
    if (roleIds.analyst) await assignPerms(adminSupabase, roleIds.analyst, ANALYST_PERMS, permIds)
    if (roleIds.viewer)  await assignPerms(adminSupabase, roleIds.viewer, VIEWER_PERMS, permIds)
    if (roleIds.user)    await assignPerms(adminSupabase, roleIds.user, USER_PERMS, permIds)
    results.assignments_done = true

    // ── Admin user ──
    const ADMIN_EMAIL = 'admin@ventara.app'
    const ADMIN_PASSWORD = 'Admin123!'

    const { data: existingAuthUsers } = await adminSupabase.auth.admin.listUsers()
    const existingAdmin = existingAuthUsers?.users.find(u => u.email === ADMIN_EMAIL)

    let adminUserId: string | null = null

    if (!existingAdmin) {
      const { data: createdUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { username: 'admin', full_name: 'Administrator', role: 'superadmin' },
      })
      if (!createError && createdUser?.user) adminUserId = createdUser.user.id
    } else {
      adminUserId = existingAdmin.id
      await adminSupabase.auth.admin.updateUserById(adminUserId, {
        password: ADMIN_PASSWORD,
        user_metadata: { username: 'admin', full_name: 'Administrator', role: 'superadmin' },
      })
    }

    if (adminUserId) {
      const { data: existingPublic } = await adminSupabase.from('users').select('id').eq('id', adminUserId).maybeSingle()
      if (!existingPublic) {
        await adminSupabase.from('users').insert({
          id: adminUserId, username: 'admin', email: ADMIN_EMAIL, display_name: 'Administrator',
          tier: 'gratis', storage_limit_bytes: 10 * 1024 * 1024, storage_used_bytes: 0,
          is_active: true, is_suspended: false,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        })
      }

      const { data: existingUserRoles } = await adminSupabase
        .from('user_roles').select('id').eq('user_id', adminUserId).eq('is_active', true)

      if (!existingUserRoles || existingUserRoles.length === 0) {
        const rolesToAssign = ['superadmin', 'admin'].filter(r => roleIds[r]).map(r => roleIds[r])
        for (const rid of rolesToAssign) {
          await adminSupabase.from('user_roles').insert({
            user_id: adminUserId, role_id: rid, assigned_by: user.id,
            assigned_at: new Date().toISOString(), is_active: true,
          })
        }
      }
      results.admin_user = adminUserId
    }

    await createAuditLog(supabase, {
      actor_id: user.id, actor_username: user.email,
      action: 'seed', resource: 'system',
      metadata: { type: 'database_seed', details: results },
    })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      details: {
        roles: Object.keys(roleIds).length,
        permissions: Object.keys(permIds).length,
        admin_user: !!adminUserId,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 })
  }
}
