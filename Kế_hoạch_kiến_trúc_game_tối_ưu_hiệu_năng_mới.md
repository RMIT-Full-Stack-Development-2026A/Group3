# **Báo cáo Phân tích và Thiết kế Kiến trúc Hệ thống Trò chơi TicTacToang (Full Stack MEN & React 18\)**

## **Khái quát Hệ thống và Tầm nhìn Kiến trúc Định hướng Hiệu năng**

Trong bối cảnh công nghệ web hiện đại, các ứng dụng thời gian thực đòi hỏi một sự kết hợp khắt khe giữa khả năng mở rộng kiến trúc, độ trễ tiệm cận bằng không và trải nghiệm người dùng liền mạch.1 Dự án hệ thống trò chơi trực tuyến Full Stack TicTacToang được xây dựng nhằm đáp ứng các tiêu chuẩn công nghiệp cao nhất, đồng thời thỏa mãn hoàn toàn các mục tiêu học tập (CLO 01-05) và tiêu chí đánh giá khắt khe của khóa học phân tích.4 Hệ thống không chỉ phục vụ như một nền tảng giải trí đa người chơi mà còn là một minh chứng kỹ thuật về cách xử lý đồng bộ hóa trạng thái phức tạp, quản lý ranh giới miền dữ liệu và bảo mật đa tầng trong một môi trường phân tán.4  
Để đạt được hiệu năng tối ưu trên mọi nền tảng (không giật/lag) và cấu trúc mở rộng linh hoạt, hệ thống áp dụng kiến trúc **Monorepo (NPM Workspaces)**. Ngăn xếp công nghệ MEN (MongoDB, Express.js, Node.js) được triển khai theo mô hình hiện đại, kết hợp **Modular Monolith** phân lớp N-Tier cho backend, và **Feature-Sliced Design** cho frontend. Toàn bộ logic cốt lõi (Game Rules, AI) được tập trung tại gói **@tictactoang/shared** nhằm đảm bảo tính đồng bộ tuyệt đối giữa client và server.4  
Báo cáo này trình bày một bản thiết kế toàn diện, phân tích sâu sắc các quyết định kiến trúc, từ cơ chế đồng bộ hóa luồng sự kiện Socket.IO, thuật toán kiểm tra thắng thua tối ưu với độ phức tạp ![][image1], cho đến chiến lược thiết kế cơ sở dữ liệu MongoDB tuân thủ nghiêm ngặt quy tắc lập chỉ mục ESR (Equality, Sort, Range) nhằm giải quyết khối lượng dữ liệu lịch sử khổng lồ. Mọi quyết định kỹ thuật đều được đối chiếu trực tiếp với bộ tiêu chí đánh giá (Rubric) nhằm đảm bảo hệ thống đạt mức độ hoàn thiện xuất sắc (High Distinction) ở các khía cạnh tổ chức mã nguồn, triển khai, tính năng và cộng tác nhóm.

## **Kiến trúc Backend: Monorepo Modular Monolith và Phân lớp N-Tier**

Sự ổn định và khả năng bảo trì của backend được tối ưu hóa thông qua cấu trúc **Monorepo**. Toàn bộ mã nguồn máy chủ nằm trong gói `packages/backend`, tuân thủ mô hình Modular Monolith với khả năng chia cắt dọc (Vertical Slicing) kết hợp phân lớp chức năng (N-Tier) khắt khe.4

Sự ổn định, khả năng bảo trì và khả năng ngăn chặn các lỗi ảnh hưởng chéo (cross-module ripple effects) của backend phụ thuộc hoàn toàn vào cách tổ chức mã nguồn và quản lý ranh giới dữ liệu.11 Hệ thống TicTacToang từ bỏ cách tiếp cận phân lớp ngang đơn thuần (nơi tất cả các bộ điều khiển nằm chung một thư mục) để chuyển sang cấu trúc chia cắt dọc (Vertical Slicing) kết hợp với phân lớp chức năng chi tiết (N-Tier) bên trong mỗi lát cắt.4

### **Ranh giới Miền nghiệp vụ (Modular Monolith)**

Kiến trúc Modular Monolith chia toàn bộ hệ thống backend thành các module nghiệp vụ hoàn toàn độc lập, với các ngữ cảnh được giới hạn (Bounded Contexts) rõ ràng, bao gồm: auth (xác thực), profile (hồ sơ người dùng), game (logic trò chơi và AI), arena (quản lý phòng và phiên Socket), subscription (thanh toán ví), và admin (quản trị hệ thống).4  
Bảng dưới đây so sánh các khía cạnh kỹ thuật để minh chứng lý do Modular Monolith là sự lựa chọn tối ưu cho hệ thống TicTacToang so với các kiến trúc khác:

| Khía cạnh Kiến trúc | Monolith Truyền thống | Modular Monolith (Lựa chọn) | Microservices |
| :---- | :---- | :---- | :---- |
| **Phân chia Cấu trúc** | Dựa trên công nghệ (Controllers, Models chung) | Dựa trên miền nghiệp vụ (Auth, Game, Admin...) 9 | Dựa trên miền nghiệp vụ, kho lưu trữ hoàn toàn tách biệt 15 |
| **Giao tiếp Nội bộ** | Gọi hàm trực tiếp, không có ranh giới kiểm soát | Gọi qua Facade/Interface nội bộ, độ trễ cực thấp 16 | Giao tiếp qua mạng (HTTP/gRPC/Kafka), độ trễ mạng cao 16 |
| **Triển khai (Deployment)** | Đơn lẻ, triển khai toàn bộ cùng lúc | Đơn lẻ, triển khai toàn bộ cùng lúc 18 | Phân tán, đòi hỏi CI/CD phức tạp cho từng dịch vụ 15 |
| **Độ phức tạp Vận hành** | Thấp | Trung bình 19 | Rất cao (yêu cầu Kubernetes, Service Mesh, Load Balancers) 7 |
| **Khả năng Tách rời** | Khó khăn do sự phụ thuộc chéo dày đặc (Spaghetti) | Dễ dàng trích xuất thành Microservice trong tương lai khi lưu lượng tăng 14 | Đã tách rời từ đầu, chi phí hạ tầng ban đầu khổng lồ 8 |

Mô hình này cung cấp những lợi ích của việc phân chia ranh giới vật lý như trong Microservices, nhưng duy trì sự đơn giản trong triển khai của một Monolith. Bằng cách nhóm các tệp theo tính năng, mã nguồn tuân thủ nguyên tắc trách nhiệm duy nhất (Single Responsibility Principle), đáp ứng trực tiếp tiêu chí "Code Organization & Style" với yêu cầu mã nguồn sạch, dạng module và tuân theo các quy ước đặt tên nhất quán.4

### **Hệ thống Phân lớp Chức năng (N-Tier Layering)**

Bên trong mỗi module nghiệp vụ, kiến trúc áp dụng mô hình phân lớp N-Tier khắt khe để tách biệt các mối quan tâm, đảm bảo rằng mã xử lý mạng không hòa trộn với logic nghiệp vụ hoặc truy vấn cơ sở dữ liệu.4 Sự phân lớp này là bắt buộc đối với cấp độ kiến trúc "Ultimo" của hệ thống.4

1. **Lớp Định tuyến (Route \- \*Route.js):** Lớp này chịu trách nhiệm duy nhất là khai báo các đường dẫn HTTP (Endpoints) và thiết lập chuỗi các phần mềm trung gian (Middleware) bảo mật. Tuyệt đối không chứa bất kỳ logic kiểm tra dữ liệu hay nghiệp vụ nào.4  
2. **Lớp Điều khiển (Controller \- \*Controller.js):** Tiếp nhận đối tượng yêu cầu (req) và phản hồi (res) từ Express.js. Nhiệm vụ của Controller là trích xuất dữ liệu thô, gọi các Đối tượng Truyền Dữ liệu (Request DTO) để xác thực tính hợp lệ, sau đó ủy quyền xử lý cho lớp Service, và cuối cùng định dạng kết quả thông qua Response DTO trước khi trả về cho máy khách. Lớp Controller không bao giờ được phép chứa các lệnh truy vấn Mongoose.4  
3. **Lớp Dịch vụ (Service \- \*Service.js):** Trái tim của mọi module. Toàn bộ các quy tắc nghiệp vụ phức tạp, từ việc thực thi thuật toán kiểm tra người chiến thắng (win-check), tính toán bước đi của AI, cho đến việc xác minh tính hợp lệ của số dư ví khi thanh toán đăng ký Premium, đều nằm tại đây.4 Đặc biệt, lớp Service được thiết kế hoàn toàn tách biệt khỏi các khái niệm về giao thức HTTP; nó nhận các đối tượng dữ liệu thuần túy và trả về dữ liệu thuần túy, giúp cho việc kiểm thử đơn vị (Unit Testing) trở nên vô cùng dễ dàng.4  
4. **Lớp Truy cập Dữ liệu (Repository \- \*Repository.js):** Đóng vai trò là lớp trừu tượng hóa cơ sở dữ liệu. Lớp này chứa toàn bộ các câu lệnh tương tác với Mongoose (find, updateOne, aggregate). Việc sử dụng Repository pattern cho phép cách ly logic nghiệp vụ khỏi các thay đổi cấu trúc dữ liệu bên dưới.4 Nếu trong tương lai dự án chuyển đổi từ MongoDB sang PostgreSQL, chỉ có lớp Repository cần được viết lại, trong khi lớp Service vẫn giữ nguyên vẹn.21  
5. **Lớp Lược đồ (Model \- \*Model.js):** Nơi định nghĩa các lược đồ (schema) của cơ sở dữ liệu Mongoose, bao gồm các cấu hình về kiểu dữ liệu, giá trị mặc định và các chỉ mục (indexes).4

### **Mẫu Thiết kế Facade và Giao tiếp Liên Module**

Để ngăn chặn tình trạng phụ thuộc chéo (cross-coupling), hệ thống thiết lập quy tắc: Các module không được phép gọi trực tiếp Service của module khác. Toàn bộ giao tiếp liên module phải thông qua tệp giao diện `*.interface.js`.4  

Đặc biệt, dự án triển khai lớp **Logic Chia sẻ (Shared logic - packages/shared/)**. Lớp này chứa các thuật toán "vàng" (Ground Truth) như Win-check và AI Heuristics. Cả Máy chủ (khi xác thực nước đi) và Máy khách (khi hiển thị trạng thái lạc quan) đều gọi chung một mã nguồn từ gói `@tictactoang/shared`. Điều này loại bỏ hoàn toàn rủi ro sai lệch trạng thái (Out-of-sync) giữa hai đầu hệ thống.4


## **Kiến trúc Frontend: Thiết kế Cắt lớp Tính năng (Feature-Sliced) và Quản lý Trạng thái**

Để đối phó với sự phức tạp ngày càng tăng của giao diện người dùng, đặc biệt là trong các ứng dụng có nhiều vai trò và quyền hạn đan xen như bảng điều khiển trò chơi và hệ thống quản trị, kiến trúc frontend trên nền tảng React 18 và Vite từ bỏ cấu trúc thư mục phẳng truyền thống. Sự phân chia mã nguồn chỉ theo loại tệp (như thư mục /components, /hooks, /services ở mức gốc) tạo ra mã nguồn khó theo dõi và tỷ lệ phụ thuộc cao.24 Thay vào đó, hệ thống áp dụng kiến trúc **Gói Thành phần Hướng Tính năng (Feature-Driven Component Packages)**, phản ánh nguyên lý Feature-Sliced Design (FSD).4

### **Ranh giới Tính năng và Nguyên tắc Nguyên tử (Atomic Design)**

Bên trong thư mục `packages/frontend/src/features/`, mọi mã nguồn phục vụ một tính năng cụ thể sẽ được đóng gói riêng biệt:

1. **Giao diện (View - *.view.jsx):** Cấu trúc UI thuần túy (dumb component).4  
2. **Hook logic (Hook - *.hook.js):** Quản lý state và event handlers, tách rời khỏi UI.4  
3. **Dịch vụ mạng (Service - *.service.js):** Xử lý API thông qua `http.util.js` (Axios Interceptor).4  
4. **Lược đồ dữ liệu (Model - *.model.js):** Định nghĩa cấu trúc dữ liệu cục bộ.4  
5. **Kiểu dáng Scoped (Style - *.css):** Cô lập CSS cho từng tính năng.4

Trong khi các tính năng phức tạp được nhóm theo miền nghiệp vụ, các yếu tố giao diện trực quan cốt lõi có khả năng tái sử dụng cao (như nút bấm tùy chỉnh, hộp thoại cảnh báo, biểu tượng tải trang, hình đại diện) lại được phát triển dựa trên phương pháp luận **Thiết kế Nguyên tử (Atomic Design)**.10 Các thành phần này được xem như những "nguyên tử" (Atoms) độc lập và ổn định, được lưu trữ tại src/components/, đóng vai trò như một thư viện UI nội bộ (Design System) nhất quán để cấu thành nên các giao diện phức tạp.28 Sự kết hợp giữa Feature-Driven và Atomic Design giải quyết trọn vẹn cả nhu cầu mở rộng tính năng và duy trì tính đồng nhất của hệ thống giao diện.30

