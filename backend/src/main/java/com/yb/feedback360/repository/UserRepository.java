package com.yb.feedback360.repository;

import com.yb.feedback360.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByExternalUserId(Long externalUserId);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findAllByOrderByUserIdAsc();

    long countByRole_Name(String roleName);
    long countByActive(boolean active);
    long countByPasswordHashIsNull();

    @Query("""
            select u from User u join u.role r
            where (:role is null or r.name = :role)
              and (:active is null or u.active = :active)
              and (:pendingOnly = false or u.passwordHash is null)
              and (:search is null
                   or lower(u.firstName) like :search
                   or lower(u.lastName)  like :search
                   or lower(u.email)     like :search)
            """)
    Page<User> search(@Param("role") String role,
                      @Param("active") Boolean active,
                      @Param("pendingOnly") boolean pendingOnly,
                      @Param("search") String search,
                        Pageable pageable);
}
