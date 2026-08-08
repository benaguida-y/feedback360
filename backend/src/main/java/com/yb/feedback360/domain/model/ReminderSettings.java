package com.yb.feedback360.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/** Réglage global de la relance automatique (ligne unique). */
@Entity
@Table(name = "reminder_settings")
@Getter
@Setter
public class ReminderSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private boolean autoEnabled;

    @Column(nullable = false)
    private int delayDays;

    @Column(nullable = false)
    private int maxReminders;
}