Sự kết hợp giữa Feature-Driven và Atomic Design (trong `src/components/`) giải quyết trọn vẹn nhu cầu mở rộng tính năng và duy trì tính đồng nhất của hệ thống giao diện.30


### **Đột phá Kết xuất Đồng thời (Concurrent Rendering) trong React 18**

Trong một trò chơi cờ caro thời gian thực, độ trễ khi vẽ lại giao diện (UI lagging) do các luồng dữ liệu bị nghẽn là không thể chấp nhận.31 Hệ thống tận dụng các tính năng Kết xuất Đồng thời (Concurrent Rendering) mới nhất của React 18 để tạo ra trải nghiệm mượt mà, không giật lag ngay cả trong điều kiện phần cứng hạn chế.31  
Ở các phiên bản React cũ, quá trình cập nhật giao diện là đồng bộ và không thể bị gián đoạn. Nếu ứng dụng đang phải xử lý một mảng dữ liệu lớn (như lịch sử các bước đi trong tính năng Replay) hoặc đang chờ phản hồi từ máy chủ, toàn bộ luồng chính (main thread) sẽ bị khóa, khiến trình duyệt đóng băng và bỏ lỡ các thao tác nhập liệu của người dùng.31 React 18 giải quyết triệt để vấn đề này bằng cách cho phép ưu tiên các tác vụ kết xuất.  
Thông qua hook useTransition và useOptimistic, nền tảng đánh dấu các thao tác tương tác của người dùng (như nhấp chuột để đặt quân cờ) là khẩn cấp (urgent updates), trong khi các tác vụ nặng (như tải lại hình ảnh động hoặc cập nhật danh sách phòng) được đẩy xuống mức độ ưu tiên thấp hơn dưới dạng tiến trình nền (background work).31 Cơ chế tự động gộp cập nhật (Automatic Batching) của React 18 cũng giúp nhóm nhiều thay đổi trạng thái lại thành một lần vẽ lại giao diện duy nhất, giảm thiểu chu kỳ tiêu thụ tài nguyên vô ích.31

### **Quản trị Trạng thái: Sự giao thoa giữa Context API và Zustand**

Việc lựa chọn công cụ quản lý trạng thái (State Management) tác động trực tiếp đến hiệu năng kết xuất lại của ứng dụng.37 Thay vì sử dụng một giải pháp duy nhất như Redux vốn đi kèm với lượng mã nguyên mẫu (boilerplate) đồ sộ và độ phức tạp cao, hệ thống phân bổ trách nhiệm quản lý dựa trên đặc tính của dữ liệu 38:

* **Dữ liệu Tĩnh, Biến đổi Chậm (Static/Slow-moving State):** React Context API được triển khai qua AuthContext.jsx để lưu trữ các trạng thái toàn cục ít khi thay đổi như thông tin phiên đăng nhập của người dùng, JWT token và cấu hình chủ đề (theme).4 Vì dữ liệu này chỉ cập nhật khi người dùng đăng nhập hoặc đăng xuất, Context API giải quyết hiệu quả vấn đề truyền dữ liệu qua nhiều tầng thành phần (prop-drilling) mà không gây ra sự hao tổn hiệu năng kết xuất lại (re-render penalties).4  
* **Dữ liệu Động, Tần suất Cao (Highly Dynamic State):** Đối với các dữ liệu thay đổi liên tục trong tích tắc như trạng thái ván đấu, tọa độ các quân cờ, tin nhắn trò chuyện, và bộ đếm thời gian, Context API sẽ trở thành thảm họa hiệu năng do cơ chế kích hoạt kết xuất lại toàn bộ cây thành phần bên dưới nó.40 Để giải quyết, dự án sử dụng thư viện **Zustand**. Khác với Context, Zustand hoạt động độc lập bên ngoài cây DOM của React và sử dụng mô hình đăng ký chọn lọc (subscription-based selectivity). Các thành phần UI chỉ đăng ký lắng nghe một phân mảnh trạng thái (state slice) cụ thể và chỉ kết xuất lại khi chính xác dữ liệu đó thay đổi, mang lại hiệu suất tối đa cho các tương tác trò chơi nhạy cảm với độ trễ.38

## **Giao thức Mạng và Đồng bộ hóa Trạng thái Thời gian Thực (Real-Time Synchronization)**

Thách thức cốt lõi của tính năng nhiều người chơi trực tuyến (Online Multiplayer) là việc duy trì trạng thái ván cờ đồng bộ hoàn hảo giữa nhiều thiết bị phân tán theo thời gian thực (Zero-Latency).4 Giao thức HTTP truyền thống, với mô hình yêu cầu-phản hồi (request/response) và chi phí thiết lập kết nối lớn thông qua việc liên tục mở và đóng kết nối TCP (handshakes), là quá chậm chạp đối với trò chơi điện tử.1  
Để đạt được kết nối liên tục, song công toàn phần (full-duplex), hệ thống sử dụng **WebSockets** được đóng gói thông qua thư viện **Socket.IO**.1 Khác với WebSocket nguyên thủy, Socket.IO cung cấp độ tin cậy tuyệt đối thông qua cơ chế tự động kết nối lại (auto-reconnection), phân chia không gian tên (namespaces), phòng (rooms), và tự động chuyển đổi dự phòng (fallback) sang giao thức HTTP Long-polling khi tường lửa mạng chặn các cổng WebSocket.44

### **Tối ưu Hóa Băng thông và Giảm Độ trễ Mạng (Network Latency Optimization)**

Mặc dù Socket.IO cung cấp kết nối thời gian thực, nhưng nếu không được cấu hình đúng, kích thước dữ liệu truyền tải có thể gây ra hiện tượng nghẽn mạng cục bộ. Đối với bàn cờ caro kích thước lớn 15x15, việc liên tục phát sóng (broadcast) trạng thái của 225 ô cờ dưới định dạng chuỗi JSON thô (raw JSON payload) trong mỗi bước đi sẽ tiêu tốn băng thông lớn và gia tăng chu kỳ CPU để phân tích cú pháp (parsing).46  
Hệ thống triển khai một loạt các kỹ thuật tối ưu hóa chuyên sâu:

1. **Giao thức Nén Nhị phân (Binary Compression):** Hệ thống thay thế các gói tin JSON cồng kềnh bằng dữ liệu nhị phân. Các phần mở rộng gốc của C++ như bufferutil và utf-8-validate được tích hợp trực tiếp vào cấu hình Socket.IO của Node.js.49 bufferutil đảm nhận nhiệm vụ che giấu và mở che giấu (masking/unmasking) các khung dữ liệu WebSocket ở mức độ phần cứng cực nhanh, trong khi utf-8-validate xác nhận tính hợp lệ của chuỗi ký tự ở hiệu suất tối ưu, giảm tải đáng kể cho luồng xử lý đơn (single-thread) của V8 Engine trong Node.js.49 Đồng thời, dữ liệu truyền đi có thể được biên dịch thành các mảng bộ nhớ đệm nhị phân dựa trên lược đồ (như Protocol Buffers hoặc @colyseus/schema), ánh xạ các chuỗi tên biến thành các chỉ mục số, giúp giảm kích thước gói tin từ 50-80%.50  
2. **Cập nhật Tăng dần (Incremental Deltas):** Thay vì gửi toàn bộ tình trạng ván cờ, mô hình đồng bộ chỉ truyền đi những thay đổi (deltas) – tức là dữ liệu về quân cờ vừa được đánh xuống.6 Máy khách nhận tọa độ ![][image2] và tự động cập nhật bản sao trạng thái cục bộ của mình, giảm thiểu đáng kể số byte truyền tải.50  
3. **Vô hiệu hóa Thuật toán Nagle:** Theo mặc định, ngăn xếp TCP sử dụng thuật toán Nagle để gộp các gói tin nhỏ thành các khối lớn hơn trước khi gửi đi nhằm tiết kiệm tài nguyên mạng. Tuy nhiên, điều này tạo ra độ trễ nhân tạo vô cùng tai hại trong các trò chơi nhiều người chơi. Hệ thống vô hiệu hóa thuật toán này (thông qua tùy chọn cấu hình Socket) để đảm bảo dữ liệu bước đi được đẩy lên đường truyền ngay lập tức mà không có bất kỳ sự chờ đợi nào.53

### **Cơ chế Giao diện Lạc quan (Optimistic UI) và Điều hòa Trạng thái (Server Reconciliation)**

Bất chấp mọi tối ưu hóa, độ trễ vật lý của tín hiệu mạng (Ping/Jitter) qua đường truyền internet là không thể xóa bỏ.5 Việc yêu cầu người chơi nhấp chuột và chờ vài chục mili-giây để máy chủ xác nhận trước khi hiển thị quân cờ sẽ tạo ra cảm giác "nặng nề" và phản hồi kém.5  
Để thiết kế một trải nghiệm không độ trễ (Zero-latency feel), hệ thống kết hợp **Dự đoán Máy khách (Client-Side Prediction)** và **Giao diện Lạc quan (Optimistic UI Updates)**.5 Khi người chơi chọn một ô, hook useOptimistic trong React ngay lập tức hiển thị quân cờ tại vị trí đó trước khi tín hiệu kịp gửi đến máy chủ.34 Cùng lúc đó, gói tin cập nhật được phát qua Socket.IO.  
Máy chủ backend duy trì quyền kiểm soát tối cao (Server-Authoritative Model). Máy chủ sẽ xác thực tính hợp lệ của bước đi dựa trên trạng thái nội tại của nó (ví dụ: ô cờ có bị đối thủ đánh trùng vào tích tắc trước đó không, có đúng lượt không).5

* Nếu bước đi hợp lệ: Máy chủ phát sóng nước đi cho đối thủ, và giao diện máy khách của người đánh giữ nguyên.57  
* Nếu bước đi không hợp lệ (xung đột trạng thái): Máy chủ gửi một thông báo từ chối. Cơ chế **Điều hòa Máy chủ (Server Reconciliation)** trên trình duyệt sẽ tự động kích hoạt tính năng hoàn tác (rollback) giao diện lạc quan, buộc bảng cờ đồng bộ trở lại với sự thật cốt lõi từ máy chủ, đảm bảo tính công bằng và chống gian lận tuyệt đối (Anti-Cheat).5

### **Khả năng Mở rộng Chiều ngang cho Socket (Horizontal Scaling)**

Một tiến trình Node.js đơn lẻ không thể xử lý hàng trăm nghìn kết nối WebSocket duy trì liên tục do giới hạn tài nguyên cấp hệ điều hành (như giới hạn file descriptor) và việc sử dụng bộ nhớ.59 Việc mở rộng hệ thống theo chiều dọc (thêm RAM, CPU) sẽ chạm đến giới hạn phần cứng (Hard ceiling).61 Để đáp ứng tiêu chí triển khai trên đám mây toàn cầu 4, nền tảng sử dụng mở rộng theo chiều ngang (Horizontal Scaling) thông qua cơ chế phân tán tải:

* **Sticky Sessions:** Bộ cân bằng tải (Load Balancer) như Nginx được cấu hình sử dụng Sticky Sessions (phiên gắn kết) dựa trên địa chỉ IP hoặc Cookie. Điều này đảm bảo tất cả các yêu cầu từ một máy khách cụ thể, ngay cả khi kết nối WebSocket thất bại và bị rớt xuống giao thức HTTP Polling nhiều lần, đều được định tuyến trở lại đúng một vùng máy chủ Node.js đang lưu giữ ngữ cảnh kết nối, ngăn chặn các lỗi mã 400 "Session ID unknown".44  
* **Redis Pub/Sub Adapter:** Vì người chơi 1 có thể đang kết nối với Máy chủ Node A, trong khi người chơi 2 đang kết nối với Máy chủ Node B, Máy chủ A không thể truyền trực tiếp thông điệp socket tới Máy chủ B thông qua bộ nhớ cục bộ.61 Việc tích hợp bộ chuyển đổi Socket.io-Redis thông qua cơ chế Xuất bản/Đăng ký (Pub/Sub) giải quyết vấn đề này. Khi người chơi 1 đi một nước cờ, Máy chủ A sẽ xuất bản sự kiện lên Redis; Redis ngay lập tức chuyển tiếp sự kiện đó tới Máy chủ B, và Máy chủ B sẽ phát sóng nó tới người chơi 2\. Redis đóng vai trò như một bảng thông báo tốc độ cao tập trung, mang lại sự liền mạch cho mạng lưới các máy chủ phân tán.61

## **Tối ưu Hóa Thuật toán Trò chơi và Trí tuệ Nhân tạo (AI)**

Hệ thống cho phép người dùng mở rộng cấu hình từ bàn cờ 10x10 tiêu chuẩn lên kích thước 15x15 với điều kiện thắng là chuỗi 5 quân cờ liên tiếp.4 Sự thay đổi quy mô này yêu cầu một cuộc đại tu lớn về mặt thiết kế thuật toán so với cờ caro 3x3 đơn giản.

