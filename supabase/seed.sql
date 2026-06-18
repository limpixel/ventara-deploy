-- ============================================================================
-- VENTARA DB SEED
-- Execute di Supabase SQL Editor (cukup sekali)
-- Cocok dengan schema yg ada di SQL Editor.
--
-- NOTE: Trigger `set_permission_name` otomatis mengisi kolom `name`
--       sebagai 'resource:action'. Jadi kolom `name` di-skip di INSERT.
-- ============================================================================

-- ============================================================================
-- 1. SYSTEM ROLES
-- ============================================================================
INSERT INTO roles (name, display_name, description, is_system, is_active)
VALUES
    ('superadmin', 'Super Administrator', 'Akses penuh ke seluruh sistem termasuk konfigurasi.', TRUE, TRUE),
    ('admin',      'Administrator',       'Kelola user, billing, dan pantau semua aktivitas.', TRUE, TRUE),
    ('analyst',    'Analyst',             'Dapat training model dan generate forecast.', TRUE, TRUE),
    ('viewer',     'Viewer',              'Hanya bisa melihat forecast dan data historis.', TRUE, TRUE),
    ('user',       'User',                'Role default. Akses ke resource milik sendiri saja.', TRUE, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. PERMISSIONS
-- ============================================================================
-- Kolom `name` diisi otomatis oleh trigger `set_permission_name`.
INSERT INTO permissions (resource, action, description) VALUES

    -- Users
    ('users',           'create',   'Buat user baru'),
    ('users',           'read',     'Lihat data user'),
    ('users',           'update',   'Edit profil user'),
    ('users',           'delete',   'Hapus user'),
    ('users',           'manage',   'Kelola semua aspek user'),

    -- Roles
    ('roles',           'create',   'Buat role baru'),
    ('roles',           'read',     'Lihat daftar role & permission'),
    ('roles',           'update',   'Edit role & permission'),
    ('roles',           'delete',   'Hapus role'),
    ('roles',           'manage',   'Kelola semua aspek RBAC'),

    -- Datasets
    ('datasets',        'create',   'Upload dataset'),
    ('datasets',        'read',     'Lihat dataset milik sendiri'),
    ('datasets',        'update',   'Edit metadata dataset'),
    ('datasets',        'delete',   'Hapus dataset milik sendiri'),
    ('datasets',        'manage',   'Kelola dataset semua user'),
    ('datasets',        'export',   'Export / download dataset'),

    -- Historical data
    ('historical_data', 'read',     'Lihat data historis milik sendiri'),
    ('historical_data', 'export',   'Export data historis'),
    ('historical_data', 'manage',   'Kelola data historis semua user'),

    -- Training jobs
    ('training_jobs',   'create',   'Jalankan training baru'),
    ('training_jobs',   'read',     'Lihat status training job'),
    ('training_jobs',   'update',   'Cancel / retry training job'),
    ('training_jobs',   'delete',   'Hapus training job'),
    ('training_jobs',   'manage',   'Kelola training job semua user'),

    -- Model registry
    ('model_registry',  'read',     'Lihat model yang tersedia'),
    ('model_registry',  'delete',   'Hapus model'),
    ('model_registry',  'manage',   'Kelola model semua user'),

    -- Generation jobs
    ('generation_jobs', 'create',   'Jalankan forecast baru'),
    ('generation_jobs', 'read',     'Lihat status generation job'),
    ('generation_jobs', 'update',   'Cancel generation job'),
    ('generation_jobs', 'manage',   'Kelola generation job semua user'),

    -- Forecast results
    ('forecast_results','read',     'Lihat hasil forecast milik sendiri'),
    ('forecast_results','delete',   'Hapus hasil forecast'),
    ('forecast_results','export',   'Download hasil forecast'),
    ('forecast_results','manage',   'Kelola forecast semua user'),

    -- Billing
    ('billing',         'read',     'Lihat info tier & penggunaan storage'),
    ('billing',         'update',   'Upgrade / downgrade tier user'),
    ('billing',         'manage',   'Kelola billing semua user'),

    -- System
    ('system',          'read',     'Lihat konfigurasi sistem'),
    ('system',          'manage',   'Kelola konfigurasi sistem (superadmin)')

ON CONFLICT (resource, action) DO NOTHING;

-- ============================================================================
-- 3. ROLE → PERMISSION MAPPINGS
-- ============================================================================

-- --------------------------------------------------------------------------
-- SUPERVISOR: semua permission (full cross-join)
-- --------------------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM roles r, permissions p
WHERE r.name = 'superadmin'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- --------------------------------------------------------------------------
-- ADMIN: manage di resource bisnis, read-only untuk sisanya
-- --------------------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM roles r
JOIN permissions p ON (p.resource, p.action) IN (
    ('users',           'manage'),
    ('roles',           'read'),
    ('datasets',        'manage'),
    ('historical_data', 'manage'),
    ('training_jobs',   'manage'),
    ('model_registry',  'manage'),
    ('generation_jobs', 'manage'),
    ('forecast_results','manage'),
    ('billing',         'manage'),
    ('system',          'read')
)
WHERE r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- --------------------------------------------------------------------------
-- ANALYST: full akses ke resource teknis milik sendiri + export
-- --------------------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM roles r
JOIN permissions p ON (p.resource, p.action) IN (
    ('datasets',        'create'),
    ('datasets',        'read'),
    ('datasets',        'update'),
    ('datasets',        'delete'),
    ('datasets',        'export'),
    ('historical_data', 'read'),
    ('historical_data', 'export'),
    ('training_jobs',   'create'),
    ('training_jobs',   'read'),
    ('training_jobs',   'update'),
    ('model_registry',  'read'),
    ('model_registry',  'delete'),
    ('generation_jobs', 'create'),
    ('generation_jobs', 'read'),
    ('generation_jobs', 'update'),
    ('forecast_results','read'),
    ('forecast_results','delete'),
    ('forecast_results','export'),
    ('billing',         'read')
)
WHERE r.name = 'analyst'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- --------------------------------------------------------------------------
-- VIEWER: read-only + export
-- --------------------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM roles r
JOIN permissions p ON (p.resource, p.action) IN (
    ('historical_data', 'read'),
    ('historical_data', 'export'),
    ('model_registry',  'read'),
    ('forecast_results','read'),
    ('forecast_results','export'),
    ('billing',         'read')
)
WHERE r.name = 'viewer'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- --------------------------------------------------------------------------
-- USER (default): akses resource milik sendiri, tanpa export
-- --------------------------------------------------------------------------
INSERT INTO role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM roles r
JOIN permissions p ON (p.resource, p.action) IN (
    ('datasets',        'create'),
    ('datasets',        'read'),
    ('datasets',        'update'),
    ('datasets',        'delete'),
    ('historical_data', 'read'),
    ('training_jobs',   'create'),
    ('training_jobs',   'read'),
    ('training_jobs',   'update'),
    ('model_registry',  'read'),
    ('generation_jobs', 'create'),
    ('generation_jobs', 'read'),
    ('generation_jobs', 'update'),
    ('forecast_results','read'),
    ('forecast_results','delete'),
    ('billing',         'read')
)
WHERE r.name = 'user'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- ============================================================================
-- 4. VERIFIKASI
-- ============================================================================
SELECT 'Roles'         AS entity, COUNT(*)::TEXT AS total FROM roles
UNION ALL
SELECT 'Permissions',  COUNT(*)::TEXT FROM permissions
UNION ALL
SELECT 'Role→Perm',    COUNT(*)::TEXT FROM role_permissions
ORDER BY entity;

-- ============================================================================
-- 5. QUERY CEPAT UNTUK ADMIN
-- ============================================================================

-- Lihat permission per role:
-- SELECT r.name AS role, p.resource, p.action
-- FROM roles r
-- JOIN role_permissions rp ON rp.role_id = r.id
-- JOIN permissions p ON p.id = rp.permission_id
-- ORDER BY r.name, p.resource, p.action;

-- Lihat role user tertentu:
-- SELECT r.name, r.display_name, ur.assigned_at, ur.expires_at
-- FROM user_roles ur
-- JOIN roles r ON r.id = ur.role_id
-- WHERE ur.user_id = '<user_uuid>' AND ur.is_active = TRUE;

-- Cek permission user:
-- SELECT * FROM v_user_effective_permissions WHERE user_id = '<user_uuid>';
