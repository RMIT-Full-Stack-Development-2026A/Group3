# TicTacToang — Kiến Trúc Cơ Sở Dữ Liệu Chi Tiết (NoSQL Scalable Design)

Báo cáo này mô tả chi tiết thiết kế cơ sở dữ liệu cho hệ thống TicTacToang (Enterprise Level). Mọi Collection, Field, và Index được thiết kế nhằm đáp ứng khả năng mở rộng (Scalability), tối ưu hóa thời gian truy vấn $\mathcal{O}(1)$ bằng Denormalization, và đảm bảo tính toàn vẹn dữ liệu thông qua các liên kết tham chiếu (References) chuẩn xác.

Tổng cộng hệ thống bao gồm **10 Entities** cốt lõi được định nghĩa qua Mongoose Schemas.

---

## 1. Nhóm Auth & Access Control (Phân quyền & Bảo mật)

### 1.1 `user` (Collection: users)
*Lưu trữ thông tin định danh và trạng thái tài khoản của người chơi.*
* `_id`: ObjectId (PK)
* `username`: String (Unique, Indexed, Required) -> Tên đăng nhập.
* `email`: String (Unique, Indexed, Required) -> Email liên hệ.
* `passwordHash`: String (Required) -> Mật khẩu đã mã hóa.
* `country`: String (Required) -> Quốc gia của người chơi.
* `avatarUrl`: String -> Đường dẫn ảnh đại diện (Default: `''`).
* `role`: String -> Phân quyền (Default: `'player'`).
* `isActive`: Boolean -> Trạng thái hoạt động, dùng để ban/unban (Default: `true`).
* `walletBalance`: Number -> Số dư ví dùng để mua Premium (Default: `0`).
* `isPremium`: Boolean -> Cờ đánh dấu trạng thái tài khoản trả phí (Default: `false`).
* `premiumExpiry`: Date -> Ngày hết hạn Premium (Default: `null`).
* `createdAt`, `updatedAt`: Date -> (Tự động sinh qua `timestamps: true`).

### 1.2 `admin` (Collection: admins)
*Lưu trữ thông tin định danh của Quản trị viên, tách biệt với người chơi để bảo mật.*
* `_id`: ObjectId (PK)
* `username`: String (Unique, Indexed, Required)
* `email`: String (Unique, Indexed, Required)
* `passwordHash`: String (Required)
* `role`: String -> Phân quyền (Default: `'admin'`).
* `createdAt`, `updatedAt`: Date -> (Tự động sinh).

---

## 2. Nhóm Core Game & Matchmaking (Lõi Trò chơi Real-time)

### 2.1 `game_session` (Collection: game_sessions)
*Trái tim của hệ thống chơi cờ, lưu trữ trạng thái và diễn biến ván đấu.*
* `_id`: ObjectId (PK)
* `gameType`: String (Required) -> Enum `['SINGLE', 'LOCAL', 'ONLINE']`
* `boardSize`: Number (Required) -> Enum `[10, 15]`
* `player1Id`: ObjectId (Ref: `user`, Indexed, Required)
* `player1Name`: String (Required) -> *Denormalized* từ bảng user.
* `player1Avatar`: String -> *Denormalized* (Default: `''`).
* `player2Id`: ObjectId (Ref: `user`, Indexed) -> Để AI đánh thì là `null` (Default: `null`).
* `player2Name`: String (Required)
* `currentTurn`: ObjectId (Ref: `user`) -> ID người chơi đang tới lượt.
* `boardState`: Array 2D (Mixed) -> Ma trận lưu trạng thái bàn cờ (Default: `[[null]]`).
* `status`: String -> Enum `['ACTIVE', 'WIN', 'DRAW', 'LOSE', 'ABORTED', 'ADMIN_CLOSED']` (Default: `'ACTIVE'`).
* `winnerId`: ObjectId (Ref: `user`) -> ID người chiến thắng (Default: `null`).
* `winLine`: Array of Objects `[{ x: Number, y: Number }]` -> Tọa độ dải chiến thắng.
* `moves`: Array of Objects (Sub-document Embedded) -> Lịch sử nước đi:
  * `step`: Number (Required)
  * `pId`: ObjectId (Ref: `user`, Default: `null`)
  * `x`: Number (Required)
  * `y`: Number (Required)
  * `marker`: String (Required) -> Enum `['X', 'O']`
  * `time`: Date -> Thời điểm đánh (Default: `Date.now`).
