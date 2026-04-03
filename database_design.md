# TicTacToang — Kiến Trúc Cơ Sở Dữ Liệu Chi Tiết (NoSQL Scalable Design)

Là một người thiết kế dữ liệu chuyên nghiệp (Data Engineer/Architect), khi thiết kế một hệ thống mang mác **High Distinction (Enterprise Level)**, chúng ta không chỉ liệt kê các bảng cho có. Mọi Table (Collection), mọi Field (Attribute), và vị trí đặt Index đều phải giải quyết bài toán cốt lõi: **"Hệ thống sẽ ra sao nếu có 100,000 người cùng chơi online và query bảng xếp hạng cùng lúc?"**

Dưới đây là chi tiết Attributes BẮT BUỘC cho 13 Entities, áp dụng triệt để nguyên lý NoSQL (Denormalization, Embedded vs Referenced, TTL Indexes).

---

## 1. Nhóm Auth & Access Control (Phân quyền & Bảo mật)

### 1.1 `users`
*Lưu thông tin định danh tĩnh. Các thao tác cập nhật (Ghi) trên bảng này diễn ra rất ít (chỉ khi đổi mật khẩu/avatar), nhưng thao tác Đọc (Read) diễn ra liên tục.*
*   `_id`: ObjectId (PK)
*   `username`: String (Unique, Indexed) -> Phục vụ đăng nhập và truy vấn URL trang cá nhân.
*   `email`: String (Unique, Indexed) -> Phục vụ đăng nhập, gửi email qua Nodemailer.
*   `passwordHash`: String -> (Bcrypt). Tuyệt đối chặn ở DTO.
*   `country`: String -> Dropdown chuẩn ISO-3166.
*   `avatarUrl`: String -> Local path hoặc Cloud CDN link.
*   `role`: String -> Enum `['PLAYER', 'ADMIN']` (RBAC).
*   `isActive`: Boolean -> Admin toggle để ban/unban người dùng. Nếu là `false`, người dùng không thể đăng nhập.
*   `walletBalance`: Number -> Default 0. Dùng để nạp tiền và mua Premium.
*   `isPremium`: Boolean -> Cờ hiệu năng (Cache flag). Được cập nhật từ bảng `subscriptions`.
*   `premiumExpiry`: Date -> Ngày hết hạn gói Premium. Hệ thống sẽ kiểm tra flag này khi người dùng đăng nhập.
*   `isAdmin`: Boolean -> Thay cho role nếu bạn muốn đơn giản, hoặc giữ `role: ['PLAYER', 'ADMIN']`.
*   `createdAt`, `updatedAt`: Date.

---

## 2. Nhóm Core Game & Matchmaking (Lõi Real-time)

### 2.1 `gameSessions`
*Trái tim của hệ thống chơi cờ và tính năng Premium Replay. Áp dụng chuẩn Denormalize để truy vấn lịch sử đấu siêu tốc.*
*   `_id`: ObjectId (PK)
*   `gameType`: String -> Enum `['SINGLE', 'LOCAL', 'ONLINE']`
*   `boardSize`: Number -> `10` hoặc `15`
*   `player1Id`: ObjectId (Ref: `users`, Indexed)
*   `player1Name`: String -> **Denormalize (Lưu thừa dữ liệu)**. Giúp Load lịch sử không cần JOIN bảng Users.
*   `player1Avatar`: String -> **Denormalize** Tương tự P1Name.
*   `player2Id`: ObjectId (Nullable, Ref: `users`, Indexed) -> Để AI đánh thì để Null.
*   `player2Name`: String -> "Bot Easy" hoặc tên người thật.
*   `currentTurn`: ObjectId -> (Ref: `users` ID của người đang được đánh).
*   `boardState`: Array 2D -> Ví dụ: `[[null, 'X', 'O'], ...]` phục vụ check thắng/thua ở Backend.
*   `status`: String -> Enum `['ACTIVE', 'WIN', 'DRAW', 'ABORTED', 'ADMIN_CLOSED']`
*   `winnerId`: ObjectId -> Entity của người thắng.
*   `winLine`: Array of Objects -> `[{x, y}, {x, y}... x5]` Tọa độ 5 ô thắng để Frontend vẽ Animation (Feature 4.2.6).
*   `moves`: Array of Objects -> `[{ step: 1, pId: ObjectId, x: 5, y: 5, marker: 'X', time: Date }]`.
    *   *Scalability Note*: Mảng này lưu tối đa 225 phần tử (bàn 15x15). Kích thước < 30KB, cực kỳ an toàn để nhúng (embed) thẳng vào mảng của document thay vì tạo collection Moves riêng, giúp load JSON Replay trong 1 lần query (Feature 4.3.3).

### 2.2 `gameRooms`
*Phòng chờ cho các ván Online riêng tư.*
*   `_id`: ObjectId
*   `roomCode`: String -> Unique Code "ROOM-XYZ" (Indexed).
*   `hostId`: ObjectId (Ref: `users`)
*   `guestId`: ObjectId (Nullable)
*   `sessionId`: ObjectId (Nullable, Ref: `gameSessions`) -> Liên kết ván đấu khi phòng bắt đầu.
*   `status`: String -> `['WAITING', 'PLAYING', 'CLOSED']`.

