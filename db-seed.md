# Database Seed Data

Cocok dengan schema di Supabase SQL Editor.

## Custom Types (Enums)

Sudah dibuat di schema, jangan di-create ulang. Cek dulu di Supabase → Database → Types.

| Type | Values |
|------|--------|
| `user_tier` | `gratis`, `basic`, `pro`, `business` |
| `job_status` | `pending`, `running`, `done`, `error`, `cancelled` |
| `variable_name` | `WS10M`, `WD10M`, `RH2M`, `T2M`, `PS` |
| `model_type` | `ml`, `dl`, `ensemble` |
| `metric_type` | `train`, `test`, `ensemble` |
| `generate_mode` | `general`, `best` |
| `upload_status` | `uploading`, `validating`, `ready`, `error` |
| `permission_action` | `create`, `read`, `update`, `delete`, `manage`, `approve`, `reject`, `export`, `import` |
| `resource_name` | `users`, `roles`, `datasets`, `historical_data`, `training_jobs`, `model_registry`, `generation_jobs`, `forecast_results`, `billing`, `system` |

## Roles (5)

| name | display_name | description | is_system |
|------|-------------|-------------|-----------|
| `superadmin` | Super Administrator | Akses penuh ke seluruh sistem termasuk konfigurasi. | true |
| `admin` | Administrator | Kelola user, billing, dan pantau semua aktivitas. | true |
| `analyst` | Analyst | Dapat training model dan generate forecast. | true |
| `viewer` | Viewer | Hanya bisa melihat forecast dan data historis. | true |
| `user` | User | Role default. Akses ke resource milik sendiri saja. | true |

## Permissions (42)

### users (5)
| action | description |
|--------|-------------|
| create | Buat user baru |
| read | Lihat data user |
| update | Edit profil user |
| delete | Hapus user |
| manage | Kelola semua aspek user |

### roles (5)
| action | description |
|--------|-------------|
| create | Buat role baru |
| read | Lihat daftar role & permission |
| update | Edit role & permission |
| delete | Hapus role |
| manage | Kelola semua aspek RBAC |

### datasets (6)
| action | description |
|--------|-------------|
| create | Upload dataset |
| read | Lihat dataset milik sendiri |
| update | Edit metadata dataset |
| delete | Hapus dataset milik sendiri |
| manage | Kelola dataset semua user |
| export | Export / download dataset |

### historical_data (3)
| action | description |
|--------|-------------|
| read | Lihat data historis milik sendiri |
| export | Export data historis |
| manage | Kelola data historis semua user |

### training_jobs (5)
| action | description |
|--------|-------------|
| create | Jalankan training baru |
| read | Lihat status training job |
| update | Cancel / retry training job |
| delete | Hapus training job |
| manage | Kelola training job semua user |

### model_registry (3)
| action | description |
|--------|-------------|
| read | Lihat model yang tersedia |
| delete | Hapus model |
| manage | Kelola model semua user |

### generation_jobs (4)
| action | description |
|--------|-------------|
| create | Jalankan forecast baru |
| read | Lihat status generation job |
| update | Cancel generation job |
| manage | Kelola generation job semua user |

### forecast_results (4)
| action | description |
|--------|-------------|
| read | Lihat hasil forecast milik sendiri |
| delete | Hapus hasil forecast |
| export | Download hasil forecast |
| manage | Kelola forecast semua user |

### billing (3)
| action | description |
|--------|-------------|
| read | Lihat info tier & penggunaan storage |
| update | Upgrade / downgrade tier user |
| manage | Kelola billing semua user |

### system (2)
| action | description |
|--------|-------------|
| read | Lihat konfigurasi sistem |
| manage | Kelola konfigurasi sistem (superadmin) |

## Role → Permission

### superadmin → Semua (42)
Full cross-join: superadmin dapet **semua** permission.

### admin → 10 permission
`manage` di users, datasets, historical_data, training_jobs, model_registry, generation_jobs, forecast_results, billing + `read` di roles, system.

### analyst → 19 permission
Full teknis: create/read/update/delete/export datasets + read/export historical_data + create/read/update training_jobs + read/delete model_registry + create/read/update generation_jobs + read/delete/export forecast_results + read billing.

### viewer → 6 permission
read/export historical_data + read model_registry + read/export forecast_results + read billing.

### user → 14 permission
Default: create/read/update/delete datasets + read historical_data + create/read/update training_jobs + read model_registry + create/read/update generation_jobs + read/delete forecast_results + read billing.

## Cara Pakai

### SQL Editor (rekomendasi)
```bash
1. Buka Supabase Dashboard → SQL Editor
2. Copy-paste isi `supabase/seed.sql`
3. Execute
```

### Auto-assign default role
Schema punya trigger `assign_default_role` yang otomatis assign role `user` saat INSERT ke tabel `users`. Jadi user baru langsung dapet role default tanpa manual assign.

### Cek hasil
```sql
SELECT * FROM v_user_effective_permissions WHERE user_id = '<user_uuid>';
SELECT * FROM v_user_roles_summary WHERE user_id = '<user_uuid>';
```
