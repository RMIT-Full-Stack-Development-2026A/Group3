# COSC2769 - Full Stack Development Assignment 2

# TicTacToang - Group 3

TicTacToang is a premium Tic-Tac-Toe platform built with the MEN stack
(MongoDB, Express.js, Node.js), React, Vite, Socket.IO, and npm workspaces.

## GitHub Repository

[https://github.com/RMIT-Full-Stack-Development-2026A/Group3.git](https://github.com/RMIT-Full-Stack-Development-2026A/Group3.git)

## Login Credentials for Testing

The following accounts are provided for testing the submitted application.
The username or email can be used as the login identifier where available.

| Account Type | Username | Email | Password |
|---|---|---|---|
| Player | `TestAccountA` | `user1@example.com` | `Abcd1234!` |
| Player | `TestAccountB` | `user2@example.com` | `Abcd1234!` |
| Admin | `admin` | N/A | `admin123` |

## Steps to Start and Run the Website

### 1. Prerequisites

Install the following software before running the project:

- Node.js v16 or higher
- npm
- MongoDB Atlas account or a local MongoDB database

### 2. Clone the Repository

```bash
git clone https://github.com/RMIT-Full-Stack-Development-2026A/Group3.git
cd Group3
```

### 3. Install Dependencies

Run the following command from the root directory:

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside `packages/backend`:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=10000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USER=your_smtp_username
EMAIL_PASS=your_smtp_password
EMAIL_FROM=your_sender_email
```

Create a `.env` file inside `packages/frontend` if a custom backend URL is
required:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
```

If `VITE_API_BASE_URL` is not provided, the frontend uses
`http://localhost:10000` by default.

### 5. Run the Backend

Open the first terminal from the root directory:

```bash
npm run dev:backend
```

The backend server runs on the port configured in `packages/backend/.env`
(for example, `http://localhost:10000`).

### 6. Run the Frontend

Open a second terminal from the root directory:

```bash
npm run dev:frontend
```

### 7. Open the Website

Open the frontend URL in a browser and log in using one of the testing
accounts above. The backend must remain running while using the website.

## Main Features

- User registration and login with JWT authentication and authorization
- Brute-force protection on login
- Local Tic-Tac-Toe game mode
- AI Tic-Tac-Toe game mode
- Online multiplayer game mode with real-time Socket.IO communication
- Online chat
- Match history and replay system
- Profile management and avatar processing
- Premium subscription and transaction features
- Admin user and room management

## Project Structure

```text
Group3/
├── packages/
│   ├── backend/   # Express.js API, MongoDB models, services, DTOs, middleware
│   ├── frontend/  # React and Vite client application
│   └── shared/    # Shared game logic, AI logic, and socket utilities
├── package.json
└── README.md
```

## Contribution Table

The group has 5 contributing members. Since all members contributed equally,
each member receives the default contribution score of `05`. The total
contribution score is:

```text
05 x 5 members = 25
```

| Member Name | Role | Assigned Tasks | Contribution Score |
|---|---|---|---|
| Tran Duc Khang | Full Stack Developer | Design database; Profile management and avatar processing; AI game mode; Draw sequence diagrams; Develop admin feature for frontend; Design UI pages by Stitch | 05 |
| Tran Nhat Tien | Full Stack Developer | Design database; Local game mode; Draw sequence diagrams; Design board styles in the frontend; Develop admin feature for backend; Design UI pages by Stitch; Brute-force protection on login | 05 |
| Do Le Minh Quan | Full Stack Developer | Draw component diagrams; List project features; Online chat; Multiplayer online game mode; Initialize frontend architecture; Login, JWS authentication and authorization | 05 |
| Bui Viet Anh | Full Stack Developer | Draw component diagrams; Subscription and transaction features; Match history display on profile page; Initialize backend architecture; Login, JWS authentication and authorization | 05 |
| Dang Minh Duc | Full Stack Developer | Complete ERD; Implement replay system; UI design; User registration with dual-layer validation | 05 |

## Team Members

| Name | Student ID |
|---|---|
| Do Le Minh Quan | s4032589 |
| Bui Viet Anh | s3988393 |
| Dang Minh Duc | s3959833 |
| Tran Nhat Tien | s4027643 |
| Tran Duc Khang | s4049334 |
