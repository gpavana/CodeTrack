# CodeTrack — Technical Interview & Architecture Guide

This guide is specifically written for students and freshers to help you explain every technical detail, architectural choice, and line of code in **CodeTrack** with confidence during technical interviews.

---

## 1. Why Spring Boot Was Chosen

### The Core Problem in Enterprise Java
Before Spring Boot, building enterprise Java applications required configuring hundreds of lines of XML (`applicationContext.xml`, `web.xml`), manually managing WAR archives, and deploying them to external servlet containers like standalone Apache Tomcat or WildFly.

### How Spring Boot Solves This
1. **Convention over Configuration:** Spring Boot provides opinionated defaults. If `spring-boot-starter-web` is on the classpath, Spring automatically configures DispatcherServlet, Jackson ObjectMapper for JSON conversion, and an embedded Apache Tomcat web server.
2. **Embedded Servlet Container:** Applications package into a self-contained executable JAR (`java -jar app.jar`) with embedded Tomcat on port 8080.
3. **Starter Dependencies:** Instead of hunting compatible versions for 20 individual libraries, starter dependencies like `spring-boot-starter-data-jpa` or `spring-boot-starter-security` bundle pre-tested, mutually compatible dependency versions.
4. **Inversion of Control (IoC) & Dependency Injection (DI):** Instead of manually creating instances with `new ProblemService()`, Spring's IoC container instantiates beans at startup and injects them where needed using constructor injection.

---

## 2. How React Communicates with the Backend

### The Client-Server Decoupling
CodeTrack uses a decoupled Single Page Application (SPA) architecture:
- **Frontend (Port 5173):** React renders components in the user's browser DOM.
- **Backend (Port 8080):** Spring Boot exposes JSON REST endpoints.

```text
React Component (e.g. ProblemListPage)
       │
       ▼ (Calls async function)
Axios Client Instance (src/api/axios.js)
       │
       ├── Interceptor 1: Injects "Authorization: Bearer <token>"
       ▼
HTTP Network Request (GET http://localhost:8080/api/problems)
       ▼
Spring Boot Controller (ProblemController.java)
       │ (JSON deserialized -> Business logic executed)
       ▼
HTTP JSON Response (Status 200 OK)
       │
       ├── Interceptor 2: Detects 401 Unauthorized -> Clears token on expiration
       ▼
React Component Updates State (setPagedData) ──▶ Virtual DOM Re-renders
```

### Key Interview Concepts to Explain:
- **CORS (Cross-Origin Resource Sharing):** Browsers block HTTP requests between different origins (`localhost:5173` to `localhost:8080`) by default for security. We configured `CorsConfigurationSource` in Spring Security to explicitly whitelist `http://localhost:5173` with credentials and allowed HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- **Axios Interceptors:** Avoids manually passing the JWT token in every component. A single request interceptor reads the token from `localStorage` and attaches `Authorization: Bearer <token>`. A response interceptor intercepts any `401 Unauthorized` responses and redirects the user to `/login`.

---

## 3. What Spring Data JPA and Hibernate Do

### Object-Relational Mapping (ORM)
Relational databases store tables and rows; Java programs use classes and objects. Hibernate bridges this impedance mismatch:
- An `@Entity` class like `CodingProblem` maps directly to the `coding_problems` SQL table.
- Each instance of the class represents a row in that table.
- Fields annotated with `@Column`, `@Enumerated`, and `@ManyToOne` define foreign keys and column data types.

### The Power of Spring Data JPA
Without Spring Data JPA, you would write repetitive JDBC code: opening connections, creating `PreparedStatement`, looping through `ResultSet`, and closing connections.

Spring Data JPA provides:
1. **Interface-Only Repositories:** By extending `JpaRepository<CodingProblem, Long>`, Spring generates standard CRUD operations (`save`, `findById`, `delete`, `findAll`) at runtime through dynamic proxies.
2. **Derived Query Methods:** Writing `countByUserIdAndStatus(Long userId, ProblemStatus status)` automatically generates the SQL:
   ```sql
   SELECT COUNT(*) FROM coding_problems WHERE user_id = ? AND status = ?;
   ```
3. **Dynamic Filtering with JPA Specifications:** For the problem search and filter page, we use `JpaSpecificationExecutor`. It dynamically combines predicates (`like`, `equal`) into a single SQL query with `LIMIT` and `OFFSET` for pagination.