### **Thuật toán Kiểm tra Thắng/Thua Độ phức tạp Không đổi ![][image1]**

Một thuật toán kiểm tra thắng thua quét qua toàn bộ ma trận (bàn cờ) theo hàng, cột và đường chéo có độ phức tạp thời gian ![][image3].64 Trên lưới 15x15 (225 ô), việc lặp lại thao tác này hàng chục lần mỗi giây cho hàng ngàn trận đấu đồng thời sẽ khiến CPU máy chủ quá tải và dẫn đến tình trạng suy giảm hiệu suất nghiêm trọng (server bottleneck).64  
Giải pháp để triệt tiêu thời gian xử lý là đánh đổi độ phức tạp không gian (Space Complexity) lấy tốc độ thời gian (Time Complexity).64 Phương pháp đếm mảng toàn cục được sử dụng, trong đó hệ thống tạo các bộ đếm độc lập cho mỗi hàng, mỗi cột và mỗi đường chéo. Khi một người chơi đi một nước tại tọa độ ![][image4], thuật toán chỉ cập nhật giá trị của các bộ đếm tương ứng: row\[r\]++, col\[c\]++, diag\[r-c\]++, và antiDiag\[r+c\]++.64  
Tuy nhiên, phân tích chuyên sâu cho thấy phương pháp đếm mảng toàn cục ![][image1] này **chỉ chính xác đối với các trò chơi mà điều kiện chiến thắng bằng với toàn bộ chiều dài của bảng** (như 3 ô thẳng hàng trên bàn 3x3).64 Đối với trò chơi Gomoku (5 quân để thắng trên bảng 15x15), một hàng có thể chứa 5 quân cờ nhưng nằm rải rác không liên tiếp, khiến bộ đếm báo thắng giả (false positive).64  
Do đó, thuật toán ![][image1] đích thực và tối ưu nhất cho biến thể 15x15 sử dụng kỹ thuật **Kiểm tra Cục bộ Hướng Tâm (Radial Local Search)**. Bởi vì một chiến thắng chỉ có thể được kích hoạt bởi nước đi cuối cùng, thuật toán không bao giờ quét qua các phần khác của bàn cờ.65 Thay vào đó, nó lấy điểm ![][image4] vừa được đánh xuống làm trung tâm, và di chuyển ra hai hướng đối nghịch dọc theo 4 trục (Ngang, Dọc, Chéo chính, Chéo phụ), mỗi hướng quét tối đa 4 bước liền kề.65 Bất kể kích thước bàn cờ mở rộng thành 100x100 hay vô hạn, thuật toán luôn chỉ thực hiện tối đa ![][image5] phép tính toán.66 Cách tiếp cận này loại bỏ hoàn toàn các vòng lặp qua mảng hai chiều, giảm thiểu tài nguyên sử dụng xuống mức cực hạn và đảm bảo khả năng xử lý lượng người dùng cực lớn trên nền tảng đám mây.65

### **Thiết kế Logic Trí tuệ Nhân tạo (AI Heuristics)**

Tương tự như thuật toán thắng thua, không gian trạng thái của trò chơi cờ caro 15x15 là vô cùng vĩ đại, ước tính khoảng ![][image6] khả năng.67 Việc sử dụng thuật toán duyệt cây trò chơi truyền thống như Minimax tìm kiếm toàn diện (Brute-force) để xác định nước đi tốt nhất là bất khả thi về mặt toán học.67 Để đáp ứng tính năng chế độ một người chơi (Single Player) theo quy định của hệ thống 4, các thực thể AI được xây dựng dựa trên logic kinh nghiệm (Heuristics) và khả năng nhận diện các Chuỗi Mối Đe Dọa (Threat Sequences) 4:

1. **Mức độ Easy (Ngẫu nhiên cục bộ):** AI ở chế độ này mô phỏng hành vi của người chơi thiếu kinh nghiệm.4 Thay vì đánh ngẫu nhiên toàn bàn cờ (có thể gây vô nghĩa), hệ thống giới hạn phạm vi tìm kiếm. Thuật toán sẽ chỉ xác định tập hợp các ô trống ngay sát với nước đi gần nhất của đối thủ và chọn ngẫu nhiên một trong số chúng.4 Trọng tải xử lý gần như bằng không.  
2. **Mức độ Medium (Hệ thống phòng thủ phản xạ):** Thiết kế xoay quanh tính năng phòng thủ phản ứng.4 Bộ máy AI phải rà soát bàn cờ cục bộ quanh các cụm quân của người chơi để phát hiện và ngăn chặn các mối đe dọa sinh tử, tuân theo một hệ thống độ ưu tiên (Priority System) 4:  
   * *Ưu tiên 1 (Chặn đứng đường 5):* Nếu phát hiện đối thủ có chuỗi 4 quân liền kề, AI phải ngay lập tức đặt quân cờ để chặn một đầu.4  
   * *Ưu tiên 2 (Khóa đường 4 mở):* Đường 4 mở (Open 4\) là cấu trúc \_XXXX\_ (hai đầu trống). Nếu người chơi thiết lập được cấu trúc này, lượt sau họ chắc chắn thắng. AI phải chèn quân vào một trong hai đầu trống.4  
   * *Ưu tiên 3 (Phá vỡ Ngã ba \- Fork Formation):* Ngã ba là một chiến thuật hiểm hóc tạo ra hai đường 3 mở cùng lúc giao nhau. Thuật toán của AI sử dụng tính năng đánh giá rủi ro quét qua các mẫu giao thoa để chèn quân phá vỡ các cấu trúc mở này trước khi chúng kịp hình thành hình mẫu ngã ba.4  
3. **Mức độ Hard (Phòng thủ chủ động kết hợp Tấn công):** Hard AI thừa kế toàn bộ cấu trúc phòng ngự ưu tiên của cấp độ Medium nhưng được gắn thêm logic tấn công tiên quyết.4 Nếu bộ đánh giá heuristic nhận ra rằng chính AI đang có một cơ hội hoàn thiện chuỗi 5 quân của mình, hệ thống sẽ bỏ qua tất cả các hàm phòng thủ để ra đòn kết liễu.4 Đối với các phiên bản nâng cao, việc triển khai thuật toán Minimax kết hợp cắt tỉa Alpha-Beta (Alpha-Beta Pruning) nhưng giới hạn độ sâu (Depth-limited) ở mức 2-3 lượt đi, và chỉ tìm kiếm các nhánh kề sát cụm quân hiện có, sẽ mang lại một đối thủ gần như bất khả chiến bại trong thời gian xử lý thực (vài phần nghìn giây).67 Các thực thể AI được hệ thống định danh trong quá trình lưu trữ lịch sử dưới các tên gọi chuyên biệt nhằm báo hiệu trực quan mức độ khó (Ví dụ: "Jeremy (Easy)" hay "Bot (Medium)").4

## 

## **Hướng dẫn Chi tiết Cấu trúc Cơ sở Dữ liệu MongoDB và Tối ưu hóa Chỉ mục (Indexing)**

Cơ sở dữ liệu đám mây MongoDB Atlas phục vụ như bộ nhớ vĩnh viễn cho dự án, tuân theo cấu trúc Mongoose Schema mạnh mẽ nhưng cực kỳ linh hoạt.4 Sự khác biệt cơ bản giữa việc áp dụng mô hình dữ liệu NoSQL (Dựa trên tài liệu \- Document) so với mô hình cơ sở dữ liệu quan hệ (RDBMS) là việc sử dụng phương pháp giảm chuẩn hóa (Denormalization) và nhúng tài liệu (Embedding) để thay thế các câu lệnh JOIN đắt đỏ vốn tạo ra các nút thắt hiệu năng.69

### **Cấu trúc Lược đồ Mongoose Hiện đại**

Hệ thống được thiết kế dựa trên bốn bộ sưu tập (collections) cốt lõi với sơ đồ (schema) được định nghĩa tại từng miền nghiệp vụ riêng biệt theo cấu trúc Modular Monolith.4  
**1\. Lược đồ Người dùng (users collection):** Đây là cấu trúc nền tảng chứa thông tin danh tính, bảo vệ tài khoản và lịch sử hệ thống của cả Players và Admins.4

* *Định danh và Hồ sơ:* Trường username, email (với ràng buộc unique: true), country (sử dụng các tùy chọn giới hạn từ danh sách thả xuống \- Enum), và avatarUrl (lưu trữ đường dẫn tới hình ảnh đã được xử lý qua công cụ thư viện sharp xuống kích thước chuẩn 200x200 pixel).4  
* *Bảo mật Mật khẩu:* Mật khẩu thuần túy được chuyển đổi qua hàm băm (hashing function) với salt ngẫu nhiên của thư viện bcrypt và lưu tại trường passwordHash. Thiết kế từ chối hoàn toàn việc sử dụng mã hóa hai chiều (encryption).4  
* *Phân quyền và Tài chính:* Thuộc tính role (giá trị Enum: PLAYER hoặc ADMIN) và isPremium quản lý quyền truy cập. Trường walletBalance lưu trữ số dư cục bộ phục vụ cho quá trình đăng ký.4  
* *Cấu trúc Chống Brute-force:* Ứng dụng theo dõi trực tiếp trạng thái tấn công trên cơ sở dữ liệu qua trường loginAttempts (kiểu số nguyên) và lockUntil (kiểu thời gian \- Date).4 Khi loginAttempts chạm ngưỡng 5, lockUntil được đẩy lên 60 giây trong tương lai, khóa hoàn toàn mọi truy cập.4

**2\. Lược đồ Phiên Trò chơi (gameSessions collection):** Chứa toàn bộ trạng thái vòng đời của một ván cờ, từ thời điểm khởi tạo, các nước đi cho đến kết quả phân tích thuật toán. Thiết kế này tạo nền tảng cho tính năng Xem lại (Replay) và các bảng lịch sử truy vấn phức tạp.4

* *Thuộc tính Định tuyến:* gameType (Local, Single, Online), boardSize (10x10 hoặc 15x15), status (ACTIVE, WIN, DRAW, ABORTED).4  
* *Tham chiếu Danh tính:* Liên kết (Referencing) đến ID người chơi thông qua player1Id, player2Id và đối chiếu tên hiển thị khử chuẩn hóa (denormalized name) như player1Name, player2Name (Lưu ý: Đối với chế độ AI, player2Name trực tiếp nhận tên thực thể AI).4  
* *Lưu trữ Bước đi (Ký hiệu Đại số) \- Mảng Nhúng Giới hạn:* Để lưu trữ dữ liệu phát lại (Replay), hệ thống không tạo một bộ sưu tập moves riêng biệt mà áp dụng mẫu thiết kế **Mảng Nhúng Giới hạn (Bounded Array Pattern)**.4 Các bước đi chứa định dạng tọa độ Ký hiệu Đại số (Algebraic notation, ví dụ: cột chữ cái, hàng chữ số), thứ tự bước đi (seq), ký hiệu đánh (marker) được nối (append) liên tục vào mảng moves.4 Mặc dù MongoDB khuyến cáo chống lại Mảng không giới hạn (Unbounded Array Anti-pattern) vì nó làm tài liệu phình to gây suy giảm hiệu suất phân trang 70, nhưng bàn cờ Caro 15x15 có giới hạn vật lý tự nhiên là tối đa 225 ô.70 Do đó, mảng moves sẽ không bao giờ phát triển vượt quá 225 phần tử, đảm bảo tài liệu luôn nhỏ, gọn nhẹ, dễ phân giải (serialize) và không bao giờ chạm đến giới hạn 16MB của BSON Document.70  
* *Phân tích Chiến thắng:* Mảng winLine chứa chính xác mảng 5 tọa độ ô vuông đã đem lại chiến thắng, cho phép UI frontend tạo ngay các hoạt ảnh đánh dấu chiến thắng nhanh chóng thay vì tính toán lại.4

**3\. Lược đồ Quản lý Phòng (gameRooms collection) và Đăng ký (subscriptions collection):**

* gameRooms: Theo dõi ngữ cảnh của sảnh chờ thời gian thực, với roomCode, trạng thái kết nối WebSocket (WAITING, ACTIVE, CLOSED) và các mốc thời gian bắt đầu/kết thúc để quản lý vòng đời mạng.4  
* subscriptions: Ghi nhận giao dịch lịch sử. Chứa ID người dùng, số tiền thanh toán, phương thức (Ví nội bộ hoặc hệ thống bên thứ 3\) và cột thời gian hết hạn (expiresAt \- cấu hình tự hủy sau 30 ngày).4

### **Tối ưu hóa Chỉ mục (Indexing) cho Hiệu suất Truy vấn Tốc độ cao**

