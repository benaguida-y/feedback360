package com.yb.feedback360.domain.model;

import com.yb.feedback360.domain.enums.LogStatus;
import com.yb.feedback360.domain.enums.LogType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "integration_log")
@Getter
@Setter
public class IntegrationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LogType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LogStatus status;

    @Column(columnDefinition = "text")
    private String requestPayload;

    @Column(columnDefinition = "text")
    private String errorMessage;

    @Column(nullable = false)
    private Instant receivedAt;

    private Instant processedAt;

    @ManyToOne
    @JoinColumn(name = "user_id") // nullable: log may exist before user is parsed
    private User user;

    @ManyToOne
    @JoinColumn(name = "module_id")
    private ModuleFormation moduleFormation;
}