---

## 4. The Request Lifecycle (Entity-Repository-Service-Controller)

When a candidate clicks "Save Problem":

1. **HTTP Request:** React sends a `POST /api/problems` with JSON body.
2. **Security Filter:** `JwtAuthenticationFilter` validates the JWT token, builds `UserPrincipal`, and sets it in `SecurityContextHolder`.
3. **Controller Layer (`ProblemController`):**
   - `@Valid` triggers Jakarta Bean Validation on `ProblemRequest` (checking `@NotBlank`, `@Size`).
   - Extracts current user ID via `@AuthenticationPrincipal UserPrincipal principal`.
   - Delegates to `problemService.createProblem(userId, request)`.
   - Wraps output in `ApiResponse.success(...)` returning `HTTP 201 Created`.
4. **Service Layer (`ProblemService`):**
   - Contains business logic: verifies user exists in database.
   - If the status is `SOLVED`, sets `dateSolved` and calls `revisionService.scheduleNextSpacedRevision(...)`.
   - Converts the DTO into a `CodingProblem` entity.
5. **Repository Layer (`CodingProblemRepository`):**
   - Calls `problemRepository.save(problem)`.
   - Hibernate issues an SQL `INSERT INTO coding_problems ...` query through HikariCP.
6. **Database:** MySQL commits the transaction and generates an auto-incremented primary key.

---

## 5. How JWT Authentication & BCrypt Work

### Why Stateless JWT instead of Sessions?
In traditional session-based authentication, the server creates a session in memory and sets a `JSESSIONID` cookie. In distributed or modern decoupled systems, this consumes server memory and complicates horizontal scaling.

With **JSON Web Tokens (JWT)**:
- The token is completely self-contained. It consists of three Base64URL-encoded parts separated by dots:
  `Header.Payload.Signature`
- **Header:** Specifies algorithm (`HS256` or `HS384`).
- **Payload:** Contains claims (`sub` = email, `userId`, `exp` = expiration timestamp).
- **Signature:** Created by hashing `Header + Payload` with a private secret key known only to the backend server.
- The server does not need to store active sessions in a database. To verify authentication, it cryptographically validates the token's signature using the secret key.

### How BCrypt Works
- Storing passwords in plaintext or simple hashes like MD5/SHA-256 is insecure against rainbow table attacks.
- `BCryptPasswordEncoder` uses a one-way key derivation function with an internal random salt and a configurable work factor (cost parameter).
- Each password produces a unique hash even if two users choose the exact same password:
  ```text
  $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
  └──┬─┘└┬┘└──────────┬─────────┘└─────────────┬─────────────┘
   Alg Cost     22-char salt            31-char hash
  ```

---

## 6. How Multi-Tenant Authorization Works (Preventing IDOR)

### The Vulnerability: IDOR (Insecure Direct Object Reference)
In naive CRUD applications, endpoints look like:
`GET /api/problems/45` or `DELETE /api/problems/45`
If the developer executes:
```java
problemRepository.deleteById(id);
```
An attacker could simply change the URL ID from `45` to `46` to delete or view another candidate's private problem solutions.

### How CodeTrack Guarantees Complete Isolation:
1. The backend **never trusts client-supplied user IDs**. User identity is extracted exclusively from the authenticated JWT token:
   ```java
   Long currentUserId = principal.getId();
   ```
2. Every database query enforces the `user_id` constraint:
   ```java
   CodingProblem problem = problemRepository.findByIdAndUserId(problemId, currentUserId)
           .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
   ```
3. If an unauthorized user attempts to access ID `46`, the query returns empty, triggering a safe `404 Not Found` without disclosing whether the record exists.

---

## 7. How Dashboard Statistics Are Calculated

Instead of fetching thousands of records into Java memory to calculate counts in loops (which causes severe memory overhead), CodeTrack leverages database-level SQL aggregations:

### 1. Topic Progress Projection
```java
@Query("SELECT p.topic as topic, COUNT(p) as total, " +
       "SUM(CASE WHEN p.status = 'SOLVED' THEN 1L ELSE 0L END) as solved " +
       "FROM CodingProblem p WHERE p.user.id = :userId GROUP BY p.topic")
List<TopicStatProjection> getTopicProgress(@Param("userId") Long userId);
```
This executes a single efficient `GROUP BY` query in MySQL.

