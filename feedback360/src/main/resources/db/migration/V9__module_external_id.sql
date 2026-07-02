ALTER TABLE module_formation
    ADD COLUMN external_module_id BIGINT NOT NULL UNIQUE;