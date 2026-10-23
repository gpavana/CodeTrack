package com.codetrack.controller;

import com.codetrack.dto.*;
import com.codetrack.exception.UnauthorizedException;
import com.codetrack.security.UserPrincipal;
import com.codetrack.service.RevisionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RevisionController {

    private final RevisionService revisionService;

    public RevisionController(RevisionService revisionService) {
        this.revisionService = revisionService;
    }

    @GetMapping("/revisions")
    public ResponseEntity<ApiResponse<RevisionCenterResponse>> getRevisionCenterData(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        RevisionCenterResponse data = revisionService.getRevisionCenterData(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Revision center data retrieved", data));
    }

    @GetMapping("/revisions/due")
    public ResponseEntity<ApiResponse<List<RevisionResponse>>> getDueRevisions(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        List<RevisionResponse> dueList = revisionService.getDueAndOverdue(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Due and overdue revisions retrieved", dueList));
    }

    @PostMapping("/revisions/{id}/complete")
    public ResponseEntity<ApiResponse<RevisionResponse>> completeRevision(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) CompleteRevisionRequest request) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        if (request == null) {
            request = new CompleteRevisionRequest();
        }
        RevisionResponse response = revisionService.completeRevision(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Revision completed successfully", response));
    }

    @PostMapping("/problems/{id}/revisions/schedule")
    public ResponseEntity<ApiResponse<RevisionResponse>> scheduleProblemRevision(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRevisionRequest request) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        RevisionResponse response = revisionService.scheduleCustomRevision(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Revision scheduled successfully", response));
    }

    @GetMapping("/problems/{id}/revisions")
    public ResponseEntity<ApiResponse<List<RevisionResponse>>> getProblemRevisions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        List<RevisionResponse> list = revisionService.getProblemRevisions(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Problem revision history retrieved", list));
    }
}
