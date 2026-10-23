package com.codetrack.dto;

import java.util.List;

public class RevisionCenterResponse {
    private List<RevisionResponse> dueToday;
    private List<RevisionResponse> overdue;
    private List<RevisionResponse> upcoming;
    private List<RevisionResponse> completed;

    public RevisionCenterResponse() {
    }

    public RevisionCenterResponse(List<RevisionResponse> dueToday, List<RevisionResponse> overdue,
                                  List<RevisionResponse> upcoming, List<RevisionResponse> completed) {
        this.dueToday = dueToday;
        this.overdue = overdue;
        this.upcoming = upcoming;
        this.completed = completed;
    }

    public List<RevisionResponse> getDueToday() {
        return dueToday;
    }

    public void setDueToday(List<RevisionResponse> dueToday) {
        this.dueToday = dueToday;
    }

    public List<RevisionResponse> getOverdue() {
        return overdue;
    }

    public void setOverdue(List<RevisionResponse> overdue) {
        this.overdue = overdue;
    }

    public List<RevisionResponse> getUpcoming() {
        return upcoming;
    }

    public void setUpcoming(List<RevisionResponse> upcoming) {
        this.upcoming = upcoming;
    }

    public List<RevisionResponse> getCompleted() {
        return completed;
    }

    public void setCompleted(List<RevisionResponse> completed) {
        this.completed = completed;
    }
}
