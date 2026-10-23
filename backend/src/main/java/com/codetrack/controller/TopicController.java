package com.codetrack.controller;

import com.codetrack.dto.ApiResponse;
import com.codetrack.dto.ProblemResponse;
import com.codetrack.dto.TopicProgressResponse;
import com.codetrack.exception.UnauthorizedException;
import com.codetrack.security.UserPrincipal;
import com.codetrack.service.DashboardService;
import com.codetrack.service.ProblemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final DashboardService dashboardService;
    private final ProblemService problemService;

    public TopicController(DashboardService dashboardService, ProblemService problemService) {
        this.dashboardService = dashboardService;
        this.problemService = problemService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TopicProgressResponse>>> getTopics(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        List<TopicProgressResponse> list = dashboardService.getTopicProgress(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Topics retrieved successfully", list));
    }

    @GetMapping("/{topic}/problems")
    public ResponseEntity<ApiResponse<List<ProblemResponse>>> getProblemsByTopic(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String topic) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        List<ProblemResponse> problems = problemService.getProblemsByTopic(principal.getId(), topic);
        return ResponseEntity.ok(ApiResponse.success("Topic problems retrieved successfully", problems));
    }
}
