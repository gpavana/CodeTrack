package com.codetrack.service;

import com.codetrack.dto.DashboardSummaryResponse;
import com.codetrack.dto.DifficultyDistributionResponse;
import com.codetrack.dto.TopicProgressResponse;
import com.codetrack.entity.Difficulty;
import com.codetrack.entity.ProblemStatus;
import com.codetrack.entity.RevisionStatus;
import com.codetrack.repository.CodingProblemRepository;
import com.codetrack.repository.RevisionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private CodingProblemRepository problemRepository;

    @Mock
    private RevisionRepository revisionRepository;

    @Mock
    private ProblemService problemService;

    @Mock
    private RevisionService revisionService;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("Should accurately calculate dashboard summary metrics and completion percentage")
    void getSummary_CalculatesAccurateMetrics() {
        when(problemRepository.countByUserId(1L)).thenReturn(20L);
        when(problemRepository.countByUserIdAndStatus(1L, ProblemStatus.SOLVED)).thenReturn(15L);
        when(problemRepository.countByUserIdAndStatus(1L, ProblemStatus.IN_PROGRESS)).thenReturn(3L);
        when(revisionRepository.countByUserIdAndStatusAndScheduledDateLessThanEqual(
                eq(1L), eq(RevisionStatus.PENDING), any(LocalDate.class)
        )).thenReturn(4L);

        DashboardSummaryResponse summary = dashboardService.getSummary(1L);

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalProblems()).isEqualTo(20L);
        assertThat(summary.getSolvedProblems()).isEqualTo(15L);
        assertThat(summary.getInProgressProblems()).isEqualTo(3L);
        assertThat(summary.getDueRevisions()).isEqualTo(4L);
        // (15 / 20) * 100 = 75.0%
        assertThat(summary.getCompletionRate()).isEqualTo(75.0);
    }

    @Test
    @DisplayName("Should return 0% completion rate when no problems exist")
    void getSummary_EmptyDatabase_ReturnsZeroRate() {
        when(problemRepository.countByUserId(1L)).thenReturn(0L);
        when(problemRepository.countByUserIdAndStatus(1L, ProblemStatus.SOLVED)).thenReturn(0L);
        when(problemRepository.countByUserIdAndStatus(1L, ProblemStatus.IN_PROGRESS)).thenReturn(0L);
        when(revisionRepository.countByUserIdAndStatusAndScheduledDateLessThanEqual(
                eq(1L), eq(RevisionStatus.PENDING), any(LocalDate.class)
        )).thenReturn(0L);

        DashboardSummaryResponse summary = dashboardService.getSummary(1L);

        assertThat(summary.getCompletionRate()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Should return topic progress containing all standard interview topics")
    void getTopicProgress_IncludesStandardTopics() {
        when(problemRepository.getTopicProgress(1L)).thenReturn(Collections.emptyList());

        List<TopicProgressResponse> topics = dashboardService.getTopicProgress(1L);

        assertThat(topics).isNotEmpty();
        assertThat(topics).extracting(TopicProgressResponse::getTopic)
                .contains("Arrays", "Strings", "Dynamic Programming", "Trees", "Graphs");
    }

    @Test
    @DisplayName("Should return difficulty distribution for EASY, MEDIUM, and HARD")
    void getDifficultyDistribution_ContainsAllDifficulties() {
        when(problemRepository.getDifficultyDistribution(1L)).thenReturn(Collections.emptyList());

        List<DifficultyDistributionResponse> distribution = dashboardService.getDifficultyDistribution(1L);

        assertThat(distribution).hasSize(3);
        assertThat(distribution).extracting(DifficultyDistributionResponse::getDifficulty)
                .containsExactly(Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD);
    }
}
