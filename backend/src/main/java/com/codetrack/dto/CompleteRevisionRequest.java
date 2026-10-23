package com.codetrack.dto;

public class CompleteRevisionRequest {
    private String notes;
    private Boolean scheduleNext = true;

    public CompleteRevisionRequest() {
    }

    public CompleteRevisionRequest(String notes, Boolean scheduleNext) {
        this.notes = notes;
        this.scheduleNext = scheduleNext;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getScheduleNext() {
        return scheduleNext;
    }

    public void setScheduleNext(Boolean scheduleNext) {
        this.scheduleNext = scheduleNext;
    }
}
