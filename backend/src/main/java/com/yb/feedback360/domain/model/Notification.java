package com.yb.feedback360.domain.model;

import com.yb.feedback360.domain.enums.NotificationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notification")
@Getter
@Setter
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    private Instant sentAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationStatus status;

    @ManyToOne(optional = false)
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name="module_id", nullable = false)
    private ModuleFormation moduleFormation;
}
