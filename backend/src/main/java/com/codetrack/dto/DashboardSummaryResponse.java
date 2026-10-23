package com.codetrack.dto;

public class DashboardSummaryResponse {
    private long totalProblems;
    private long solvedProblems;
    private long inProgressProblems;
    private long dueRevisions;
    private double completionRate;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(long totalProblems, long solvedProblems, long inProgressProblems,
                                    long dueRevisions, double completionRate) {
        this.totalProblems = totalProblems;
        this.solvedProblems = solvedProblems;
        this.inProgressProblems = inProgressProblems;
        this.dueRevisions = dueRevisions;
        this.completionRate = completionRate;
    }

    public long getTotalProblems() {
        return totalProblems;
    }

    public void setTotalProblems(long totalProblems) {
        this.totalProblems = totalProblems;
    }

    public long getSolvedProblems() {
        return solvedProblems;
    }

    public void setSolvedProblems(long solvedProblems) {
        this.solvedProblems = solvedProblems;
    }

    public long getInProgressProblems() {
        return inProgressProblems;
    }

    public void setInProgressProblems(long inProgressProblems) {
        this.inProgressProblems = inProgressProblems;
    }

    public long getDueRevisions() {
        return dueRevisions;
    }

    public void setDueRevisions(long dueRevisions) {
        this.dueRevisions = dueRevisions;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }
}