Khi dữ liệu lịch sử trận đấu của người dùng phình to, việc hệ thống cơ sở dữ liệu phải thực hiện Quét toàn bộ bộ sưu tập (COLLSCAN) để trả về lịch sử chơi game hoặc thống kê bảng xếp hạng sẽ đánh sập máy chủ vì hao tốn quá nhiều tài nguyên I/O và Memory.74 Nền tảng cấu hình bộ Chỉ mục (Indexes) đa chiều ở cấp độ thiết kế Mongoose Schema:  
**1\. Chỉ mục Phức hợp và Quy tắc ESR (Equality, Sort, Range):** Bảng Profile chứa danh sách lịch sử trận đấu, đòi hỏi các truy vấn lọc phức tạp (theo ID người dùng, theo trạng thái kết quả) và sắp xếp theo thời gian (startTime). Để đạt tốc độ tìm kiếm micro-giây, nền tảng sử dụng một Chỉ mục Phức hợp (Compound Index) tuân thủ quy tắc ESR vàng của MongoDB 75:

* *E \- Equality (Tính bằng):* Các trường thường được truy vấn bằng so sánh bằng xác định (player1Id, status) được xếp đầu tiên trong chỉ mục, giúp cơ sở dữ liệu cắt giảm ngay hàng nghìn tài liệu không liên quan.75  
* *S \- Sort (Sắp xếp):* Trường startTime (Sắp xếp giảm dần) đứng vị trí thứ hai trong chuỗi. Điều này cho phép MongoDB trả về kết quả đã được sắp xếp ngay trên cây chỉ mục (B-Tree) thay vì phải nạp toàn bộ vào bộ nhớ RAM để thực hiện phân loại trên bộ nhớ (In-memory Sort \- thao tác cực kỳ đắt đỏ).75  
* *R \- Range (Phạm vi):* Các trường truy vấn dải phân cách, chẳng hạn như dải ngày tháng (endTime \> ngày A), được đặt cuối cùng trong chuỗi cấu trúc.75

**2\. Đột phá Hiệu năng Tìm kiếm Không Phân biệt Chữ hoa/Chữ thường (Case-Insensitive Search):** Một thách thức lớn trong hệ thống là tính năng cho phép người dùng hoặc Admin tìm kiếm tên người chơi thông qua từ khóa một phần, bất chấp việc ghi hoa hay ghi thường (ví dụ: gõ "na" để tìm "Anna" hoặc "Nam").4 Trong truyền thống, phương pháp này được giải quyết thông qua biểu thức chính quy (Regular Expressions \- toán tử $regex kết hợp cờ i).75  
Tuy nhiên, phân tích hệ thống chỉ ra rằng: Biểu thức chính quy không có tính định hướng Collation.78 Khi sử dụng $regex /na/i, cấu trúc B-Tree bị bỏ qua hoàn toàn, buộc MongoDB phải thực hiện quét tuyến tính toàn bộ các nút chỉ mục (Index Scan) hoặc tệ hơn là quét toàn bộ tài liệu.78 Càng có nhiều người dùng, tính năng tìm kiếm càng trở nên giật lag.79  
Để khôi phục hiệu suất, lược đồ áp dụng tính năng **Chỉ mục Đối chiếu (Collation Index)**. Bằng cách khai báo một chỉ mục riêng với thuộc tính collation: { locale: 'en', strength: 2 } (Sức mạnh cấp 2 bỏ qua sự khác biệt về in hoa/in thường) trên các trường username và player2Name.77 Khi yêu cầu tìm kiếm cũng được đính kèm cờ collation tương tự, MongoDB dễ dàng duyệt qua các nhánh của B-Tree một cách tự nhiên bằng thuật toán nhị phân, mang lại tốc độ tìm kiếm tính bằng mili-giây, độc lập hoàn toàn khỏi quy mô cơ sở dữ liệu.77

## **Cơ chế Bảo mật và Quản lý Phân quyền Kiến trúc Đa Tầng (Multi-Layer Security)**

Sự kết hợp giữa nhiều loại người dùng và các tính năng trả phí đòi hỏi hệ thống mạng của TicTacToang phải triển khai một khung bảo mật toàn diện, dựa trên nguyên tắc Quyền tối thiểu (Principle of Least Privilege). Lỗ hổng bảo mật không chỉ đe dọa dữ liệu mà còn trực tiếp trừ điểm kiến trúc sâu sắc trong các tiêu chí đánh giá.4

### **Xác thực và Cấu trúc Mã thông báo (JWT Payload Strategy)**

Mọi mật khẩu trong cơ sở dữ liệu được băm bằng thuật toán bcrypt cùng hệ thống muối (salt) tự động, phá vỡ mọi nỗ lực giải mã bẻ khóa cục bộ (offline cracking) của kẻ tấn công.4 Sau khi so sánh thông tin đăng nhập thành công, máy chủ xác thực sẽ khởi tạo một Chữ ký Web JSON (JWS/JWT) dưới dạng vé thông hành (Access Token).4  
Quyết định kiến trúc thông minh nhất ở đây là chiến lược Tối ưu hóa Truy vấn thông qua Tải trọng (Payload Optimization).4 Thay vì chỉ chứa một đoạn chuỗi UUID, tải trọng của mã thông báo JWT được mã hóa chứa luôn các thông tin quan trọng nhất của người dùng: id, role (Vai trò) và isPremium (Trạng thái đăng ký).4 Giải pháp này giải phóng máy chủ khỏi gánh nặng khổng lồ; thay vì phải thực hiện một lệnh truy vấn đắt đỏ đến cơ sở dữ liệu trên mỗi lần gọi API chỉ để biết người dùng có phải là Admin hay có mua gói Premium không, bộ Middleware trên Node.js có thể tự đưa ra các quyết định định tuyến an toàn chỉ bằng việc giải mã chữ ký token ngay lập tức (Stateless Verification).4

### **Quản lý Phân quyền: Mạng lưới RBAC và ABAC**

Hệ thống thiết lập một Chuỗi Trách nhiệm (Chain of Responsibility) dưới dạng các rào chắn phần mềm trung gian (Middleware Guards), bảo vệ mọi đường dẫn API trước khi mã điều khiển (Controller) bị chạm tới.4

* **RBAC (Role-Based Access Control):** Kiểm soát các tác vụ vĩ mô theo cấp độ vai trò.4 roleMiddleware giải mã JWT để trích xuất quyền (PLAYER hay ADMIN). Bất kỳ người chơi nào cố tình gửi truy vấn PUT hay DELETE đến nhóm đường dẫn nội bộ /api/v1/admin/\* sẽ lập tức bị hệ thống từ chối truy cập bằng mã HTTP 403 Forbidden.4 Thiết kế này ngăn ngừa các hành vi leo thang đặc quyền (Privilege Escalation).4  
* **ABAC (Attribute-Based Access Control):** Cấu trúc RBAC vẫn chứa điểm mù ngang (Horizontal Vulnerability); một Player A có thể gửi truy vấn thay đổi thông tin tới điểm cuối hồ sơ của Player B do cả hai đều sở hữu chung chứng chỉ truy cập (vai trò Player).4 Lỗ hổng này được vá bởi ownershipMiddleware, một cơ chế ABAC so sánh chéo ID được trích xuất từ JWT với ID tham số của tài nguyên đang bị yêu cầu sửa đổi.4 Nếu thông tin không khớp, yêu cầu bị chặn lại. Tương tự, premiumMiddleware bảo vệ các luồng truyền dẫn WebSocket cho chế độ Phát lại (Replay), đọc trực tiếp cờ isPremium trong JWT để xác minh đặc quyền trả phí mà không tốn nhịp truy xuất DB.4

### **Hệ thống Chống Brute-Force Đa Cấp (Dual-Layer Guard)**

Điểm cuối kết nối mạng POST /api/v1/auth/login thường là mục tiêu béo bở nhất cho các phần mềm tấn công dò mật khẩu tự động.4 Hệ thống không dựa vào một biện pháp đơn lẻ mà dựng lên một tường thành hai lớp (Defense in Depth) 4:

1. **Chống ngập lụt qua IP (Middleware Layer):** Thông qua gói công cụ express-rate-limit, hệ thống bảo vệ tài nguyên máy chủ bằng cách thiết lập một cửa sổ trượt bộ nhớ (Sliding Window) gắn với địa chỉ IP.4 Khi một địa chỉ IP bắn quá 5 yêu cầu đăng nhập sai trong vòng 60 giây, bộ lọc sẽ thả rơi (drop) các yêu cầu tiếp theo. Điều này chặn đứng các cuộc tấn công âm lượng lớn (High-volume) trước khi chúng tiêu hao năng lực tính toán của lớp Dịch vụ.4  
2. **Khóa Vĩnh viễn Mục tiêu (Service Layer):** Nếu kẻ tấn công sử dụng mạng botnet phân tán (Distributed Attack) để dùng hàng ngàn IP khác nhau tấn công cùng một tài khoản nhằm lách luật Rate Limit, hệ thống kích hoạt rào chắn thứ hai.4 authService giám sát biến loginAttempts nằm bên trong cơ sở dữ liệu của người dùng. Ngay khi đạt 5 lần nhập sai, trường thời gian lockUntil được đẩy lên 60 giây về tương lai. Bất kể yêu cầu đăng nhập đến từ quốc gia hay địa chỉ IP nào, lớp dịch vụ cũng sẽ khóa sập cánh cửa cho tới khi hết hạn hình phạt, vô hiệu hóa mọi nỗ lực khai thác cơ sở dữ liệu.4

### **Khử trùng Dữ liệu với DTO (Data Transfer Object)**

Bảo mật hoàn hảo phải bao trùm cả chiều dữ liệu phản hồi (Outbound Data). Việc nhà phát triển bất cẩn gọi res.json(user) và vô tình gửi toàn bộ mô hình dữ liệu Mongoose cho trình duyệt là một trong những thảm họa rò rỉ thông tin lớn nhất trong công nghệ Node.js, cung cấp cho kẻ xâm nhập các băm mật khẩu nội bộ hoặc lịch sử nỗ lực đăng nhập.4  
Trong kiến trúc của hệ thống, điều này bị nghiêm cấm hoàn toàn.4 Mọi luồng dữ liệu bắt buộc phải đi qua các lớp **DTO (Đối tượng Truyền Dữ liệu)** hoạt động dưới dạng Nguyên tắc Khai báo Tích cực (Allowlist Principle).4 Lớp Controller sẽ gửi dữ liệu nhận được từ Service sang một DTO phản hồi (như PublicUserDTO hay GameSessionSummaryDTO). DTO này sẽ lọc bỏ, khử trùng và tạo ra một đối tượng hoàn toàn mới chỉ chứa các khóa công khai (username, avatarUrl, isPremium), cắt xén vĩnh viễn các thông tin bí mật như passwordHash, thông số nội bộ Mongoose (\_\_v), hay số dư thẻ tín dụng nhạy cảm (walletBalance) ngay cả khi đối tượng yêu cầu là Admin.4  
Bất kỳ lỗi ngoại lệ (Exceptions) hay phản hồi thành công nào cũng đều được niêm phong thông qua Mẫu Bao bì Phản hồi (Response Envelope Pattern \- thông qua responseHelper.js), duy trì một cấu trúc JSON nhất quán { success, data, message, error: { code, message } }, đảm bảo lớp Frontend luôn có các hợp đồng phân tích dễ dàng và các thông điệp lỗi bảo mật (không tiết lộ dấu vết Stack Trace).4 Cấu trúc kép giữa việc xác thực DTO Phân tích Cú pháp Cục bộ (Frontend) và Xác thực Bức tường Lửa (Backend Request DTOs) thỏa mãn triệt để các yêu cầu nghiêm ngặt nhất (Dual Validation).4

## **Quản lý Vòng đời Phát triển, Cộng tác và Đánh giá (SDLC & Rubric Alignment)**

Sự phức tạp kỹ thuật của hệ thống đòi hỏi một chiến lược tổ chức phát triển chuyên nghiệp, đồng thời phản ánh trực tiếp cấu trúc chấm điểm 40 điểm của khóa học.4

### **Quản trị Agile và Phân nhánh Code (Git Flow)**

Hệ thống quản lý công việc và cộng tác không tuân theo các quy trình tự do (Ad-hoc) mà áp dụng phương pháp luận Agile/SCRUM.4 Mọi hoạt động của nhóm đều được gắn trực tiếp với Bảng Quản lý Dự án GitHub (GitHub Project Board) có sự giám sát trực tiếp của giảng viên.4  
Để đạt mức điểm Tối đa (Excellent) ở tiêu chí "Team Contribution & Collaboration" (7 điểm) 4, các quy tắc nghiêm ngặt được thiết lập:

* Mỗi tác vụ (Task) phải được gắn cho một cá nhân chịu trách nhiệm, có thời hạn rõ ràng và được thiết lập Điểm Câu chuyện (Story Points) theo dãy Fibonacci. Việc đánh giá độ khó bằng số Giờ (Hours) được quy định là một hành động gây trừ điểm trực tiếp.4  
* Cấu trúc nhánh (Branching Strategy): Nhánh main được bảo vệ tuyệt đối; không ai được phép thao tác đẩy mã (commit) trực tiếp.4 Các nhà phát triển (Full-Stack Ownership) phải tạo các nhánh tính năng (feat/auth-jws) dựa trên ranh giới miền, sau đó khởi tạo Yêu cầu Hợp nhất (Pull Request) với sự phê duyệt chéo (Code Review) từ Trưởng nhóm Kỹ thuật (Tech Lead) trước khi mã nguồn được tích hợp vào hệ sinh thái chung.4

