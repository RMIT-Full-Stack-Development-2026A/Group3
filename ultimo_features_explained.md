# TicTacToang — Ultimo Feature Explanations

This document provides a detailed technical explanation for every **Ultimo-tier** feature in the TicTacToang project. These features are designed to meet the highest standards of the rubric for High Distinction (HD) marks.

---

## 1. Security & Authentication ("Defense in Depth")

### Dual Validation: Parallel Rules on Frontend & Backend (1.3.1)
*   **What it is**: Every single validation rule (e.g., "Username must not contain spaces") is implemented twice: once in the React frontend and once in the Node.js backend.
*   **Why it matters**: The Frontend validation provides **instant feedback** to the user, making the app feel professional. The Backend validation is the **security gate**—it protects your database if an attacker tries to send "garbage" data directly to your API using a tool like Postman.

### JWS Token Generation with Claims (2.3.1)
*   **What it is**: When a user logs in, the server generates a **JSON Web Signature (JWS)**. We embed the `id`, `role` (Admin/Player), and `isPremium` status as "claims" inside this token.
*   **Why it matters**: These claims allow the server to verify exactly who the user is and what they can do *instantly* without needing to run a slow database query on every single click.

### Token Invalidation on Logout (2.3.2)
*   **What it is**: We ensure that a logout actually "kills" the session on the server side. Additionally, the token is set to expire automatically after 24 hours.
*   **Why it matters**: This prevents an unauthorized person from reusing an old token to gain access to an account, even if they somehow stole the token string.

### Dual Brute-Force Protection (2.2.1)
*   **IP-level Guard**: If one IP address fails login 5 times, it is temporarily blocked. This stops "spray attacks" from botnets.
*   **Account-level Guard**: If 5 failed logins occur on one *username* specifically, that account is locked (even if the attacks come from different IPs). This prevents targeted hacking of a specific user's account.

---

## 2. High-End Game Features (The "Wow" Factor)

### Real-Time Multiplayer over Socket.IO (4.3.1)
*   **What it is**: Instead of the browser "refreshing" to see if the other player moved, we use **WebSockets**. The server "pushes" the move to the opponent instantly.
*   **Why it matters**: This makes the game feel like a modern, professional application (like Lichess or Chess.com).

### Real-time Chat Sidebar (4.3.2)
*   **What it is**: A live chat window that stays open during an online game session.
*   **Why it matters**: It enables social interaction between players and uses the same ultra-fast Socket.IO connection as the game logic itself.

### Replay Feature with Controls (4.3.3)
*   **What it is**: A premium-only tool that allows users to "watch" any completed game. It includes **Pause, Resume, Forward, and Backward** buttons.
*   **Why it matters**: Since we store every move in the `moves[]` array in the database, we can recreate the match exactly. This is one of the most technically impressive features in the rubric.

### Algebraic Notation (A–O, 1–15) on Axes (4.3.3)
*   **What it is**: Your board isn't just a grid; it has coordinate labels (A-O across the top, 1-15 down the side).
*   **Why it matters**: It is required for **all** game modes and gives the project a polished, board-game-standard look.

---

## 3. Professional Architecture (The HD Requirement)

### Modular Monolith + N-Tier Isolation (A.3.1)
*   **What it is**: Your code is organized into independent "Modules" (Auth, Game, Profile, etc.). These modules **never** talk to each other's secrets directly.
*   **Why it matters**: If you change the Game logic, you won't accidentally break the Auth system. This "separation of concerns" is how professional enterprise systems are built.

### DTO (Data Transfer Object) on ALL Responses (A.3.2)
*   **What it is**: We never send raw database data to the user. Instead, we use a "DTO" function to create a safe copy of the data.
*   **Why it matters**: This prevents accidentally leaking sensitive info (like a `passwordHash` or someone's `walletBalance`) to people who shouldn't see it. It is a mandatory security requirement for an HD grade.

### Paginated History with Search/Filter/Sort (3.3.1)
*   **What it is**: Instead of a giant list, the game history shows 10 items per page. It includes a search bar and filters (like "Show only Wins").
*   **Why it matters**: It keeps the app fast even if a user has played thousands of games.

---

## 4. Admin & UI Excellence

### Admin Command Center (6.3.1 - 6.3.3)
*   **What it is**: Admins can see a live list of every game being played. They can **search** for rooms by name and **force-close** any room if needed (e.g., for maintenance or to stop toxic behavior).
*   **Why it matters**: It demonstrates that you have thought about the "Operations" side of running a real platform.

### Responsive Design for All UIs (A.4.b)
*   **What it is**: Every single screen—even the complex Admin tables—must work perfectly on a smartphone, a tablet, and a 4K monitor.
*   **Why it matters**: A "broken" layout on mobile is an instant mark-down. This feature proves your frontend expertise.
