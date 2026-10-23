package com.codetrack.service;

import com.codetrack.dto.*;
import com.codetrack.entity.Difficulty;
import com.codetrack.entity.ProblemStatus;
import com.codetrack.entity.RevisionStatus;
import com.codetrack.repository.CodingProblemRepository;
import com.codetrack.repository.CodingProblemRepository.DifficultyStatProjection;
import com.codetrack.repository.CodingProblemRepository.TopicStatProjection;
import com.codetrack.repository.RevisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final CodingProblemRepository problemRepository;
    private final RevisionRepository revisionRepository;
    private final ProblemService problemService;
    private final RevisionService revisionService;

    // Standard curated topics for coding interview preparation
    public static final List<String> STANDARD_TOPICS = List.of(
            "Arrays", "Strings", "Hashing", "Two Pointers", "Sliding Window",
            "Binary Search", "Linked Lists", "Stacks & Queues", "Trees",
            "Graphs", "Recursion", "Dynamic Programming", "Greedy", "Backtracking"
    );

    public DashboardService(CodingProblemRepository problemRepository,
                            RevisionRepository revisionRepository,
                            ProblemService problemService,
                            RevisionService revisionService) {
        this.problemRepository = problemRepository;
        this.revisionRepository = revisionRepository;
        this.problemService = problemService;
        this.revisionService = revisionService;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(Long userId) {
        long total = problemRepository.countByUserId(userId);
        long solved = problemRepository.countByUserIdAndStatus(userId, ProblemStatus.SOLVED);
        long inProgress = problemRepository.countByUserIdAndStatus(userId, ProblemStatus.IN_PROGRESS);
        long dueRevisions = revisionRepository.countByUserIdAndStatusAndScheduledDateLessThanEqual(
                userId, RevisionStatus.PENDING, LocalDate.now()
        );

        double rate = 0.0;
        if (total > 0) {
            rate = BigDecimal.valueOf((double) solved / total * 100.0)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return new DashboardSummaryResponse(total, solved, inProgress, dueRevisions, rate);
    }

    @Transactional(readOnly = true)
    public List<TopicProgressResponse> getTopicProgress(Long userId) {
        List<TopicStatProjection> dbStats = problemRepository.getTopicProgress(userId);
        Map<String, TopicStatProjection> map = dbStats.stream()
                .collect(Collectors.toMap(TopicStatProjection::getTopic, p -> p, (a, b) -> a));

        List<TopicProgressResponse> result = new ArrayList<>();

        // First include standard topics
        for (String topic : STANDARD_TOPICS) {
            TopicStatProjection stat = map.remove(topic);
            long total = stat != null ? stat.getTotal() : 0L;
            long solved = stat != null ? stat.getSolved() : 0L;
            double percentage = total > 0
                    ? BigDecimal.valueOf((double) solved / total * 100.0).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;
            result.add(new TopicProgressResponse(topic, total, solved, percentage));
        }

        // Add any remaining custom user topics
        for (Map.Entry<String, TopicStatProjection> entry : map.entrySet()) {
            TopicStatProjection stat = entry.getValue();
            long total = stat.getTotal();
            long solved = stat.getSolved();
            double percentage = total > 0
                    ? BigDecimal.valueOf((double) solved / total * 100.0).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;
            result.add(new TopicProgressResponse(entry.getKey(), total, solved, percentage));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<DifficultyDistributionResponse> getDifficultyDistribution(Long userId) {
        List<DifficultyStatProjection> dbStats = problemRepository.getDifficultyDistribution(userId);
        Map<Difficulty, DifficultyStatProjection> map = dbStats.stream()
                .collect(Collectors.toMap(DifficultyStatProjection::getDifficulty, p -> p, (a, b) -> a));

        List<DifficultyDistributionResponse> result = new ArrayList<>();
        for (Difficulty diff : Difficulty.values()) {
            DifficultyStatProjection stat = map.get(diff);
            long total = stat != null ? stat.getTotal() : 0L;
            long solved = stat != null ? stat.getSolved() : 0L;
            result.add(new DifficultyDistributionResponse(diff, total, solved));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public RecentActivityResponse getRecentActivity(Long userId) {
        List<ProblemResponse> recentProblems = problemRepository.findTop5ByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(p -> {
                    long revCount = revisionRepository.countByUserIdAndProblemIdAndStatus(
                            userId, p.getId(), RevisionStatus.COMPLETED
                    );
                    return problemService.mapToResponse(p, revCount);
                })
                .collect(Collectors.toList());

        List<RevisionResponse> upcomingRevisions = revisionRepository.findTop5ByUserIdAndStatusOrderByScheduledDateAsc(
                userId, RevisionStatus.PENDING
        ).stream().map(revisionService::mapToResponse).collect(Collectors.toList());

        return new RecentActivityResponse(recentProblems, upcomingRevisions);
    }
}
