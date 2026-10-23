-- =======================================================
-- CodeTrack Database Schema
-- Coding Practice & Revision Management Platform
-- =======================================================

CREATE DATABASE IF NOT EXISTS codetrack_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE codetrack_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Coding Problems Table
CREATE TABLE IF NOT EXISTS coding_problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    problem_url VARCHAR(500) NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'LeetCode',
    topic VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL, -- 'EASY', 'MEDIUM', 'HARD'
    status VARCHAR(20) NOT NULL DEFAULT 'TODO', -- 'TODO', 'IN_PROGRESS', 'SOLVED', 'NEEDS_REVISION'
    approach_notes TEXT NULL,
    time_complexity VARCHAR(50) NULL,
    space_complexity VARCHAR(50) NULL,
    date_solved DATE NULL,
    next_revision_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_problems_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_problems_user (user_id),
    INDEX idx_problems_user_status (user_id, status),
    INDEX idx_problems_user_topic (user_id, topic),
    INDEX idx_problems_user_difficulty (user_id, difficulty),
    INDEX idx_problems_revision (user_id, next_revision_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Revisions Table
CREATE TABLE IF NOT EXISTS revisions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_at DATETIME NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'SKIPPED'
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_revisions_problem FOREIGN KEY (problem_id) REFERENCES coding_problems (id) ON DELETE CASCADE,
    CONSTRAINT fk_revisions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_revisions_user (user_id),
    INDEX idx_revisions_user_date (user_id, scheduled_date),
    INDEX idx_revisions_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
