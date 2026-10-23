package com.codetrack.service;

import com.codetrack.dto.CompleteRevisionRequest;
import com.codetrack.dto.RevisionResponse;
import com.codetrack.dto.ScheduleRevisionRequest;
import com.codetrack.entity.*;
import com.codetrack.exception.BadRequestException;
import com.codetrack.repository.CodingProblemRepository;
import com.codetrack.repository.RevisionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RevisionServiceTest {

    @Mock
    private RevisionRepository revisionRepository;

    @Mock
    private CodingProblemRepository problemRepository;

    @InjectMocks
    private RevisionService revisionService;

    private User sampleUser;
    private CodingProblem sampleProblem;
    private Revision sampleRevision;

    @BeforeEach
    void setUp() {
        sampleUser = new User(1L, "Alex Johnson", "alex@example.com", "hash");
        sampleProblem = new CodingProblem();
        sampleProblem.setId(10L);
        sampleProblem.setUser(sampleUser);
        sampleProblem.setTitle("Two Sum");
        sampleProblem.setPlatform("LeetCode");
        sampleProblem.setTopic("Arrays");
        sampleProblem.setDifficulty(Difficulty.EASY);
        sampleProblem.setStatus(ProblemStatus.SOLVED);

        sampleRevision = new Revision();
        sampleRevision.setId(100L);
        sampleRevision.setUser(sampleUser);
        sampleRevision.setProblem(sampleProblem);
        sampleRevision.setScheduledDate(LocalDate.now());
        sampleRevision.setStatus(RevisionStatus.PENDING);
    }

    @Test
    @DisplayName("Should correctly compute spaced repetition intervals for 0, 1, 2, 3+ completed revisions")
    void calculateNextIntervalDays_CalculatesExpectedSpacedDays() {
        assertThat(revisionService.calculateNextIntervalDays(0)).isEqualTo(1);
        assertThat(revisionService.calculateNextIntervalDays(1)).isEqualTo(3);
        assertThat(revisionService.calculateNextIntervalDays(2)).isEqualTo(7);
        assertThat(revisionService.calculateNextIntervalDays(3)).isEqualTo(21);
        assertThat(revisionService.calculateNextIntervalDays(10)).isEqualTo(21);
    }

    @Test
    @DisplayName("Should schedule next spaced repetition when completing a revision with scheduleNext=true")
    void completeRevision_SuccessWithNextSchedule() {
        CompleteRevisionRequest request = new CompleteRevisionRequest("Good recall on hash map technique", true);

        when(revisionRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(sampleRevision));
        when(revisionRepository.save(any(Revision.class))).thenAnswer(i -> i.getArgument(0));
        when(revisionRepository.countByUserIdAndProblemIdAndStatus(1L, 10L, RevisionStatus.COMPLETED)).thenReturn(0L);
        when(revisionRepository.findByUserIdAndProblemIdOrderByScheduledDateAsc(1L, 10L)).thenReturn(Collections.emptyList());

        RevisionResponse response = revisionService.completeRevision(1L, 100L, request);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(RevisionStatus.COMPLETED);
        assertThat(response.getNotes()).isEqualTo("Good recall on hash map technique");
        verify(problemRepository, atLeastOnce()).save(sampleProblem);
    }

    @Test
    @DisplayName("Should throw BadRequestException if attempting to complete an already completed revision")
    void completeRevision_AlreadyCompleted_ThrowsException() {
        sampleRevision.setStatus(RevisionStatus.COMPLETED);
        when(revisionRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(sampleRevision));

        CompleteRevisionRequest request = new CompleteRevisionRequest("Notes", true);

        assertThatThrownBy(() -> revisionService.completeRevision(1L, 100L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already been marked as completed");
    }

    @Test
    @DisplayName("Should reject scheduling revision in the past")
    void scheduleCustomRevision_PastDate_ThrowsException() {
        ScheduleRevisionRequest request = new ScheduleRevisionRequest(LocalDate.now().minusDays(2), "Past revision");
        when(problemRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(sampleProblem));

        assertThatThrownBy(() -> revisionService.scheduleCustomRevision(1L, 10L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot be in the past");
    }
}
