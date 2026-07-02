package com.yb.feedback360.repository;

import com.yb.feedback360.domain.model.Population;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PopulationRepository extends JpaRepository<Population, Long> {
    Optional<Population> findByExternalPopulationId(Long externalPopulationId);
}
