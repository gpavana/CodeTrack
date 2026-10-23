package com.codetrack.dto;

import com.codetrack.entity.ProblemStatus;
import jakarta.validation.constraints.NotNull;

public class ProblemStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ProblemStatus status;

    public ProblemStatusUpdateRequest() {
    }

    public ProblemStatusUpdateRequest(ProblemStatus status) {
        this.status = status;
    }

    public ProblemStatus getStatus() {
        return status;
    }

    public void setStatus(ProblemStatus status) {
        this.status = status;
    }
}