* `createdAt`, `updatedAt`: Date -> (Tự động sinh).

### 2.2 `game_room` (Collection: game_rooms)
*Phòng chờ cho các ván đấu trực tuyến.*
* `_id`: ObjectId (PK)
* `roomCode`: String (Unique, Indexed, Required)
* `hostId`: ObjectId (Ref: `user`, Required)
* `guestId`: ObjectId (Ref: `user`, Default: `null`)
* `sessionId`: ObjectId (Ref: `GameSession`, Default: `null`)
* `status`: String -> Enum `['WAITING', 'PLAYING', 'CLOSED']` (Default: `'WAITING'`).
* `createdAt`, `updatedAt`: Date -> (Tự động sinh).

### 2.3 `chat_message` (Collection: chat_messages)
*Lưu trữ tin nhắn trao đổi trong phòng chơi trực tuyến.*
* `_id`: ObjectId (PK)
* `roomId`: ObjectId (Ref: `game_room`, Indexed, Required)
* `senderId`: ObjectId (Ref: `user`, Required)
* `message`: String (Required)
* `createdAt`, `updatedAt`: Date -> (Tự động sinh).

---

## 3. Nhóm Hồ sơ (Social) & Thành tích

### 3.1 `user_statistic` (Collection: user_statistics)
*Quản lý thống kê thành tích của người chơi, phục vụ tính toán Bảng xếp hạng (Leaderboard).*
* `userId`: ObjectId (Ref: `User`, Unique, Required)
* `totalGames`: Number (Default: `0`)
* `wins`: Number (Default: `0`)
* `losses`: Number (Default: `0`)
* `draws`: Number (Default: `0`)
* `eloRating`: Number -> Điểm xếp hạng (Default: `1000`).
* **Indexes Thiết lập**: `eloRating: -1` -> Tối ưu hóa truy vấn Leaderboard siêu tốc $\mathcal{O}(\log N)$.
* *(Không sử dụng timestamps để giảm thiểu dung lượng ghi do bảng này được update liên tục)*.

---

## 4. Nhóm Tài chính (Billing)

### 4.1 `transaction` (Collection: transactions)
*Ghi nhận các giao dịch nạp tiền và thanh toán của người chơi.*
* `_id`: ObjectId (PK)
* `userId`: ObjectId (Ref: `user`, Indexed, Required)
* `type`: String (Required) -> Enum `['DEPOSIT', 'BUY_PREMIUM']`
* `amount`: Number (Required)
* `createdAt`, `updatedAt`: Date -> (Tự động sinh).

### 4.2 `subscription` (Collection: subscriptions)
*Chứng nhận và lịch sử gói thành viên Premium.*
* `_id`: ObjectId (PK)
* `userId`: ObjectId (Ref: `user`, Indexed, Required)
* `validFrom`: Date (Required)
* `validUntil`: Date (Indexed, Required) -> Index phục vụ việc quét hết hạn.
* `status`: String -> Enum `['ACTIVE', 'EXPIRED', 'CANCELLED']` (Default: `'ACTIVE'`).
* `transactionId`: ObjectId (Ref: `transaction`, Required) -> Liên kết hóa đơn gốc.
* `createdAt`, `updatedAt`: Date -> (Tự động sinh).

---

## 5. Nhóm OPs / Quản trị hệ thống (Admin)

### 5.1 `audit_log` (Collection: audit_logs)
*Nhật ký kiểm toán, ghi nhận các hành động can thiệp vào hệ thống của Quản trị viên.*
* `_id`: ObjectId (PK)
* `adminId`: ObjectId (Ref: `admin`, Required)
* `action`: String (Required) -> Enum `['BAN_USER', 'FORCE_CLOSE_ROOM', 'UNBAN_USER']`
* `targetId`: String (Required) -> Chứa ID của User hoặc Room bị can thiệp.
* `oldValue`: Mixed -> Trạng thái dữ liệu trước khi thay đổi (JSON Object).
* `newValue`: Mixed -> Trạng thái dữ liệu sau khi thay đổi (JSON Object).
* `createdAt`, `updatedAt`: Date -> (Tự động sinh).