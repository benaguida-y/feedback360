CREATE TABLE integration_log (
    log_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type            VARCHAR(30) NOT NULL,
    status          VARCHAR(20) NOT NULL,
    request_payload TEXT,
    received_at     TIMESTAMPTZ NOT NULL,
    processed_at    TIMESTAMPTZ,
    user_id         BIGINT REFERENCES app_user(user_id),
    module_id       BIGINT REFERENCES module_formation(module_id)
);