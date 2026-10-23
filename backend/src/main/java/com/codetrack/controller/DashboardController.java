package com.codetrack.controller;

import com.codetrack.dto.*;
import com.codetrack.exception.UnauthorizedException;
import com.codetrack.security.UserPrincipal;
import com.codetrack.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        DashboardSummaryResponse summary = dashboardService.getSummary(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved", summary));
    }

    @GetMapping("/topic-progress")
    public ResponseEntity<ApiResponse<List<TopicProgressResponse>>> getTopicProgress(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        List<TopicProgressResponse> progress = dashboardService.getTopicProgress(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Topic progress retrieved", progress));
    }

    @GetMapping("/difficulty-distribution")
    public ResponseEntity<ApiResponse<List<DifficultyDistributionResponse>>> getDifficultyDistribution(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        List<DifficultyDistributionResponse> distribution = dashboardService.getDifficultyDistribution(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Difficulty distribution retrieved", distribution));
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<ApiResponse<RecentActivityResponse>> getRecentActivity(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        RecentActivityResponse activity = dashboardService.getRecentActivity(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Recent activity retrieved", activity));
    }
}
