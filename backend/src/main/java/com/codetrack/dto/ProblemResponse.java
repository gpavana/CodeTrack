package com.codetrack.dto;

import com.codetrack.entity.Difficulty;
import com.codetrack.entity.ProblemStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProblemResponse {
    private Long id;
    private String title;
    private String problemUrl;
    private String platform;
    private String topic;
    private Difficulty difficulty;
    private ProblemStatus status;
    private String approachNotes;
    private String timeComplexity;
    private String spaceComplexity;
    private LocalDate dateSolved;
    private LocalDate nextRevisionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long revisionCount;

    public ProblemResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getProblemUrl() {
        return problemUrl;
    }

    public void setProblemUrl(String problemUrl) {
        this.problemUrl = problemUrl;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public ProblemStatus getStatus() {
        return status;
    }

    public void setStatus(ProblemStatus status) {
        this.status = status;
    }

    public String getApproachNotes() {
        return approachNotes;
    }

    public void setApproachNotes(String approachNotes) {
        this.approachNotes = approachNotes;
    }

    public String getTimeComplexity() {
        return timeComplexity;
    }

    public void setTimeComplexity(String timeComplexity) {
        this.timeComplexity = timeComplexity;
    }

    public String getSpaceComplexity() {
        return spaceComplexity;
    }

    public void setSpaceComplexity(String spaceComplexity) {
        this.spaceComplexity = spaceComplexity;
    }

    public LocalDate getDateSolved() {
        return dateSolved;
    }

    public void setDateSolved(LocalDate dateSolved) {
        this.dateSolved = dateSolved;
    }

    public LocalDate getNextRevisionDate() {
        return nextRevisionDate;
    }

    public void setNextRevisionDate(LocalDate nextRevisionDate) {
        this.nextRevisionDate = nextRevisionDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public long getRevisionCount() {
        return revisionCount;
    }

    public void setRevisionCount(long revisionCount) {
        this.revisionCount = revisionCount;
    }
}
