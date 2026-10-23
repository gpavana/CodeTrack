package com.codetrack.repository;

import com.codetrack.entity.CodingProblem;
import com.codetrack.entity.ProblemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long>, JpaSpecificationExecutor<CodingProblem> {

    Optional<CodingProblem> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, ProblemStatus status);

    List<CodingProblem> findTop5ByUserIdOrderByUpdatedAtDesc(Long userId);

    List<CodingProblem> findByUserIdAndTopicOrderByCreatedAtDesc(Long userId, String topic);

    @Query("SELECT p.topic as topic, COUNT(p) as total, " +
           "SUM(CASE WHEN p.status = com.codetrack.entity.ProblemStatus.SOLVED THEN 1L ELSE 0L END) as solved " +
           "FROM CodingProblem p WHERE p.user.id = :userId GROUP BY p.topic")
    List<TopicStatProjection> getTopicProgress(@Param("userId") Long userId);

    @Query("SELECT p.difficulty as difficulty, COUNT(p) as total, " +
           "SUM(CASE WHEN p.status = com.codetrack.entity.ProblemStatus.SOLVED THEN 1L ELSE 0L END) as solved " +
           "FROM CodingProblem p WHERE p.user.id = :userId GROUP BY p.difficulty")
    List<DifficultyStatProjection> getDifficultyDistribution(@Param("userId") Long userId);

    interface TopicStatProjection {
        String getTopic();
        Long getTotal();
        Long getSolved();
    }

    interface DifficultyStatProjection {
        com.codetrack.entity.Difficulty getDifficulty();
        Long getTotal();
        Long getSolved();
    }
}
