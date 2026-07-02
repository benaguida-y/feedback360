CREATE TABLE app_user (
    user_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_user_id BIGINT NOT NULL UNIQUE,
    first_name       VARCHAR(255),
    last_name        VARCHAR(255),
    email            VARCHAR(255) NOT NULL UNIQUE,
    role             VARCHAR(50)  NOT NULL,
    department       VARCHAR(255),
    password_hash    VARCHAR(100)
);