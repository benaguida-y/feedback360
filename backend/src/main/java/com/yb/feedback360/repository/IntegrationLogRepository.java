package com.yb.feedback360.repository;

import com.yb.feedback360.domain.enums.LogStatus;
import com.yb.feedback360.domain.model.IntegrationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IntegrationLogRepository extends JpaRepository<IntegrationLog, Long> {
    // Les 100 derniers appels reçus, plus récents d'abord.
    List<IntegrationLog> findTop100ByOrderByReceivedAtDesc();

    long countByStatus(LogStatus status);
}