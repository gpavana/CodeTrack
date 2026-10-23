package com.codetrack.dto;

import com.codetrack.entity.Difficulty;

public class DifficultyDistributionResponse {
    private Difficulty difficulty;
    private long total;
    private long solved;

    public DifficultyDistributionResponse() {
    }

    public DifficultyDistributionResponse(Difficulty difficulty, long total, long solved) {
        this.difficulty = difficulty;
        this.total = total;
        this.solved = solved;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getSolved() {
        return solved;
    }

    public void setSolved(long solved) {
        this.solved = solved;
    }
}
