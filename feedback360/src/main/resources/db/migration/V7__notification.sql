CREATE TABLE notification (
    notification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sent_at         TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL,
    user_id         BIGINT NOT NULL REFERENCES app_user(user_id),
    module_id       BIGINT NOT NULL REFERENCES module_formation(module_id)
);