import { type SupabaseClient } from '@supabase/supabase-js'
import type { Resource, Action, Role, Permission } from '@/app/types/rbac.types'

export async function getUserRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<Role[]> {
  const { data } = await supabase
    .from('user_roles')
    .select('role_id, roles!inner(id, name, display_name, description, is_system, is_active)')
    .eq('user_id', userId)
    .eq('is_active', true)

  return (data as any[])?.map((ur) => ur.roles) ?? []
}

export async function getRolePermissions(
  supabase: SupabaseClient,
  roleId: string
): Promise<Permission[]> {
  const { data } = await supabase
    .from('role_permissions')
    .select('permission_id, permissions!inner(id, resource, action, name, description, created_at)')
    .eq('role_id', roleId)

  return (data as any[])?.map((rp) => rp.permissions) ?? []
}

export async function getUserPermissions(
  supabase: SupabaseClient,
  userId: string
): Promise<Permission[]> {
  const roles = await getUserRoles(supabase, userId)
  const roleIds = roles.map(r => r.id)

  if (roleIds.length === 0) return []

  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select('permissions!inner(id, resource, action, name, description, created_at)')
    .in('role_id', roleIds)

  const permissions: Permission[] = (rolePerms as any[])?.map((rp) => rp.permissions) ?? []

  const { data: overrides } = await supabase
    .from('user_permission_overrides')
    .select('permission_id, is_granted')
    .eq('user_id', userId)

  const overrideMap = new Map(overrides?.map(o => [o.permission_id, o.is_granted]) ?? [])

  const { data: allPerms } = await supabase
    .from('permissions')
    .select('id, resource, action, name, description, created_at')

  return (allPerms ?? []).filter(p => {
    const override = overrideMap.get(p.id)
    if (override !== undefined) return override
    return permissions.some(rp => rp.id === p.id)
  })
}

export async function checkPermission(
  supabase: SupabaseClient,
  userId: string,
  resource: Resource,
  action: Action
): Promise<boolean> {
  const permissions = await getUserPermissions(supabase, userId)
  return permissions.some(p => p.resource === resource && p.action === action)
}

export async function isUserAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const roles = await getUserRoles(supabase, userId)
  return roles.some(r => r.name === 'admin' || r.name === 'superadmin')
}

export async function requireAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const admin = await isUserAdmin(supabase, userId)
  if (!admin) throw new Error('Forbidden: Admin access required')
}

export async function requirePermission(
  supabase: SupabaseClient,
  userId: string,
  resource: Resource,
  action: Action
): Promise<void> {
  const has = await checkPermission(supabase, userId, resource, action)
  if (!has) throw new Error(`Forbidden: Missing ${action} on ${resource}`)
}

export async function createAuditLog(
  supabase: SupabaseClient,
  log: {
    actor_id?: string | null
    actor_username?: string | null
    target_user_id?: string | null
    action: string
    resource?: string | null
    resource_id?: string | null
    old_value?: unknown
    new_value?: unknown
    ip_address?: string | null
    user_agent?: string | null
    metadata?: unknown
  }
) {
  await supabase.from('audit_logs').insert({
    actor_id: log.actor_id ?? null,
    actor_username: log.actor_username ?? null,
    target_user_id: log.target_user_id ?? null,
    action: log.action,
    resource: log.resource ?? null,
    resource_id: log.resource_id ?? null,
    old_value: log.old_value ?? null,
    new_value: log.new_value ?? null,
    ip_address: log.ip_address ?? null,
    user_agent: log.user_agent ?? null,
    metadata: log.metadata ?? null,
  })
}