<!-- ### 2.3 `matchmakingTickets`
*Hàng đợi (Queue) giải quyết bài toán chắp ghép 2 người chơi ngẫu nhiên cùng level.*
*   `_id`: ObjectId
*   `userId`: ObjectId (Unique Index) -> Một người chỉ có 1 vé tìm trận lúc đang xếp hàng.
*   `eloScore`: Number -> Điểm rank để ghép trận môn đăng hộ đối.
*   `status`: String -> `['QUEUING', 'MATCHED']`.
*   `matchedRoomId`: ObjectId -> Trả về Room khi tìm thấy đối thủ.
*   `createdAt`: Date -> Dùng để đánh giá độ ưu tiên (Priority) ai xếp hàng lâu được ghép trước. -->

### 2.4 `chatMessages`
*Lưu trữ log chat.*
*   `_id`: ObjectId
*   `roomId`: ObjectId (Ref: `gameRooms`, Indexed).
*   `senderId`: ObjectId -> Người gửi.
*   `message`: String -> Nội dung HTML/Text.
*   `createdAt`: Date (Indexed) -> Load chat theo thứ tự cũ nhất -> mới nhất.

---

## 3. Nhóm Hồ sơ (Social) & Thành tích (Leaderboard)

### 3.1 `userStatistics`
*Tách rời khỏi bảng `users` để tránh Lock Contention. Bảng Users chứa dữ liệu cá nhân, bảng Statistics cập nhật (Write) liên tục cường độ cao.*
*   `userId`: ObjectId (Unique, PK, Ref: `users`)
*   `totalGames`: Number
*   `wins`: Number
*   `losses`: Number
*   `draws`: Number
*   `eloRating`: Number -> Điểm xếp hạng để tính toán Leaderboard (Indexed `DESC`).

---

---

## 4. Nhóm Tài chính (Billing)

### 4.1 `transactions`
*Sổ cái (Ledger - Không update, chỉ Insert).*
*   `_id`: ObjectId
*   `userId`: ObjectId (Indexed)
*   `type`: String -> `['DEPOSIT', 'BUY_PREMIUM']`
*   `amount`: Number -> Số lượng USD.
*   `method`: String -> `['WALLET', 'STRIPE']`
*   `status`: String -> `['PENDING', 'SUCCESS', 'FAILED']`
*   `createdAt`: Date.

### 4.2 `subscriptions`
*Ghi lại lịch sử các gói Premium đã mua. Đóng vai trò là "Bằng chứng thanh toán" (Evidence of Payment).*
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref: `users`, Indexed)
*   `validFrom`: Date -> Ngày bắt đầu hiệu lực.
*   `validUntil`: Date -> Ngày hết hạn.
*   `status`: String -> `['ACTIVE', 'EXPIRED', 'CANCELLED']`
*   `transactionId`: ObjectId -> (Ref: `transactions`) Liên kết với hóa đơn nạp tiền.

> [!NOTE]
> **Tư duy thiết kế HD Tier:** Tại sao có cả `isPremium` ở bảng `users` và bảng `subscriptions`?
> 1. **Hiệu năng (Performance)**: `users.isPremium` giúp Middleware kiểm tra quyền truy cập Replay ngay lập tức mà không cần JOIN bảng Subscriptions tốn tài nguyên.
> 2. **Minh bạch (Accountability)**: Bảng `subscriptions` lưu lại lịch sử. Nếu người dùng kiện cáo "Tôi mới mua mà sao hết hạn?", bạn có bằng chứng để đối soát.

---

## 5. Nhóm OPs / Quản trị hệ thống (Admin)

### 5.1 `auditLogs`
*Bảo vệ hệ thống khỏi Admin thao túng. Mọi thao tác đều bị hệ thống ghi lại.*
*   `_id`: ObjectId
*   `adminId`: ObjectId (Ref: `users`)
*   `action`: String -> `['BAN_USER', 'FORCE_CLOSE_ROOM', 'UPDATE_CONFIG']`
*   `targetId`: String -> (ID của User hoặc Room bị tác động).
*   `oldValue`: Object -> Chứa JSON dữ liệu trước khi sửa.
*   `newValue`: Object -> Chứa JSON dữ liệu sau khi sửa.
*   `createdAt`: Date.

---

## Tổng kết Kỹ thuật cho Design này:
1.  **Chống Nút thắt cổ chai (Bottlenecks)**: Bằng cách tách `userStatistics` ra khỏi `users`, bạn có thể yên tâm query Leaderboard hàng vạn người mà không làm nghẽn luồng truy cập đăng nhập.
2.  **O(1) Time Complexity (Load siêu tốc)**: `player1Name` được **Denormalize** nhúng vào GameSessions. Việc hiển thị Lịch sử Game không cần dùng thuật toán Lookup/Join để dò sang bảng Users. Query trực tiếp là ra UI luôn. Mảng `moves[]` được Embed (nhúng) giúp tính năng Replay load chỉ với đúng 1 query.
3.  **Tự dọn dẹp (Self-Cleaning via TTL Index)**: Session hết hạn, Log Spam Brute-force, Vé tìm trận quá hạn sẽ tự động bốc hơi khỏi RAM/Disk do MongoDB quản lý bằng TTL Indexes. Bộ nhớ DB của bạn sẽ hoàn toàn sạch sẽ.
