package com.yb.feedback360.repository;

import com.yb.feedback360.domain.enums.LogStatus;
import com.yb.feedback360.domain.enums.LogType;
import com.yb.feedback360.domain.model.IntegrationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IntegrationLogRepository extends JpaRepository<IntegrationLog, Long> {

    long countByStatus(LogStatus status);

    @Query("""
            select l from IntegrationLog l
              left join l.user u
              left join l.moduleFormation m
            where (:type is null or l.type = :type)
              and (:status is null or l.status = :status)
              and (:search is null
                   or lower(u.email) like :search
                   or lower(m.title) like :search)
            order by l.receivedAt desc
            """)
    Page<IntegrationLog> search(@Param("type") LogType type,
                                @Param("status") LogStatus status,
                                @Param("search") String search,
                                Pageable pageable);
}