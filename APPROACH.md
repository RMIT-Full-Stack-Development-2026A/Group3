# TicTacToang — HD Master Project Plan
### COSC2769 / COSC2808 · Full Stack Development · Due 18:00, May 8 2026
> **Target: High Distinction (85–100%). Every decision in this document is driven by the rubric and SRS Ultimo-tier requirements.**

---

## Table of Contents

1. [HD Achievement Strategy](#1-hd-achievement-strategy)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Blueprint](#3-architecture-blueprint)
   - 3.1 [Backend: Modular Monolith (Ultimo)](#31-backend-modular-monolith-ultimo)
   - 3.2 [Frontend: Feature-Driven Component Packages (Ultimo)](#32-frontend-feature-driven-component-packages-ultimo)
4. [Middleware: RBAC & ABAC Architecture](#4-middleware-rbac--abac-architecture)
   - 4.1 [Conceptual Difference: RBAC vs ABAC](#41-conceptual-difference-rbac-vs-abac)
   - 4.2 [Middleware Chain Design](#42-middleware-chain-design)
   - 4.3 [authMiddleware — JWS Verification](#43-authmiddleware--jws-verification)
   - 4.4 [roleMiddleware — RBAC Guard](#44-rolemiddleware--rbac-guard)
   - 4.5 [ownershipMiddleware — ABAC Guard](#45-ownershipmiddleware--abac-guard)
   - 4.6 [premiumMiddleware — Attribute Guard](#46-premiummiddleware--attribute-guard)
   - 4.7 [loginRateLimiter — Brute-Force Guard](#47-loginratelimiter--brute-force-guard)
   - 4.8 [Route-to-Middleware Mapping](#48-route-to-middleware-mapping)
5. [DTO Architecture](#5-dto-architecture)
   - 5.1 [Why DTOs — The Security Argument](#51-why-dtos--the-security-argument)
   - 5.2 [DTO Design Rules](#52-dto-design-rules)
   - 5.3 [Response Envelope Pattern](#53-response-envelope-pattern)
   - 5.4 [DTO Catalogue by Module](#54-dto-catalogue-by-module)
   - 5.5 [Controller → Service → DTO Data Flow](#55-controller--service--dto-data-flow)
6. [Data Model (MongoDB Collections)](#6-data-model-mongodb-collections)
7. [Sprint Plan](#7-sprint-plan)
8. [Gap Analysis: Original Tasks vs SRS](#8-gap-analysis-original-tasks-vs-srs)
9. [GitHub & SCRUM Workflow](#9-github--scrum-workflow)
10. [Interview Preparation Guide](#10-interview-preparation-guide)
11. [Report Writing Guide (25-Page Allocation)](#11-report-writing-guide-25-page-allocation)
12. [Final Submission Checklist](#12-final-submission-checklist)

---

## 1. HD Achievement Strategy

### Rubric Scorecard Target

| Criterion | Max | Target | Key Action |
|---|---|---|---|
| Code Organization & Style | 5 | **5/5** | Modular Monolith + N-Tier, feature-driven folders, JSDoc on every public function |
| Demo, Deployment & Interview | 10 | **10/10** | Cloud deploy on Render, Gold Dataset preloaded, all members rehearsed |
| Report | 8 | **8/8** | 25 pages, sequence diagrams, ERD, component diagrams, DTO field analysis |
| Features & Implementation | 10 | **10/10** | All Ultimo-tier features + win animation, responsive admin |
| Team Contribution & Collaboration | 7 | **7/7** | SCRUM board with story points, feature branches, active commit history, lecturer on board |
| **Total** | **40** | **40/40** | |

### Non-Negotiable Architecture Decisions for HD

To score in the **Excellent** band on every criterion, the team must commit to Ultimo tier across the board:

- **Backend**: Modular Monolith with full N-Tier stack per module (Route → Controller → Service → Repository → Model)
- **Backend**: Modules communicate only through exported interface functions — no cross-module Service imports
- **Backend**: DTO on every API response — raw Mongoose documents are **never** sent to the client
- **Frontend**: Feature-package structure — each feature has JSX + Hook + Service + Model + CSS in separate files under one folder
- **Frontend**: HTTP Helper utility class (Axios interceptor that auto-attaches JWT)
- **Frontend**: Global API config grouped by business domain (`authAPI`, `gameAPI`, `profileAPI`, `adminAPI`)
- **Frontend**: Role-based route guards (PLAYER blocked from `/admin/*`, vice versa)
- **Frontend**: Responsive design on Profile page and **all** Admin UIs

---

## 2. Technology Stack

> The stack is fixed by the SRS. All choices below align with what was introduced in-course.

| Layer | Technology | Justification |
|---|---|---|
| Frontend | React 18 + Vite | Fast HMR, modern JSX, course-approved |
| Frontend | Tailwind CSS + Bootstrap 5 | Tailwind for layout architecture; Bootstrap for standard UI elements (modal, badge, card) |
| Frontend | Axios | HTTP client with interceptor support for JWT auto-attachment |
| Frontend | Socket.IO Client | Real-time game state sync and in-game chat |
| Backend | **Node.js + Express.js** | MEN Stack — required by SRS (section b) |
| Backend | **MongoDB + Mongoose** | Document DB, flexible schema for game board state |
| Backend | Socket.IO | WebSocket server for real-time multiplayer (SRS 4.3.1) |
| Backend | bcrypt | Password **hashing** — SRS 1.1.3 is explicit: hashing ≠ encryption |
| Backend | jsonwebtoken | JWS token generation with `userId` + `role` claims (SRS 2.3.1) |
| Backend | express-rate-limit | Per-IP brute-force protection middleware (SRS 2.2.1) |
| Backend | nodemailer | Email notification on premium payment (SRS 5.1.2) |
| Backend | multer + sharp | Avatar upload (SRS 3.2.1) + auto-resize to 200×200 px |
| Database | MongoDB Atlas | Cloud DB — whitelist `0.0.0.0/0` for grader network access |
| Deployment | Render | Cloud deploy for backend (Web Service) and frontend (Static Site) |

> **Note on the existing guide**: `tictactoe_platform_guide.md` references Java Spring Boot. This project uses **Node.js + Express** as required by the SRS MEN Stack specification. All architecture patterns — N-Tier, Modular Monolith, DTOs, RBAC, ABAC — are language-agnostic and apply identically here.

---

## 3. Architecture Blueprint

### 3.1 Backend: Modular Monolith (Ultimo)

The backend combines two architectural patterns: **N-Tier** (separation of concerns within a module) and **Modular Monolith** (bounded contexts between modules). The result is a single deployable unit where each business domain is internally structured and externally isolated.

**Why not pure N-Tier alone?** Pure N-Tier groups files by layer (`controllers/`, `services/`, `models/`), which causes high coupling between business domains — changing the auth service risks breaking game logic. Modular Monolith adds vertical slicing by feature, so each domain owns its own layers.

**Why not Microservices?** Overkill for this scale. A Modular Monolith gives team-level separation of work without the operational overhead of separate deployment pipelines.

```
backend/
├── index.js                        ← Entry point: npm start / node index.js
├── package.json
├── .env
│
├── config/
│   ├── db.js                       ← MongoDB Atlas connection
│   └── env.js                      ← Centralized environment variable loader + validation
│
├── middleware/                     ← 🛡️ GLOBAL MIDDLEWARE (see Section 4)
│   ├── authMiddleware.js           ← JWS token verification
│   ├── roleMiddleware.js           ← RBAC: PLAYER / ADMIN role guard
│   ├── ownershipMiddleware.js      ← ABAC: resource ownership guard
│   ├── premiumMiddleware.js        ← ABAC: premium-only feature guard
│   └── loginRateLimiter.js        ← Brute-force: block after 5 fails / 60s
│
├── common/
│   ├── responseHelper.js           ← Global response envelope { success, data, message }
│   └── errorHandler.js             ← Global Express error handler
│
├── auth/                           ← 🔐 AUTH MODULE
│   ├── authRoute.js                ← POST /api/v1/auth/register | /login | /logout
│   ├── authController.js           ← HTTP in/out → delegates to authService
│   ├── authService.js              ← bcrypt hash, JWS sign, brute-force counter logic
│   ├── authRepository.js           ← findByEmail() | findByUsername() | createUser()
│   ├── authModel.js                ← Mongoose User schema
│   ├── authDTO.js                  ← RegisterRequestDTO | LoginResponseDTO | PublicUserDTO
│   └── authInterface.js            ← Public interface for other modules to call (A.3.1)
│
├── profile/                        ← 📊 PROFILE MODULE
│   ├── profileRoute.js             ← GET /api/v1/profile/:id | PUT /api/v1/profile/:id
│   ├── profileController.js
│   ├── profileService.js           ← Avatar resize logic, history search & filter
│   ├── profileRepository.js        ← findById() | updateProfile() | getGameHistory()
│   ├── profileModel.js             ← (reuses User + GameSession references)
│   └── profileDTO.js               ← ProfileResponseDTO | GameSessionSummaryDTO
│
├── game/                           ← 🎮 GAME MODULE
│   ├── gameRoute.js                ← POST /api/v1/game/start | /move | GET /api/v1/game/history
│   ├── gameController.js
│   ├── gameService.js              ← checkWin() | calculateAIMove() | recordMove()
│   ├── gameRepository.js           ← createSession() | appendMove() | findSessionById()
│   ├── gameModel.js                ← GameSession schema (with moves[] array for Replay)
│   └── gameDTO.js                  ← MoveRequestDTO | MoveResponseDTO | ReplaySessionDTO
│
├── arena/                          ← 🌐 ARENA / ONLINE MODULE
│   ├── arenaRoute.js               ← GET /api/v1/arena/rooms | POST /api/v1/arena/rooms
│   ├── arenaController.js
│   ├── arenaService.js             ← createRoom() | joinRoom() | closeRoom()
│   ├── arenaRepository.js          ← findActiveRooms() | findRoomById() | updateRoomStatus()
│   ├── arenaModel.js               ← GameRoom schema
│   ├── arenaDTO.js                 ← RoomSummaryDTO | RoomDetailDTO
│   └── socketHandler.js            ← Socket.IO events: join | move | chat | leave | close
│
├── subscription/                   ← 💳 PREMIUM MODULE
│   ├── subscriptionRoute.js        ← POST /api/v1/subscription/deposit | /subscribe
│   ├── subscriptionController.js
│   ├── subscriptionService.js      ← Wallet deduction, email trigger, Stripe (medium tier)
│   ├── subscriptionRepository.js   ← createSubscription() | findByUserId()
│   ├── subscriptionModel.js        ← Subscription schema
│   └── subscriptionDTO.js          ← DepositRequestDTO | SubscribeResponseDTO
│
└── admin/                          ← 👑 ADMIN MODULE
    ├── adminRoute.js               ← GET /api/v1/admin/users | /rooms | PUT /api/v1/admin/users/:id/status
    ├── adminController.js
    ├── adminService.js             ← deactivateUser() | reactivateUser() | closeRoom()
    ├── adminRepository.js          ← findAllUsers() | findAllRooms() | searchRooms()
    └── adminDTO.js                 ← UserSummaryDTO | RoomAdminDTO
```

#### Layer Responsibilities (N-Tier within each module)

| Layer | File suffix | Responsibility | Must NOT do |
|---|---|---|---|
| **Route** | `*Route.js` | Declare HTTP paths and wire middleware chain to controller methods | Contain any business logic |
| **Controller** | `*Controller.js` | Parse request, call Request DTO for validation, call Service, call Response DTO, send reply | Query the database directly |
| **Service** | `*Service.js` | Implement all business rules (win check, AI, auth logic, wallet deduction) | Know about HTTP (`req`/`res`) or execute DB queries |
| **Repository** | `*Repository.js` | Define and execute all database queries via Mongoose | Contain business logic or HTTP concerns |
| **Model** | `*Model.js` | Define the Mongoose schema and collection structure | Contain logic of any kind |
| **DTO** | `*DTO.js` | Shape data coming in (validation) and going out (field filtering) | Persist data or enforce business rules |
| **Interface** | `*Interface.js` | Re-export selected service functions for other modules to call | Expose internal Repository or Model |

#### Module Interface Rule (SRS A.3.1)

When one module needs data from another, it calls the **public interface file** of that module — never its Service directly. This preserves bounded context and prevents cascading changes across modules.

- **Correct**: `gameService` needs user info → calls `authInterface.getUserById()`
- **Incorrect**: `gameService` imports `authService` directly → breaks module isolation

Each module that exposes functionality to peers must maintain an `*Interface.js` file that acts as a controlled API boundary. Only functions listed in the interface file are part of the module's public contract. This is an application of the **Facade pattern** — the interface file hides internal complexity and exposes only a curated surface.

---

### 3.2 Frontend: Feature-Driven Component Packages (Ultimo)

The frontend is organized by **vertical feature slices**, not horizontal layers. Every feature folder is a self-contained package holding all five elements required by SRS A.3.a in **separate files**. The Component and Hook are **decoupled** (SRS A.3.b) — the hook is configured independently of the component so the component's behavior can be swapped without rewriting JSX.

```
frontend/src/
│
├── config/
│   └── apiConfig.js               ← Base URL + grouped route constants
│                                      Exports: authAPI, gameAPI, profileAPI, arenaAPI, adminAPI
│                                      Each group is an object of named route strings
│
├── util/
│   └── httpClient.js              ← Axios instance — the REST HTTP Helper (SRS A.2.b)
│                                      Attaches Authorization: Bearer <token> to every request
│                                      Returns { data, status, headers } to the caller
│                                      Handles 401 responses globally (redirect to login)
│
├── core/
│   ├── AuthContext.jsx            ← JWT state management: user, token, login(), logout()
│   └── RouteGuard.jsx             ← Role-based redirect guard (SRS A.2.c)
│
├── components/                    ← Reusable UI components (SRS A.1.3)
│   ├── Button/
│   ├── Modal/
│   ├── Avatar/
│   ├── LoadingSpinner/
│   └── CountrySelect/             ← Dropdown for country field — SRS 1.1.4 (no free text)
│
├── features/
│   ├── auth/
│   │   ├── RegisterView.jsx       ← Presentation only — renders form, displays hook state
│   │   ├── LoginView.jsx
│   │   ├── useAuthHook.js         ← State: form fields, errors, loading; handlers: validate, submit
│   │   ├── authService.js         ← Network: POST /auth/register | POST /auth/login
│   │   ├── authModel.js           ← Shape definition for User object
│   │   └── auth.css
│   │
│   ├── profile/
│   │   ├── ProfileView.jsx        ← Responsive layout (SRS A.4.b)
│   │   ├── GameHistoryView.jsx    ← Table + search + filter + sort controls
│   │   ├── useProfileHook.js      ← State: profile data, history list, search/filter params
│   │   ├── profileService.js      ← Network: GET/PUT /profile/:id | POST /profile/:id/avatar
│   │   ├── profileModel.js
│   │   └── profile.css
│   │
│   ├── game/
│   │   ├── GameBoardView.jsx      ← Board grid with algebraic notation axes (A–O, 1–15)
│   │   ├── GameSetupView.jsx      ← Board size, marker choice, who goes first
│   │   ├── WinnerOverlay.jsx      ← Win animation: motion + color effect (SRS 4.2.6)
│   │   ├── useGameHook.js         ← State: boardState, currentTurn, isLoading; win observer
│   │   ├── aiEngine.js            ← Pure functions: easyMove() | mediumMove() | hardMove()
│   │   ├── gameService.js         ← Network: POST /game/start | POST /game/move
│   │   ├── gameModel.js
│   │   └── game.css
│   │
│   ├── arena/
│   │   ├── ArenaView.jsx          ← Live room list with join button
│   │   ├── OnlineGameView.jsx     ← Board + chat sidebar
│   │   ├── useArenaHook.js        ← Socket.IO subscriptions: room events, move events, chat
│   │   ├── arenaService.js        ← Network: GET /arena/rooms | POST /arena/rooms
│   │   └── arena.css
│   │
│   ├── replay/                    ← Premium only (SRS 4.3.3)
│   │   ├── ReplayView.jsx         ← Board snapshot + Pause / Resume / Forward / Backward controls
│   │   ├── useReplayHook.js       ← Step iterator with configurable delay, playback state
│   │   └── replayService.js       ← Network: GET /game/:id/replay
│   │
│   ├── subscription/
│   │   ├── WalletView.jsx
│   │   ├── SubscribeView.jsx
│   │   ├── useSubscriptionHook.js
│   │   └── subscriptionService.js
│   │
│   └── admin/
│       ├── AdminUserListView.jsx  ← Responsive table (SRS A.4.b)
│       ├── AdminRoomListView.jsx  ← Room list + search + close action
│       ├── useAdminHook.js
│       ├── adminService.js        ← Network: GET /admin/users | PUT /admin/users/:id/status | DELETE /admin/rooms/:id
│       └── admin.css              ← Responsive grid layout
│
└── App.jsx                        ← Router + RouteGuard wrapping all protected routes
```

#### Frontend Layer Responsibilities

| Layer | File suffix | Responsibility | Must NOT do |
|---|---|---|---|
| **View** | `*View.jsx` | Render JSX, consume hook state, display errors and loading states | Contain business logic or make network calls directly |
| **Hook** | `use*Hook.js` | Own component state, handle user events, call service functions, manage loading flags | Render any JSX |
| **Service** | `*Service.js` | Make HTTP calls via `httpClient`, return raw response data to the hook | Manage state or render UI |
| **Model** | `*Model.js` | Define the shape of objects the feature works with | Contain logic or make network calls |
| **Style** | `*.css` | Scoped styles for the feature | Anything outside styling |

#### Component–Hook Decoupling (SRS A.3.b)

The hook is **not hardcoded** inside the component. The component only depends on the interface (the return values) of the hook — not on a specific hook implementation. This is the **Dependency Inversion Principle** applied at the component level: both the component and the hook depend on an abstract contract, not on each other directly.

In practice, this means a `GameBoardView` can receive a real `useGameHook` in production or a stub hook during testing — without changing the component's JSX. The hook is either passed as a prop or its output is destructured and passed down, keeping the binding loose.

---

## 4. Middleware: RBAC & ABAC Architecture

This is one of the most important architecture decisions for HD. The SRS requires authorization at multiple levels — a single "is the user logged in?" check is insufficient. Two complementary access control models are applied together in a layered middleware chain.

### 4.1 Conceptual Difference: RBAC vs ABAC

| Model | Full Name | Decision basis | When to use |
|---|---|---|---|
| **RBAC** | Role-Based Access Control | The **role** assigned to the user (`PLAYER` or `ADMIN`) | Controlling access to entire route groups (e.g., all `/admin/*` routes) |
| **ABAC** | Attribute-Based Access Control | The **attributes** of both the user AND the resource being accessed | Controlling row-level access (e.g., a player can only edit their own profile, not another player's) |

**Why RBAC alone is insufficient for HD**: RBAC can verify that a user is a `PLAYER`, but it cannot verify that Player A is accessing *their own* profile rather than Player B's. ABAC fills this gap by comparing user attributes (their `id`, their `isPremium` flag) against resource attributes (the resource owner's `id`, whether the feature requires premium). Using only RBAC would leave a privilege escalation vulnerability where any authenticated player could read or modify any other player's data.

### 4.2 Middleware Chain Design

Every protected request passes through middleware in a fixed order. Each layer is independently responsible for one decision — a clean application of the **Single Responsibility Principle** and the **Chain of Responsibility** design pattern. If any layer rejects the request, the chain halts immediately and the controller is never reached.

```
Incoming Request
       │
       ▼
┌─────────────────────┐
│   authMiddleware    │  ← Is the JWS token present and cryptographically valid?
│                     │    YES → decode payload (userId, role, isPremium), attach to request context
│                     │    NO  → 401 Unauthorized, chain stops here
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   roleMiddleware    │  ← RBAC: Is the user's role in the allowed list for this route?
│   (ADMIN / PLAYER)  │    YES → proceed
│                     │    NO  → 403 Forbidden, chain stops here
└─────────┬───────────┘
          │
          ▼
┌──────────────────────────────────┐
│  ownershipMiddleware             │  ← ABAC (profile/game routes)
│     OR premiumMiddleware         │    Does the user own this resource?
│     (applied per route need)     │    OR does the user have the required attribute?
│                                  │    NO → 403 Forbidden, chain stops here
└─────────┬────────────────────────┘
          │
          ▼
┌─────────────────────┐
│     Controller      │  ← Only reached if all middleware layers pass
└─────────────────────┘
```

### 4.3 authMiddleware — JWS Verification

**Pattern applied**: Guard / Interceptor

**Responsibility**: Verify the cryptographic integrity and expiry of the JWS token attached to every request. On success, it decodes the payload and attaches a `user` context object to the request so downstream middleware and controllers can read identity information without re-querying the database on every call.

**Decision logic**:

| Condition | Response |
|---|---|
| No `Authorization` header, or header does not start with `Bearer ` | 401 — token missing |
| Header present but token signature is invalid (tampered) | 401 — token invalid |
| Token signature valid but past the expiry time | 401 — session expired, prompt re-login |
| Token fully valid | Attach `{ id, role, isPremium }` to request context, call next |

**What goes into the JWS payload at sign time**: At login, the service embeds `id`, `role`, and `isPremium` into the signed token. Embedding `isPremium` avoids a database round-trip on every request to the premium-protected replay endpoint. The trade-off is that if a user subscribes mid-session, their existing token reflects the old `isPremium: false` value until expiry (24h). This is an accepted limitation — document it in the report as a known trade-off between performance and real-time consistency.

### 4.4 roleMiddleware — RBAC Guard

**Pattern applied**: Strategy Pattern (factory function)

**Responsibility**: Enforce role-based access to entire route groups. Reads `req.user.role` (set by `authMiddleware`) and compares it against the configured list of permitted roles for that route.

**Design**: The middleware is implemented as a **factory function** — it accepts a list of allowed roles as arguments and returns a configured middleware function. This avoids duplicating logic across routes and makes the permission policy readable directly in the route definition. This is the **Strategy pattern**: the factory produces a strategy object (the returned middleware) whose behavior varies based on its configuration.

| Route example | Configured policy | Meaning |
|---|---|---|
| Admin user list | `roleMiddleware('ADMIN')` | Only admins may proceed |
| Arena room list | `roleMiddleware('PLAYER', 'ADMIN')` | Either role may proceed |
| Game start | `roleMiddleware('PLAYER')` | Players only |

**Decision logic**:
- `req.user.role` is in the allowed list → call next
- `req.user.role` is not in the allowed list → 403 Forbidden, with a message naming the required role(s)

### 4.5 ownershipMiddleware — ABAC Guard

**Pattern applied**: Guard + Policy Object

**Responsibility**: Enforce that a `PLAYER` can only access or modify resources they own. This implements row-level security that RBAC cannot provide, protecting against horizontal privilege escalation (Player A accessing Player B's data).

**Design decisions**:
- Admin users bypass ownership checks entirely — their RBAC clearance already grants broader access intentionally
- For **profile routes** (e.g., `GET /profile/:id`), ownership is determined by comparing `req.user.id` against the route parameter `id` — no database lookup needed
- For **game session routes** where ownership requires knowing who the participants were, the check is performed inside the **Service layer** after fetching the session — not in middleware — because the middleware does not have the document data yet. The Service throws a `ForbiddenError` if the requesting user is not a participant

**The attack it prevents**: Without this middleware, any authenticated player who knows another player's user ID could call `PUT /profile/:otherId` to overwrite another user's email or password. RBAC cannot block this because both users share the `PLAYER` role.

**Decision logic**:
- `req.user.role === 'ADMIN'` → bypass, call next (admins have unrestricted access)
- `req.user.id` matches the resource identifier in route params → call next
- Mismatch → 403 "You can only access your own resources"

### 4.6 premiumMiddleware — Attribute Guard

**Pattern applied**: Guard / Feature Flag

**Responsibility**: Enforce that a feature is accessible only to users with an active premium subscription. This is ABAC where the relevant attribute is `isPremium` on the user object rather than resource ownership.

**Design**: Reads `req.user.isPremium` from the request context, which was decoded from the JWS token by `authMiddleware`. Because this value is already in the token, no database query is needed at the middleware level.

**Applied to**: `GET /api/v1/game/:id/replay` — the Replay feature is premium-only per SRS 4.3.3.

**Decision logic**:
- `req.user.isPremium === true` → call next
- `req.user.isPremium === false` → 403 Forbidden with a message directing the user to the subscription page

### 4.7 loginRateLimiter — Brute-Force Guard

**Pattern applied**: Token Bucket / Sliding Window (two independent levels — defence in depth)

**Responsibility**: Implement SRS 2.2.1 at two levels simultaneously for maximum resilience.

**Level 1 — Per-IP (middleware layer)**: Applied as middleware on the `POST /auth/login` route before the controller is reached. Blocks the requesting IP address after 5 requests within a 60-second window. This requires no database access and stops high-volume attacks before they hit the auth logic.

**Level 2 — Per-Account (Service layer)**: Inside `authService`, failed password comparisons increment a `loginAttempts` counter stored on the User document. After 5 failures for the same account — regardless of the source IP — the account is locked for 60 seconds via a `lockUntil` timestamp. This stops targeted attacks distributed across multiple IPs, each staying under the per-IP limit.

**Reset condition**: A successful login resets both `loginAttempts` to 0 and clears `lockUntil`.

**Why two levels?** A per-IP limiter alone is bypassed by botnets where each node sends fewer than 5 requests. A per-account limiter alone is exploitable as a denial-of-service vector — an attacker can repeatedly lock a legitimate user out. Together, the two levels are significantly more robust and demonstrate a mature understanding of security layering, which supports the HD score on Features & Implementation.

### 4.8 Route-to-Middleware Mapping

| Route | Method | Middleware Chain |
|---|---|---|
| `/api/v1/auth/register` | POST | *(public)* |
| `/api/v1/auth/login` | POST | `loginRateLimiter` |
| `/api/v1/auth/logout` | POST | `authMiddleware` |
| `/api/v1/profile/:id` | GET | `authMiddleware` → `roleMiddleware(PLAYER, ADMIN)` → `ownershipMiddleware` |
| `/api/v1/profile/:id` | PUT | `authMiddleware` → `roleMiddleware(PLAYER)` → `ownershipMiddleware` |
| `/api/v1/profile/:id/avatar` | POST | `authMiddleware` → `roleMiddleware(PLAYER)` → `ownershipMiddleware` → `multer` |
| `/api/v1/game/start` | POST | `authMiddleware` → `roleMiddleware(PLAYER)` |
| `/api/v1/game/move` | POST | `authMiddleware` → `roleMiddleware(PLAYER)` |
| `/api/v1/game/:id/replay` | GET | `authMiddleware` → `roleMiddleware(PLAYER)` → `premiumMiddleware` |
| `/api/v1/arena/rooms` | GET | `authMiddleware` → `roleMiddleware(PLAYER, ADMIN)` |
| `/api/v1/arena/rooms` | POST | `authMiddleware` → `roleMiddleware(PLAYER)` |
| `/api/v1/subscription/deposit` | POST | `authMiddleware` → `roleMiddleware(PLAYER)` |
| `/api/v1/subscription/subscribe` | POST | `authMiddleware` → `roleMiddleware(PLAYER)` |
| `/api/v1/admin/users` | GET | `authMiddleware` → `roleMiddleware(ADMIN)` |
| `/api/v1/admin/users/:id/status` | PUT | `authMiddleware` → `roleMiddleware(ADMIN)` |
| `/api/v1/admin/rooms` | GET | `authMiddleware` → `roleMiddleware(ADMIN)` |
| `/api/v1/admin/rooms/:id` | DELETE | `authMiddleware` → `roleMiddleware(ADMIN)` |

---

## 5. DTO Architecture

> **SRS Reference**: A.3.2 — "The backend must apply DTO to present only necessary data when responding to a request from the frontend AND other modules."

### 5.1 Why DTOs — The Security Argument

Without DTOs, a developer writing a response handler might accidentally serialize the entire Mongoose document, exposing fields that must never reach the client. DTOs make the **safe response the default** — a field only appears in the API output if it is explicitly added to the DTO. This is the **Allowlist principle** applied to data access.

**Fields that must never appear in any API response:**

| Field | Collection | Risk if exposed |
|---|---|---|
| `passwordHash` | users | Enables offline password cracking attacks |
| `loginAttempts` | users | Reveals the system's security posture to an attacker |
| `lockUntil` | users | Reveals lockout timing, letting an attacker optimize retry intervals |
| `walletBalance` | users | Exposed to non-owners via admin list — SRS A.3.2 uses this as an explicit example |
| `__v` | all collections | Mongoose internal version key — leaks schema metadata |
| `moves[]` full array | gameSessions | Unnecessarily large in list responses — only needed for the dedicated Replay endpoint |

### 5.2 DTO Design Rules

1. **Two DTO types per module**: Request DTOs validate and normalize incoming data before it reaches the Service. Response DTOs filter and shape outgoing data before it reaches the client.

2. **Transformation functions, not classes**: Each DTO is a pure function — takes raw input, returns a plain object. No inheritance. This keeps them independently testable and framework-agnostic.

3. **Controllers own the DTO calls**: The Controller calls the Request DTO before passing data to the Service, and calls the Response DTO before sending the reply. The Service layer works with plain validated objects — it never touches `req` or `res`.

4. **Services return DTO-shaped data internally**: When a Service returns data (to a Controller or to another module via an interface), it returns a plain object already shaped by the DTO — never a raw Mongoose document. This acts as a second line of defence if a developer forgets to apply the DTO at the Controller level.

5. **Fail loudly on validation with structured errors**: Request DTOs throw an object with a machine-readable `code` and a human-readable `message` that includes the cause and an example of valid input (SRS 1.3.1). The Controller's try-catch forwards this to the error response helper.

6. **Admin DTOs are stricter than owner DTOs**: Even though admins have broader RBAC access rights, they still receive a `UserSummaryDTO` that excludes `walletBalance`. Admin access is for operational management, not financial visibility.

### 5.3 Response Envelope Pattern

**Pattern applied**: Envelope Pattern (also called API Response Wrapper)

All API responses use a **uniform envelope structure** so the frontend's HTTP Helper can rely on a predictable shape regardless of which endpoint it calls.

**Success envelope**:
```
{
  success: true,
  data:    <DTO-shaped payload>,
  message: <human-readable confirmation string>
}
```

**Error envelope**:
```
{
  success: false,
  error: {
    code:    <machine-readable string — e.g. "INVALID_CREDENTIALS">,
    message: <human-readable string safe to display in the UI>
  }
}
```

A shared `responseHelper` module exposes two functions — `sendSuccess` and `sendError` — that all Controllers use instead of calling the HTTP response method directly. This guarantees the envelope is consistent across all modules and cannot diverge.

The frontend's `httpClient.js` is designed around this contract: it always reads the `data` property for payload and the `error.message` property for user-facing error display. The machine-readable `error.code` is used for programmatic decisions (e.g., redirecting to the login page on `TOKEN_EXPIRED`).

### 5.4 DTO Catalogue by Module

#### Auth Module DTOs

| DTO Name | Type | Purpose | Key exclusions |
|---|---|---|---|
| `RegisterRequestDTO` | Request | Validates all five registration fields; throws descriptive error per failing rule | N/A — validates, does not filter |
| `LoginResponseDTO` | Response | Returned on successful login: token + safe user object | `passwordHash`, `loginAttempts`, `lockUntil`, `walletBalance`, `__v` |
| `PublicUserDTO` | Response | Minimal user info shown to other players (e.g., in game room display) | Everything except `id`, `username`, `avatarUrl`, `country`, `isPremium` |

**RegisterRequestDTO validation contract** (implements SRS 1.2.x + 1.3.1):

| Field | Rule | Error message must include |
|---|---|---|
| All fields | All five fields required | Which field is missing |
| `username` | Letters, numbers, `_`, `-` only | The allowed character set and an example of a valid username |
| `email` | One `@`, dot after `@`, under 255 chars, no spaces or prohibited chars | Which specific rule failed and an example of a valid email |
| `password` | Min 8 chars, one uppercase, one number, one special character | Which specific rule failed and a compliant example |
| `password` vs `confirmPassword` | Must be identical | That both fields must match |

The backend **re-runs all the same rules** as the frontend (SRS 1.3.1 dual validation). Frontend validation is for quick user feedback; backend validation is the security gate.

#### Profile Module DTOs

| DTO Name | Type | Purpose | Key exclusions / inclusions |
|---|---|---|---|
| `ProfileResponseDTO` | Response | Full profile data for the authenticated account owner | Excludes `passwordHash`, `loginAttempts`, `lockUntil`. **Includes** `walletBalance` and `email` — owner-only, guarded by `ownershipMiddleware` |
| `GameSessionSummaryDTO` | Response | One row in the game history list (SRS 3.1.2) | Excludes full `moves[]` array — only the `ReplaySessionDTO` includes this |

#### Game Module DTOs

| DTO Name | Type | Purpose | Key notes |
|---|---|---|---|
| `MoveRequestDTO` | Request | Validates `gameId`, `x`, `y` — must be present and non-negative integers | Error message must specify which field failed and give an example |
| `MoveResponseDTO` | Response | Returned after each valid move — carries enough state to update the board without a full re-fetch | Includes `boardState`, `currentTurn`, `status`, `winLine`. Excludes full `moves[]` history |
| `ReplaySessionDTO` | Response | Full move history for the Replay feature — premium-gated endpoint only | Includes complete `moves[]` with **algebraic notation conversion** applied inline (numeric `x` → column letter A–O, numeric `y` → 1-indexed row number) |

The algebraic notation conversion in `ReplaySessionDTO` is a deliberate design choice: the conversion happens once in the DTO layer so the frontend Replay View receives pre-converted coordinates and does not need to know the raw numeric encoding scheme. This is the **Transform pattern**.

#### Admin Module DTOs

| DTO Name | Type | Purpose | Key exclusions |
|---|---|---|---|
| `UserSummaryDTO` | Response | One row in the admin user list (SRS 6.1.1) | `passwordHash`, `loginAttempts`, `lockUntil`, **`walletBalance`** — explicit SRS A.3.2 example |
| `RoomAdminDTO` | Response | One row in the admin room list (SRS 6.3.1) | Internal socket connection IDs, raw MongoDB ObjectId references |

#### Subscription Module DTOs

| DTO Name | Type | Purpose |
|---|---|---|
| `DepositRequestDTO` | Request | Validates deposit amount is a positive number |
| `SubscribeResponseDTO` | Response | Confirms subscription with updated `isPremium` flag and new `premiumExpiry` date |

### 5.5 Controller → Service → DTO Data Flow

Every endpoint follows this strict data flow. Deviating from this pattern is an architectural violation.

```
Client Request
      │
      ▼
┌────────────────── Controller ──────────────────┐
│ 1. Extract raw body / params from request      │
│ 2. Call REQUEST DTO                            │
│    → throws structured error on invalid input  │
│    → returns clean, validated plain object     │
│ 3. Pass clean object to Service                │
└──────────────────────┬─────────────────────────┘
                       │
                       ▼
┌────────────────── Service ─────────────────────┐
│ 4. Apply business rules                        │
│    (auth logic, win check, wallet deduction)   │
│ 5. Call Repository for all DB operations       │
│ 6. Return a PLAIN OBJECT shaped by DTO         │
│    — never a raw Mongoose document             │
└──────────────────────┬─────────────────────────┘
                       │
                       ▼
┌────────────────── Controller (again) ──────────┐
│ 7. Receive plain DTO-shaped object             │
│ 8. Call sendSuccess(res, statusCode, dto, msg) │
└────────────────────────────────────────────────┘
                       │
                       ▼
                Client Response
           { success, data, message }
```

**Error path**: Validation errors thrown by the Request DTO are caught in the Controller's try-catch and forwarded to `sendError` with status 400. Business logic errors thrown by the Service (e.g., email already taken, account locked) are forwarded with the appropriate HTTP status. A global Express error handler catches anything not caught locally as a final safety net.

**Key architectural rule**: The Service layer **never** receives a request object and **never** sends a response. It knows nothing about HTTP. This makes service functions independently testable with unit tests and ensures the HTTP transport layer is a replaceable concern.

---

## 6. Data Model (MongoDB Collections)

### Collection: `users`

| Field | Type | Constraints & Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `username` | String | Unique. Pattern: letters, numbers, `_`, `-` only (SRS 1.2.3) |
| `email` | String | Unique, lowercase normalized. Validated format (SRS 1.2.2) |
| `passwordHash` | String | bcrypt hash — **never in any DTO** |
| `country` | String | Selected from dropdown (SRS 1.1.4) |
| `role` | String | Enum: `PLAYER` \| `ADMIN` — embedded in JWS token |
| `avatarUrl` | String | Path to resized 200×200 image (SRS 3.2.1) |
| `walletBalance` | Number | Default 0. In `ProfileResponseDTO` only — **never in admin or public DTOs** |
| `isPremium` | Boolean | Default false. Embedded in JWS token |
| `premiumExpiry` | Date | Null when not premium |
| `isActive` | Boolean | Default true. False = deactivated by admin (SRS 6.2.1) |
| `loginAttempts` | Number | Default 0. Brute-force counter — **never in any DTO** |
| `lockUntil` | Date | Null when not locked — **never in any DTO** |
| `createdAt` | Date | Auto-set on creation |

### Collection: `gameSessions`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `gameType` | String | Enum: `SINGLE` \| `LOCAL` \| `ONLINE` |
| `boardSize` | String | Enum: `10x10` \| `15x15` |
| `player1Id` | ObjectId | Ref: users |
| `player1Name` | String | Denormalized for display performance |
| `player2Id` | ObjectId | Null for single-player games |
| `player2Name` | String | AI bot name for single-player (SRS 4.2.2) |
| `currentTurn` | String | Enum: `PLAYER1` \| `PLAYER2` |
| `boardState` | Array (2D) | 2D array of cell values: null \| marker string |
| `moves` | Array | **Critical for Replay (SRS 4.3.3)** — each entry: `{ seq, marker, x, y }` |
| `status` | String | Enum: `ACTIVE` \| `WIN` \| `DRAW` \| `ABORTED` |
| `winnerId` | ObjectId | Null until game ends with a winner |
| `winLine` | Array | Five `{ x, y }` objects for highlighting the winning cells (SRS 4.1.4) |
| `roomId` | ObjectId | Null for offline games. Ref: gameRooms |
| `startTime` | Date | |
| `endTime` | Date | Set on game conclusion |

> **Design note on `moves[]`**: Every move is appended in sequence order. This array is what enables the Replay feature — `ReplaySessionDTO` iterates it and applies algebraic notation conversion. This array also provides the coordinate data for the algebraic notation axes displayed on the board during all game modes, as required by SRS 4.3.3.

### Collection: `gameRooms`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `roomCode` | String | Short human-readable code, e.g. `ROOM-4829` |
| `player1Id` | ObjectId | Room creator |
| `player1Name` | String | Denormalized |
| `player2Id` | ObjectId | Null until a second player joins |
| `player2Name` | String | Null until joined |
| `status` | String | Enum: `WAITING` \| `ACTIVE` \| `CLOSED` |
| `sessionId` | ObjectId | Ref: gameSessions — created when the game starts |
| `createdAt` | Date | |
| `endTime` | Date | Set when room is closed or game ends |

### Collection: `subscriptions`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `userId` | ObjectId | Ref: users |
| `amount` | Number | 10 (USD) |
| `method` | String | Enum: `WALLET` \| `STRIPE` |
| `paidAt` | Date | |
| `expiresAt` | Date | paidAt + 30 days |

---

## 7. Sprint Plan

> Story points use a Fibonacci-like scale: 1 · 2 · 3 · 5 · 7 · 8. **Never estimate in hours — the rubric explicitly requires feature/story points.**

### Sprint 1 — Foundation & Architecture Setup (Weeks 1–2)

| # | Task | SRS Ref | Story Pts | HD Detail |
|---|---|---|---|---|
| S1-1 | Git repo + GitHub Project Board setup | SCRUM | 2 | All branch types created. Lecturer added to board. |
| S1-2 | SCRUM board columns + swim lanes | SCRUM | 3 | All 7 columns. Docs swim lane. Story points + assignee + deadline on every task. |
| S1-3 | MongoDB schema design + ERD | All | 5 | All 4 collections with all fields documented. ERD committed to `/docs`. |
| S1-4 | Backend skeleton: Modular Monolith + N-Tier | A.1.1–A.2.1 | 5 | All module folders with placeholder files. Verified: `npm install && node index.js` runs. |
| S1-5 | Common: responseHelper + errorHandler | A.3.2 | 2 | Envelope pattern established. Global Express error handler wired. |
| S1-6 | Middleware stubs: all 5 files | A.2.3 | 3 | Stubs wired into routes from day 1 — architecture visible in first commit. |
| S1-7 | Module interface files stubs | A.3.1 | 2 | `authInterface.js`, `gameInterface.js` stubs. Enforces isolation before any feature is built. |
| S1-8 | Frontend: Vite + feature-driven structure | A.1.3, A.3.a | 4 | All feature folders created. `apiConfig.js` + `httpClient.js` with Axios interceptor. |
| S1-9 | `AuthContext.jsx` + `RouteGuard.jsx` | A.2.c | 3 | JWT stored in sessionStorage. Role-based redirect logic wired. |
| S1-10 | Wireframes + responsive UI design | A.4.b | 4 | All screens. Responsive layouts for Profile + Admin. Committed to `/docs`. |
| S1-11 | README scaffold | Submission | 2 | Exact start steps. Credential table placeholder. GitHub link. |

### Sprint 2 — Authentication, Profile & Core Offline Game (Weeks 3–5)

| # | Task | SRS Ref | Story Pts | HD Detail |
|---|---|---|---|---|
| S2-1 | Registration API + dual validation | 1.1.x, 1.2.x, 1.3.1 | 5 | All validation rules. Descriptive inline error per rule on both FE and BE. |
| S2-2 | Login API + JWS + per-account lockout | 2.1.1, 2.2.1, 2.3.1 | 6 | JWS with `{ id, role, isPremium }`. DB-level account lockout after 5 fails / 60s. |
| S2-3 | `loginRateLimiter` middleware (per-IP) | 2.2.1 | 2 | `express-rate-limit`: 5 req / 60s on `/auth/login` only. |
| S2-4 | Register + Login UI with inline validation | 1.1.x, 1.1.4 | 4 | Country dropdown (not free text — SRS explicit). Error shown inline per field, not as alert. |
| S2-5 | Profile view + edit API with DTOs | 3.1.1, A.3.2 | 3 | `ProfileResponseDTO` excludes `passwordHash`, `loginAttempts`, `lockUntil`. |
| S2-6 | Avatar upload + auto-resize | 3.2.1 | 4 | multer for upload, sharp to resize to 200×200. URL stored in DB. |
| S2-7 | Game session history API (search + filter + sort) | 3.1.2, 3.2.2, 3.3.1 | 5 | Search by session# or Player2 name (case-insensitive pattern match). Filter by date range, result, game type. Sort asc/desc. All in backend. |
| S2-8 | Profile UI (responsive) | 3.x, A.4.b | 4 | Avatar, stats, history table with search + filter controls. Responsive layout. |
| S2-9 | Offline 2-player board (10×10) | 4.1.x | 5 | Prompt Player2 name. 5-in-a-row win check (all directions). Highlight winning cells. Abort. Choose who goes first. |
| S2-10 | Game session recording API with `moves[]` | 4.1.4 | 4 | Every move appended to `moves[]` in sequence order. |
| S2-11 | Easy AI | 4.2.3 | 3 | Pick a random empty cell **adjacent to the player's last move** — not any random empty cell. The SRS is specific about this. |
| S2-12 | Medium AI | 4.2.4 | 5 | Block: any 5-mark line, any open-ended 4-mark line, any fork formation (two crossing open-ended 3-mark lines). Pattern scanning in `aiEngine.js`. |
| S2-13 | Board customization UI | 4.2.1 | 4 | 3 board styles, 10×10/15×15 toggle, 6 marker choices. Display avatar + marker during game. |
| S2-14 | Algebraic notation on board axes | 4.3.3 | 3 | Column letters A–O, row numbers 1–15 on all board sizes in **all game modes**. |

### Sprint 3 — Online Play, Admin, Premium & Ultimo Features (Weeks 6–8)

| # | Task | SRS Ref | Story Pts | HD Detail |
|---|---|---|---|---|
| S3-1 | Socket.IO server + real-time game sync | 4.3.1 | 8 | Events: `createRoom`, `joinRoom`, `makeMove`, `gameOver`, `playerLeft`. Sync `boardState` on both clients. Emit `playerJoined` to P1 when P2 joins. |
| S3-2 | Arena view (live room list) | 4.3.1 | 5 | Socket.IO listener for live room list. Room code, players, join button. New room added to arena instantly without page refresh. |
| S3-3 | Real-time in-game chat | 4.3.2 | 3 | Chat sidebar during online game. Socket message events with timestamps. |
| S3-4 | Hard AI | 4.2.5 | 7 | All Medium defenses + offensive heuristic: complete own 5-mark line when opportunity exists. Prioritize attack over defense when a winning move is available. |
| S3-5 | Replay system (Premium) | 4.3.3 | 7 | Reads `moves[]` from DB via `ReplaySessionDTO`. Replay UI: Pause / Resume / Forward / Backward controls. Algebraic notation display. Linked from Profile history page. |
| S3-6 | Win announcement animation | 4.2.6 | 3 | CSS animation: color sweep along the 5-mark line + winner banner with motion. Works in all game modes. |
| S3-7 | `premiumMiddleware` wired on replay route | 4.3.3, A.2.3 | 2 | Full chain: `authMiddleware` → `roleMiddleware(PLAYER)` → `premiumMiddleware` → controller. |
| S3-8 | Admin user management (responsive) | 6.1.1, 6.2.1, A.4.b | 5 | Table: Username, Email, Premium Status, Account Status. Deactivate/reactivate toggle. Deactivated users cannot login. Responsive layout. |
| S3-9 | Admin room management | 6.3.x | 4 | List rooms: code, P1, P2, start time, end time. Search by room code or player name. Close active room → emit socket event to disconnect both players. |
| S3-10 | Premium wallet + subscription | 5.1.1, 5.1.2 | 5 | Deposit → wallet. Subscribe → deduct 10 USD → record in `subscriptions` → trigger nodemailer email. |
| S3-11 | Module interface audit (A.3.1) | A.3.1 | 4 | Review all cross-module calls. Confirm no module imports another's Service directly. All external calls via `*Interface.js`. |
| S3-12 | DTO audit (A.3.2) | A.3.2 | 3 | Trace every controller endpoint. Every response goes through a DTO. No raw Mongoose documents in `res.json()`. |
| S3-13 | Frontend route guard audit | A.2.c | 3 | Every page wrapped in `RouteGuard`. Test: PLAYER → `/admin` redirects. Test: logout → protected page redirects to login. |

### Sprint 4 — Polish, Testing, Report & Deployment (Weeks 9–10)

| # | Task | SRS Ref | Story Pts | HD Detail |
|---|---|---|---|---|
| S4-1 | Cloud deployment — Render | D.2.1 | 4 | Backend: Render Web Service (`node index.js`). Frontend: Render Static Site. All `.env` vars set in Render dashboard. |
| S4-2 | MongoDB Atlas network config | Submission | 2 | Whitelist `0.0.0.0/0`. Tested from external Wi-Fi + different laptop before submission. |
| S4-3 | Gold Dataset seeding | Interview | 3 | Admin, Player A (Premium + avatar + 5+ sessions with `moves[]`), Player B (Standard + avatar). Credentials in README. |
| S4-4 | Cross-team testing | QA | 5 | Each member tests features they did not build. Bugs logged as GitHub Issues. All P1-critical bugs fixed before submission. |
| S4-5 | Report — architecture section | Report | 5 | Container diagram, component diagrams (annotated folder trees), ERD, 3 sequence diagrams. |
| S4-6 | Report — all other sections | Report | 8 | Feature checklist (all SRS IDs), API route table, dev process, GitHub screenshots, evaluation, conclusion. |
| S4-7 | Report — three required sequence diagrams | Report | 5 | 1) Login + JWS + brute-force middleware chain. 2) Online game move + Socket.IO sync. 3) Premium subscribe + email. |
| S4-8 | Demo rehearsal | Interview | 3 | Each member explains their feature and the overall architecture. See Section 10 for questions. |
| S4-9 | README finalization | Submission | 2 | GitHub link, login credentials, exact start steps, contribution table with story-point breakdown. |
| S4-10 | Zip + Canvas submission | Submission | 1 | `group_<N>_assignment_3.zip`. No `node_modules`. PDF report + source + sample data. |

---

## 8. Gap Analysis: Original Tasks vs SRS

These gaps were identified between the team's original sprint plan and the SRS + rubric requirements. Each one risks losing marks if left unaddressed.

| Gap Area | Original Task | What SRS Actually Requires | Risk if Missed |
|---|---|---|---|
| **AI Easy** | "random empty cell" | 4.2.3: Cell must be adjacent to the player's **last move specifically** — not any random empty cell | Feature points deducted |
| **AI Medium** | "block opponent" | 4.2.4: Block 5-mark line, open-ended 4-mark line, **and fork formations** (two crossing open-ended 3-mark lines) | Feature points deducted |
| **AI Hard** | "create winning path" | 4.2.5: All Medium defenses **+ actively complete own 5-mark line** when opportunity exists | Feature points deducted |
| **Brute-Force Protection** | Missing | 2.2.1: Lock after 5 fails within 60 seconds — at both IP and account level | HD impossible — explicit security requirement |
| **Dual Validation** | "validate cả 2 phía" | 1.3.1: Every error must describe the cause and give an example of valid input — shown inline per field | HD score gap |
| **Repository Layer** | Missing | A.1.2: Dedicated Repository layer where all queries are defined and executed — separate from Service | Architecture score drops |
| **Module Interfaces** | Missing | A.3.1: Modules expose services via interface files — no direct cross-module Service imports | Ultimo tier not achieved |
| **DTO on all responses** | Missing | A.3.2: Every API response uses DTO — `walletBalance`, `passwordHash` never exposed | Security + architecture score |
| **ABAC / Ownership** | Missing | A.2.c: A player cannot access another player's sensitive data | Security gap |
| **Algebraic Notation** | Missing | 4.3.3: Board axes (A–O, 1–15) required in **all game modes**, not just replay | Replay feature incomplete |
| **Replay Controls** | "xem lại" | 4.3.3: Must have **Pause, Resume, Forward, Backward** controls — linked from Profile history | Feature scored as incomplete |
| **Admin Room Close** | Missing | 6.3.3: Admin can close any active game room — must disconnect both players via socket event | Admin feature incomplete |
| **Profile Search** | Missing | 3.2.2: Search by session number or Player2 name — **case-insensitive pattern match** | Profile feature incomplete |
| **Win Animation** | Missing | 4.2.6: Animation with **both motion and color effect** on win announcement | Feature points lost |
| **Responsive Admin** | Missing | A.4.b: All Admin UIs must support responsive design | Architecture score impact |
| **Email on Payment** | Missing | 5.1.2: Email notification sent when premium payment is successfully processed | Simplex-tier feature missing |
| **Gold Dataset with moves[]** | "nạp sẵn data" | Interview requirement: Player A must have complete `moves[]` arrays for Replay demo | Demo will fail live |
| **SCRUM Story Points** | Not mentioned | Rubric: Tasks estimated in **feature/story points**, not hours. Every task needs assignee + deadline. | Team collaboration score penalty |

---

## 9. GitHub & SCRUM Workflow

### Branch Strategy

| Branch | Purpose | Rules |
|---|---|---|
| `main` | Production-ready code | Protected. Merge only via approved PR. Never commit directly. |
| `dev` | Integration branch | All feature branches merge here first. |
| `feat/<task-name>` | One branch per sprint task | e.g., `feat/auth-jws`, `feat/ai-medium`, `feat/replay-ui` |
| `fix/<bug-description>` | Bug fixes | e.g., `fix/win-check-diagonal`, `fix/socket-disconnect` |
| `docs/<document-name>` | Report, diagrams, README | e.g., `docs/sequence-diagrams`, `docs/erd`, `docs/report-section3` |

### Commit Message Convention (Conventional Commits)

All commits follow the format `type(scope): short description` to produce a legible history that demonstrates professional practice.

| Type | When to use | Example |
|---|---|---|
| `feat` | New feature or function | `feat(auth): add JWS token with role and isPremium claims` |
| `fix` | Bug correction | `fix(game): correct diagonal win check for 15x15 board edge` |
| `refactor` | Restructure without changing behavior | `refactor(profile): extract search logic to repository layer` |
| `docs` | Report, diagrams, README changes | `docs(report): add sequence diagram for online move flow` |
| `test` | Adding or fixing tests | `test(admin): cross-browser test for responsive room list` |
| `chore` | Config, tooling, dependencies | `chore: add express-rate-limit dependency` |

### SCRUM Board Columns

| Column | Definition |
|---|---|
| 📋 Product Backlog | All tasks not yet in any sprint. Prioritized by business value. |
| 🏃 Sprint Backlog | Tasks committed for the current sprint. Estimated in story points. |
| ⚡ In Progress | Actively being worked on. Max 2 tasks per person to avoid WIP overload. |
| 👁 Review | PR submitted. Awaiting approval from at least one other team member. |
| 🧪 Staging | Merged to `dev`. Being tested in the development environment. |
| ✅ Done | Tested and verified. Merged to `main` via approved PR. |
| 📚 Documentation | Swim lane for report sections, diagrams, README, wireframes. |

### Story Point Scale

| Points | Effort Level | Examples in this project |
|---|---|---|
| 1 | Trivial | Config change, text fix, stub file |
| 2 | Simple | One API endpoint with no complex logic |
| 3 | Small | Feature with basic validation or a single integration |
| 5 | Medium | Feature with multiple steps or cross-layer integration |
| 7 | Large | Complex algorithm (AI Medium/Hard) or multi-component feature (Replay) |
| 8 | Extra large | System-level change (architecture skeleton, deployment, full DTO audit) |

---

## 10. Interview Preparation Guide

Every member must be able to answer questions about the **entire system**, not just the features they personally built.

### Architecture Questions

- What is the difference between N-Tier and Modular Monolith? Why does this project combine both?
- What is a Repository Layer? What is its contract with the Service layer above it? Why is it kept separate?
- What is a DTO? Name a field that must be excluded from an admin response, and explain exactly what attack becomes possible if it were exposed.
- Why can't Module A import Module B's Service directly in Ultimo architecture? What pattern is used instead, and what is it called?
- What is the difference between RBAC and ABAC? Give a specific example of each from this project.
- What does `authMiddleware` do step-by-step? How does it differ from `roleMiddleware`?
- What does `ownershipMiddleware` protect against? Describe the exact horizontal privilege escalation attack it prevents.
- Why is `isPremium` embedded in the JWS token instead of being fetched from the database on each request? What is the trade-off?
- What is the Chain of Responsibility pattern? Where does it appear in the middleware chain?
- What is the Envelope Pattern? Why does the frontend benefit from a consistent response shape across all endpoints?
- What is the Facade pattern? Where is it applied in the backend module structure?
- What is the Dependency Inversion Principle? How does Component–Hook decoupling apply it?

### Feature Questions

- Walk through exactly what happens when a player clicks a cell during an online game — from click to both screens updating. Name every component, hook, service, socket event, and middleware involved.
- Describe the Medium AI's fork detection algorithm in plain language. What is a fork formation?
- Explain the two-level brute-force protection. What happens at the IP level? What happens at the account level? Why do both levels need to exist together?
- How does the Replay feature work end-to-end? What is algebraic notation and why is it required on the board in all game modes, not just in replay?
- Describe the premium subscription flow from wallet deposit through to the user's premium status being reflected in the application.
- When an admin closes an active game room, what exactly happens on the two players' screens?

### Design & Quality Questions

- Why does this project use bcrypt instead of AES encryption for passwords? What is the functional difference between hashing and encryption?
- What is the difference between JWS and JWT? (JWS is a signed JWT — the SRS uses the term JWS to emphasize the token is signed for integrity, not encrypted for confidentiality.)
- How does `RouteGuard` on the frontend prevent a PLAYER from accessing `/admin`? Could a malicious user bypass it on the frontend? Does it matter?
- Why does every controller use `sendSuccess` / `sendError` instead of writing the response directly?
- What is the Single Responsibility Principle and where does it appear in the middleware chain design?

---

## 11. Report Writing Guide (25-Page Allocation)

| Section | Pages | Must Include |
|---|---|---|
| Cover Page | 1 | Project name, group number, member names, date. **Not counted in the 25 pages.** |
| Table of Contents | 1 | Clickable hyperlinks to all sections. **Not counted in the 25 pages.** |
| 1. Introduction | 1 | Platform overview, user types (Player / Admin), problem statement, scope. |
| 2. Project Description | 2 | Features organized by SRS level (Simplex / Medium / Ultimo). Use-case list. Design constraints. Lessons learned. |
| 3.1 Architecture Overview | 4 | Container diagram (FE ↔ BE ↔ DB ↔ External services). Component diagrams (annotated folder trees for FE and BE). ERD. Three sequence diagrams (see below). |
| 3.2 Frontend & Backend Implementation | 4 | API route table (Method, Path, Auth required, Request shape, Response DTO shape, excluded fields). Technologies and packages used with justification. |
| 3.3 UI/UX Design | 2 | Screenshots of key screens. Responsive design evidence (Profile + Admin on mobile). Board customization options. |
| 3.4 Tools & Package Selection | 1 | Justify each npm package: bcrypt, sharp, multer, nodemailer, socket.io, express-rate-limit, jsonwebtoken. |
| 3.5 Development Process | 2 | Sprint summaries. GitHub board screenshots. Commit history graph per member. Sprint Review notes from Weeks 2, 6, 9. |
| 3.6 Feature Checklist | 2 | Table: SRS Feature ID \| Description \| Level \| Implemented (✓/✗). All IDs from the SRS covered. |
| 3.7 Known Issues or Limitations | 1 | Honest list of bugs or limitations. Demonstrates maturity and self-awareness. |
| 4. Evaluation | 2 | Cross-testing approach (who tested what). Bug tracking via GitHub Issues. Performance observations. |
| 5. Conclusion | 1 | Strengths, what would be improved with more time, design decisions you would reconsider. |
| 6. References + AI Acknowledgement | 1 | **Required** if AI tools were used during design, ideation, or development. All external sources cited. |
| GitHub Contribution Proof | 1 | Screenshot of commit frequency graph per member. Contribution table matching README. |

**Three required sequence diagrams** (choose the three most complex flows for section 3.1):
1. Login with JWS generation + brute-force check — show the middleware chain, the two-level lockout, and the token signing
2. Online game move with Socket.IO sync — show the full flow from click through to both clients' boards updating
3. Premium subscription + email notification — show wallet deduction, subscription record creation, nodemailer invocation, and DB flag update

---

## 12. Final Submission Checklist

| # | Item | Owner | ✓ |
|---|---|---|---|
| 1 | `index.js` is the entry point — app starts with `node index.js` | Tech Lead | ☐ |
| 2 | `npm install && node index.js` tested clean on a different machine and external Wi-Fi | QA | ☐ |
| 3 | MongoDB Atlas: `0.0.0.0/0` network access whitelisted | DevOps | ☐ |
| 4 | PDF report included in zip (not `.docx`) | PM | ☐ |
| 5 | README: GitHub link, login credentials, exact start steps, contribution table | PM | ☐ |
| 6 | `node_modules` folder **NOT** included in zip | Tech Lead | ☐ |
| 7 | Zip named `group_<N>_assignment_3.zip` | PM | ☐ |
| 8 | Gold Dataset seeded: Admin, Player A (Premium), Player B (Standard) | Backend | ☐ |
| 9 | Player A has 5+ game sessions with full `moves[]` arrays populated for Replay demo | Backend | ☐ |
| 10 | Player A and Player B have avatar images uploaded | Backend | ☐ |
| 11 | GitHub repository set to **PUBLIC** no more than 24 hours before deadline | Tech Lead | ☐ |
| 12 | GitHub commit history shows all members contributing across all four sprints | All | ☐ |
| 13 | GitHub Project Board: every task has assignee + deadline + story points | PM | ☐ |
| 14 | Lecturer added to GitHub Project Board | PM | ☐ |
| 15 | Every PR has at least one reviewer who approved before merge to `dev` | All | ☐ |
| 16 | All Admin UIs tested for responsiveness at mobile viewport width | QA | ☐ |
| 17 | Replay tested end-to-end: Premium user → open session from history → all four controls work | QA | ☐ |
| 18 | Brute-force lockout tested: 5 failed logins → account locked for 60 seconds | QA | ☐ |
| 19 | DTO audit confirmed: `passwordHash`, `walletBalance`, `loginAttempts` absent from every API response | Tech Lead | ☐ |
| 20 | Contribution scores agreed by all members, total equals 5 × number of contributing members | PM | ☐ |

---

*TicTacToang — Built for HD. No shortcuts.*
*COSC2769 · Group Project 2026A*