### 

### **Hướng dẫn Triển khai Chi tiết từng bước (Step-by-Step Sprint Plan)**

Để thực thi kiến trúc và quy trình trên, nhóm cần tuân thủ nghiêm ngặt lộ trình phát triển được chia thành 4 Sprint sau đây. Mỗi thành viên sẽ đảm nhận toàn bộ theo chiều dọc (cả Frontend và Backend) cho module mình được giao. 1  
**Sprint 1: Khởi tạo Nền tảng và Kiến trúc (Tuần 1-2)**  
*Mục tiêu: Xây dựng bộ khung hệ thống hoàn chỉnh, cấu hình định tuyến và cơ sở dữ liệu. Mã nguồn phải phản ánh rõ kiến trúc ngay từ ngày đầu.*

1. **Thiết lập GitHub Project:** Cấu hình bảng SCRUM với 9 cột. Tạo các thẻ Task đầu tiên, phân công cụ thể và gán Story Points (Fibonacci: 1, 2, 3, 5, 8). Thêm Giảng viên vào bảng để giám sát. 1  
2. **Khởi tạo Backend (MEN):**  
   * Tạo tệp gốc index.js làm điểm vào duy nhất của ứng dụng. Nếu node index.js không chạy, dự án sẽ bị đánh giá 0 điểm triển khai. 1  
   * Thiết lập 6 thư mục module: auth, profile, game, arena, subscription, admin. 1  
   * Bên trong mỗi module, tạo các tệp rỗng theo chuẩn N-Tier: \*Route.js, \*Controller.js, \*Service.js, \*Repository.js, \*Model.js và \*DTO.js. 1  
   * **Bắt buộc:** Tạo tệp \*Interface.js cho mỗi module. Mọi lệnh gọi chéo giữa các module phải đi qua tệp này (Ví dụ: game gọi authInterface.js). Tuyệt đối cấm import trực tiếp Service của module khác. 1  
   * Xây dựng bộ Response Envelope trong thư mục common/ (responseHelper.js) để chuẩn hóa định dạng trả về { success, data, message }. 1  
3. **Khởi tạo Frontend (React 18 \+ Vite):**  
   * Trong src/features/, thiết lập các thư mục tương ứng với backend. Mỗi tính năng phải có chính xác 5 tệp: View.jsx, useHook.js, Service.js, Model.js, Style.css. 1  
   * Cấu hình src/util/httpClient.js sử dụng Axios Interceptor để tự động gắn token JWT (Bearer) vào mọi luồng gọi API. 1  
4. **Cơ sở dữ liệu:** Thiết kế 4 schema Mongoose chính: users, gameSessions, gameRooms, subscriptions. Hoàn thành bản vẽ ERD. 1

**Sprint 2: Tính năng Cốt lõi và Chế độ Chơi Offline (Tuần 3-5)**  
*Mục tiêu: Hoàn thiện tính năng đăng nhập/đăng ký, quản lý hồ sơ và lõi game offline tích hợp AI.*

1. **Hệ thống Xác thực (Module auth):**  
   * Lập trình API Đăng ký. Yêu cầu frontend có dropdown chọn Quốc gia. 1  
   * Áp dụng bcrypt băm mật khẩu. Tuyệt đối không dùng mã hóa (encryption). 1  
   * Lập trình API Đăng nhập. Tích hợp express-rate-limit chặn IP và biến lockUntil chặn tài khoản sau 5 lần sai. 1  
   * Trả về JWT với payload tối ưu chứa: id, role, isPremium. 1  
2. **Quản lý Hồ sơ (Module profile):**  
   * Viết API cập nhật thông tin và Upload Avatar. Dùng multer nhận file và sharp cắt ảnh chính xác 200x200 pixel trước khi lưu. 1  
   * Xây dựng API Lịch sử đấu. Cấu hình Index Collation trong MongoDB để tìm kiếm tên không phân biệt hoa/thường (Case-insensitive pattern search). 1  
3. **Lõi Trò chơi & AI (Module game):**  
   * Code giao diện lưới 10x10 và 15x15. Tích hợp Ký hiệu Đại số (Cột A-O, Hàng 1-15) lên viền bàn cờ.  
   * Viết thuật toán thắng/thua cục bộ hướng tâm (Radial Search) ![][image7].  
   * Triển khai 3 cấp AI: Dễ (Đánh ngẫu nhiên quanh nước vừa đi), Trung bình (Chặn dòng 5, khóa hai đầu dòng 4, phá ngã ba), Khó (Tấn công lấy 5). 1  
   * Đảm bảo mọi nước đi được nối (append) vào mảng moves trong database. 1

**Sprint 3: Chơi Trực tuyến, Premium và Admin (Tuần 6-8)**  
*Mục tiêu: Đạt chuẩn Ultimo bằng việc xử lý luồng mạng thời gian thực, quản lý quyền hạn ABAC/RBAC.*

1. **Sảnh chờ & Mạng (Module arena):**  
   * Tích hợp Socket.IO ở backend. Viết các sự kiện createRoom, joinRoom, makeMove, gameOver. 1  
   * Xây dựng khung Chat thời gian thực.  
   * Cấu hình Giao diện Lạc quan (Optimistic UI) trên frontend (hiển thị cờ ngay khi click) và Server Reconciliation ở backend để xử lý trễ mạng.  
2. **Thanh toán & Replay (Module subscription & game):**  
   * Viết luồng trừ 10 USD trong ví nội bộ, đánh dấu isPremium \= true. Dùng nodemailer bắn email xác nhận. 1  
   * **Replay (Chỉ Premium):** Frontend gọi mảng moves, phát lại trận đấu bằng 4 nút: Pause, Resume, Forward, Backward. Bảo vệ API bằng premiumMiddleware. 1  
3. **Quản trị viên (Module admin):**  
   * Viết UI Responsive hiển thị danh sách người dùng. Bảo vệ API bằng roleMiddleware(ADMIN).  
   * Chức năng: Vô hiệu hóa người dùng (khiến họ không thể đăng nhập), xem danh sách phòng. 1  
   * **Force Close:** Khi Admin đóng phòng, server phải bắn sự kiện Socket để ngắt kết nối 2 client ngay lập tức. 1

**Sprint 4: Dữ liệu Vàng, Báo cáo và Triển khai (Tuần 9-10)**  
*Mục tiêu: Đóng gói sản phẩm, sẵn sàng cho buổi phỏng vấn và bảo vệ điểm số tuyệt đối.*

1. **Dữ liệu Vàng (Gold Dataset):**  
   * Viết script chạy một lần (seed script) để tự động bơm vào MongoDB: 1 tài khoản Admin, 1 tài khoản Player Premium (kèm ảnh avatar, có lịch sử mảng moves đầy đủ), 1 tài khoản Standard. 1  
2. **Triển khai Đám mây:**  
   * Đẩy mã Backend (Web Service) và Frontend (Static Site) lên **Render**. Cấu hình biến môi trường. 1  
   * Vào MongoDB Atlas, thêm địa chỉ IP 0.0.0.0/0 vào danh sách trắng để giảng viên truy cập được. Test ứng dụng trên mạng Wi-Fi khác để đảm bảo kết nối thành công. 1  
3. **Hoàn thiện Báo cáo:**  
   * Viết báo cáo tối đa 25 trang theo mẫu 2026A Report Template.docx. 1  
   * Vẽ 3 Sơ đồ Tuần tự (Sequence Diagrams) mô tả luồng xác thực JWT, luồng đánh cờ Socket.IO và luồng thanh toán Premium. 1  
   * Ghi nhận việc sử dụng AI (nếu có) trong phần Reference. Đóng gói file zip loại bỏ node\_modules. 1

### **Chuẩn bị Môi trường và Dữ liệu Vàng (Deployment & Gold Dataset)**

Đối với tiêu chí "Demo, Deployment, and Interview" (10 điểm) 4, ứng dụng không chỉ cần chạy được trên localhost. Hệ thống backend và frontend được tự động triển khai trên nền tảng đám mây **Render**, kết hợp cùng bộ lưu trữ cơ sở dữ liệu toàn cầu **MongoDB Atlas**.4 Atlas được cấu hình mở tường lửa (0.0.0.0/0) bảo đảm hệ thống của người chấm bài có thể thâm nhập mà không bị chặn IP.4  
Đáng chú ý, dự án tích hợp một tập lệnh tự động chèn Dữ liệu Vàng (Gold Dataset Seed Script). Thay vì giảng viên phải lãng phí thời gian lập tài khoản giả, cơ sở dữ liệu sẽ được bơm sẵn các tài khoản ở các trạng thái khác nhau: Một tài khoản Admin toàn quyền, một tài khoản Người chơi Tiêu chuẩn (Standard), và một tài khoản Trả phí (Premium) có chứa đầy đủ chuỗi mảng lịch sử moves được định dạng đại số, kèm avatar chuẩn hóa sẵn. Điều này cung cấp môi trường trình diễn (Demo) trơn tru, không có khoảng chết, thể hiện tính chuyên nghiệp tuyệt đối.4

### **Cấu trúc Báo cáo Học thuật Kỹ thuật (Report Generation)**

Tiêu chí "Report Structure" (8 điểm) yêu cầu một tài liệu học thuật không vượt quá 25 trang.4 Quá trình lập báo cáo không chỉ tóm tắt các tính năng mà đóng vai trò như một hồ sơ phân tích hệ thống (Architecture Overview).4  
Báo cáo phân rã từng kiến trúc thông qua Sơ đồ Vùng chứa (Container Diagram), Sơ đồ Cấu trúc Cây (Component Diagrams \- chứng minh sự phân lớp N-Tier của Backend và Feature-Driven của Frontend), Biểu đồ Thực thể Liên kết (ERD) chỉ tập trung vào các liên kết độc đáo thay vì lặp lại các tham số mặc định, và cung cấp ít nhất ba Sơ đồ Tuần tự (Sequence Diagrams) minh họa cách các luồng dữ liệu (như quá trình xác thực JWT hoặc quá trình đồng bộ hóa luồng sự kiện Socket.io O(1)) tương tác chéo với nhau.4 Từng thư viện NPM và công nghệ của bên thứ ba đều được chứng minh (Justified) sự hiện diện, gắn kết với việc thừa nhận sử dụng Trí tuệ Nhân tạo (AI Acknowledgment) nếu có trong quá trình hình thành ý tưởng, bảo vệ tính trung thực học thuật ở mức cao nhất.4

## **Kết luận**

Hệ thống TicTacToang, qua phân tích chi tiết, thể hiện một sự thông hiểu uyên thâm về các nguyên lý cốt lõi cấu thành nên một ứng dụng web cấp doanh nghiệp. Việc thiết lập nền tảng bằng kiến trúc **Modular Monolith** kết hợp **N-Tier** đã vạch ra những ranh giới bảo mật bất khả xâm phạm giữa các miền dữ liệu (thông qua Facade/Interface), cách ly sự phức tạp, giải quyết triệt để vấn đề rò rỉ mã nguồn và đảm bảo khả năng duy trì bảo trì mã (Maintainability) vượt trội.4  
Bằng cách tận dụng mô hình kết xuất không đồng bộ **Concurrent Rendering** của React 18 và nguyên tắc chia rẽ theo gói tính năng (Feature-Sliced Design), hệ thống xây dựng một lớp giao diện (UI) thông minh và đáp ứng nhanh.10 Khả năng tối ưu hóa đồng bộ mạng thời gian thực thông qua việc vô hiệu hóa thuật toán Nagle, truyền tải dữ liệu thay đổi cực tiểu (incremental deltas), kết hợp chặt chẽ với cơ chế Giao diện Lạc quan (Optimistic UI) và Điều hòa Máy chủ, đã đánh bại mọi giới hạn của độ trễ vật lý internet (Network Jitter).5  
Hơn thế nữa, một thuật toán kiểm tra chiến thắng ![][image1] dạng hướng tâm xuyên thủng thách thức hiệu năng của bàn cờ khổng lồ 15x15, trong khi lược đồ MongoDB với việc nhúng các dải dữ liệu một cách giới hạn (Bounded Array Pattern) và các bộ Chỉ mục Collation Không phân biệt Chữ hoa/Chữ thường (Case-Insensitive Index) giải quyết bài toán truy xuất dữ liệu lớn với tốc độ chớp nhoáng.65 Các cơ chế an ninh nhiều lớp, từ DTOs đóng vai trò vệ sĩ dữ liệu, phân quyền RBAC/ABAC qua JWT, đến hệ thống phòng ngự Brute-force đôi, đã cung cấp một mạng lưới rào cản vững chắc bảo vệ hệ thống trước các nguy cơ tấn công đương đại.4 Tổng hòa tất cả, bản thiết kế kiến trúc này là một hình mẫu chuẩn mực, định hình rõ ràng con đường vượt qua các yêu cầu khắt khe và vươn tới mức đánh giá xuất sắc nhất.

