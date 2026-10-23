package com.codetrack.controller;

import com.codetrack.dto.ApiResponse;
import com.codetrack.dto.PagedResponse;
import com.codetrack.dto.ProblemRequest;
import com.codetrack.dto.ProblemResponse;
import com.codetrack.dto.ProblemStatusUpdateRequest;
import com.codetrack.entity.Difficulty;
import com.codetrack.entity.ProblemStatus;
import com.codetrack.exception.UnauthorizedException;
import com.codetrack.security.UserPrincipal;
import com.codetrack.service.ProblemService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProblemResponse>>> getProblems(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) ProblemStatus status,
            @RequestParam(required = false) String platform,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        // Whitelist allowed sort fields for security
        String sanitizedSort = switch (sortBy) {
            case "title" -> "title";
            case "difficulty" -> "difficulty";
            case "status" -> "status";
            case "topic" -> "topic";
            case "platform" -> "platform";
            case "dateSolved" -> "dateSolved";
            case "createdAt" -> "createdAt";
            default -> "updatedAt";
        };

        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(sortDirection, sanitizedSort));
        PagedResponse<ProblemResponse> response = problemService.getProblems(
                principal.getId(), search, topic, difficulty, status, platform, pageable
        );

        return ResponseEntity.ok(ApiResponse.success("Problems retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProblemResponse>> createProblem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProblemRequest request) {

        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        ProblemResponse created = problemService.createProblem(principal.getId(), request);
        return new ResponseEntity<>(
                ApiResponse.success("Coding problem created successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProblemResponse>> getProblemById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        ProblemResponse problem = problemService.getProblemById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Problem retrieved successfully", problem));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProblemResponse>> updateProblem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ProblemRequest request) {

        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        ProblemResponse updated = problemService.updateProblem(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Problem updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProblemResponse>> updateProblemStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ProblemStatusUpdateRequest request) {

        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        ProblemResponse updated = problemService.updateProblemStatus(principal.getId(), id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Problem status updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProblem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }

        problemService.deleteProblem(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Problem deleted successfully", null));
    }
}
