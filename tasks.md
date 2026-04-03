# Lộ trình dự án TicTacToang (Target: HD)
**Hạn chót nộp bài: 18:00, ngày 08 tháng 05, 2026**

Dưới đây là kế hoạch chi tiết cho từng giai đoạn (Sprint) để hoàn thành toàn bộ các tính năng "Ultimo" yêu cầu trong Master Plan.

---

## **Sprint 1: Nền móng hệ thống (Setup & Architecture)**
**Deadline: 02/04/2026 (Tuần 1)**

1.  **Khởi tạo Git & Quản lý dự án**: [DONE] Tạo repo GitHub, mời thành viên, phân quyền nhánh (`feat/`, `fix/`, `main`). Tạo README hướng dẫn cài đặt và bảng phân chia công việc trên GitHub Project Board.
2.  **Thiết kế Cơ sở dữ liệu (ERD)**: Vẽ sơ đồ thực thể mối quan hệ (ERD). Thiết kế 4 collection chính trong MongoDB: `users`, `gameSessions`, `gameRooms`, `subscriptions` với đầy đủ các field cho tính năng Ultimo.
3.  **Khởi tạo Backend Modular Monolith**: [DONE] Setup Express.js, cấu hình 6 module (auth, profile, game, arena, subscription, admin) theo dòng chảy N-Tier. **Bắt buộc**: Tạo tệp `*Interface.js` cho mọi module để giao tiếp chéo và cấu trúc `Response Envelope`.
4.  **Khởi tạo Frontend React (Vite)**: [DONE] Setup Vite + React 18. Cấu hình cấu trúc thư mục Feature-Driven (5 tệp/module). Tích hợp Axios Interceptors (`httpClient.js`). Cấu hình **Zustand** cho In-game State thay vì Context API.
5.  **Thiết kế Layout & UI (Responsive)**: Lên wireframe cho tất cả các trang. Dựng khung giao diện cơ bản (Navbar, Sidebar, Footer) đảm bảo hiển thị tốt trên cả điện thoại và máy tính.

---

## **Sprint 2: Xác thực & Core Game Offline**
**Deadline: 16/04/2026 (Tuần 3)**

6.  **Đăng ký & Dual Validation**: API đăng ký người dùng với Dual Validation (Kiểm tra dữ liệu ở cả Frontend và Backend). Mã hóa mật khẩu bằng bcrypt. Dropdown chọn quốc gia (không nhập text tự do).
7.  **Đăng nhập & Auth JWS (RBAC/ABAC)**: API login sinh JWS Token chứa thông tin `id`, `role` (Admin/Player), và `isPremium`. Viết Middleware kiểm tra token và phân quyền truy cập cho từng loại API.
9.  **Giao diện Profile & Avatar**: Trang cá nhân cho phép sửa thông tin và xem lịch sử đấu. API upload ảnh đại diện có tự động resize về 200x200 pixel bằng thư viện Sharp.
10. **Logic bàn cờ Offline & Thuật toán O(1)**: Code giao diện 10x10 và 15x15 tích hợp **Ký hiệu Đại số** (Cột A-O, Hàng 1-15). Bắt buộc áp dụng **Radial Local Search** O(1) để check Win. Áp dụng **Optimistic UI** kết hợp **Server Reconciliation** để xử lý giật lag mạng và chống gian lận.
11. **Chế độ Single Player (AI Easy, Medium & Hard)**: Viết thuật toán AI: mức Dễ (đánh ngẫu nhiên ô cạnh người chơi), mức Trung bình (chặn đối thủ) và mức Khó (biết tấn công và chặn đối thủ bằng hệ thống chấm điểm Heuristic).
12. **Lịch sử đấu (Search/Filter/Sort)**: API lấy danh sách trận đấu có phân trang (Pagination). Cho phép tìm kiếm theo mã trận/tên đối thủ và lọc theo kết quả (Thắng/Thua) hoặc ngày tháng.
---

## **Sprint 3: Online Play, Admin & Tính năng Ultimo**
**Deadline: 30/04/2026 (Tuần 5)**

13. **Multiplayer (Socket.IO Zero-Latency)**: Đấu online qua Socket.IO. Tối ưu hóa Server: Bật nén gói tin nhị phân (**Binary Compression**) và tắt thuật toán Nagle (`noDelay: true`) để đường truyền mượt mà tuyệt đối.
14. **Chat & Hiệu ứng chiến thắng**: Tích hợp khung chat trong trận đấu online. Hiệu ứng win animation cao cấp (chuyển động và đổi màu dải ô thắng). Trình diễn tọa độ bàn cờ (A-O, 1-15).
15. **Hệ thống Replay (Premium)**: Chỉ dành cho tài khoản trả phí. Cho phép xem lại toàn bộ diễn biến trận đấu với các nút: Tạm dừng, Tiếp tục, Tua tới, Tua lui dựa trên mảng `moves[]` trong database.
16. **Admin Portal (Tối ưu Tìm kiếm)**: Dashboard quản lý tài khoản và phòng chơi. Thanh tìm kiếm áp dụng **Collation Index** (bên MongoDB) để search tên bất phân chữ hoa/thường nhằm tiết kiệm CPU thay vì dùng `$regex`.
17. **Thanh toán & Nạp tiền (Wallet/Premium)**: Chức năng nạp tiền vào ví ảo. Đăng ký gói Premium trừ tiền ví và gửi email thông báo thành công qua Nodemailer. Tích hợp Stripe demo (nếu kịp).
18. **Kiểm tra Module Isolation & DTO**: Rà soát lại code đảm bảo các module chỉ gọi nhau qua Interface (không import chéo Service). Đảm bảo 100% API đều dùng DTO để lọc dữ liệu nhạy cảm.

---

## **Sprint 4: Hoàn thiện, Testing & Đóng gói**
**Deadline: 08/05/2026 (Tuần 6 - Submission)**

19. **Triển khai Cloud (Render/Atlas)**: Đưa Backend và Frontend lên Render. Cấu hình whitelist IP cho MongoDB Atlas để giảng viên có thể truy cập chấm bài từ mạng bất kỳ.
20. **Tạo Gold Dataset (Dữ liệu mẫu)**: Nạp sẵn dữ liệu cho Admin, người chơi Premium, người chơi thường và các trận đấu có lịch sử nước đi đầy đủ để demo tính năng Replay.
21. **Kiểm thử chéo (Cross-team Testing)**: Các thành viên test chéo tính năng của nhau để tìm lỗi (Bug). Sửa sạch các lỗi nghiêm trọng (Critical) trước khi nộp.
22. **Viết Báo cáo (Final Report 25 trang)**: Hoàn thiện tài liệu 25 trang bao gồm: Sơ đồ ERD, 3 sơ đồ Sequence (Auth/Room/Sub), Sơ đồ Component, bảng checklist tính năng SRS.
23. **Diễn tập Demo & Nộp bài**: Các thành viên tập thuyết trình giải thích code và kiến trúc. Đóng gói file Zip cuối cùng (loại bỏ node_modules) và nộp lên Canvas.