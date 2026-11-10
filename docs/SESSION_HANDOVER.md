# Session Handover - Werewolf Moderator Web App

## 1. Tổng Quan Tiến Độ & Tính Năng Đã Triển Khai
- **Sắp Xếp Lại Thứ Tự Gọi Đêm Chuẩn Xác Theo Diễn Biến Thực Tế ([NightPhaseView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/NightPhaseView.jsx))**:
  - **Thứ tự chuẩn**: Bảo Vệ (4) ➔ Bầy Ma Sói & Sói Nguyền săn mồi/lây nhiễm (5) ➔ **Tiên Tri (6)** ➔ **Phù Thủy (7)**.
  - Sói nguyền và bầy Sói hành động trước giúp Quản trò biết rõ nạn nhân đã bị cắn hay biến đổi thành Sói hay chưa trước khi Tiên Tri thức dậy soi, đảm bảo ra dấu chuẩn xác 100%!

- **Tối Giản Hóa Hoàn Toàn Chức Năng Tiên Tri Soi**:
  - **Không lưu state phức tạp hay bắt buộc submit**: Loại bỏ validation bắt buộc chọn người.
  - **Chạm vào ai thì lật ngay Thẻ Bài của người đó**:
    - Khi Tiên Tri chỉ tay vào người chơi nào, Quản trò chỉ cần chạm vào ghế của người đó trên màn hình.
    - Ứng dụng lập tức hiển thị **Thẻ Bài Tarot to rõ** của người đó (`role.image`), Tên vai trò, Phe, và dòng hướng dẫn ra dấu cụ thể: `👉 RA DẤU CHO TIÊN TRI: LÀ MA SÓI! 🐺` hoặc `👉 RA DẤU: LÀ DÂN LÀNG! 👨‍🌾`.
    - Quản trò ra dấu xong có thể bấm tiếp tục bất kỳ lúc nào mà không bị chặn lại.

- **Ma Trận Ghế Ngồi Rạp Chiếu Phim (Theatre Seat Matrix) & Custom Slider ([PlayerSeatPicker.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/PlayerSeatPicker.jsx) & [PlayersGridView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/PlayersGridView.jsx))**:
  - **Tab Sơ Đồ Bàn Chơi**:
    - Chuyển đổi toàn bộ danh sách 14 người chơi thành **Ma Trận Ghế Ngồi Rạp Hát (Theatre Seat Matrix)** phía dưới vòm sân khấu làng.
    - Toàn bộ 14 ghế hiển thị trọn vẹn trong một khung nhìn duy nhất, có số ghế nổi bật `#1`, `#2`..., màu sắc ghế theo phe (Sói đỏ, Dân tím, Chết tối), chạm trực tiếp vào ghế để đổi vai trò.
  - **Custom Slider & Ma Trận Chọn Ghế Đêm (Cupid, Bảo Vệ, Tiên Tri...)**:
    - Tích hợp bộ chọn `PlayerSeatPicker` có cả chế độ Ma trận ghế (1 màn hình) và Thanh trượt Slider (Horizontal Carousel với nút `Trang trước` / `Trang sau` và dots phân trang), Quản trò không bao giờ phải cuộn dọc liên tục nữa.

- **Hero Card Trung Tâm (Card Centered & Name Underneath)**:
  - Lá bài Tarot to (`w-28 h-40` đến `w-40 h-56`) được đặt làm trọng tâm ở chính giữa màn hình (`center`), tên vai trò nằm ngay bên dưới lá bài, loại bỏ hoàn toàn các instruction dài dòng gây choán chỗ.

