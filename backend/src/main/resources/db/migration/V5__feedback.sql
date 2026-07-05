CREATE TABLE feedback (
    feedback_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    global_score DOUBLE PRECISION,
    comment      VARCHAR(2000),
    status       VARCHAR(30) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL,
    user_id      BIGINT NOT NULL REFERENCES app_user(user_id),
    module_id    BIGINT NOT NULL REFERENCES module_formation(module_id)
);