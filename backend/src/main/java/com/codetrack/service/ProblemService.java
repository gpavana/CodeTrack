package com.codetrack.service;

import com.codetrack.dto.PagedResponse;
import com.codetrack.dto.ProblemRequest;
import com.codetrack.dto.ProblemResponse;
import com.codetrack.entity.CodingProblem;
import com.codetrack.entity.Difficulty;
import com.codetrack.entity.ProblemStatus;
import com.codetrack.entity.RevisionStatus;
import com.codetrack.entity.User;
import com.codetrack.exception.ResourceNotFoundException;
import com.codetrack.repository.CodingProblemRepository;
import com.codetrack.repository.RevisionRepository;
import com.codetrack.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProblemService {

    private final CodingProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final RevisionRepository revisionRepository;
    private final RevisionService revisionService;

    public ProblemService(CodingProblemRepository problemRepository,
                          UserRepository userRepository,
                          RevisionRepository revisionRepository,
                          RevisionService revisionService) {
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.revisionRepository = revisionRepository;
        this.revisionService = revisionService;
    }

    @Transactional
    public ProblemResponse createProblem(Long userId, ProblemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        CodingProblem problem = new CodingProblem();
        problem.setUser(user);
        problem.setTitle(request.getTitle().trim());
        problem.setProblemUrl(request.getProblemUrl() != null ? request.getProblemUrl().trim() : null);
        problem.setPlatform(request.getPlatform() != null ? request.getPlatform().trim() : "LeetCode");
        problem.setTopic(request.getTopic().trim());
        problem.setDifficulty(request.getDifficulty());
        problem.setStatus(request.getStatus());
        problem.setApproachNotes(request.getApproachNotes());
        problem.setTimeComplexity(request.getTimeComplexity() != null ? request.getTimeComplexity().trim() : null);
        problem.setSpaceComplexity(request.getSpaceComplexity() != null ? request.getSpaceComplexity().trim() : null);

        if (request.getStatus() == ProblemStatus.SOLVED) {
            problem.setDateSolved(request.getDateSolved() != null ? request.getDateSolved() : LocalDate.now());
        } else {
            problem.setDateSolved(request.getDateSolved());
        }

        CodingProblem savedProblem = problemRepository.save(problem);

        // If newly created as SOLVED, auto schedule 1st spaced revision (1 day)
        if (savedProblem.getStatus() == ProblemStatus.SOLVED) {
            revisionService.scheduleNextSpacedRevision(savedProblem, user);
        }

        return mapToResponse(savedProblem, 0);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProblemResponse> getProblems(
            Long userId,
            String search,
            String topic,
            Difficulty difficulty,
            ProblemStatus status,
            String platform,
            Pageable pageable) {

        Specification<CodingProblem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // User isolation is enforced
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("title")), searchPattern));
            }

            if (StringUtils.hasText(topic)) {
                predicates.add(cb.equal(root.get("topic"), topic.trim()));
            }

            if (difficulty != null) {
                predicates.add(cb.equal(root.get("difficulty"), difficulty));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (StringUtils.hasText(platform)) {
                predicates.add(cb.equal(root.get("platform"), platform.trim()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CodingProblem> pageResult = problemRepository.findAll(spec, pageable);

        List<ProblemResponse> content = pageResult.getContent().stream()
                .map(problem -> {
                    long revCount = revisionRepository.countByUserIdAndProblemIdAndStatus(
                            userId, problem.getId(), RevisionStatus.COMPLETED
                    );
                    return mapToResponse(problem, revCount);
                })
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    @Transactional(readOnly = true)
    public ProblemResponse getProblemById(Long userId, Long problemId) {
        CodingProblem problem = problemRepository.findByIdAndUserId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        long revCount = revisionRepository.countByUserIdAndProblemIdAndStatus(
                userId, problem.getId(), RevisionStatus.COMPLETED
        );

        return mapToResponse(problem, revCount);
    }

    @Transactional
    public ProblemResponse updateProblem(Long userId, Long problemId, ProblemRequest request) {
        CodingProblem problem = problemRepository.findByIdAndUserId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        ProblemStatus oldStatus = problem.getStatus();

        problem.setTitle(request.getTitle().trim());
        problem.setProblemUrl(request.getProblemUrl() != null ? request.getProblemUrl().trim() : null);
        problem.setPlatform(request.getPlatform() != null ? request.getPlatform().trim() : "LeetCode");
        problem.setTopic(request.getTopic().trim());
        problem.setDifficulty(request.getDifficulty());
        problem.setStatus(request.getStatus());
        problem.setApproachNotes(request.getApproachNotes());
        problem.setTimeComplexity(request.getTimeComplexity() != null ? request.getTimeComplexity().trim() : null);
        problem.setSpaceComplexity(request.getSpaceComplexity() != null ? request.getSpaceComplexity().trim() : null);

        if (request.getStatus() == ProblemStatus.SOLVED) {
            if (problem.getDateSolved() == null) {
                problem.setDateSolved(request.getDateSolved() != null ? request.getDateSolved() : LocalDate.now());
            } else if (request.getDateSolved() != null) {
                problem.setDateSolved(request.getDateSolved());
            }
        } else {
            problem.setDateSolved(request.getDateSolved());
        }

        CodingProblem updatedProblem = problemRepository.save(problem);

        // If status changed to SOLVED from another status, auto schedule spaced revision if no pending exists
        if (oldStatus != ProblemStatus.SOLVED && updatedProblem.getStatus() == ProblemStatus.SOLVED) {
            revisionService.scheduleNextSpacedRevision(updatedProblem, updatedProblem.getUser());
        }

        long revCount = revisionRepository.countByUserIdAndProblemIdAndStatus(
                userId, updatedProblem.getId(), RevisionStatus.COMPLETED
        );

        return mapToResponse(updatedProblem, revCount);
    }

    @Transactional
    public ProblemResponse updateProblemStatus(Long userId, Long problemId, ProblemStatus newStatus) {
        CodingProblem problem = problemRepository.findByIdAndUserId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        ProblemStatus oldStatus = problem.getStatus();
        problem.setStatus(newStatus);

        if (newStatus == ProblemStatus.SOLVED && problem.getDateSolved() == null) {
            problem.setDateSolved(LocalDate.now());
        }

        CodingProblem updated = problemRepository.save(problem);

        if (oldStatus != ProblemStatus.SOLVED && newStatus == ProblemStatus.SOLVED) {
            revisionService.scheduleNextSpacedRevision(updated, updated.getUser());
        }

        long revCount = revisionRepository.countByUserIdAndProblemIdAndStatus(
                userId, updated.getId(), RevisionStatus.COMPLETED
        );

        return mapToResponse(updated, revCount);
    }

    @Transactional
    public void deleteProblem(Long userId, Long problemId) {
        CodingProblem problem = problemRepository.findByIdAndUserId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        problemRepository.delete(problem);
    }

    @Transactional(readOnly = true)
    public List<ProblemResponse> getProblemsByTopic(Long userId, String topic) {
        List<CodingProblem> problems = problemRepository.findByUserIdAndTopicOrderByCreatedAtDesc(userId, topic);
        return problems.stream()
                .map(p -> {
                    long revCount = revisionRepository.countByUserIdAndProblemIdAndStatus(
                            userId, p.getId(), RevisionStatus.COMPLETED
                    );
                    return mapToResponse(p, revCount);
                })
                .collect(Collectors.toList());
    }

    public ProblemResponse mapToResponse(CodingProblem problem, long revisionCount) {
        ProblemResponse response = new ProblemResponse();
        response.setId(problem.getId());
        response.setTitle(problem.getTitle());
        response.setProblemUrl(problem.getProblemUrl());
        response.setPlatform(problem.getPlatform());
        response.setTopic(problem.getTopic());
        response.setDifficulty(problem.getDifficulty());
        response.setStatus(problem.getStatus());
        response.setApproachNotes(problem.getApproachNotes());
        response.setTimeComplexity(problem.getTimeComplexity());
        response.setSpaceComplexity(problem.getSpaceComplexity());
        response.setDateSolved(problem.getDateSolved());
        response.setNextRevisionDate(problem.getNextRevisionDate());
        response.setCreatedAt(problem.getCreatedAt());
        response.setUpdatedAt(problem.getUpdatedAt());
        response.setRevisionCount(revisionCount);
        return response;
    }
}
