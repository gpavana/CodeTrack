# CodeTrack — Coding Practice and Revision Management Platform

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**CodeTrack** is a professional, full-stack productivity web application designed for students, freshers, and software engineers preparing for competitive coding and technical interviews. Instead of aimlessly solving hundreds of algorithmic challenges and forgetting the solutions weeks later, CodeTrack empowers candidates to log problem approaches, monitor real-time curriculum progress across core Data Structures and Algorithms (DSA), and automatically schedule spaced revisions using proven cognitive intervals (1, 3, 7, and 21 days).

Built from the ground up with **Java 17, Spring Boot 3.x, Spring Security, JWT, Spring Data JPA, Hibernate, MySQL, and React with Vite**.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [Architecture and System Design](#architecture-and-system-design)
4. [Project Folder Structure](#project-folder-structure)
5. [Database Schema and Setup](#database-schema-and-setup)
6. [Authentication and Security Flow](#authentication-and-security-flow)
7. [Spaced Repetition Engine](#spaced-repetition-engine)
8. [REST API Documentation](#rest-api-documentation)
9. [Prerequisites and Environment Setup](#prerequisites-and-environment-setup)
10. [Running the Application Locally](#running-the-application-locally)
11. [Running Tests](#running-tests)
12. [Adding Screenshots](#adding-screenshots)
13. [Known Limitations and Future Enhancements](#known-limitations-and-future-enhancements)

---

## 1. Key Features

- **Centralized Problem Repository:** Log challenges from LeetCode, HackerRank, GeeksforGeeks, Codeforces, and CodeChef with direct problem URLs, status, platform, and curated DSA topic tags.
- **Complexity Tracking:** Record Big-O Time Complexity ($O(n)$, $O(n \log n)$) and Space Complexity ($O(1)$, $O(n)$) alongside detailed solution intuition, key patterns, base cases, and traps.
- **Scientific Spaced Repetition (1, 3, 7, 21 Days):** Automatically schedules your next revision interval upon solving a problem or finishing a review session to prevent cognitive decay before interview day.
- **Interactive Revision Center:** Tabbed views for *Due Today*, *Overdue*, *Upcoming*, and *Completed* revisions with custom note-taking and one-click completion.
- **Real-Time Preparation Analytics:** Dynamic dashboard powered by Recharts with:
  - Total problems, Solved count, In Progress count, and Due revisions counter.
  - Overall completion rate percentage.
  - Topic-wise progress horizontal bar chart comparing total vs. solved problems.
  - Complexity distribution donut chart (Easy, Medium, Hard).
- **Curriculum Topics Drill-Down:** Dedicated view for 14+ standardized DSA domains (Arrays, Two Pointers, Sliding Window, Binary Search, Linked Lists, Trees, Graphs, Dynamic Programming, etc.).
- **Multi-Tenant User Isolation:** Every problem, tag, and revision is strictly isolated in the backend using validated Spring Security principals and parameterized JPA queries.
- **Developer-Grade Dark Charcoal/Navy UI:** Custom responsive styling with smooth collapsible sidebar navigation, toast notifications, confirmation dialogs, and mobile drawers.

---

## 2. Technology Stack

### Backend
- **Language:** Java 17 (LTS)
- **Framework:** Spring Boot 3.3.4
- **Web Layer:** Spring Web (RESTful Controllers, DTO validation)
- **Persistence:** Spring Data JPA, Hibernate ORM
- **Database:** MySQL 8.0 (with HikariCP connection pooling)
- **Security:** Spring Security 6.x, BCrypt Password Encoder
- **Tokens:** JSON Web Tokens (JJWT 0.12.5 with HMAC-SHA256)
- **Validation:** Jakarta Bean Validation (`jakarta.validation-api`, Hibernate Validator)
- **Build Tool:** Apache Maven 3.9+
- **Testing:** JUnit 5, Mockito, AssertJ, Spring MockMvc, In-memory H2 database

### Frontend
- **Framework:** React 18 (SPA)
- **Tooling:** Vite 5.x
- **Language:** Pure Modern JavaScript (ES6+), JSX
- **Routing:** React Router v6
- **HTTP Client:** Axios (with request & response interceptors)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Styling:** Custom Vanilla CSS with Design System Variables (Dark Charcoal/Navy theme)

---

## 3. Architecture and System Design

CodeTrack follows a clean layered architecture adhering to the Single Responsibility Principle:

```
[ Client: React + Vite SPA (Port 5173) ]
                     │
                     │ HTTP / JSON (Bearer JWT Authorization)
                     ▼
           [ Spring Security Filter Chain ]
                     │  (JwtAuthenticationFilter & BCrypt)
                     ▼
           [ REST Controllers (/api/**) ]
                     │  (Request Validation, DTO mapping)
                     ▼
           [ Service Layer (Business Logic) ]
                     │  (Spaced repetition, user isolation, stats)
                     ▼
           [ Spring Data JPA Repositories ]
                     │  (Derived Queries, Specifications, Projections)
                     ▼
               [ MySQL 8.0 Database ]
```

---

## 4. Project Folder Structure

```text
CodeTrack/
├── backend/
│   ├── pom.xml
│   ├── .env.example
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/codetrack/
│   │   │   │   ├── CodeTrackApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   └── SecurityConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── ProblemController.java
│   │   │   │   │   ├── RevisionController.java
│   │   │   │   │   ├── DashboardController.java
│   │   │   │   │   ├── TopicController.java
│   │   │   │   │   └── UserController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── ApiResponse.java
│   │   │   │   │   ├── AuthResponse.java
│   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── ProblemRequest.java
│   │   │   │   │   ├── ProblemResponse.java
│   │   │   │   │   ├── PagedResponse.java
│   │   │   │   │   ├── RevisionResponse.java
│   │   │   │   │   ├── RevisionCenterResponse.java
│   │   │   │   │   ├── DashboardSummaryResponse.java
│   │   │   │   │   ├── TopicProgressResponse.java
│   │   │   │   │   └── DifficultyDistributionResponse.java
│   │   │   │   ├── entity/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── CodingProblem.java
│   │   │   │   │   ├── Revision.java
│   │   │   │   │   ├── Difficulty.java
│   │   │   │   │   ├── ProblemStatus.java
│   │   │   │   │   └── RevisionStatus.java
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ErrorResponse.java
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   ├── BadRequestException.java
│   │   │   │   │   ├── DuplicateResourceException.java
│   │   │   │   │   └── UnauthorizedException.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   ├── CodingProblemRepository.java
│   │   │   │   │   └── RevisionRepository.java
│   │   │   │   ├── security/
│   │   │   │   │   ├── UserPrincipal.java
│   │   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   └── JwtAuthenticationEntryPoint.java
│   │   │   │   └── service/
│   │   │   │       ├── AuthService.java
│   │   │   │       ├── ProblemService.java
│   │   │   │       ├── RevisionService.java
│   │   │   │       ├── DashboardService.java
│   │   │   │       └── UserService.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   │       ├── java/com/codetrack/
│   │       │   ├── controller/AuthControllerIntegrationTest.java
│   │       │   ├── security/JwtTokenProviderTest.java
│   │       │   └── service/
│   │       │       ├── AuthServiceTest.java
│   │       │       ├── ProblemServiceTest.java
│   │       │       ├── RevisionServiceTest.java
│   │       │       └── DashboardServiceTest.java
│   │       └── resources/
│   │           └── application-test.properties
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── api/
│       │   ├── axios.js
│       │   ├── authApi.js
│       │   ├── problemApi.js
│       │   ├── revisionApi.js
│       │   ├── dashboardApi.js
│       │   ├── topicApi.js
│       │   └── userApi.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── DifficultyBadge.jsx
│       │   ├── StatCard.jsx
│       │   ├── Pagination.jsx
│       │   ├── ConfirmModal.jsx
│       │   ├── LoadingSpinner.jsx
│       │   └── EmptyState.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ToastContext.jsx
│       ├── layouts/
│       │   ├── MainLayout.jsx
│       │   └── AuthLayout.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── ProblemListPage.jsx
│       │   ├── AddProblemPage.jsx
│       │   ├── ProblemDetailPage.jsx
│       │   ├── EditProblemPage.jsx
│       │   ├── RevisionCenterPage.jsx
│       │   ├── TopicsProgressPage.jsx
│       │   ├── SettingsPage.jsx
│       │   └── NotFoundPage.jsx
│       ├── styles/
│       │   └── index.css
│       ├── utils/
│       │   ├── constants.js
│       │   └── formatters.js
│       ├── App.jsx
│       └── main.jsx
├── database/
│   └── schema.sql
├── .gitignore
├── README.md
└── INTERVIEW_GUIDE.md
```

---

## 5. Database Schema and Setup

The MySQL schema is defined in `database/schema.sql`:

```sql
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
);

-- 2. Coding Problems Table
CREATE TABLE IF NOT EXISTS coding_problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    problem_url VARCHAR(500) NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'LeetCode',
    topic VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'TODO',
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
    INDEX idx_problems_user_topic (user_id, topic)
);

-- 3. Revisions Table
CREATE TABLE IF NOT EXISTS revisions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    problem_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    scheduled_date DATE NOT NULL,
    completed_at DATETIME NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_revisions_problem FOREIGN KEY (problem_id) REFERENCES coding_problems (id) ON DELETE CASCADE,
    CONSTRAINT fk_revisions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_revisions_user (user_id),
    INDEX idx_revisions_user_date (user_id, scheduled_date)
);
```

### Initializing Database
Log in to MySQL and run the schema file:
```bash
mysql -u root -p < database/schema.sql
```
Alternatively, in MySQL Workbench or DBeaver, open `database/schema.sql` and execute all statements.

---

## 6. Authentication and Security Flow

1. **Password Hashing:** Passwords are never stored in plaintext. Spring Security's `BCryptPasswordEncoder` hashes passwords with a cryptographic salt.
2. **Stateless JWT Tokens:** When a user logs in via `POST /api/auth/login`, Spring Security validates the credentials and issues a signed HMAC-SHA256 JWT access token.
3. **Protected Endpoints:** All requests to `/api/problems/**`, `/api/revisions/**`, `/api/dashboard/**`, and `/api/topics/**` require an `Authorization: Bearer <token>` header.
4. **User Principal Extraction:** The `JwtAuthenticationFilter` validates the signature and expiration, populating Spring Security's `SecurityContextHolder`. Controllers derive user identity through `@AuthenticationPrincipal UserPrincipal principal`.
5. **Zero Data Leakage:** Changing an ID in an API request does not permit viewing or editing another candidate's problems; all queries enforce `WHERE user_id = :principalId`.

---

## 7. Spaced Repetition Engine

CodeTrack implements a deterministic, database-backed spaced repetition algorithm based on Hermann Ebbinghaus's forgetting curve:

```text
Problem Solved
     │
     ▼
[ Interval 1: +1 Day ] ──▶ Completed ──▶ [ Interval 2: +3 Days ]
                                                    │
                                                    ▼
[ Mastered / +21 Days ] ◀── Completed ◀── [ Interval 3: +7 Days ]
```

- When a problem is saved or marked as `SOLVED`, CodeTrack checks completed revision history count $N$:
  - $N = 0$: Scheduled in **1 day**
  - $N = 1$: Scheduled in **3 days**
  - $N = 2$: Scheduled in **7 days**
  - $N \ge 3$: Scheduled in **21 days**
- Marking a revision as completed updates `completed_at`, records candidate notes, and automatically computes and schedules the next interval.

---

## 8. REST API Documentation

All REST API endpoints are prefixed with `/api`.

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Yes |

### Coding Problems
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/problems` | Filterable, paginated problem search | Yes |
| `POST` | `/api/problems` | Create a new coding problem | Yes |
| `GET` | `/api/problems/{id}` | Get problem details and revision count | Yes |
| `PUT` | `/api/problems/{id}` | Update existing problem | Yes |
| `PATCH` | `/api/problems/{id}/status` | Quick status change | Yes |
| `DELETE` | `/api/problems/{id}` | Delete problem and cascading revisions | Yes |

Query Parameters for `GET /api/problems`:
- `search`: Case-insensitive title search keyword
- `topic`: Filter by topic name (e.g. `Arrays`, `Dynamic Programming`)
- `difficulty`: `EASY`, `MEDIUM`, or `HARD`
- `status`: `TODO`, `IN_PROGRESS`, `SOLVED`, or `NEEDS_REVISION`
- `platform`: `LeetCode`, `HackerRank`, `Codeforces`, etc.
- `page`: Page index (default `0`)
- `size`: Page size (default `10`, max `100`)
- `sortBy`: `updatedAt`, `createdAt`, `title`, `difficulty`
- `direction`: `asc` or `desc`

### Dashboard Analytics
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Total, solved, in-progress, due counts & completion rate | Yes |
| `GET` | `/api/dashboard/topic-progress` | Per-topic total and solved breakdown | Yes |
| `GET` | `/api/dashboard/difficulty-distribution` | EASY, MEDIUM, and HARD metrics | Yes |
| `GET` | `/api/dashboard/recent-activity` | Top 5 recent problems and upcoming revisions | Yes |

### Revision Center
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/revisions` | Due today, overdue, upcoming, and completed lists | Yes |
| `GET` | `/api/revisions/due` | All currently due and overdue items | Yes |
| `POST` | `/api/revisions/{id}/complete` | Mark revision completed and schedule next | Yes |
| `POST` | `/api/problems/{id}/revisions/schedule` | Schedule custom revision date | Yes |
| `GET` | `/api/problems/{id}/revisions` | View problem's revision history timeline | Yes |

### Topics & Profile
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/topics` | Get all curriculum topics with stats | Yes |
| `GET` | `/api/topics/{topic}/problems` | Get all problems under a topic | Yes |
| `PUT` | `/api/users/me` | Update candidate display name | Yes |
| `PUT` | `/api/users/me/password` | Change user password | Yes |

---

## 9. Prerequisites and Environment Setup

### Prerequisites
- **Java Development Kit (JDK):** Version 17 or higher
- **Maven:** Version 3.8+
- **Node.js:** Version 18+ (Node 20 or 22 recommended)
- **npm:** Version 9+
- **MySQL Server:** Version 8.0+

### Environment Configuration

#### Backend Configuration (`backend/application.properties` or environment variables)
```properties
PORT=8080
DB_URL=jdbc:mysql://localhost:3306/codetrack_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=root
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend Configuration (`frontend/.env`)
```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 10. Running the Application Locally

### Step 1: Initialize Database
```bash
# In MySQL command line or client:
mysql -u root -p < database/schema.sql
```

### Step 2: Start the Backend Server
```bash
cd backend
mvn spring-boot:run
```
The backend starts at `http://localhost:8080`.

### Step 3: Start the Frontend Application
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173`.

---

## 11. Running Tests

### Backend Unit & Integration Tests
```bash
cd backend
mvn clean test
```
This executes all 18 JUnit 5 and Mockito tests covering:
- User registration and duplicate email rejection (409 Conflict)
- User login, password hashing, and authentication failures (401 Unauthorized)
- Spaced repetition interval calculations (0 -> 1d, 1 -> 3d, 2 -> 7d, 3+ -> 21d)
- Coding problem CRUD and user isolation boundaries
- Dashboard summary calculation with zero-state handling
- JWT generation, claims parsing, and expired/tampered token rejection
- MockMvc security lifecycle integration tests

### Frontend Build Verification
```bash
cd frontend
npm run build
```
Generates an optimized, minified production build in `frontend/dist/`.

---

## 12. Adding Screenshots

To display real application screenshots in this repository:
1. Create a folder named `screenshots/` at the root of the project:
   ```bash
   mkdir screenshots
   ```
2. Capture screenshots of the following pages:
   - `screenshots/01-landing.png` — Landing Page with feature highlights
   - `screenshots/02-dashboard.png` — Analytics Dashboard with Recharts
   - `screenshots/03-problems.png` — Problem repository with search and filters
   - `screenshots/04-revisions.png` — Revision Center with spaced repetition tabs
   - `screenshots/05-topics.png` — Topics & Progress drill-down
3. Reference them in your README:
   ```markdown
   ![Dashboard Preview](screenshots/02-dashboard.png)
   ```

---

## 13. Known Limitations and Future Enhancements

- **Stateless JWT Invalidation:** As with standard stateless JWT architectures, tokens remain valid until their expiration timestamp unless an in-memory or Redis token blacklist is maintained. Logging out clears the token on the client side.
- **External Platform Synchronization:** Problem details (title, topic, complexity) are inputted by the candidate rather than scraped directly from LeetCode or Codeforces APIs to avoid rate limits and anti-bot captchas.
- **Email Verification:** Registration is immediate without sending SMTP email confirmation links to simplify local development setups.
