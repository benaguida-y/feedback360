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
@Table(name = "population")
@Getter
@Setter
public class Population {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long populationId;

    @Column(nullable = false, unique = true)
    private Long externalPopulationId; // for external population id from talentup

    @Column(nullable = false)
    private String name;
}
