package com.codetrack.dto;

import java.util.List;

public class RecentActivityResponse {
    private List<ProblemResponse> recentProblems;
    private List<RevisionResponse> upcomingRevisions;

    public RecentActivityResponse() {
    }

    public RecentActivityResponse(List<ProblemResponse> recentProblems, List<RevisionResponse> upcomingRevisions) {
        this.recentProblems = recentProblems;
        this.upcomingRevisions = upcomingRevisions;
    }

    public List<ProblemResponse> getRecentProblems() {
        return recentProblems;
    }

    public void setRecentProblems(List<ProblemResponse> recentProblems) {
        this.recentProblems = recentProblems;
    }

    public List<RevisionResponse> getUpcomingRevisions() {
        return upcomingRevisions;
    }

    public void setUpcomingRevisions(List<RevisionResponse> upcomingRevisions) {
        this.upcomingRevisions = upcomingRevisions;
    }
}