### 2. Difficulty Distribution Projection
```java
@Query("SELECT p.difficulty as difficulty, COUNT(p) as total, " +
       "SUM(CASE WHEN p.status = 'SOLVED' THEN 1L ELSE 0L END) as solved " +
       "FROM CodingProblem p WHERE p.user.id = :userId GROUP BY p.difficulty")
List<DifficultyStatProjection> getDifficultyDistribution(@Param("userId") Long userId);
```

### 3. Edge-Case Handling: Division by Zero
When a new user registers, total problems is `0`. Calculating completion rate as `(solved / total) * 100` would throw an arithmetic exception or return `NaN`. In `DashboardService`:
```java
double rate = 0.0;
if (total > 0) {
    rate = BigDecimal.valueOf((double) solved / total * 100.0)
            .setScale(1, RoundingMode.HALF_UP)
            .doubleValue();
}
```

---

## 8. How Revision Scheduling Works

### The Spaced Repetition Logic
Memory retention naturally degrades over time according to Ebbinghaus's Forgetting Curve. Reviewing material at progressively increasing intervals resets the decay curve.

### CodeTrack Implementation:
1. `RevisionService.calculateNextIntervalDays(completedCount)`:
   - $0$ completed reviews: Interval = **1 day**
   - $1$ completed review: Interval = **3 days**
   - $2$ completed reviews: Interval = **7 days**
   - $\ge 3$ completed reviews: Interval = **21 days**
2. When a problem is marked `SOLVED`, or a revision session is completed with `scheduleNext = true`:
   ```java
   long completedCount = revisionRepository.countByUserIdAndProblemIdAndStatus(userId, problemId, RevisionStatus.COMPLETED);
   int intervalDays = calculateNextIntervalDays(completedCount);
   LocalDate nextDate = LocalDate.now().plusDays(intervalDays);
   ```
3. To avoid duplicate rows when candidates repeatedly submit, `RevisionService` checks for existing `PENDING` revisions and updates the scheduled date rather than creating redundant records.

---

## 9. Top Interview Questions & Model Answers

### Q1: Why did you use DTOs instead of exposing JPA entities directly in your controllers?
> **Answer:** "Exposing JPA entities directly creates tight coupling between the database schema and the API contract. It can lead to security vulnerabilities such as mass assignment (over-posting), infinite recursion during JSON serialization with bidirectional relationships (`@OneToMany`/`@ManyToOne`), and lazy loading exceptions (`LazyInitializationException`). DTOs allow strict control over input validation, hide sensitive database columns like password hashes, and format output tailored to the frontend's needs."

### Q2: How does the application handle global exceptions?
> **Answer:** "I implemented a centralized `@RestControllerAdvice` class named `GlobalExceptionHandler`. It intercepts specific exceptions such as `ResourceNotFoundException` (mapped to HTTP 404), `DuplicateResourceException` (mapped to HTTP 409 Conflict), and `MethodArgumentNotValidException` (mapped to HTTP 400 with a map of field-specific validation errors). This ensures all client errors receive a consistent, structured `ErrorResponse` JSON without leaking internal server stack traces."

### Q3: How do you handle pagination in large data sets?
> **Answer:** "Rather than fetching all records and slicing them in the frontend (which degrades performance as data grows), we use Spring Data JPA's `Pageable` and `PageRequest`. The frontend passes `page` and `size` query parameters, and the backend translates them into SQL `LIMIT` and `OFFSET` clauses. The returned `PagedResponse` includes `totalPages`, `totalElements`, and `isLast` flags for clean UI pagination."

### Q4: What happens if a user's JWT expires while they are using the platform?
> **Answer:** "The backend's `JwtAuthenticationFilter` attempts to parse the token using `Jwts.parser()`. If the expiration claim is past the current timestamp, JJWT throws an `ExpiredJwtException`. The filter catches this and rejects the request. On the frontend, an Axios response interceptor intercepts the `401 Unauthorized` status, purges `localStorage`, and cleanly redirects the candidate to `/login?expired=true` with an informative session expiration notice."

### Q5: Why did you choose constructor injection over `@Autowired` on fields?
> **Answer:** "Constructor injection is the recommended best practice in modern Spring. It enforces immutability by allowing dependency fields to be marked `final`, prevents `NullPointerException` during unit testing by making dependencies explicit, avoids circular dependencies at startup, and allows easy unit testing using Mockito without needing to reflectively inject private fields."
