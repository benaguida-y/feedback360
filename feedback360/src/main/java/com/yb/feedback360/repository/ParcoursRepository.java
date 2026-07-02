package com.yb.feedback360.repository;

import com.yb.feedback360.domain.model.Parcours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParcoursRepository extends JpaRepository<Parcours, Long> {
    Optional<Parcours> findByExternalParcoursId(Long externalParcoursId);
}
