package com.yb.feedback360.repository;

import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.domain.model.Feedback;
import com.yb.feedback360.domain.model.ModuleFormation;
import com.yb.feedback360.domain.model.User;
import com.yb.feedback360.dto.response.CollaboratorProgressResponse;
import com.yb.feedback360.dto.response.ModuleStatsResponse;
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

    @Query("""
            select new ModuleStatsResponse(
                m.title, 
                sum(case when f.status = :submitted then 1 else 0 end),
                sum(case when f.status = :notSubmitted then 1 else 0 end),
                avg(case when f.status = :submitted then f.globalScore else null end))
            from Feedback f join f.moduleFormation m
            group by m.title
            order by m.title
            """)
    List<ModuleStatsResponse> moduleStats(@Param("submitted") FeedbackStatus submitted, @Param("notSubmitted") FeedbackStatus unsubmitted);

    @Query("""
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
            group by u.userId, u.firstName, u.lastName, u.email
            order by u.firstName, u.lastName
            """)
    List<CollaboratorProgressResponse> collaboratorProgress(@Param("submitted") FeedbackStatus submitted,
                                                            @Param("notSubmitted") FeedbackStatus notSubmitted);


}
