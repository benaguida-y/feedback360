-- Turn the role from an enum-in-code into a proper reference table.

-- 1. the new reference table
CREATE TABLE role (
    role_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE
);

-- 2. seed the known roles
INSERT INTO role (name) VALUES ('ADMIN'), ('MANAGER'), ('COLLABORATOR');

-- 3. add the foreign-key column to app_user (nullable for now, so we can backfill)
ALTER TABLE app_user ADD COLUMN role_id BIGINT REFERENCES role(role_id);

-- 4. backfill role_id from the existing role text column
UPDATE app_user u SET role_id = r.role_id FROM role r WHERE r.name = u.role;

-- 5. now that every row has a role_id, enforce NOT NULL
ALTER TABLE app_user ALTER COLUMN role_id SET NOT NULL;

-- 6. drop the old text column
ALTER TABLE app_user DROP COLUMN role;
