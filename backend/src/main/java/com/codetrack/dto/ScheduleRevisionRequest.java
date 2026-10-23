package com.codetrack.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ScheduleRevisionRequest {

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;

    private String notes;

    public ScheduleRevisionRequest() {
    }

    public ScheduleRevisionRequest(LocalDate scheduledDate, String notes) {
        this.scheduledDate = scheduledDate;
        this.notes = notes;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
