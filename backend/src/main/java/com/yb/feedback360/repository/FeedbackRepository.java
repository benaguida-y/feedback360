package com.yb.feedback360.repository;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.ModuleFormation;
import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.dto.response.CollaboratorProgressResponse;
import com.yb.feedback360.dto.response.ModuleStatsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByUserAndModuleFormationAndStatus(
            User user, ModuleFormation moduleFormation, FeedbackStatus status
    );
    List<Feedback> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    long countByUser_UserId(Long userId);
    long countByUser_UserIdAndStatus(Long userId, FeedbackStatus status);

    // Spring builds the SQL from the name (... where user_id = ? and status = ? order by created_at desc)
    List<Feedback> findByUser_UserIdAndStatusOrderByCreatedAtDesc(Long userId, FeedbackStatus status);

    // Global (manager) queries - all users
    long countByStatus(FeedbackStatus status);
    List<Feedback> findAllByOrderByCreatedAtDesc();
    List<Feedback> findByStatusOrderByCreatedAtDesc(FeedbackStatus status);

    @Query("select avg(f.globalScore) from Feedback f where f.status = :status")
    Double averageScore(@Param("status") FeedbackStatus status);

    @Query(value = """
            select new ModuleStatsResponse(
                m.title,
                sum(case when f.status = :submitted then 1 else 0 end),
                sum(case when f.status = :notSubmitted then 1 else 0 end),
                avg(case when f.status = :submitted then f.globalScore else null end))
            from Feedback f join f.moduleFormation m
            where (:search is null or lower(m.title) like :search)
            group by m.title
            order by m.title
            """,
            countQuery = """
            select count(distinct m.title)
            from Feedback f join f.moduleFormation m
            where (:search is null or lower(m.title) like :search)
            """)
    Page<ModuleStatsResponse> moduleStats(@Param("submitted") FeedbackStatus submitted,
                                          @Param("notSubmitted") FeedbackStatus notSubmitted,
                                          @Param("search") String search,
                                          Pageable pageable);

    @Query(value = """
            select new CollaboratorProgressResponse(
                u.userId,
                trim(concat(concat(coalesce(u.firstName, ''), ' '), coalesce(u.lastName, ''))),
                u.email,
                count(f),
                sum(case when f.status = :submitted then 1 else 0 end),
                sum(case when f.status = :notSubmitted then 1 else 0 end),
                (sum(case when f.status = :submitted then 1 else 0 end) * 100) / count(f),
                avg(case when f.status = :submitted then f.globalScore else null end))
            from Feedback f join f.user u
            where (:search is null
                   or lower(u.firstName) like :search
                   or lower(u.lastName)  like :search
                   or lower(u.email)     like :search)
            group by u.userId, u.firstName, u.lastName, u.email
            order by u.firstName, u.lastName
            """,
            countQuery = """
            select count(distinct u.userId)
            from Feedback f join f.user u
            where (:search is null
                   or lower(u.firstName) like :search
                   or lower(u.lastName)  like :search
                   or lower(u.email)     like :search)
            """)
    Page<CollaboratorProgressResponse> collaboratorProgress(@Param("submitted") FeedbackStatus submitted,
                                                            @Param("notSubmitted") FeedbackStatus notSubmitted,
                                                            @Param("search") String search,
                                                            Pageable pageable);

    @Query("""
            select f from Feedback f
              join f.user u
              join f.moduleFormation m
            where (:status is null or f.status = :status)
              and (:search is null
                   or lower(m.title)     like :search
                   or lower(u.firstName) like :search
                   or lower(u.lastName)  like :search
                   or lower(u.email)     like :search)
            order by f.createdAt desc
            """)
    Page<Feedback> searchFeedbacks(@Param("status") FeedbackStatus status,
                                   @Param("search") String search,
                                   Pageable pageable);

    @Query("""
            select f from Feedback f join f.moduleFormation m
            where f.user.userId = :userId
              and (:status is null or f.status = :status)
              and (:search is null or lower(m.title) like :search)
            order by f.createdAt desc
            """)
    Page<Feedback> findUserFeedbacks(@Param("userId") Long userId,
                                     @Param("status") FeedbackStatus status,
                                     @Param("search") String search,
                                     Pageable pageable);

}