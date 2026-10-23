package com.codetrack.service;

import com.codetrack.dto.ProblemRequest;
import com.codetrack.dto.ProblemResponse;
import com.codetrack.entity.CodingProblem;
import com.codetrack.entity.Difficulty;
import com.codetrack.entity.ProblemStatus;
import com.codetrack.entity.User;
import com.codetrack.exception.ResourceNotFoundException;
import com.codetrack.repository.CodingProblemRepository;
import com.codetrack.repository.RevisionRepository;
import com.codetrack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProblemServiceTest {

    @Mock
    private CodingProblemRepository problemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RevisionRepository revisionRepository;

    @Mock
    private RevisionService revisionService;

    @InjectMocks
    private ProblemService problemService;

    private User sampleUser;
    private CodingProblem sampleProblem;

    @BeforeEach
    void setUp() {
        sampleUser = new User(1L, "Alex Johnson", "alex@example.com", "hash");
        sampleProblem = new CodingProblem();
        sampleProblem.setId(5L);
        sampleProblem.setUser(sampleUser);
        sampleProblem.setTitle("Valid Anagram");
        sampleProblem.setPlatform("LeetCode");
        sampleProblem.setTopic("Hashing");
        sampleProblem.setDifficulty(Difficulty.EASY);
        sampleProblem.setStatus(ProblemStatus.SOLVED);
    }

    @Test
    @DisplayName("Should create problem and trigger spaced revision when created with SOLVED status")
    void createProblem_Solved_TriggersRevision() {
        ProblemRequest request = new ProblemRequest();
        request.setTitle("Valid Anagram");
        request.setPlatform("LeetCode");
        request.setTopic("Hashing");
        request.setDifficulty(Difficulty.EASY);
        request.setStatus(ProblemStatus.SOLVED);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(problemRepository.save(any(CodingProblem.class))).thenReturn(sampleProblem);

        ProblemResponse response = problemService.createProblem(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Valid Anagram");
        assertThat(response.getStatus()).isEqualTo(ProblemStatus.SOLVED);

        verify(revisionService).scheduleNextSpacedRevision(any(CodingProblem.class), eq(sampleUser));
    }

    @Test
    @DisplayName("Should enforce user isolation: Throw ResourceNotFoundException if user tries to access another user's problem")
    void getProblemById_OtherUser_ThrowsNotFound() {
        // User 2 trying to access User 1's problem
        when(problemRepository.findByIdAndUserId(5L, 2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> problemService.getProblemById(2L, 5L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Problem not found");
    }

    @Test
    @DisplayName("Should delete problem if user owns it")
    void deleteProblem_Owner_Success() {
        when(problemRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(sampleProblem));

        problemService.deleteProblem(1L, 5L);

        verify(problemRepository).delete(sampleProblem);
    }
}
