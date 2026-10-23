package com.codetrack.dto;

public class TopicProgressResponse {
    private String topic;
    private long total;
    private long solved;
    private double percentage;

    public TopicProgressResponse() {
    }

    public TopicProgressResponse(String topic, long total, long solved, double percentage) {
        this.topic = topic;
        this.total = total;
        this.solved = solved;
        this.percentage = percentage;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
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

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
