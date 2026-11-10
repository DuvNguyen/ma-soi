# Session Handover - Werewolf Moderator Web App

## 1. Tổng Quan Tiến Độ & Tính Năng Đã Triển Khai
- **Sửa Lỗi Đồng Bộ Số Lượng Người Chơi Khi Nạp Nhóm Roster ([App.jsx](file:///home/levi/Desktop/Projects/werewolf/src/App.jsx))**:
  - **Khắc Phục Hiện Tượng Dư Người Chơi Cũ (Lỗi "Thu Hà thứ 14")**: Trước đây `handleApplyRoster` dùng `Math.max(prev.length, names.length)`, khiến cho khi nạp nhóm 13 người vào bàn có sẵn 14 người thì người thứ 14 ("Thu Hà") không bị loại bỏ.
  - **Chuẩn Hóa Số Lượng Ghế Bàn Chơi**: Cập nhật hàm `handleApplyRoster` để số lượng ghế bàn chơi `players` khớp chính xác 100% với số lượng thành viên trong nhóm nạp vào (`targetCount = names.length`).
  - **Tự Động Cân Bằng Bộ Bài (`deckRoleIds`) & Làm Sạch Target Đêm**: Tự động tăng/giảm số lượng thẻ `dan-lang` tương ứng khi nạp nhóm người chơi mới để số thẻ bài luôn khớp với số người chơi, đồng thời lọc sạch các mục tiêu đêm (Sói cắn, Bảo vệ, Tiên tri soi, Cupid) vượt quá giới hạn ghế mới.

- **Tái Thiết Kế Thư Viện Thẻ Bài RPG Chuyên Nghiệp & Responsive Hoàn Hảo ([RoleLibraryModal.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/RoleLibraryModal.jsx))**:
  - **Khắc Phục 100% Lỗi Chồng Chéo (Broken Layout) Trên Mobile**: Xóa bỏ lỗi 2 khung danh sách và chi tiết bị đè lên nhau che khuất thông tin. Thay vào đó triển khai mô hình Master-Detail chuyển đổi trạng thái mượt mà chuẩn game RPG item codex.
  - **Tủ Thẻ Bài RPG (Inventory Grid)**: Hiển thị lưới thẻ bài 3 cột trên mobile với ảnh bài Tarot, thứ tự gọi đêm (`#4`), huy hiệu phe (`[V]`, `[W]`, `[3]`), tên vai trò, viền dạ quang theo từng phe. Có nút chuyển đổi linh hoạt giữa Dạng Lưới RPG (`Grid`) và Danh Sách Thu Gọn (`List`).
  - **Khung Soi Thẻ Bài Chi Tiết (RPG Card Inspector)**: Khi chạm vào bất kỳ thẻ bài nào trên mobile, giao diện chuyển sang màn hình soi thẻ bài to rõ kèm nút `← Bộ Sưu Tập` và cụm điều hướng `< Trước` / `Sau >` cho phép lướt qua lại giữa 48 thẻ bài cực kỳ mượt mà.
  - **Bento Panels Đầy Đủ**: Giữ nguyên và nâng cấp toàn bộ các khối thông tin chuyên sâu: Phiên bản mở rộng, Huy hiệu phe, Thứ tự thức dậy, Tóm tắt chiến thuật, Chi tiết năng lực & luật chơi, Khẩu lệnh Quản trò, và Lưu ý quan trọng.

- **Tối Ưu Trải Nghiệm Mobile: Khóa Trượt Ngang, Tăng Tốc Độ Chạm & Tự Động Cuộn Xem Thẻ Bài**:
  - **SVG Wolf Icon & Favicon Tab (`public/favicon.svg`, `src/components/ui/WolfIcon.jsx`)**: Thay thế icon tab mặc định bằng SVG đầu Sói gothic cực ngầu trên nền ngọc huyết; đồng thời thay thế emoji `🐺` ở badge thống kê `0/2 Sói` và logo Brand bằng component vector SVG đồng bộ sắc nét.
  - **Khóa Cứng Trượt Ngang (Fix Rigid Horizontal Drag Wobble)**: Khắc phục triệt để lỗi màn hình bị lắc lư/dịch chuyển qua lại khi vuốt ngang trên mobile bằng cách thêm `overflow-x: hidden`, `overscroll-behavior-x: none`, `touch-action: pan-y` trên `html`, `body`, `#root` và `overflow-x-clip` trên card `NightPhaseView`.
  - **Triệt Tiêu Độ Trễ Chạm (Zero Tap Delay)**: Loại bỏ độ trễ 300ms của trình duyệt di động qua `touch-action: manipulation;`, `user-scalable=no`, giảm thời gian phản hồi nút bấm xuống `duration-75 active:scale-95`, tạo cảm giác bấm cơ học tức thì ngay khi ngón tay vừa chạm.
  - **Tự Động Cuộn Mượt (Smooth Auto-scroll) Lên Thẻ Bài**: Bổ sung `useRef` và `useEffect` khi bấm `Đi Ngủ 💤` hoặc chuyển bước vai trò, màn hình sẽ tự động kích hoạt animation cuộn mượt mà đưa thẳng lá bài Tarot và thông tin nhân vật tiếp theo vào tầm mắt Quản trò.

- **Triển Khai Vercel Production & Serverless API Kết Nối Neon DB**:
  - **Vercel Serverless Function Endpoints (`api/index.js`, `api/[...path].js`)**: Tạo bộ xử lý Serverless chuẩn cho Vercel, hỗ trợ tự động toàn bộ API `/api/matches`, `/api/matches/:id`, `/api/templates`, `/api/rosters`, `/api/game-state`, `/api/db-check`.
  - **Cấu hình `vercel.json`**: Định tuyến SPA client-side rewrite và ánh xạ `/api/*` tới Serverless Functions; build output trỏ về `dist`.
  - **Dynamic Neon DB Client (`src/server/db.js`)**: Cải tiến cơ chế khởi tạo client với `getSql()`, tự động nạp `process.env.DATABASE_URL` từ môi trường Vercel hoặc `.env.local`, đảm bảo hoạt động hoàn hảo trong môi trường serverless không trạng thái.
  - **Auto Deploy On Push to Main**: Đã push commit lên `origin/main`, Vercel tự động kích hoạt pipeline build và deploy ngay khi có commit mới.

- **Ban Hành Quy Chuẩn Thiết Kế Bắt Buộc & Loại Bỏ Layout Shift ([DESIGN_RULES.md](file:///home/levi/Desktop/Projects/werewolf/docs/DESIGN_RULES.md))**:
  - **Khắc Phục Hoàn Toàn Lỗi Đoán Phe Non Nớt & Giả Lập Vai Dân**: Đã xóa bỏ toàn bộ việc tự động đoán `Cùng phe` / `Phe thứ 3` khi Cupid ghép đôi ở Đêm 1; loại bỏ 100% các đoạn fallback giả lập `|| 'Dân'` / `|| 'Dân làng'` khi người chơi chưa được gán vai, chuyển sang hiển thị trung thực là `Chưa lộ vai` / `Chưa gán vai` trên toàn bộ hệ thống.
  - **Tối Giản Nút Chuyển Bước (`Đi Ngủ 💤`) & Sửa Lỗi Che Khuất Notice Ở Đáy**: Thay thế chuỗi text dài lê thê `Cho [Tên vai dài] Ngủ 💤` bằng nhãn súc tích `Đi Ngủ 💤`, giúp thanh bottom bar gọn gàng và chừa toàn bộ diện tích cho notice; bổ sung đệm đáy `pb-24` giúp banner cảnh báo không bao giờ bị đè hay che khuất khi cuộn kịch sàn.
  - **Zero Layout Shift (CLS = 0)**: Đã xóa bỏ hoàn toàn khối banner giải thích luật động (`DYNAMIC TEAM ALERT`) ở bước ghép đôi Cupid tại [`NightPhaseView.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/NightPhaseView.jsx) và [`ActionModal.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/ActionModal.jsx). Khi chọn cặp đôi, các ô ghế và nút bấm bên dưới không còn bị giật đẩy xuống (push down) làm mất vị trí thao tác của Quản trò.
  - **Inline & Stable Height**: Trạng thái cặp đôi (cùng phe hay Phe thứ 3) được tích hợp thành 1 chip ngắn gọn ngay trên hàng tiêu đề (`🔥 Phe Thứ 3 (1 Sói + 1 Dân)` / `❤️ Cùng phe`), giữ nguyên độ cao container tuyệt đối.
  - **No AI-Style Meta-text**: Triệt tiêu toàn bộ các đoạn văn giải thích luật dài dòng rườm rà trên giao diện khi đang thao tác.

- **Refactor Hoàn Toàn Sang Mô Hình Entity Chuẩn (`Player` × `Role`)**:
  - **Single Source of Truth**: Tạo mới tệp [`src/utils/roleUtils.js`](file:///home/levi/Desktop/Projects/werewolf/src/utils/roleUtils.js) với các hàm tra cứu và chuẩn hóa:
    - `getRole(roleId)`: Tra cứu Role metadata trực tiếp từ danh mục gốc `ROLES`.
    - `getPlayerRole(player)`: Trả về object vai trò hiện tại của người chơi dựa trên `currentRoleId` (hoặc `roleId`).
    - `getPlayerOriginalRole(player)`: Trả về object vai trò ban đầu trước khi bị biến đổi dựa trên `originalRoleId`.
    - `isWolfPlayer(player)`: Hàm duy nhất xác định người chơi thuộc phe Sói (bao gồm `isCursedWolf`, `teamCode === 'W'`, Sói biến đổi), thay thế toàn bộ 7+ định nghĩa local rải rác.
    - `WOLF_ROLE_IDS`: Hằng số danh sách các ID vai Ma Sói.
  - **Loại Bỏ Anti-pattern Object Embedded**: Xóa bỏ hoàn toàn việc nhúng object `role` to đùng và `originalRole` vào từng bản ghi `player` state. `Player` hiện chỉ lưu `currentRoleId` (FK), `originalRoleId` (FK) và modifiers/flags (`isCursedWolf`, `loverId`, `elderLives`...).
  - **Cập Nhật Đồng Bộ 100% Toàn Bộ Codebase**:
    - [`App.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/App.jsx): Template người chơi, các hàm `handleAssignRole`, `handleAssignRoleToMultiple`, `handleAutoAssignVillagers`, `handleAdvanceToDay`, `handleLynchPlayer`, `evaluateGameEnd`.
    - [`gameLogic.js`](file:///home/levi/Desktop/Projects/werewolf/src/utils/gameLogic.js): Sói Nguyền lây nhiễm, Nửa Người Nửa Sói thức tỉnh, Đứa Trẻ Hoang Dã biến đổi, Già Làng, Thợ Săn, Người Thổi Sáo, Sói Trắng... đều cập nhật qua ID và `roleUtils.js`.
    - Toàn bộ Components: [`NightPhaseView.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/NightPhaseView.jsx), [`DayPhaseView.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/DayPhaseView.jsx), [`PlayersGridView.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/PlayersGridView.jsx), [`ActionModal.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/ActionModal.jsx), [`RoleClaimBox.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/RoleClaimBox.jsx), [`RoleHolderBanner.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/RoleHolderBanner.jsx), [`CemeteryModal.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/CemeteryModal.jsx), [`PlayerSeatPicker.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/PlayerSeatPicker.jsx), [`WolfWhisperBox.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/WolfWhisperBox.jsx), [`MatchHistoryModal.jsx`](file:///home/levi/Desktop/Projects/werewolf/src/components/MatchHistoryModal.jsx).
  - **Tối Ưu Hóa Lưu Trữ & Đồng Bộ DB**: `syncGameStateApi` và `saveMatchRecordApi` giờ chỉ serialize mảng ID người chơi gọn nhẹ, không còn dư thừa dữ liệu hay rủi ro desync.

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
- `npm run build`: Thành công 100% không lỗi (`built in 404ms`).

## 3. Bản Cập Nhật Triệt Để: Quy Tắc "One Person 1 Role" & Cảnh Sát Trưởng (#09) Chuẩn Game Rules
Theo quy chuẩn [docs/game-rules.md](file:///home/levi/Desktop/Projects/werewolf/docs/game-rules.md):
- **Quy tắc bất biến (One Person 1 Role)**:
  - Mỗi người chơi chỉ được giữ duy nhất **1 lá bài nhân vật chính** (`currentRoleId`).
  - Trong [RoleClaimBox.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/RoleClaimBox.jsx), [RoleHolderBanner.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/RoleHolderBanner.jsx) và [ActionModal.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/ActionModal.jsx):
    - Người chơi đã có vai khác lập tức bị **khóa cứng (disabled, opacity-40, cursor-not-allowed)**, hiển thị `🔒 Đã là [Tên vai]`. Quản trò không thể chọn gán tiếp vai mới cho họ.
    - Chỉ cho phép gán đối với người chưa có vai (`!currentRoleId`), hoặc click vào chính người đang giữ để hủy gán vai (unassign).
    - Ngăn chặn hoàn toàn tình trạng 1 người sở hữu nhiều lá nhân vật.
- **Chức vụ công khai: Cảnh Sát Trưởng (#09 / Sheriff)**:
  - Theo luật (Dòng 477): Là chức vụ do làng bầu công khai vào sáng ngày 1, người được bầu giữ thẻ chức vụ **song song với lá nhân vật chính** của mình.
  - Quản lý qua thuộc tính `isSheriff: boolean` (không ghi đè `currentRoleId` làm mất lá nhân vật).
  - Tích hợp khối **Cảnh Sát Trưởng** trực quan tại [DayPhaseView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/DayPhaseView.jsx):
    - Sáng ngày 1: Quản trò có nút bầu Cảnh Sát Trưởng.
    - Người giữ chức nhận huy hiệu `⭐ Cảnh Sát Trưởng (x2 Phiếu)`.
    - Khi Cảnh Sát Trưởng hy sinh (bị Sói cắn hoặc bị treo cổ): Hiển thị cảnh báo đỏ nổi bật kèm nút chỉ định người kế nhiệm huy hiệu đúng luật.
    - Hiển thị ngôi sao vàng `⭐` trên Sơ đồ bàn rạp hát ([PlayersGridView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/PlayersGridView.jsx)).

## 4. Tự Động Lưu Trữ & Phục Hồi Tiến Trình Ván Đấu (LocalStorage Instant Auto-Save & Restore)
- **Vấn đề đã xử lý**: Trước đây mỗi khi người dùng F5 hoặc reload tab, ván chơi bị reset trắng về trạng thái ban đầu.
- **Giải pháp triển khai trong [App.jsx](file:///home/levi/Desktop/Projects/werewolf/src/App.jsx)**:
  - Khởi tạo đồng bộ (`getInitialSavedState()` với lazy `useState(() => ...)`): Khi người dùng F5 / reload, React đọc ngay `werewolf_active_game_state` từ `localStorage` để render trạng thái ván chơi tức thì trong **0ms** (không bị chớp giật hay flash màn hình trắng).
  - Tự động lưu tức thời (`useEffect`): Bất kỳ thay đổi nào (gán vai, cắn người, soi bài, bảo vệ, phù thủy, chuyển Đêm/Ngày, treo cổ...) đều được lưu ngay vào `localStorage` và đồng bộ ngầm lên Neon DB.
  - Phục hồi đầy đủ: `players`, `roundNumber`, `isNight`, `activeTab`, `nightState`, `deckRoleIds`, `nightLogs`, `lynchedTodayPlayerId`, `gameEndResult`.
  - Nút **Reset Về 0** (`handleResetGame`): Có hộp thoại xác nhận; chỉ khi Quản trò xác nhận xóa ván thì `localStorage` mới được dọn dẹp để chơi ván mới sạch sẽ.

## 5. Cải Tiến Luồng Sói Nguyền (Chuyển Thành Sói Ngay & Tiếp Tục Cắn)
- **Luồng thao tác Quản trò mới**:
  - Khi Quản trò chọn 1 người chơi để cắn (ví dụ #14 Thu Hà), panel Sói Nguyền hiện nút hành động tức thì: **`🔮 Nguyền [Tên người] Thành Sói & Cắn Tiếp ➔`**.
  - Bấm nút này:
    1. Người đó **lập tức hóa thành Ma Sói ngay trong đêm** (`isCursedWolf: true`, lưu `originalRoleId` vai gốc, đổi `currentRoleId = 'soi-thuong'`).
    2. Người đó được thêm ngay vào danh sách đàn Sói (`isWolfPlayer` là true, ghế chuyển viền đỏ Sói, hiển thị "🐺 Đồng bọn" và không thể bị cắn nữa).
    3. Trạng thái cắn được reset (`wolfTargetId = null`) để bầy Sói **tiếp tục chọn 1 người khác để cắn đêm nay**.
    4. Hiển thị banner xác nhận tím kèm nút **`↩ Hoàn tác nguyền`** phòng trường hợp bấm nhầm.
    5. Sáng hôm sau: Ghi nhận đầy đủ nhật ký Sói Nguyền lây nhiễm, đồng thời xử lý nạn nhân thứ 2 theo quy trình cắn thông thường.
  - Tích hợp tại: [NightPhaseView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/NightPhaseView.jsx), [App.jsx](file:///home/levi/Desktop/Projects/werewolf/src/App.jsx), [gameLogic.js](file:///home/levi/Desktop/Projects/werewolf/src/utils/gameLogic.js).

## 6. Tối Giản Thông Báo Trên Thanh Điều Hướng Đáy (Compact Mobile Sticky Note)
- Rút gọn toàn bộ các câu thông báo bước đêm trên thanh điều hướng đáy (`sticky bottom bar`):
  - Ví dụ: `⚠️ Chưa gán ai là Cupid (Thần Tình Yêu)! Hãy chạm...` ➔ Rút gọn thành `⚠️ Chưa gán vai Cupid` (vừa vặn 100%, không bao giờ bị cắt thành `...` trên màn hình hẹp).
  - Tương tự cho các bước: `Chưa đủ 1/2 Sói`, `Chưa chọn mục tiêu cắn`, `Chọn cặp đôi (0/2)`, `Chưa chọn bảo vệ`, `Chưa chọn Thần Tượng`...
  - Giữ nguyên tooltip hover và banner nội dung cho giải thích chi tiết.

## 7. Triệt Tiêu Layout Shift Của Nút "Xóa Chọn Lại" & Loại Bỏ Text Over-Explained
- **Chuyển nút "Xóa chọn lại" của Cupid xuống dưới cùng**:
  - Trước: Nút xuất hiện có điều kiện ở giữa tiêu đề và đoạn mô tả, khiến mỗi khi chọn 1 người thì toàn bộ component phía dưới bị giật khựng tụt xuống.
  - Sau: Xóa bỏ khỏi header; đưa xuống **dưới cùng** (bên dưới ma trận ghế `PlayerSeatPicker`). Khi chọn người chơi, các component phía trên đứng yên 100% không dịch chuyển (CLS = 0).
- **Tối giản nút hành động (Chống over-explained)**:
  - `🔮 Nguyền Thu Hà Thành Sói & Cắn Tiếp ➔` ➔ **`🔮 Nguyền thành Sói`**
  - `🚫 Đêm Nay Bỏ Qua (Chưa Dùng)` ➔ **`Bỏ qua`**
  - `🚫 Bầy Sói Đêm Nay Không Cắn Ai` ➔ **`Đêm nay không cắn`**
  - `Xác Nhận Treo Cổ Người Này (Chỉ 1 người)` ➔ **`Xác nhận treo cổ`**
  - `HẾT NGÀY - ĐÊM BUÔNG XUỐNG` ➔ **`Hết ngày ➔ Ban đêm`**
  - `Thẩm Phán Lắp Bắp kích hoạt (Treo thêm lượt 2)` ➔ **`Thẩm Phán kích hoạt`**
- **Cập nhật quy chuẩn thiết kế**: Bổ sung điều khoản cấm nút bấm over-explained và quy định vị trí nút xóa chọn vào [docs/DESIGN_RULES.md](file:///home/levi/Desktop/Projects/werewolf/docs/DESIGN_RULES.md).
