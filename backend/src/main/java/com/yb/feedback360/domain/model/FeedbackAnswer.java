package com.yb.feedback360.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "feedback_answer")
@Getter
@Setter
public class FeedbackAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long answerId;

    @Column(length = 2000)
    private String value;

    @ManyToOne(optional = false)
    @JoinColumn(name = "feedback_id", nullable = false)
    private Feedback feedback;
}
