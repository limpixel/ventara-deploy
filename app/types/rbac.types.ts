export type Resource =
  | 'users'
  | 'roles'
  | 'datasets'
  | 'historical_data'
  | 'training_jobs'
  | 'model_registry'
  | 'generation_jobs'
  | 'forecast_results'
  | 'billing'
  | 'system'

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import'

export interface Role {
  id: string
  name: string
  display_name: string
  description: string | null
  is_system: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  resource: Resource
  action: Action
  name: string | null
  description: string | null
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  assigned_by: string | null
  assigned_at: string
  expires_at: string | null
  is_active: boolean
}

export interface UserPermissionOverride {
  id: string
  user_id: string
  permission_id: string
  is_granted: boolean
  reason: string | null
  granted_by: string | null
  granted_at: string
  expires_at: string | null
}

export interface AuditLog {
  id: number
  actor_id: string | null
  actor_username: string | null
  target_user_id: string | null
  action: string
  resource: Resource | null
  resource_id: string | null
  old_value: any
  new_value: any
  ip_address: string | null
  user_agent: string | null
  metadata: any
  created_at: string
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[]
}

export interface UserWithRoles {
  id: string
  username: string
  email: string
  display_name: string | null
  is_active: boolean
  roles: Role[]
  created_at: string
}
