-- internal users (managers/admins created by an admin) have no external id
ALTER TABLE app_user ALTER COLUMN external_user_id DROP NOT NULL;