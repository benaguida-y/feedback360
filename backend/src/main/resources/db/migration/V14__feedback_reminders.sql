-- Suivi des relances par feedback (pour la relance automatique planifiée).
ALTER TABLE feedback ADD COLUMN reminder_count   INT NOT NULL DEFAULT 0;
ALTER TABLE feedback ADD COLUMN last_reminded_at TIMESTAMPTZ;
