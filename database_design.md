# Database Design Specification

Tài liệu này mô tả chi tiết schema cơ sở dữ liệu của hệ thống, được chia thành các module độc lập theo nguyên tắc Domain-Driven Design (DDD).

---

## 1. Auth Module
Chịu trách nhiệm về xác thực người dùng (Authentication), phân quyền (Authorization) và quản lý phiên đăng nhập.

### Entity: `users`
Chỉ chứa dữ liệu phục vụ cho quá trình đăng nhập và phân quyền.
| Field | Type | Notes / Constraints |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `username` | String | Unique, Indexed, Required |
| `email` | String | Unique, Indexed, Required, Lowercase |
| `passwordHash` | String | Required (Bcrypt hash, never in DTOs) |
| `role` | String | Enum: `PLAYER`, `ADMIN` (Default: `PLAYER`) |
| `isActive` | Boolean | Default: `true` (false khi bị admin ban) |
| `createdAt` | Date | Auto timestamps |
| `updatedAt` | Date | Auto timestamps |

## 2. Profile Module
Chịu trách nhiệm lưu trữ thông tin hiển thị của người dùng và thống kê thành tích.

### Entity: `profiles`
Chứa thông tin hiển thị và số dư ví. Sinh ra đồng thời cùng `users` khi đăng ký.
| Field | Type | Notes / Constraints |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `userId` | ObjectId | Ref `users._id`, Unique, Indexed, Required |
| `country` | String | Required |
| `isPremium` | Boolean | Default: `false` (Embed vào JWT) |
| `avatarUrl` | String | Default: `''` |
| `walletBalance` | Number | Default: `0` |
| `premiumExpiry` | Date | Default: `null` |
| `createdAt` | Date | Auto timestamps |
| `updatedAt` | Date | Auto timestamps |

### Entity: `userStatistics`
Thống kê thành tích và ELO phục vụ bảng xếp hạng (Leaderboard).
| Field | Type | Notes / Constraints |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `userId` | ObjectId | Ref `users._id`, Unique, Required |
| `totalGames` | Number | Default: `0` |
| `wins` | Number | Default: `0` |
| `losses` | Number | Default: `0` |
| `draws` | Number | Default: `0` |
| `eloRating` | Number | Default: `1000`, Indexed (Descending) |
| `updatedAt` | Date | Manual update sau mỗi ván đấu |

---

## 3. Game & Arena Module
Trái tim của hệ thống, quản lý phòng chờ (lobbies), trạng thái ván đấu, lịch sử nước đi và hệ thống chat.

### Entity: `gameSessions`
Lưu trữ trạng thái và lịch sử của một ván cờ.
| Field | Type | Notes / Constraints |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `gameType` | String | Enum: `SINGLE`, `LOCAL`, `ONLINE` |
| `boardSize` | Number | Enum: `10`, `15` |
| `player1Id` | ObjectId | Ref `users._id`, Indexed, Required |
| `player1Marker` | String | Enum: `CROSS`, `CIRCLE`, `TRIANGLE`, `SQUARE`, `DIAMOND`, `STAR` |
| `player1Name` | String | Denormalized |
| `player1Avatar` | String | Denormalized |
| `player2Id` | ObjectId | Ref `users._id`, Indexed (Null nếu đánh với AI) |
| `player2Marker` | String | Enum: `CROSS`, `CIRCLE`, `TRIANGLE`, `SQUARE`, `DIAMOND`, `STAR` |
| `player2Name` | String | Denormalized (Hoặc tên AI) |
| `player2Avatar` | String | Denormalized |
| `currentTurn` | String | Enum: `PLAYER1`, `PLAYER2` |
| `boardState` | Array (2D) | Ma trận bàn cờ |
| `difficulty` | String | Enum: `EASY`, `MEDIUM`, `HARD` (Null nếu đánh với người) |
| `moves` | Array | **Embedded sub-documents** (Xem bảng bên dưới) |
| `status` | String | Enum: `ACTIVE`, `ABORTED`, `COMPLETED`|
| `winnerId` | ObjectId | Ref `users._id` (Null cho đến khi có người thắng) |
| `winLine` | Array | Chứa mảng 5 tọa độ `{x, y}` để highlight |
| `roomId` | ObjectId | Ref `gameRooms._id` (Null nếu offline) |
| `startTime` | Date | Default: `Date.now` |
| `endTime` | Date | Default: `null` |
| `createdAt` | Date | Auto timestamps |
| `updatedAt` | Date | Auto timestamps |

