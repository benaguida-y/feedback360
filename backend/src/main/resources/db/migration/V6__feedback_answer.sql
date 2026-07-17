CREATE TABLE feedback_answer (
    answer_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    value       VARCHAR(2000),
    feedback_id BIGINT NOT NULL REFERENCES feedback(feedback_id)
);