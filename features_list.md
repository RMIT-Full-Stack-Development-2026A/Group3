# TicTacToang — Project Feature List

This document lists all the features for the **TicTacToang** project, categorized by their technical difficulty tier as defined in the SRS and the HD Master Plan.

| Module | Feature Description | Tier | SRS ID |
| :--- | :--- | :--- | :--- |
| **Authentication** | Registration form (Username, Email, Pass, Country) | Simplex | 1.1.1 |
| | Unique email constraint (DB level) | Simplex | 1.1.2 |
| | Password hashing with bcrypt | Simplex | 1.1.3 |
| | Country field as a selectable dropdown (no free text) | Simplex | 1.1.4 |
| | Login with username/email and password check | Simplex | 2.1.1 |
| | Password strength validation (8+ chars, upper, number, special) | Medium | 1.2.1 |
| | Email syntax validation (pattern check) | Medium | 1.2.2 |
| | Username character pattern (letters, numbers, _, -) | Medium | 1.2.3 |
| | Brute-force protection: Block after 5 failed attempts in 60s | Medium | 2.2.1 |
| | Dual validation: Parallel rules on both Frontend & Backend | Ultimo | 1.3.1 |
| | JWS Token generation with id, role, and isPremium claims | Ultimo | 2.3.1 |
| | Token invalidation on logout or after 24h expiry | Ultimo | 2.3.2 |
| **Profile** | Edit Email, Username, Password, Country | Simplex | 3.1.1 |
| | Game history list (Time, Type, Result, Players) | Simplex | 3.1.2 |
| | Avatar upload with automatic Sharp resizing (200x200) | Medium | 3.2.1 |
| | Search history by Session ID or Player 2 name | Medium | 3.2.2 |
| | Paginated history with Search, Filter (Date/Result/Type), and Sort | Ultimo | 3.3.1 |
| **Game** | Local two-player mode on a single device | Simplex | 4.1.1 |
| | 10×10 default board size | Simplex | 4.1.2 |
| | Distinct markers (one mark per cell) | Simplex | 4.1.3 |
| | 5-in-a-row win logic (Horizontal, Vertical, Diagonal) | Simplex | 4.1.4 |
| | Abort game at any time (Session ends with no winner) | Simplex | 4.1.5 |
| | Initiator chooses who takes the first move | Simplex | 4.1.6 |
| | 3 Board Styles, 10x10/15x15 toggle, 6 distinct markers | Medium | 4.2.1 |
| | Single Player mode vs AI (Easy, Medium, Hard) | Medium | 4.2.2 |
| | AI Easy: Picks adjacent cell to player's last move | Medium | 4.2.3 |
| | AI Medium: Blocks threat patterns (5-line, open 4-line, forks) | Medium | 4.2.4 |
| | AI Hard: Medium defense + offensive 5-line completion | Medium | 4.2.5 |
| | Win animation with both motion and color effects | Medium | 4.2.6 |
| | Real-time Multiplayer over Socket.IO (Arena) | Ultimo | 4.3.1 |
| | Real-time Chat sidebar during online play | Ultimo | 4.3.2 |
| | Replay feature with Pause, Resume, Forward, Backward | Ultimo | 4.3.3 |
| | Algebraic Notation (A–O, 1–15) on axes in ALL game modes | Ultimo | 4.3.3 |
| **Subscription** | Wallet deposit and Monthly 10 USD deduction | Simplex | 5.1.1 |
| | Email notification via Nodemailer on successful payment | Simplex | 5.1.2 |
| | Third-party payment integration (Stripe/PayPal) | Medium | 5.2.1 |
| **Admin** | Admin view of all players (Wallet excluded) | Simplex | 6.1.1 |
| | Deactivate and reactivate player accounts | Medium | 6.2.1 |
| | Admin view of all online rooms with codes and player names | Ultimo | 6.3.1 |
| | Admin search rooms by room number or player name | Ultimo | 6.3.2 |
| | Admin can force-close any active game room (via socket) | Ultimo | 6.3.3 |
| **System** | Local machine deployment (node index.js) | Simplex | D.1.1 |
| | Cloud deployment on Render (Backend + Frontend) | Medium | D.2.1 |
| | Responsive design for Profile and all Admin UIs | Ultimo | A.4.b |
| | Dual Brute-Force Protection (IP-level + Account-level) | Ultimo | 2.2.1 |
| | Modular Monolith + N-Tier architecture isolation | Ultimo | A.3.1 |
| | DTO on ALL responses (No raw Mongoose docs) | Ultimo | A.3.2 |
