-- Réglage global de la relance automatique (une seule ligne, éditable par l'admin).
CREATE TABLE reminder_settings (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auto_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
    delay_days    INT     NOT NULL DEFAULT 7,
    max_reminders INT     NOT NULL DEFAULT 3
);

INSERT INTO reminder_settings (auto_enabled, delay_days, max_reminders)
VALUES (FALSE, 7, 3);
