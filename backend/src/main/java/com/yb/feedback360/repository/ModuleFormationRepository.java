package com.yb.feedback360.repository;

import com.yb.feedback360.domain.model.ModuleFormation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ModuleFormationRepository extends JpaRepository<ModuleFormation, Long> {
    Optional<ModuleFormation> findByExternalModuleId(Long externalModuleId);
}
