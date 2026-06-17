## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `username` | `varchar` |  Unique |
| `email` | `varchar` |  Unique |
| `password_hash` | `varchar` |  |
| `display_name` | `varchar` |  Nullable |
| `tier` | `user_tier` |  |
| `storage_limit_bytes` | `int8` |  |
| `storage_used_bytes` | `int8` |  |
| `is_active` | `bool` |  |
| `is_suspended` | `bool` |  |
| `suspension_reason` | `text` |  Nullable |
| `last_login_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `varchar` |  Unique |
| `display_name` | `varchar` |  |
| `description` | `text` |  Nullable |
| `is_system` | `bool` |  |
| `is_active` | `bool` |  |
| `created_by` | `uuid` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `permissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `resource` | `resource_name` |  |
| `action` | `permission_action` |  |
| `name` | `varchar` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `role_permissions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `role_id` | `uuid` |  |
| `permission_id` | `uuid` |  |
| `granted_by` | `uuid` |  Nullable |
| `granted_at` | `timestamptz` |  |

## Table `user_roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `role_id` | `uuid` |  |
| `assigned_by` | `uuid` |  Nullable |
| `assigned_at` | `timestamptz` |  |
| `expires_at` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  |

## Table `user_permission_overrides`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `permission_id` | `uuid` |  |
| `is_granted` | `bool` |  |
| `reason` | `text` |  Nullable |
| `granted_by` | `uuid` |  Nullable |
| `granted_at` | `timestamptz` |  |
| `expires_at` | `timestamptz` |  Nullable |

