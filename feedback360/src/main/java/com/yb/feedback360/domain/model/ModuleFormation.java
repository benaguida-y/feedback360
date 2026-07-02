package com.yb.feedback360.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="module_formation")
@Getter
@Setter
public class ModuleFormation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long moduleId;

    @Column(nullable = false, unique = true)
    private Long externalModuleId;

    @Column(nullable = false)
    private String title;
    private String description;
    private String category;
    private String source;

    @ManyToOne(optional = false)
    @JoinColumn(name="parcours_id", nullable= false)
    private Parcours parcours; //FK

    @ManyToOne(optional = false)
    @JoinColumn(name="population_id", nullable= false)
    private Population population; //FK

}