#### **Nguồn trích dẫn**

1. Real-Time Apps with Node.js and Socket.io Explained \- NareshIT, truy cập vào tháng 3 30, 2026, [https://nareshit.com/blogs/real-time-apps-nodejs-socketio-how-it-works](https://nareshit.com/blogs/real-time-apps-nodejs-socketio-how-it-works)  
2. WebSockets: The Secret to Seamless Real-Time Communication \- DEV Community, truy cập vào tháng 3 30, 2026, [https://dev.to/mukhilpadmanabhan/websockets-the-secret-to-seamless-real-time-communication-3joc](https://dev.to/mukhilpadmanabhan/websockets-the-secret-to-seamless-real-time-communication-3joc)  
3. Node.js for Real-Time Apps in 2025: Is It Still the Best?, truy cập vào tháng 3 30, 2026, [https://www.abbacustechnologies.com/node-js-for-real-time-apps-in-2025-is-it-still-the-best/](https://www.abbacustechnologies.com/node-js-for-real-time-apps-in-2025-is-it-still-the-best/)  
4. TicTacToang.pdf  
5. Mastering Multiplayer Game Engine Synchronization Techniques for Seamless Online Play \- Wayline, truy cập vào tháng 3 30, 2026, [https://www.wayline.io/blog/multiplayer-game-engine-synchronization-techniques](https://www.wayline.io/blog/multiplayer-game-engine-synchronization-techniques)  
6. Real-Time Multiplayer Socket.io | Claude Code Skill \- MCP Market, truy cập vào tháng 3 31, 2026, [https://mcpmarket.com/tools/skills/real-time-multiplayer-networking](https://mcpmarket.com/tools/skills/real-time-multiplayer-networking)  
7. Monolith vs Microservices: A Practical Guide with Examples in Node.js using TypeScript, truy cập vào tháng 3 30, 2026, [https://levelup.gitconnected.com/monolith-vs-microservices-a-practical-guide-with-examples-in-node-js-using-typescript-546c05eb3af6](https://levelup.gitconnected.com/monolith-vs-microservices-a-practical-guide-with-examples-in-node-js-using-typescript-546c05eb3af6)  
8. Monolith vs Microservices: Making the Right Architectural Choice in 2025 \- DEV Community, truy cập vào tháng 3 30, 2026, [https://dev.to/prateekbka/monolith-vs-microservices-making-the-right-architectural-choice-in-2025-4a27](https://dev.to/prateekbka/monolith-vs-microservices-making-the-right-architectural-choice-in-2025-4a27)  
9. Monolith vs Microservices: What Actually Matters (Lessons From Netflix, Amazon, Atlassian), truy cập vào tháng 3 30, 2026, [https://aws.plainenglish.io/monolith-vs-microservices-what-actually-matters-lessons-from-netflix-amazon-atlassian-7cdc19dff4e4](https://aws.plainenglish.io/monolith-vs-microservices-what-actually-matters-lessons-from-netflix-amazon-atlassian-7cdc19dff4e4)  
10. The 5 Frontend Architectures You Must Know in 2025 | Feature-Sliced Design, truy cập vào tháng 3 30, 2026, [https://feature-sliced.design/blog/frontend-architecture-guide](https://feature-sliced.design/blog/frontend-architecture-guide)  
11. Modular Monolith Architecture in Cloud Environments: A Systematic Literature Review, truy cập vào tháng 3 31, 2026, [https://www.mdpi.com/1999-5903/17/11/496](https://www.mdpi.com/1999-5903/17/11/496)  
12. Node.js project architecture best practices \- LogRocket Blog, truy cập vào tháng 3 31, 2026, [https://blog.logrocket.com/node-js-project-architecture-best-practices/](https://blog.logrocket.com/node-js-project-architecture-best-practices/)  
13. Building Modular Monoliths with Logical Boundaries Hexagonal Architecture and Internal Messaging \- SoftwareSeni, truy cập vào tháng 3 31, 2026, [https://www.softwareseni.com/building-modular-monoliths-with-logical-boundaries-hexagonal-architecture-and-internal-messaging/](https://www.softwareseni.com/building-modular-monoliths-with-logical-boundaries-hexagonal-architecture-and-internal-messaging/)  
14. What architecture do you recommend for modular monolithic backend? \- Reddit, truy cập vào tháng 3 30, 2026, [https://www.reddit.com/r/Backend/comments/1p0jgnm/what\_architecture\_do\_you\_recommend\_for\_modular/](https://www.reddit.com/r/Backend/comments/1p0jgnm/what_architecture_do_you_recommend_for_modular/)  
15. Monolith vs Modular Monolith vs Microservices — Understanding the Right Architecture Path (With Node.js Context) \- NonCoderSuccess, truy cập vào tháng 3 30, 2026, [https://noncodersuccess.medium.com/monolith-vs-modular-monolith-vs-microservices-understanding-the-right-architecture-path-with-03565e6a7b9f](https://noncodersuccess.medium.com/monolith-vs-modular-monolith-vs-microservices-understanding-the-right-architecture-path-with-03565e6a7b9f)  
16. Method Calls vs Event-Driven Architecture in a Modular Monolith API? \- Reddit, truy cập vào tháng 3 30, 2026, [https://www.reddit.com/r/softwarearchitecture/comments/1ckjtdx/method\_calls\_vs\_eventdriven\_architecture\_in\_a/](https://www.reddit.com/r/softwarearchitecture/comments/1ckjtdx/method_calls_vs_eventdriven_architecture_in_a/)  
17. A Guide to the Facade Design Pattern in TypeScript and Node.js with Practical Examples | by Robin Viktorsson | Medium, truy cập vào tháng 3 31, 2026, [https://medium.com/@robinviktorsson/a-guide-to-the-facade-design-pattern-in-typescript-and-node-js-with-practical-examples-b568a45b7dfa](https://medium.com/@robinviktorsson/a-guide-to-the-facade-design-pattern-in-typescript-and-node-js-with-practical-examples-b568a45b7dfa)  
18. Architectural patterns for modular monoliths that enable fast flow \- Microservices.io, truy cập vào tháng 3 31, 2026, [https://microservices.io/post/architecture/2024/09/09/modular-monolith-patterns-for-fast-flow.html](https://microservices.io/post/architecture/2024/09/09/modular-monolith-patterns-for-fast-flow.html)  
19. Comparing Monolith vs Event Driven Architecture: an Example \- Simple AWS, truy cập vào tháng 3 30, 2026, [https://newsletter.simpleaws.dev/p/monolith-vs-event-driven-architecture-comparison-example](https://newsletter.simpleaws.dev/p/monolith-vs-event-driven-architecture-comparison-example)  
20. asp.net mvc \- Difference between Repository and Service Layer? \- Stack Overflow, truy cập vào tháng 3 30, 2026, [https://stackoverflow.com/questions/5049363/difference-between-repository-and-service-layer](https://stackoverflow.com/questions/5049363/difference-between-repository-and-service-layer)  
21. The Repository Pattern. Build Scalable APIs: your guide to the… | by Muyiwa-dev | Medium, truy cập vào tháng 3 30, 2026, [https://medium.com/@muyiwa-dev/the-repository-pattern-ff87cde360ce](https://medium.com/@muyiwa-dev/the-repository-pattern-ff87cde360ce)  
22. Cross module communication in modular monolith \- Stack Overflow, truy cập vào tháng 3 31, 2026, [https://stackoverflow.com/questions/72537043/cross-module-communication-in-modular-monolith](https://stackoverflow.com/questions/72537043/cross-module-communication-in-modular-monolith)  
23. Facades, DTOs, and the Art of Not Letting Modules Boss Each Other Around \- Medium, truy cập vào tháng 3 31, 2026, [https://medium.com/@ldp42/facades-dtos-and-the-art-of-not-letting-modules-boss-each-other-around-427c5e5d83fe](https://medium.com/@ldp42/facades-dtos-and-the-art-of-not-letting-modules-boss-each-other-around-427c5e5d83fe)  
24. Build Scalable React with Feature-Based React Architecture \- adjoe, truy cập vào tháng 3 30, 2026, [https://adjoe.io/company/engineer-blog/moving-to-feature-based-react-architecture/](https://adjoe.io/company/engineer-blog/moving-to-feature-based-react-architecture/)  
25. React Architecture: A Complete Guide for Scalable Front-End Applications | by Rohit Kuwar, truy cập vào tháng 3 30, 2026, [https://medium.com/@rohitkuwar/react-architecture-a-complete-guide-for-scalable-front-end-applications-05e2ab8a79d7](https://medium.com/@rohitkuwar/react-architecture-a-complete-guide-for-scalable-front-end-applications-05e2ab8a79d7)  
26. Building Scalable Systems with React Architecture \- Feature-Sliced Design, truy cập vào tháng 3 31, 2026, [https://feature-sliced.design/blog/scalable-react-architecture](https://feature-sliced.design/blog/scalable-react-architecture)  
27. 3 Folder Structures in React I've Used — And Why Feature-Based Is My Favorite, truy cập vào tháng 3 30, 2026, [https://asrulkadir.medium.com/3-folder-structures-in-react-ive-used-and-why-feature-based-is-my-favorite-e1af7c8e91ec](https://asrulkadir.medium.com/3-folder-structures-in-react-ive-used-and-why-feature-based-is-my-favorite-e1af7c8e91ec)  
28. Feature-Driven Architecture: Designing Scalable Applications \- DEV Community, truy cập vào tháng 3 31, 2026, [https://dev.to/josephciullo/feature-driven-architecture-designing-scalable-applications-2ac6](https://dev.to/josephciullo/feature-driven-architecture-designing-scalable-applications-2ac6)  
29. The 2025 Guide to Building Scalable React Apps \- DEV Community, truy cập vào tháng 3 30, 2026, [https://dev.to/bhavendra/the-2025-guide-to-building-scalable-react-apps-b5l](https://dev.to/bhavendra/the-2025-guide-to-building-scalable-react-apps-b5l)  
30. “Feature-Driven Modular Architecture in React: Focusing on Scalability, Reusability, and Atomic Design Principles” | by muhammed shanoob A K | Medium, truy cập vào tháng 3 30, 2026, [https://medium.com/@muhmdshanoob/feature-driven-modular-architecture-in-react-focusing-on-scalability-reusability-and-atomic-76d9579ac60e](https://medium.com/@muhmdshanoob/feature-driven-modular-architecture-in-react-focusing-on-scalability-reusability-and-atomic-76d9579ac60e)  
31. React 18 Concurrent Rendering: What You Need to Know \- SDLC Corp, truy cập vào tháng 3 31, 2026, [https://sdlccorp.com/post/react-18-concurrent-rendering-what-you-need-to-know/](https://sdlccorp.com/post/react-18-concurrent-rendering-what-you-need-to-know/)  
32. React v18.0, truy cập vào tháng 3 31, 2026, [https://react.dev/blog/2022/03/29/react-v18](https://react.dev/blog/2022/03/29/react-v18)  
33. Performance Optimization with React 18 Concurrent Rendering \- Curiosum, truy cập vào tháng 3 31, 2026, [https://www.curiosum.com/blog/performance-optimization-with-react-18-concurrent-rendering](https://www.curiosum.com/blog/performance-optimization-with-react-18-concurrent-rendering)  
34. React 19 useOptimistic Hook Breakdown \- DEV Community, truy cập vào tháng 3 30, 2026, [https://dev.to/dthompsondev/react-19-useoptimistic-hook-breakdown-5g9k](https://dev.to/dthompsondev/react-19-useoptimistic-hook-breakdown-5g9k)  
35. Improve App Performance with Concurrent Rendering | Design and Develop Vega Apps, truy cập vào tháng 3 31, 2026, [https://developer.amazon.com/docs/vega/0.21/concurrent-rendering.html](https://developer.amazon.com/docs/vega/0.21/concurrent-rendering.html)  
36. React 18's Latest Features: How to Leverage Concurrency, Batching & More for High-Performance Apps \- DEV Community, truy cập vào tháng 3 31, 2026, [https://dev.to/melvinprince/react-18s-latest-features-how-to-leverage-concurrency-batching-more-for-high-performance-apps-482g](https://dev.to/melvinprince/react-18s-latest-features-how-to-leverage-concurrency-batching-more-for-high-performance-apps-482g)  
37. How to Choose Between Context API, Redux, and Zustand for Your React App \- OneUptime, truy cập vào tháng 3 30, 2026, [https://oneuptime.com/blog/post/2026-01-15-choose-react-state-management-context-redux-zustand/view](https://oneuptime.com/blog/post/2026-01-15-choose-react-state-management-context-redux-zustand/view)  
38. State Management Architectures in Modern React: An Exhaustive Comparative Analysis of Zustand, Redux Toolkit, and the Context API | by Noro Avetisyan | Medium, truy cập vào tháng 3 30, 2026, [https://medium.com/@noroavetisyan/state-management-architectures-in-modern-react-an-exhaustive-comparative-analysis-of-zustand-095823853adb](https://medium.com/@noroavetisyan/state-management-architectures-in-modern-react-an-exhaustive-comparative-analysis-of-zustand-095823853adb)  
39. State management in React: Context API vs. Zustand vs. Redux \- DEV Community, truy cập vào tháng 3 30, 2026, [https://dev.to/mspilari/state-management-in-react-context-api-vs-zustand-vs-redux-3ahk](https://dev.to/mspilari/state-management-in-react-context-api-vs-zustand-vs-redux-3ahk)  
40. is there ever a situation for using React Context over Zustand? : r/reactjs \- Reddit, truy cập vào tháng 3 30, 2026, [https://www.reddit.com/r/reactjs/comments/1ahe1he/now\_learning\_zustand\_is\_there\_ever\_a\_situation/](https://www.reddit.com/r/reactjs/comments/1ahe1he/now_learning_zustand_is_there_ever_a_situation/)  
41. I chose zustand over context api for my side project and my mentor is not happy about it. Am i doing the wrong here? : r/reactjs \- Reddit, truy cập vào tháng 3 30, 2026, [https://www.reddit.com/r/reactjs/comments/riq9v6/i\_chose\_zustand\_over\_context\_api\_for\_my\_side/](https://www.reddit.com/r/reactjs/comments/riq9v6/i_chose_zustand_over_context_api_for_my_side/)  
42. WebSocket architecture best practices: Designing scalable realtime systems \- Ably, truy cập vào tháng 3 30, 2026, [https://ably.com/topic/websocket-architecture-best-practices](https://ably.com/topic/websocket-architecture-best-practices)  
43. Simple Multiplayer Game with Socket.io Tutorial — Part One: Setup and Movement | by Jason Yang | Medium, truy cập vào tháng 3 30, 2026, [https://medium.com/@projectyang/simple-multiplayer-game-with-socket-io-tutorial-part-one-setup-and-movement-ee202024f0ef](https://medium.com/@projectyang/simple-multiplayer-game-with-socket-io-tutorial-part-one-setup-and-movement-ee202024f0ef)  
44. Socket.IO vs WebSocket Guide for Developers September 2025 \- Velt, truy cập vào tháng 3 31, 2026, [https://velt.dev/blog/socketio-vs-websocket-guide-developers](https://velt.dev/blog/socketio-vs-websocket-guide-developers)  
45. What is Socket.IO and when should you use it? \- Ably, truy cập vào tháng 3 31, 2026, [https://ably.com/topic/socketio](https://ably.com/topic/socketio)  
46. Compress Files with compress in Socket.IO | Compression Algorithms in Programming, truy cập vào tháng 3 30, 2026, [https://ssojet.com/compression/compress-files-with-compress-in-socketio](https://ssojet.com/compression/compress-files-with-compress-in-socketio)  
47. Game networking: JSON vs custom binary protocol over TLS/TCP \- Reddit, truy cập vào tháng 3 30, 2026, [https://www.reddit.com/r/gamedev/comments/a6mzdr/game\_networking\_json\_vs\_custom\_binary\_protocol/](https://www.reddit.com/r/gamedev/comments/a6mzdr/game_networking_json_vs_custom_binary_protocol/)  
48. Are there any general rule of thumbs for optimizing browser socket io games? \- Reddit, truy cập vào tháng 3 31, 2026, [https://www.reddit.com/r/gamedev/comments/osevgz/are\_there\_any\_general\_rule\_of\_thumbs\_for/](https://www.reddit.com/r/gamedev/comments/osevgz/are_there_any_general_rule_of_thumbs_for/)  
49. Performance tuning | Socket.IO, truy cập vào tháng 3 31, 2026, [https://socket.io/docs/v4/performance-tuning/](https://socket.io/docs/v4/performance-tuning/)  
50. Real-time State Sync with Socket.IO | by Endel Dreyer | Medium, truy cập vào tháng 3 31, 2026, [https://medium.com/@endel/full-stack-state-sync-with-socket-io-72ae50c7a989](https://medium.com/@endel/full-stack-state-sync-with-socket-io-72ae50c7a989)  
51. Real-time State Sync with Socket.IO: Beyond CRDTs \- DEV Community, truy cập vào tháng 3 30, 2026, [https://dev.to/endel/full-stack-state-sync-with-socketio-beyond-crdts-54mg](https://dev.to/endel/full-stack-state-sync-with-socketio-beyond-crdts-54mg)  
52. WebSockets in realtime gaming: Achieving low latency gameplay | Pusher blog, truy cập vào tháng 3 30, 2026, [https://pusher.com/blog/websockets-realtime-gaming-low-latency/](https://pusher.com/blog/websockets-realtime-gaming-low-latency/)  
53. How to make a multiplayer online game with Phaser, Socket.io and Node.js, truy cập vào tháng 3 31, 2026, [https://www.html5gamedevs.com/topic/29104-how-to-make-a-multiplayer-online-game-with-phaser-socketio-and-nodejs/](https://www.html5gamedevs.com/topic/29104-how-to-make-a-multiplayer-online-game-with-phaser-socketio-and-nodejs/)  
54. Game Mechanics \#1: Multiplayer Network Synchronization | by Can Bayar \- Medium, truy cập vào tháng 3 30, 2026, [https://canbayar91.medium.com/game-mechanics-1-multiplayer-network-synchronization-46cbe21be16a](https://canbayar91.medium.com/game-mechanics-1-multiplayer-network-synchronization-46cbe21be16a)  
55. Timing for multiplayer games in Node.js \- socket.io \- Stack Overflow, truy cập vào tháng 3 31, 2026, [https://stackoverflow.com/questions/62001671/timing-for-multiplayer-games-in-node-js](https://stackoverflow.com/questions/62001671/timing-for-multiplayer-games-in-node-js)  
56. Tricks and patterns to deal with latency | Netcode for GameObjects | 2.7.0 \- Unity \- Manual, truy cập vào tháng 3 30, 2026, [https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.7/manual/learn/dealing-with-latency.html](https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@2.7/manual/learn/dealing-with-latency.html)  
57. How to Use the Optimistic UI Pattern with the useOptimistic() Hook in React \- freeCodeCamp, truy cập vào tháng 3 30, 2026, [https://www.freecodecamp.org/news/how-to-use-the-optimistic-ui-pattern-with-the-useoptimistic-hook-in-react/](https://www.freecodecamp.org/news/how-to-use-the-optimistic-ui-pattern-with-the-useoptimistic-hook-in-react/)  
58. Node.js \+ Socket.IO for web-based Multiplayer? : r/gamedev \- Reddit, truy cập vào tháng 3 31, 2026, [https://www.reddit.com/r/gamedev/comments/1l7feha/nodejs\_socketio\_for\_webbased\_multiplayer/](https://www.reddit.com/r/gamedev/comments/1l7feha/nodejs_socketio_for_webbased_multiplayer/)  
59. WebSocket Performance in Node: Handling Real-Time at Massive Scale | by Bhagya Rana, truy cập vào tháng 3 30, 2026, [https://medium.com/@bhagyarana80/websocket-performance-in-node-handling-real-time-at-massive-scale-ce5022c1c817](https://medium.com/@bhagyarana80/websocket-performance-in-node-handling-real-time-at-massive-scale-ce5022c1c817)  
60. Feature-Sliced Design is the best architecture. Prove me wrong\! \- Medium, truy cập vào tháng 3 31, 2026, [https://medium.com/@vadymchernykh/feature-sliced-design-is-the-best-architecture-prove-me-wrong-50fd83a39a0d](https://medium.com/@vadymchernykh/feature-sliced-design-is-the-best-architecture-prove-me-wrong-50fd83a39a0d)  
61. What it really takes to scale Socket.IO in production \- Ably, truy cập vào tháng 3 31, 2026, [https://ably.com/topic/scaling-socketio](https://ably.com/topic/scaling-socketio)  
62. Using multiple nodes | Socket.IO, truy cập vào tháng 3 31, 2026, [https://socket.io/docs/v4/using-multiple-nodes/](https://socket.io/docs/v4/using-multiple-nodes/)  
63. Building a Multiplayer Board Game with JavaScript and WebSockets \- DEV Community, truy cập vào tháng 3 31, 2026, [https://dev.to/krishanvijay/building-a-multiplayer-board-game-with-javascript-and-websockets-4fae](https://dev.to/krishanvijay/building-a-multiplayer-board-game-with-javascript-and-websockets-4fae)  
64. Check Tic Tac Toe Winner at O(1) Time Complexity | by Shray \- Medium, truy cập vào tháng 3 31, 2026, [https://medium.com/@shray.7/check-tic-tac-toe-winner-at-o-1-time-complexity-a86e644aae13](https://medium.com/@shray.7/check-tic-tac-toe-winner-at-o-1-time-complexity-a86e644aae13)  
65. Algorithm for Determining Tic Tac Toe Game Over \- Stack Overflow, truy cập vào tháng 3 31, 2026, [https://stackoverflow.com/questions/1056316/algorithm-for-determining-tic-tac-toe-game-over](https://stackoverflow.com/questions/1056316/algorithm-for-determining-tic-tac-toe-game-over)  
66. gomoku diagonal winning condition \- Stack Overflow, truy cập vào tháng 3 30, 2026, [https://stackoverflow.com/questions/47754747/gomoku-diagonal-winning-condition](https://stackoverflow.com/questions/47754747/gomoku-diagonal-winning-condition)  
67. What's the easiest way to make an AI that can learn to play a 15x15 tic-tac-toe game?, truy cập vào tháng 3 31, 2026, [https://www.quora.com/Whats-the-easiest-way-to-make-an-AI-that-can-learn-to-play-a-15x15-tic-tac-toe-game](https://www.quora.com/Whats-the-easiest-way-to-make-an-AI-that-can-learn-to-play-a-15x15-tic-tac-toe-game)  
68. GitHub \- Lance117/gomoku: 5 in-a-row Tic-Tac-Toe variant, AI player, truy cập vào tháng 3 30, 2026, [https://github.com/Lance117/gomoku](https://github.com/Lance117/gomoku)  
69. 6 Rules Of Thumb For MongoDB Schema Design, truy cập vào tháng 3 31, 2026, [https://www.mongodb.com/company/blog/mongodb/6-rules-of-thumb-for-mongodb-schema-design](https://www.mongodb.com/company/blog/mongodb/6-rules-of-thumb-for-mongodb-schema-design)  
70. How to Design MongoDB Schemas for Performance \- OneUptime, truy cập vào tháng 3 31, 2026, [https://oneuptime.com/blog/post/2026-01-26-mongodb-schema-performance/view](https://oneuptime.com/blog/post/2026-01-26-mongodb-schema-performance/view)  
71. 5 Best Practices For Improving MongoDB Performance, truy cập vào tháng 3 31, 2026, [https://www.mongodb.com/resources/products/capabilities/performance-best-practices](https://www.mongodb.com/resources/products/capabilities/performance-best-practices)  
72. MongoDB Schema Design: Do's and Don'ts for Real Projects \- DEV Community, truy cập vào tháng 3 30, 2026, [https://dev.to/mongodb/mongodb-schema-design-dos-and-donts-for-real-projects-1cg6](https://dev.to/mongodb/mongodb-schema-design-dos-and-donts-for-real-projects-1cg6)  
73. Streamline Global Gaming Management \- Atlas Architecture Center \- MongoDB Docs, truy cập vào tháng 3 30, 2026, [https://www.mongodb.com/docs/atlas/architecture/current/solutions-library/streamline-gaming-management/](https://www.mongodb.com/docs/atlas/architecture/current/solutions-library/streamline-gaming-management/)  
74. Optimizing Query Performance and Indexing Strategies for Large Datasets in MongoDB | by firman brilian | Medium, truy cập vào tháng 3 31, 2026, [https://medium.com/@firmanbrilian/optimizing-query-performance-and-indexing-strategies-for-large-datasets-in-mongodb-b4ef4df012ef](https://medium.com/@firmanbrilian/optimizing-query-performance-and-indexing-strategies-for-large-datasets-in-mongodb-b4ef4df012ef)  
75. Performance Best Practices: Indexing \- MongoDB, truy cập vào tháng 3 31, 2026, [https://www.mongodb.com/company/blog/performance-best-practices-indexing](https://www.mongodb.com/company/blog/performance-best-practices-indexing)  
76. Indexing Strategies \- Database Manual \- MongoDB Docs, truy cập vào tháng 3 30, 2026, [https://www.mongodb.com/docs/manual/applications/indexes/](https://www.mongodb.com/docs/manual/applications/indexes/)  
77. MongoDB Query with Case Insensitive Search \- GeeksforGeeks, truy cập vào tháng 3 30, 2026, [https://www.geeksforgeeks.org/mongodb/mongodb-query-with-case-insensitive-search/](https://www.geeksforgeeks.org/mongodb/mongodb-query-with-case-insensitive-search/)  
78. Case-Insensitive Indexes \- Database Manual \- MongoDB Docs, truy cập vào tháng 3 31, 2026, [https://www.mongodb.com/docs/manual/core/index-case-insensitive/](https://www.mongodb.com/docs/manual/core/index-case-insensitive/)  
79. MongoDB, performance of query by regular expression on indexed fields \- Stack Overflow, truy cập vào tháng 3 31, 2026, [https://stackoverflow.com/questions/17501798/mongodb-performance-of-query-by-regular-expression-on-indexed-fields](https://stackoverflow.com/questions/17501798/mongodb-performance-of-query-by-regular-expression-on-indexed-fields)  
80. Case-insensitive with Mongoose \- node.js \- Stack Overflow, truy cập vào tháng 3 30, 2026, [https://stackoverflow.com/questions/72565724/case-insensitive-with-mongoose](https://stackoverflow.com/questions/72565724/case-insensitive-with-mongoose)  
81. How to Do Case-Insensitive Queries in MongoDB \- OneUptime, truy cập vào tháng 3 31, 2026, [https://oneuptime.com/blog/post/2025-12-15-mongodb-case-insensitive-queries/view](https://oneuptime.com/blog/post/2025-12-15-mongodb-case-insensitive-queries/view)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAXCAYAAACWEGYrAAAB3ElEQVR4Xu2WzSulYRjGbxNGGSFEI3VKmA1ly5KslZSVRtlrtlKSvf8B8Q/MTtmJjZ2NhZmN5KPIR8zEYO6r936cx+X9eA6HTM2vrnrO7769730eT+d9Rf7zvmlnkcEXFqH0a+ptXaKZ00xq6h464rlnEcCmppNlFseaeVufa+4kurnLN6sxh5oGlkap5pqlB65byTKOGoma3bfCeiBflnFzcbs1qjliqWzL4y+YBO5zyTIOXGTQ1j81W17N4Xa1kTxcEzkf/EfShgSoN7P0OdCc2rpLoj/AWWRwDFAb9txnc2mEDImzucbSkZPoAtX2+bum5aH6GJxH9PZ4bkHSzxsIGXJEUnrOJKVIrMjT3lvNEjkmZEiQ2INCYpFwZ9IHn2fJMUUZEjcPAb3TMW6MHFPIkBUsQehOTkl8H9xXlkQhQ1axBCFDlknU455CPvAzLIlChozlh0TFHS4YbsBeLhioLbIkXjzkB8nv5i9Nh/mPmmXzn8zFgZ7fLIkrSRnAGJKMnnLNjeSHdenzmxLISfLFLzT7ml3LnuZE0+o3GeuaDZbFBEPWsiwQXANH69WYkGinngvOe9ZTqyj8kYSfjwDw1MLr3JuQdDbTWNV0s3xN8ObUxjID/2Xl3+Qv6KOEzdR0748AAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAYCAYAAABurXSEAAACG0lEQVR4Xu2WvUsdQRTFrx+IgoJWWphCtLIRrMRCiBAJYhE7wUKCCILYKIiFaCshECwthICNkC4QRCv/AQVFURCENCqIguK3hd7jzuB95+289zaEt40/OLw7587Ozs67M7si76RLDxtFJvH9R1XTbBaZCtUlmyE+qI7ZTIl+1SabcTyrKtlMEcynnk1Lp+qBzZQZVt2xaXmS9Gs5Dqx2ECSr2DQsqEZMe141Y9qF0qf6qSonv0aiDchgXr1sAlwQeiLU1I6Lx1WP8tYXG+W7iwthTjXkfvl+aC+RB3C/NTbBR8kexGP9atduU3W4eMDk83Hifo8kc9xS1241nudA9ZdN8FXCk2438ZRk9kty0pSomlyMMRZNbsJ5caxKIIe/LDZBXElh/XLRJdEYZcbDiyQ07h8J5PxfnQ/0WWYzIduSfS+0f5Pn2VddsAnqJHsgUCuR3yxv9Wzrbs/EACWQ70TBGL62AVYcni1Dy71qnU0PLuQjB3UHH0fhlot9XWIzrrjYcy5RH9R+iF3JXCB/TQjkvrDpQXKSPKwcfOiTRCvu27OmnwcPgknE7nbDmURjYBVvXRwiV+51da7Z/Eew40O0UBuTGiPPg+PUllIsGIDfVEnB8dnIpgPfNnbl8HLKtZLINbDJfFYdspmQUzYMmES3i3+obkyOwQtvg80Q3yTzG+N/g9Pll0THbAi8IXM9UCxDbBSZQTbeSYMXpiB48dcUii4AAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAYCAYAAACvKj4oAAACr0lEQVR4Xu2XS8hOQRjHH8oldx8iUV/JpeTb2IhSIkkWLJRSfG5bl/QpUpJiQXa2ChFbklhhz4Zi4ZIkt9zvd8/fzPOe5/zfOd7jvZG+X/1r5v/MPDNn3jlz5hXp5Z9gteqH6r1qEsX+ClPYaIC5qgmxPEDCg/bLwrLQlf+IBarRsdxHdVC1QzWq0iINJtBMDks+J8oHXL2/6pWrl+KZ6kgsv1Z9l5DYtCXGmMeqMWxGnqq+SZaDuST5MR7mwxUQW0LeMtUV8pKMkJBgRqyj7LfA+uilJrhK9YRNYrPqsoT+2ylmfGXDsUH1ks0Ico5lk0GjpbF8R3XNxQz7NTkZvHHkMdgZoGiRsLD72YwMUT1g07FO9YFNzyPJVqdLwgTw7jHYuogtd9746NXC2lyP5ekuBk6qhpFnXHXlba7sKZxDp4Tg8Fg/o5pYiebB+4e2s513VPXZ1VNgsZAXDJaQ400W/kXRBHGIdKvWqnpUc3LRDPRfzCZAgqLkzAWpbovD4zh5zEbVTFe3re53yRdXNk5LtqVNRWCRz7MJanX02MQ8qO8hj7H3z1gkoZ/9qtNUe7NwXdxU3WMTYCBMvAxouyvhrSGP4UUBfmFPSdi6jXBO0uOU/gV3SrodvG42HX1VZ9lUDknoa5+fRsEYyTxlHhDXI7Sx240H/m42HVtVs9iM2NifOFAHN1TP2QS3JQxyiwMRe7jfnV7H2HTgNlTEXam9QGX5KOEQrAJbyFYSH8up0cfl9kT08aEtAm2QPAXutOg/iAORDgnxgRyoA+Sxi0oVuLTimLYHNc33jQrolNCWeat6IWHboLwvH66AWDNIzaFpIPlINtvICim+oDeFTar7bLYRLHCtu3DD4J/AUDbbwDzVRTZbRUvfgwQ4IN+x2Upwt5zMZgtZyUYv/xM/ATWWsd50EyciAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAYCAYAAABnRtT+AAABtklEQVR4Xu2WzStEURjGX0KEsPWxtxF2YiEbsVMs7CZKsVZS2Euy4Q/wL1gpJYrMxs4KpSzIhijyHe/TOXfcee65171Tc2czv3qaOb/nnPs1d+6MSJniMswiBTpZRDGrWWSZAqeaLpYuOjS3LFPkR1PPksGkWpYpgtvshaWffs07yxKAC9XG0uNTSnMvMrg3j1l64AzqWCo9mg1NtR1Pa1b/6sQ0aTY165pm6sCkmGMJ0CjuokZzpJkQ079qWsUcqGv+f9xorjSVdhy2DacfEndxYF/nxPTtdoz3F/Z9XN40T77xubj3CZx+StzFin3F2fv7pE+AJTHrq8hX0NgDcwP7yNgiDHSHLBOA9VHbZzAXt2AefbYIA90gywRgPT6NuDiPpUVCCon4tvnAx7bM0gfWb7NUGlhYQveHAt9m5kwiFlnuxcxZ4MKyJ8FtjGoeyYFxCc7NgWKepfKl2WJJdIs50GsufOyI2QfyoBnLr3OcaLIsPXAVnlkmZJdFAeAkvB8OJ5jAj4m44DHmPUcLZUDzwZIZ0VyyjMkdiwL4lpgXaU0zwzIF9jW9LKPIsEgB/FUsU1R+ASHDW0rYq6/KAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAAAXCAYAAACPm4iNAAACpElEQVR4Xu2YS8hNURTHF3lFHwPJhO4MX5ESAyUpIxkxw4CQTAxkICYyoYwMlDzzSCKvFIpQRMojz4FCJK8SKY9IWH9r7WuddfY5995Tzv0G+1f/7ln/vb9vrbO+ffbZ9yNKJBKJRF+jwfrtzRoYxLpCkvu8G+sGR0lq+c5a68YsPaynJHPvuLEomFh3g6eQ5Byh8TSNuwVyD3fxDxMHlpCMDdR4A+tTczQCVs4Xqv/mkO9exHvgvDqYSZL7ovE+qjfeeKPUG2K80sU5hnWK9Z5KJjlWecMx1RsRQqE7nX9b/boZQJJ3i/G+qudXta9vqIszhMmdNHg167A3lXmsy96MsJgk31bnX1K/LxBrJuLwhE0n2YsLOc4aq9edNBisY5103nzWVecV0aD4Cn6h/kjn1wlW80PWL1Y/4/eS1HaIZGsbxtqmXg7cAFZLoNMGg/Uk2wtAc6+ZsXZAvvsRD8ILr4yDJdrP2sfay9rD2sUa/PenWrOQtZ31jnXajS2g+KrGH+Kb83KTqjQYoMnXWTf8QBvMJsmJoxrAsQiPH7z+YVIXeUtSS1jFczV+3Zwh5La1HawJ1qDqDV7Gesw66wfaZDTJKeYRaxLrGVWr43+whqSWNxo3NMZTYsFKzzx150j2Squw9HG9O0xsAZqL+WAl5R+pKqAGPHKtwNu+E9mTQIwDrJ/Om0H/+hLA9RETgzPqj3N+Bv+LWrGU8i80NDnsye0Qy4kYJ5G6CbXMMt5y9V4ZD/ETE4O76pcSu9kiFrEueFNZwTrmzQKQD2fNwC3WBxPXCU5E+Mpu+UxSo31BTlTPgnij85rgezQ285cqXN/MzMizyRuOOd4oYDJJcciLT3+DdXOCpI7n+omTQez0gS9aGA//i9icHU4kEolEIpGowh+FkMZA/xoaMwAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAXCAYAAADz/ZRUAAABcUlEQVR4Xu2VzStFQRjGXxRJJFul/AOUtZ2dlbKxkq+Fm+zYyE5ZWfjIQrZKKWykJGWJ7G2wYkcKCxsfz9PM8Jy558aNc0udX/26M897zplmzsw9Zv+EVvgC3+FoVNv2+SWskfwNbsIpeAXrpVYWK9LmQAXfPpJ8xNcCbNNj2CB5WbRZ8qEH0ufvidTYb5T2j+iE9/b1sOZkOcETPI9DUG3FM5+Gp+YmkMo4XJb+hrkbuyQL1FnpGV3DNenrda+wXfqfhHfzXUaYVcUhGISLcSjswts4JDdWPFDa4A/S5s4O8JVx9UitudVpsuT93PWP0i/JjLkbeyW7gMPeCXjo8xa4A4fgGNz3OVdnzrfJMxyQfip95gZekozvPqxEcNLX4lxnOwvPzO2FeclTWYBb5jZHT1SrGPw34wz24kKliJcwM7jM61EWBu+O8j+l39JnGTL9UGQCB+HZDHT4LBybTOFZ5eeP3pkbeDVxRU5Ozi/4ADhIYf38pimzAAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAXCAYAAACWEGYrAAAB3ElEQVR4Xu2WzSulYRjGbxNGGSFEI3VKmA1ly5KslZSVRtlrtlKSvf8B8Q/MTtmJjZ2NhZmN5KPIR8zEYO6r936cx+X9eA6HTM2vrnrO7769730eT+d9Rf7zvmlnkcEXFqH0a+ptXaKZ00xq6h464rlnEcCmppNlFseaeVufa+4kurnLN6sxh5oGlkap5pqlB65byTKOGoma3bfCeiBflnFzcbs1qjliqWzL4y+YBO5zyTIOXGTQ1j81W17N4Xa1kTxcEzkf/EfShgSoN7P0OdCc2rpLoj/AWWRwDFAb9txnc2mEDImzucbSkZPoAtX2+bum5aH6GJxH9PZ4bkHSzxsIGXJEUnrOJKVIrMjT3lvNEjkmZEiQ2INCYpFwZ9IHn2fJMUUZEjcPAb3TMW6MHFPIkBUsQehOTkl8H9xXlkQhQ1axBCFDlknU455CPvAzLIlChozlh0TFHS4YbsBeLhioLbIkXjzkB8nv5i9Nh/mPmmXzn8zFgZ7fLIkrSRnAGJKMnnLNjeSHdenzmxLISfLFLzT7ml3LnuZE0+o3GeuaDZbFBEPWsiwQXANH69WYkGinngvOe9ZTqyj8kYSfjwDw1MLr3JuQdDbTWNV0s3xN8ObUxjID/2Xl3+Qv6KOEzdR0748AAAAASUVORK5CYII=>