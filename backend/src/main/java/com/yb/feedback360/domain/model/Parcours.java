package com.yb.feedback360.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "parcours")
@Getter
@Setter
public class Parcours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long parcoursId;

    @Column(nullable = false, unique = true)
    private Long externalParcoursId; // -> column external_parcours_id

    @Column(nullable = false)
    private String name;
}