- **Strict Rule Chặn Người Đã Có Vai Trò & Giới Hạn Sói Theo Bộ Bài ([RoleClaimBox.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/RoleClaimBox.jsx), [NightPhaseView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/NightPhaseView.jsx))**:
  - **Khóa nghiêm ngặt (Disabled)** người chơi đã có vai trò khác (như Cupid, Bảo Vệ, Tiên Tri, Dân Làng...): Nút bấm và thẻ bị vô hiệu hóa (`opacity-40 cursor-not-allowed`), hiển thị nhãn `🔒 Đã có vai: [Tên vai]`.
  - **Bán Sói (Nửa Người Nửa Sói)**: Ban đầu thuộc phe Dân Làng, chỉ khi bị Sói cắn mới thức tỉnh thành Sói, tuyệt đối không cho phép gán tay vào bầy Sói ở bước nhận diện danh tính ban đầu.
  - **Giới hạn số Sói tối đa (`maxWolves`)**: Tự động tính toán từ cấu hình bộ bài (`deckRoleIds`). Khi đã chọn đủ `maxWolves`, toàn bộ các người chơi còn lại tự động khóa để chống gán dư người.
  - **Thanh Header Live Stats**: Chuẩn hóa hiển thị `🐺 {aliveWolves}/{totalWolvesInDeck} Sói` (ví dụ `0/2 Sói` thay vì `0/14 Sói` gây hiểu nhầm).

- **Chặn Hoàn Toàn Việc Bỏ Qua Bước Gọi Sói (Strict Block Skip)**:
  - Khi ở bước gọi Ma Sói, nếu chưa gán đủ số lượng Sói theo bộ bài (`currentWolves < maxWolves`), hệ thống **TUYỆT ĐỐI KHÔNG CHO SKIP / BỎ QUA**:
    - Nút "Bỏ qua vai" bị ẩn hoàn toàn trong bước Sói.
    - Chặn nút ghi đè ("Bỏ qua bắt buộc").
    - Chặn khi Quản trò click vào các bước sau trên thanh Stepper Breadcrumb (hiển thị popup Cảnh báo bắt buộc gán đủ Sói).

- **Tính Năng Sói Nguyền (Người Cha Của Sói / Cursed Wolf) Lây Nhiễm ([gameLogic.js](file:///home/levi/Desktop/Projects/werewolf/src/utils/gameLogic.js), [NightPhaseView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/NightPhaseView.jsx))**:
  - Thêm hộp điều khiển quyền năng Sói Nguyền: Cho phép kích hoạt 1 lần trong ván khi bầy Sói chọn cắn nạn nhân.
  - **Nạn nhân được bảo toàn mạng sống** (không bị giết chết vào sáng hôm sau).
  - **Lưu giữ đồng thời CẢ 2 VAI TRÒ**:
    - Vai trò gốc trước khi bị nguyền: `p.originalRole` & `p.originalRoleId`.
    - Vai trò mới: `p.role = Ma Sói (Bị Nguyền)` với `p.isCursedWolf = true`.
  - Hiển thị đầy đủ cả 2 vai trò trên: Thẻ người chơi, Sơ đồ Ma trận bàn chơi rạp hát, Màn hình Ban ngày, và kết quả soi của Tiên Tri.

- **Tối Ưu & Sửa Lỗi Giao Diện RoleHolderBanner (Mobile 1-Row Responsive)**:
  - Khắc phục triệt để lỗi bể layout trên mobile ở banner người giữ vai ([RoleHolderBanner.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/RoleHolderBanner.jsx)):
    - Chuyển từ khối dọc 3 dòng cồng kềnh thành **1 dòng ngang duy nhất (`1-Row Responsive Bar`)**.
    - Loại bỏ tiêu đề chữ hoa dài dòng gây rớt dòng (`1/1 \n NGƯỜI`), thay bằng chip gọn gàng: `👤 Giữ vai: Thanh Mai (#8) ● Sống [1/1]`.
    - Đưa nút `[🔄 Đổi vai ▾]` sang cùng hàng bên phải, cân đối và thẩm mỹ.
    - Xóa bỏ dòng hiển thị trùng lặp tên người giữ vai trong phần Card Header ở [NightPhaseView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/NightPhaseView.jsx).

## 2. Kiểm Thử Hệ Thống
- `npm run build`: Thành công 100% không lỗi (`built in 515ms`).