#### Sub-document: `moves` (Embedded in `gameSessions`)
| Field | Type | Notes / Constraints |
| :--- | :--- | :--- |
| `step` | Number | Required (Thứ tự nước đi, bắt đầu từ 1) |
| `playerId` | ObjectId | Ref `users._id` (Null nếu là AI) |
| `x` | Number | Required (Zero-indexed column) |
| `y` | Number | Required (Zero-indexed row) |
| `marker` | String | Required |
| `playedAt` | Date | Default: `Date.now` |

### Entity: `gameRooms`
Phòng chờ cho các trận đấu online.
| Field | Type | Notes / Constraints |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `roomCode` | String | Unique, Indexed, Required (e.g. `ROOM-4829`) |
| `player1Id` | ObjectId | Ref `users._id`, Required |
| `player1Name` | String | Denormalized |
| `player2Id` | ObjectId | Ref `users._id` (Null cho đến khi P2 join) |
| `player2Name` | String | Null cho đến khi P2 join |
| `sessionId` | ObjectId | Ref `gameSessions._id` (Null cho đến khi game bắt đầu) |
| `status` | String | Enum: `WAITING`, `PLAYING`, `CLOSED` |
| `endTime` | Date | Null cho đến khi phòng đóng |
| `createdAt` | Date | Auto timestamps |
| `updatedAt` | Date | Auto timestamps |

### Entity: `chatMessages`
Tin nhắn trong các phòng đấu online.
| Field | Type | Notes / Constraints |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `roomId` | ObjectId | Ref `gameRooms._id`, Indexed, Required |
| `senderId` | ObjectId | Ref `users._id`, Required |
| `senderName` | String | Denormalized |
| `message` | String | Required |
| `createdAt` | Date | Auto (Dùng để sort thứ tự tin nhắn) |

---

## 4. Subscription & Billing Module
Quản lý lịch sử giao dịch và gói hội viên Premium.

### Entity: `transactions`
Lịch sử giao dịch tài chính.
| Field | Type | Notes / Constraints |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `userId` | ObjectId | Ref `users._id`, Indexed, Required |
| `type` | String | Enum: `DEPOSIT`, `SUBSCRIPTION_WALLET`|
| `amount` | Number | Required |
| `status` | String | Enum: `SUCCESS`, `FAILED` (Default: `SUCCESS`) |
| `createdAt` | Date | Auto timestamps |

### Entity: `subscriptions`
Bản ghi chứng nhận quyền lợi Premium của người dùng.
| Field | Type | Notes / Constraints |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `userId` | ObjectId | Ref `users._id`, Indexed, Required |
| `transactionId` | ObjectId | Ref `transactions._id`, Required |
| `validFrom` | Date | Required |
| `validUntil` | Date | Indexed, Required (Phục vụ cron-job dọn dẹp) |
| `status` | String | Enum: `ACTIVE`, `EXPIRED`, `CANCELLED` |
| `createdAt` | Date | Auto timestamps |
| `updatedAt` | Date | Auto timestamps |

---

## 5. Admin Module
Phân hệ quản trị hệ thống và kiểm toán.

### Entity: `auditLogs`
Nhật ký lưu vết mọi hành động can thiệp của Admin vào hệ thống.
| Field | Type | Notes / Constraints |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `adminId` | ObjectId | Ref `users._id` (Với role là ADMIN), Required |
| `action` | String | Enum: `BAN_USER`, `UNBAN_USER`, `CLOSE_ROOM`|
| `targetId` | ObjectId | ID của đối tượng bị tác động (User / Room) |
| `targetType` | String | Enum: `USER`, `ROOM` |
| `oldValue` | Mixed | JSON Snapshot trước khi thay đổi |
| `newValue` | Mixed | JSON Snapshot sau khi thay đổi |
| `reason` | String | Lý do thực hiện hành động |
| `createdAt` | Date | Auto timestamps |