## Table `audit_logs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary |
| `actor_id` | `uuid` |  Nullable |
| `actor_username` | `varchar` |  Nullable |
| `target_user_id` | `uuid` |  Nullable |
| `action` | `varchar` |  |
| `resource` | `resource_name` |  Nullable |
| `resource_id` | `uuid` |  Nullable |
| `old_value` | `jsonb` |  Nullable |
| `new_value` | `jsonb` |  Nullable |
| `ip_address` | `inet` |  Nullable |
| `user_agent` | `text` |  Nullable |
| `metadata` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `datasets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `original_filename` | `varchar` |  |
| `stored_path` | `varchar` |  |
| `file_hash` | `varchar` |  Nullable |
| `file_size_bytes` | `int8` |  |
| `row_count` | `int4` |  Nullable |
| `column_count` | `int4` |  Nullable |
| `status` | `upload_status` |  |
| `is_active` | `bool` |  |
| `error_message` | `text` |  Nullable |
| `trained_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `dataset_columns`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `dataset_id` | `uuid` |  |
| `column_name` | `varchar` |  |
| `column_index` | `int2` |  |
| `data_type` | `varchar` |  Nullable |
| `is_required` | `bool` |  |
| `nullable_count` | `int4` |  Nullable |
| `unique_count` | `int4` |  Nullable |
| `min_value` | `float8` |  Nullable |
| `max_value` | `float8` |  Nullable |
| `mean_value` | `float8` |  Nullable |
| `std_value` | `float8` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `historical_data`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary |
| `dataset_id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `row_index` | `int4` |  |
| `recorded_at` | `timestamptz` |  |
| `year` | `int2` |  |
| `month` | `int2` |  |
| `day` | `int2` |  |
| `hour` | `int2` |  |
| `ws10m` | `float8` |  Nullable |
| `wd10m` | `float8` |  Nullable |
| `rh2m` | `float8` |  Nullable |
| `t2m` | `float8` |  Nullable |
| `ps` | `float8` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `training_jobs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `dataset_id` | `uuid` |  |
| `status` | `job_status` |  |
| `step` | `varchar` |  Nullable |
| `log` | `jsonb` |  Nullable |
| `error_message` | `text` |  Nullable |
| `cancel_requested` | `bool` |  |
| `variables_trained` | `_text` |  Nullable |
| `started_at` | `timestamptz` |  Nullable |
| `finished_at` | `timestamptz` |  Nullable |
| `duration_seconds` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `model_registry`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `dataset_id` | `uuid` |  |
| `training_job_id` | `uuid` |  Nullable |
| `variable_name` | `variable_name` |  |
| `feature_list` | `_text` |  |
| `ml_ready` | `bool` |  |
| `dl_ready` | `bool` |  |
| `is_circular` | `bool` |  |
| `trained_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |

## Table `model_files`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `registry_id` | `uuid` |  |
| `file_type` | `varchar` |  |
| `model_type` | `model_type` |  |
| `file_path` | `varchar` |  |
| `file_size_bytes` | `int8` |  Nullable |
| `file_hash` | `varchar` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `model_metrics`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `registry_id` | `uuid` |  |
| `user_id` | `uuid` |  |
| `variable_name` | `variable_name` |  |
| `model_name` | `varchar` |  |
| `metric_type` | `metric_type` |  |
| `model_type` | `model_type` |  |
| `mae` | `float8` |  Nullable |
| `rmse` | `float8` |  Nullable |
| `smape` | `float8` |  Nullable |
| `r2` | `float8` |  Nullable |
| `circular_mae` | `float8` |  Nullable |
| `circular_rmse` | `float8` |  Nullable |
| `circular_corr` | `float8` |  Nullable |
| `acc15` | `float8` |  Nullable |
| `evs` | `float8` |  Nullable |
| `primary_metric` | `varchar` |  Nullable |
| `primary_value` | `float8` |  Nullable |
| `ml_component` | `varchar` |  Nullable |
| `dl_component` | `varchar` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `ensemble_configs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `registry_id` | `uuid` |  |
| `variable_name` | `variable_name` |  |
| `ml_model_name` | `varchar` |  |
| `dl_model_name` | `varchar` |  |
| `ensemble_name` | `varchar` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `generation_jobs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `dataset_id` | `uuid` |  Nullable |
| `mode` | `generate_mode` |  |
| `status` | `job_status` |  |
| `step` | `varchar` |  Nullable |
| `day` | `int2` |  Nullable |
| `total_days` | `int2` |  Nullable |
| `progress_pct` | `numeric` |  Nullable |
| `eta_seconds` | `int4` |  Nullable |
| `elapsed_seconds` | `int4` |  Nullable |
| `selected_var` | `variable_name` |  Nullable |
| `selected_models` | `_text` |  Nullable |
| `error_message` | `text` |  Nullable |
| `cancel_requested` | `bool` |  |
| `output_filename` | `varchar` |  Nullable |
| `output_filepath` | `varchar` |  Nullable |
| `started_at` | `timestamptz` |  Nullable |
| `finished_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `forecast_results`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `generation_job_id` | `uuid` |  Nullable |
| `dataset_id` | `uuid` |  Nullable |
| `mode` | `generate_mode` |  |
| `variable_name` | `variable_name` |  Nullable |
| `is_multi_var` | `bool` |  |
| `total_hours` | `int2` |  |
| `historical_rows` | `int4` |  Nullable |
| `nlp_report` | `text` |  Nullable |
| `ensemble_summary` | `jsonb` |  Nullable |
| `stacking_info` | `_text` |  Nullable |
| `output_filename` | `varchar` |  Nullable |
| `output_filepath` | `varchar` |  Nullable |
| `file_size_bytes` | `int8` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `forecast_data_points`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary |
| `forecast_id` | `uuid` |  |
| `row_index` | `int4` |  |
| `year` | `int2` |  |
| `month` | `int2` |  |
| `day` | `int2` |  |
| `hour` | `int2` |  |
| `is_future` | `bool` |  |
| `actual_value` | `float8` |  Nullable |
| `predicted_gbr` | `float8` |  Nullable |
| `predicted_xgb` | `float8` |  Nullable |
| `predicted_knn` | `float8` |  Nullable |
| `predicted_lstm` | `float8` |  Nullable |
| `predicted_bilstm` | `float8` |  Nullable |
| `stacked_value` | `float8` |  Nullable |
| `xgb_base_value` | `float8` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `user_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `session_token` | `varchar` |  Unique |
| `ip_address` | `inet` |  Nullable |
| `user_agent` | `text` |  Nullable |
| `is_active` | `bool` |  |
| `expires_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |
| `last_accessed_at` | `timestamptz` |  |

