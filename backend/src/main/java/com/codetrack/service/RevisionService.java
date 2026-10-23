package com.codetrack.service;

import com.codetrack.dto.CompleteRevisionRequest;
import com.codetrack.dto.RevisionCenterResponse;
import com.codetrack.dto.RevisionResponse;
import com.codetrack.dto.ScheduleRevisionRequest;
import com.codetrack.entity.CodingProblem;
import com.codetrack.entity.Revision;
import com.codetrack.entity.RevisionStatus;
import com.codetrack.entity.User;
import com.codetrack.exception.BadRequestException;
import com.codetrack.exception.ResourceNotFoundException;
import com.codetrack.repository.CodingProblemRepository;
import com.codetrack.repository.RevisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RevisionService {

    private final RevisionRepository revisionRepository;
    private final CodingProblemRepository problemRepository;

    public RevisionService(RevisionRepository revisionRepository,
                           CodingProblemRepository problemRepository) {
        this.revisionRepository = revisionRepository;
        this.problemRepository = problemRepository;
    }

    /**
     * Spaced repetition interval calculator:
     * 1st revision: 1 day after solving
     * 2nd revision: 3 days after first revision
     * 3rd revision: 7 days after second revision
     * 4th+ revision: 21 days after third revision
     */
    public int calculateNextIntervalDays(long completedRevisionsCount) {
        if (completedRevisionsCount == 0) {
            return 1;
        } else if (completedRevisionsCount == 1) {
            return 3;
        } else if (completedRevisionsCount == 2) {
            return 7;
        } else {
            return 21;
        }
    }

    @Transactional
    public Revision scheduleNextSpacedRevision(CodingProblem problem, User user) {
        long completedCount = revisionRepository.countByUserIdAndProblemIdAndStatus(
                user.getId(), problem.getId(), RevisionStatus.COMPLETED
        );

        int intervalDays = calculateNextIntervalDays(completedCount);
        LocalDate nextDate = LocalDate.now().plusDays(intervalDays);

        problem.setNextRevisionDate(nextDate);
        problemRepository.save(problem);

        // Check if there is already a PENDING revision for this problem to avoid duplicate entries
        List<Revision> existingPending = revisionRepository.findByUserIdAndProblemIdOrderByScheduledDateAsc(user.getId(), problem.getId())
                .stream()
                .filter(r -> r.getStatus() == RevisionStatus.PENDING)
                .toList();

        Revision revision;
        if (!existingPending.isEmpty()) {
            revision = existingPending.get(0);
            revision.setScheduledDate(nextDate);
            revision.setNotes("Scheduled interval (" + intervalDays + " days)");
        } else {
            revision = new Revision();
            revision.setProblem(problem);
            revision.setUser(user);
            revision.setScheduledDate(nextDate);
            revision.setStatus(RevisionStatus.PENDING);
            revision.setNotes("Scheduled interval (" + intervalDays + " days)");
        }

        return revisionRepository.save(revision);
    }

    @Transactional
    public RevisionResponse scheduleCustomRevision(Long userId, Long problemId, ScheduleRevisionRequest request) {
        CodingProblem problem = problemRepository.findByIdAndUserId(problemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + problemId));

        if (request.getScheduledDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Scheduled date cannot be in the past");
        }

        problem.setNextRevisionDate(request.getScheduledDate());
        problemRepository.save(problem);

        // Check existing pending revision to avoid duplication
        List<Revision> existingPending = revisionRepository.findByUserIdAndProblemIdOrderByScheduledDateAsc(userId, problemId)
                .stream()
                .filter(r -> r.getStatus() == RevisionStatus.PENDING)
                .toList();

        Revision revision;
        if (!existingPending.isEmpty()) {
            revision = existingPending.get(0);
            revision.setScheduledDate(request.getScheduledDate());
            if (request.getNotes() != null && !request.getNotes().isBlank()) {
                revision.setNotes(request.getNotes());
            }
        } else {
            revision = new Revision();
            revision.setProblem(problem);
            revision.setUser(problem.getUser());
            revision.setScheduledDate(request.getScheduledDate());
            revision.setStatus(RevisionStatus.PENDING);
            revision.setNotes(request.getNotes());
        }

        Revision saved = revisionRepository.save(revision);
        return mapToResponse(saved);
    }

    @Transactional
    public RevisionResponse completeRevision(Long userId, Long revisionId, CompleteRevisionRequest request) {
        Revision revision = revisionRepository.findByIdAndUserId(revisionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Revision not found with id: " + revisionId));

        if (revision.getStatus() == RevisionStatus.COMPLETED) {
            throw new BadRequestException("This revision has already been marked as completed");
        }

        revision.setStatus(RevisionStatus.COMPLETED);
        revision.setCompletedAt(LocalDateTime.now());
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            revision.setNotes(request.getNotes().trim());
        }
        Revision savedRevision = revisionRepository.save(revision);

        CodingProblem problem = revision.getProblem();

        if (Boolean.TRUE.equals(request.getScheduleNext())) {
            scheduleNextSpacedRevision(problem, revision.getUser());
        } else {
            problem.setNextRevisionDate(null);
            problemRepository.save(problem);
        }

        return mapToResponse(savedRevision);
    }

    @Transactional(readOnly = true)
    public RevisionCenterResponse getRevisionCenterData(Long userId) {
        LocalDate today = LocalDate.now();

        List<RevisionResponse> dueToday = revisionRepository.findByUserIdAndStatusAndScheduledDate(
                userId, RevisionStatus.PENDING, today
        ).stream().map(this::mapToResponse).collect(Collectors.toList());

        List<RevisionResponse> overdue = revisionRepository.findByUserIdAndStatusAndScheduledDateBeforeOrderByScheduledDateAsc(
                userId, RevisionStatus.PENDING, today
        ).stream().map(this::mapToResponse).collect(Collectors.toList());

        List<RevisionResponse> upcoming = revisionRepository.findByUserIdAndStatusAndScheduledDateAfterOrderByScheduledDateAsc(
                userId, RevisionStatus.PENDING, today
        ).stream().map(this::mapToResponse).collect(Collectors.toList());

        List<RevisionResponse> completed = revisionRepository.findByUserIdAndStatusOrderByCompletedAtDesc(
                userId, RevisionStatus.COMPLETED
        ).stream().map(this::mapToResponse).collect(Collectors.toList());

        return new RevisionCenterResponse(dueToday, overdue, upcoming, completed);
    }

    @Transactional(readOnly = true)
    public List<RevisionResponse> getDueAndOverdue(Long userId) {
        LocalDate today = LocalDate.now();
        return revisionRepository.findDueAndOverdue(userId, RevisionStatus.PENDING, today)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RevisionResponse> getProblemRevisions(Long userId, Long problemId) {
        // Ensure problem belongs to user
        if (!problemRepository.existsByIdAndUserId(problemId, userId)) {
            throw new ResourceNotFoundException("Problem not found with id: " + problemId);
        }

        return revisionRepository.findByUserIdAndProblemIdOrderByScheduledDateAsc(userId, problemId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RevisionResponse mapToResponse(Revision revision) {
        RevisionResponse dto = new RevisionResponse();
        dto.setId(revision.getId());
        dto.setProblemId(revision.getProblem().getId());
        dto.setProblemTitle(revision.getProblem().getTitle());
        dto.setPlatform(revision.getProblem().getPlatform());
        dto.setTopic(revision.getProblem().getTopic());
        dto.setDifficulty(revision.getProblem().getDifficulty());
        dto.setScheduledDate(revision.getScheduledDate());
        dto.setCompletedAt(revision.getCompletedAt());
        dto.setStatus(revision.getStatus());
        dto.setNotes(revision.getNotes());
        dto.setCreatedAt(revision.getCreatedAt());
        return dto;
    }
}
