package com.codetrack.repository;

import com.codetrack.entity.Revision;
import com.codetrack.entity.RevisionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RevisionRepository extends JpaRepository<Revision, Long> {

    Optional<Revision> findByIdAndUserId(Long id, Long userId);

    List<Revision> findByUserIdAndProblemIdOrderByScheduledDateAsc(Long userId, Long problemId);

    long countByUserIdAndProblemIdAndStatus(Long userId, Long problemId, RevisionStatus status);

    long countByUserIdAndStatusAndScheduledDateLessThanEqual(Long userId, RevisionStatus status, LocalDate date);

    List<Revision> findByUserIdOrderByScheduledDateDesc(Long userId);

    List<Revision> findByUserIdAndStatusOrderByScheduledDateAsc(Long userId, RevisionStatus status);

    List<Revision> findByUserIdAndStatusAndScheduledDate(Long userId, RevisionStatus status, LocalDate date);

    List<Revision> findByUserIdAndStatusAndScheduledDateBeforeOrderByScheduledDateAsc(Long userId, RevisionStatus status, LocalDate date);

    List<Revision> findByUserIdAndStatusAndScheduledDateAfterOrderByScheduledDateAsc(Long userId, RevisionStatus status, LocalDate date);

    List<Revision> findByUserIdAndStatusOrderByCompletedAtDesc(Long userId, RevisionStatus status);

    List<Revision> findTop5ByUserIdAndStatusOrderByScheduledDateAsc(Long userId, RevisionStatus status);

    @Query("SELECT r FROM Revision r WHERE r.user.id = :userId AND r.status = :status AND r.scheduledDate <= :date ORDER BY r.scheduledDate ASC")
    List<Revision> findDueAndOverdue(@Param("userId") Long userId, @Param("status") RevisionStatus status, @Param("date") LocalDate date);
}
