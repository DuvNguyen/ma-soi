# Session Handover - Werewolf Moderator Web App

## 1. Tổng Quan Tiến Độ & Tính Năng Đã Triển Khai
- **Hoàn Tất Tính Năng: Chọn Bộ Bài Mặc Định Trực Tiếp Vào Neon DB ([UnifiedGameSetupModal.jsx](file:///projects/werewolf/src/components/UnifiedGameSetupModal.jsx), [DeckTemplateModal.jsx](file:///projects/werewolf/src/components/DeckTemplateModal.jsx), [App.jsx](file:///projects/werewolf/src/App.jsx), [db.js](file:///projects/werewolf/src/server/db.js), [api.js](file:///projects/werewolf/src/services/api.js))**:
  - **Di Trú Database (Neon Postgres)**: Bổ sung trường `is_default BOOLEAN NOT NULL DEFAULT FALSE` vào bảng `deck_templates`, hỗ trợ tự động migration trong `ensureTablesExist()`.
  - **Cập Nhật Bộ Bài Mặc Định Ban Đầu**: Đã set `is_default = TRUE` cho template `"14 lá đặc chức năng"` (19 lá, ID: `template-1794537835909` theo ảnh mobile chụp của Quản trò).
  - **Backend API & Vite Plugin**:
    - Thêm route `POST /api/templates/:id/default` vào cả [api/index.js](file:///projects/werewolf/api/index.js) (Vercel serverless) và [src/server/viteApiPlugin.js](file:///projects/werewolf/src/server/viteApiPlugin.js) (local dev).
    - Thao tác transaction/query atomic: reset toàn bộ `is_default = FALSE` trước khi kích hoạt `is_default = TRUE` cho bộ bài được chọn.
    - `getTemplates()` trả về bộ bài được sắp xếp ưu tiên `ORDER BY is_default DESC, created_at DESC`.
  - **Giao Diện [UnifiedGameSetupModal.jsx](file:///projects/werewolf/src/components/UnifiedGameSetupModal.jsx) & [DeckTemplateModal.jsx](file:///projects/werewolf/src/components/DeckTemplateModal.jsx)**:
    - Hiển thị huy hiệu `⭐ Mặc định` trang nhã phong cách Soft Bento cạnh tên bộ bài mặc định.
    - Thêm nút `Đặt mặc định` / `⭐ Mặc định` cho từng thẻ bài, cho phép Quản trò chuyển đổi bộ bài mặc định chỉ với 1 chạm.
    - Tự động ưu tiên chọn bộ bài mặc định khi khởi tạo ván đấu mới hoặc mở modal cài đặt.
  - **Tự Động Áp Dụng Tại [App.jsx](file:///projects/werewolf/src/App.jsx)**: Khi tải ứng dụng (không có ván chơi cũ dở dang), hệ thống tự động fetch và nạp cấu hình bộ bài mặc định từ Neon DB.

- **Hoàn Tất Giai Đoạn 2: Tinh Gọn Thao Tác Biểu Quyết Ban Ngày & Tiết Chế Hiệu Ứng Trầm Tĩnh Chuẩn Soft Bento Gothic ([DayPhaseView.jsx](file:///projects/werewolf/src/components/DayPhaseView.jsx), [NightPhaseView.jsx](file:///projects/werewolf/src/components/NightPhaseView.jsx), [SheriffSuccessionModal.jsx](file:///projects/werewolf/src/components/SheriffSuccessionModal.jsx), [CemeteryModal.jsx](file:///projects/werewolf/src/components/CemeteryModal.jsx))**:
  - **Khử Trùng Lặp Thao Tác Án Treo Cổ ([DayPhaseView.jsx](file:///projects/werewolf/src/components/DayPhaseView.jsx))**: Loại bỏ nút thừa `Đổi Người Khác` (vốn gọi trùng lặp `onUndoLynch` như nút `Hoàn tác treo cổ`), rút gọn nhãn nút `Đổi Vai Trò Nạn Nhân` thành `Đổi Vai Trò`, tinh gọn nhãn Thẩm Phán thành `Thẩm Phán (Vote Thêm)`. Hàng nút điều khiển án treo cổ nay vừa khít hoàn hảo trên 1 hàng duy nhất trên mobile.
  - **Tiết Chế Animation Nhấp Nháy & Nảy Bật Không Cần Thiết**:
    - Thay thế các hiệu ứng `animate-bounce` nhảy nhót trên icon Khiên Bảo Vệ, Đầu Lâu Ma Sói bằng hiệu ứng viền dạ quang tĩnh thanh lịch (`drop-shadow-[0_0_8px_rgba(...)]`).
    - Gỡ bỏ `animate-pulse` trên các huy hiệu trạng thái chọn mục tiêu (`🛡️ Đã chọn người bảo vệ`, `🩸 Đã chọn mục tiêu cắn`, `Sói Cuồng Nộ`), thẻ Người Thuần Phục Gấu, và biểu ngữ Thợ Săn. Giao diện trở nên trầm tĩnh, huyền bí và sang trọng theo đúng chuẩn Gothic Bento.
  - **Tối Ưu Padding & Vùng Chạm Trên Mobile ([SheriffSuccessionModal.jsx](file:///projects/werewolf/src/components/SheriffSuccessionModal.jsx))**: Bổ sung `pb-4` vào lưới chọn ghế người kế nhiệm huy hiệu, đảm bảo hàng ghế dưới cùng không bao giờ bị mép bo tròn cắt xén hay khó chạm trên màn hình điện thoại.

- **Hoàn Tất Giai Đoạn 1: Kiểm Toán & Chuẩn Hóa Toàn Diện UI/UX & Văn Phong Hệ Thống ([ActionModal.jsx](file:///projects/werewolf/src/components/ActionModal.jsx), [NightPhaseView.jsx](file:///projects/werewolf/src/components/NightPhaseView.jsx), [DayPhaseView.jsx](file:///projects/werewolf/src/components/DayPhaseView.jsx), [RoleHolderBanner.jsx](file:///projects/werewolf/src/components/RoleHolderBanner.jsx), [GameOverModal.jsx](file:///projects/werewolf/src/components/GameOverModal.jsx), [DeckTemplateModal.jsx](file:///projects/werewolf/src/components/DeckTemplateModal.jsx), [GameSettingsModal.jsx](file:///projects/werewolf/src/components/GameSettingsModal.jsx), [DeckInventoryRadar.jsx](file:///projects/werewolf/src/components/DeckInventoryRadar.jsx), [PlayersGridView.jsx](file:///projects/werewolf/src/components/PlayersGridView.jsx), [App.jsx](file:///projects/werewolf/src/App.jsx), [SheriffSuccessionModal.jsx](file:///projects/werewolf/src/components/SheriffSuccessionModal.jsx))**:
  - **Sửa 100% Lỗi Markup JSX & Phục Hồi Header Chuẩn Tại [ActionModal.jsx](file:///projects/werewolf/src/components/ActionModal.jsx)**:
    - Khắc phục lỗi build vite vỡ thẻ do biểu thức rỗng `) : ()` tại nhánh kiểm tra bình độc Phù Thủy; bổ sung thông báo trạng thái `Đã hết thuốc độc`.
    - Phục hồi các tiêu đề chuẩn Bento Gothic (`BẢO VỆ`, `TIÊN TRI`, `BẦY MA SÓI`, `PHÙ THỦY`, `CUPID GHÉP ĐÔI`, `PHÁT SÚNG THỢ SĂN`) và xóa bỏ triệt để các thẻ `</div>` mồ côi / thừa.
    - Sửa nhãn nút Cupid từ cụm cộc lốc `Ghép Đôi 2 ❤️` thành `Xác Nhận Ghép Đôi ❤️`.
  - **Loại Bỏ Hoàn Toàn AI Meta-Text & Văn Bản Hướng Dẫn Thừa (Zero Over-Instruction)**:
    - Xóa bỏ `(Chạm số ghế người chơi bên dưới)` và `(Chạm số ghế con mồi bên dưới)` tại [NightPhaseView.jsx](file:///projects/werewolf/src/components/NightPhaseView.jsx).
    - Cắt gọn cảnh báo `Chưa gán ai là... Chạm số ghế người chơi để gán` thành `Chưa gán vai...`.
    - Rút gọn tooltip giải thích nút bấm rườm rà tại [App.jsx](file:///projects/werewolf/src/App.jsx) (`title="Nghĩa trang ({deadCount})"`), [DeckInventoryRadar.jsx](file:///projects/werewolf/src/components/DeckInventoryRadar.jsx) (`title="Gán toàn bộ người còn lại làm Dân Làng"`), và [PlayersGridView.jsx](file:///projects/werewolf/src/components/PlayersGridView.jsx).
    - Xóa dòng meta-text `Chạm ra ngoài để đóng` tại footer [GameSettingsModal.jsx](file:///projects/werewolf/src/components/GameSettingsModal.jsx).
  - **Chuẩn Hóa Tiêu Đề Gothic Bento Thanh Lịch (Hạ Giọng Shouty ALL CAPS)**:
    - Thay thế toàn bộ các tiêu đề in hoa dạng mệnh lệnh dài trong [NightPhaseView.jsx](file:///projects/werewolf/src/components/NightPhaseView.jsx) (`Mục tiêu bảo vệ đêm nay`, `Mục tiêu bầy Sói cắn`, `Mục tiêu soi đêm nay`, `Thuốc Phù Thủy`, `Ghép đôi Cupid`, `Thần Tượng liên kết`, `Bản Thể liên kết`, `Dấu ấn Quạ`, `Đánh hơi của Cáo`, `Lượt cắn Sói Lớn Xấu Xa`, `Lượt cắn Sói Trắng`, `Khóa phép Nguyệt Nữ`).
    - Cắt gọt văn bản kịch bản quá đà của Gấu tại [DayPhaseView.jsx](file:///projects/werewolf/src/components/DayPhaseView.jsx) (`GẤU GẦM GỪZZZZ!... Quản trò hãy gầm lớn` ➔ `Gấu gầm: Có Ma Sói ngồi kề bên`), chuông báo (`Hết giờ thảo luận ➔ Chuyển sang biểu quyết`), và nhãn chiến thắng trang trọng tại [GameOverModal.jsx](file:///projects/werewolf/src/components/GameOverModal.jsx) (`PHE CHIẾN THẮNG`).
  - **Vượt Qua 100% Bộ Test Domain & E2E (19 Domain Tests + Full Match Simulation)** và build production thành công tuyệt đối.

- **Hỗ Trợ Multi-Select & Giữ Trạng Thái Mở Cho Hai Chị Em (2 người) & Ba Anh Em (3 người) ([RoleClaimBox.jsx](file:///projects/werewolf/src/components/RoleClaimBox.jsx), [RoleHolderBanner.jsx](file:///projects/werewolf/src/components/RoleHolderBanner.jsx), [ActionModal.jsx](file:///projects/werewolf/src/components/ActionModal.jsx), [deckUtils.js](file:///projects/werewolf/src/utils/deckUtils.js), [NightPhaseView.jsx](file:///projects/werewolf/src/components/NightPhaseView.jsx))**:
  - **Chuẩn hóa dung lượng vai (Capacity)**: `getRoleCapacity` đảm bảo vai `hai-chi-em` luôn có dung lượng tối thiểu là 2 người (`capacity >= 2`), và `ba-anh-em` luôn có dung lượng tối thiểu là 3 người (`capacity >= 3`), kể cả khi Quản trò chỉ thêm 1 thẻ cấu hình đại diện trong bộ bài.
  - **Gán nhiều người (Multi-select) tại RoleClaimBox**: Cho phép Quản trò chạm chọn liên tiếp 2 người cho Hai Chị Em (hoặc 3 người cho Ba Anh Em), hiển thị thẻ tóm tắt slot người chọn và nút xác nhận `Xác Nhận (X/2) Hai Chị Em ✓` / `Xác Nhận (X/3) Ba Anh Em ✓`.
  - **Không tự động đóng drawer/modal khi chọn xong**: Tại `RoleHolderBanner` và `ActionModal`, khi gán/bỏ gán người chơi cho vai Hai Chị Em hoặc Ba Anh Em, danh sách giữ nguyên trạng thái mở để Quản trò thoải mái gán tiếp người thứ 2/thứ 3 mà không bị sập drawer.
  - **Khắc phục lỗi text hiển thị `✓ Đã nguyền từ vai này`**: Đã sửa tại `RoleHolderBanner.jsx`, hiển thị đúng `✓ Đang giữ vai này` cho người chơi bình thường (chỉ hiện `🔮 Bị nguyền (vai gốc)` nếu người đó thực sự trúng lời nguyền Sói).
  - **Thêm Step Validation chuẩn kịch bản đêm**: Bước gọi Hai Chị Em bắt buộc gán đủ đúng 2 người (`count === 2`), Ba Anh Em bắt buộc đủ 3 người (`count === 3`) mới cho phép Quản trò bấm `Đi Ngủ 💤`.

- **Loại Bỏ Hoàn Toàn Nút To Trùng Lặp Ở Các Role Kịch Bản Đêm ([NightPhaseView.jsx](file:///projects/werewolf/src/components/NightPhaseView.jsx))**:
  - **Khắc phục lỗi 2 nút "Đi Ngủ" cùng xuất hiện trên màn hình**: Trước đây khi Quản trò chọn xong mục tiêu cho các vai (Cupid chọn 2 người, Tiên Tri soi bài, Ma Sói cắn, Bảo Vệ khiên, hoặc các vai chưa gán/đã chết/lời nguyền Già Làng), một nút to ngang toàn màn hình (`w-full h-11`) tự động bung ra ngay giữa màn hình (`Đã Ghép Đôi & Đi Ngủ 💤`, `Đã Soi Bài & Đi Ngủ 💤`, `Xác Nhận & Đi Ngủ 💤`...), nằm đè ngay sát thanh điều hướng dính đáy (`Sticky Bottom Action Bar`).
  - **Giữ thanh Sticky Bottom duy nhất & chuẩn xác**: Quản trò thao tác bằng thanh Action Bar cố định ở đáy màn hình (`Bước Trước` / Huy hiệu trạng thái `✓ Đã ghép đôi ✓` / `Đi Ngủ 💤 >`), loại bỏ hoàn toàn các nút to chiếm diện tích và nút floating dư thừa.
  - **Dọn dẹp code sạch sẽ**: Xóa bỏ các state, ref, và IntersectionObserver không cần thiết (`inlineButtonNode`, `inlineAdvanceBtnRef`, `showFloatingAdvanceButton`, `isOriginalFooterVisible`).

- **Áp Dụng Bộ Typography Mới Chuẩn Gothic Occult ([index.html](file:///home/levi/Desktop/Projects/werewolf/index.html), [index.css](file:///home/levi/Desktop/Projects/werewolf/src/index.css))**:
  - **Bộ Font 3 Tầng Đẳng Cấp**:
    - **Tiêu đề, Nhãn Cổ Kính**: `Cinzel` (`wght@600;700;800;900`).
    - **Nội dung, Giao diện chính**: `Inter` (`wght@400;500;600;700`) - sắc nét, tương phản cao, tối ưu hiển thị trên màn hình OLED/Retina.
    - **Mã Code, Nhãn Thẻ, Ghế Ngồi, Counters**: `JetBrains Mono` (`wght@400;500;600;700`).

- **Thực Thi Sửa Đổi Toàn Bộ Các Xung Đột Vai Trò & Lỗ Hổng Logic ([gameLogic.js](file:///home/levi/Desktop/Projects/werewolf/src/utils/gameLogic.js), [App.jsx](file:///home/levi/Desktop/Projects/werewolf/src/App.jsx), [NightPhaseView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/NightPhaseView.jsx))**:
  - **Fix Xung Đột #1 (Thợ Săn chết do Thuốc Độc Phù Thủy)**: Thợ Săn chết do độc Phù Thủy trong đêm hoặc quẫn trí chết theo người yêu sẽ bị tê liệt, **KHÔNG kích hoạt popup nổ súng**. Chỉ nổ súng khi chết do Sói cắn hoặc bị treo cổ.
  - **Fix Xung Đột #2 (Lời Nguyền Già Làng)**: Khi Già Làng bị Dân Làng treo cổ hoặc bị Phù Thủy đầu độc, cờ `isVillageCursed = true` được kích hoạt. Toàn bộ phe Dân Làng mất năng lực đặc biệt (Bảo Vệ, Tiên Tri, Phù Thủy bị phong ấn năng lực, hiển thị cảnh báo đỏ trên kịch bản đêm).
  - **Fix Xung Đột #3 (Hoàn Trả Bình Cứu Phù Thủy)**: Khi cả Bảo Vệ và Phù Thủy cùng cứu 1 mục tiêu, Bảo Vệ đỡ đòn thành công thì hệ thống **tự động hoàn trả lại bình cứu (`witchHasHeal = true`)** cho Phù Thủy, không bị lãng phí bình.
  - **Fix Xung Đột #4 (Sói Con chết kích hoạt cắn 2 người)**: Khi Sói Con (`soi-con`) chết (treo cổ hoặc ban đêm), cờ `wolfCanKillDouble = true` kích hoạt. Đêm kế tiếp bầy Sói được chọn 2 con mồi (`wolfTargetId` và `wolfTargetId2`) với badge Cuồng Nộ rực lửa.
  - **Fix Xung Đột #7 (Thiên Sứ bị treo cổ Ngày 1)**: Nếu Thiên Sứ bị treo cổ vào Ngày 1 (`roundNumber === 1`), hệ thống tuyên bố **Thiên Sứ Chiến Thắng Ngay Lập Tức**!
  - **Fix Xung Đột #8 (Di Chúc Cảnh Sát Trưởng)**: Khi người giữ huy hiệu Cảnh Sát Trưởng chết (ban ngày hoặc ban đêm), hệ thống tự động hiển thị hộp thoại yêu cầu di chúc chuyển giao huy hiệu cho người sống kế nhiệm.
  - **Fix Xung Đột #9 (Chuẩn Hóa 15 Vai Trò Mở Rộng Vào Kịch Bản Đêm)**: Đăng ký đầy đủ `cho-soi-soi-lai` (0.8), `hai-chi-em` (2.1), `ba-anh-em` (2.2), `ba-dong` (3.6), `nguoi-mua-roi` (4.8), `sat-thu` (7.6), `ke-dot-nha` (8.1), `con-qua-plus` (9.1) vào `orderPriority` và lọc các vai thụ động ban ngày (`co-be`, `canh-sat-characters`, `ki-si`, `thanh-vien-giao-phai`).
  - **Gộp Sói Quỷ Vào Bước Bầy Ma Sói**: `soi-quy` được gộp chuẩn vào bước Bầy Sói săn mồi (có nút "Nguyền thành Sói"), không còn bị tách thành bước riêng lệch thứ tự.

- **Báo Cáo Toàn Diện Kiểm Toán E2E, Logic & Xung Đột Vai Trò ([docs/werewolf-e2e-audit-and-role-conflicts.html](file:///home/levi/Desktop/Projects/werewolf/docs/werewolf-e2e-audit-and-role-conflicts.html))**:
  - Đã xuất bản báo cáo HTML standalone tại thư mục `docs/`.
  - **Kiểm Toán 48 Vai Trò Toàn Diện**: Phân loại chi tiết 48 vai trò thành các nhóm trạng thái thực thi: 5 vai trò Full Flow Production Ready, 16 vai trò có kịch bản đêm nhưng thiếu action engine, 15 vai trò bị lệch thứ tự (rơi vào fallback priority #99), và 10 vai trò thụ động/passive.
  - **Phát Hiện & Phân Tích Sâu 10 Xung Đột Vai Trò & Lỗ Hổng Logic**:
    1. *Thợ Săn chết do Thuốc Độc Phù Thủy*: Hiện tại vẫn kích hoạt popup nổ súng (vi phạm luật quốc tế: trúng độc trong đêm không được bắn).
    2. *Già Làng bị Dân Làng treo cổ / Phù Thủy ném độc*: Chưa kích hoạt cơ chế tước đoạt toàn bộ chức năng đặc biệt của phe Dân.
    3. *Bảo Vệ và Phù Thủy cùng cứu 1 người*: Cả 2 cùng cứu khiến Phù Thủy mất oan 1 bình cứu quý giá dù Bảo Vệ đã đỡ đòn thành công.
    4. *Sói Con chết*: Chưa có cơ chế cho phép bầy Sói cắn 2 nạn nhân vào đêm kế tiếp.
    5. *Sói Trắng thức dậy solo giết Sói*: Thiếu UI chọn con Sói bị giết riêng.
    6. *Người Thổi Sáo thôi miên*: Đã có logic thắng trong engine nhưng thiếu UI chọn 2 ghế người chơi để bật cờ `isHypnotized`.
    7. *Thiên Sứ bị treo cổ Ngày 1*: Chưa có cơ chế thắng tức thì trong `handleLynchPlayer`.
    8. *Cảnh Sát Trưởng qua đời*: Thiếu popup tự động yêu cầu di chúc chuyển giao huy hiệu.
    9. *15 vai trò mở rộng bị đẩy xuống priority 99*: Lệch kịch bản đêm so với luật chuẩn.
    10. *Thằng Ngốc 1v1 Ma Sói*: Logic engine xác minh đã hoạt động chuẩn xác (Sói thắng ngay khi áp đảo).
  - **Báo Cáo Độc Lập HTML Đẳng Cấp**: Định dạng Obsidian Occult Dashboard, dark theme, interactive filter theo phe và trạng thái, timeline đêm trực quan, code diff sửa lỗi cụ thể.

- **Khắc Phục Nền Giấy Da Cổ & Viết Lại Cẩm Nang Quản Trò Dark Theme ([parchment-bg.png](file:///home/levi/Desktop/Projects/werewolf/public/parchment-bg.png), [GameGuideModal.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/GameGuideModal.jsx))**:
  - **Khử 100% Viền Trắng Ngoài Mép Giấy Rách**: Dùng thuật toán flood-fill bóc tách toàn bộ 4,982 pixel nền trắng ngoài vết cháy của ảnh giấy da sang alpha = 0 (trong suốt tuyệt đối). Tờ giấy da rách giờ hòa quyện tự nhiên trên màn đêm mà không có bất kỳ đốm trắng hay viền khung hình chữ nhật.
  - **Sổ Tay Quản Trò Thuần Chữ Dark/Gothic Occult**: Loại bỏ toàn bộ các khối card màu trắng kem sữa (`bg-[#f5e6cc]`) và emoji màu mè hoạt hình (📜, 🐺, 💡, 🎴, 👥...). Thay thế bằng typography Cinzel mực đen cổ điển (`text-[#260e05]`) in trực tiếp trên giấy da, icon tối màu (`FileText`, `Sliders`, `Moon`, `Sun`, `Database`).
  - **Nội Dung 100% Hướng Dẫn Sử Dụng Ứng Dụng (GM Tool Manual)**:
    - *Thiết Lập Bàn*: Thao tác nút Bộ Bài, nút Tên nạp từ Cloud, Sơ đồ bàn đổi vai tức thì, Nút Reset về 0.
    - *Điều Khiển Đêm*: Bấm nút "Đi Ngủ" chuyển lượt, chạm ghế gán mục tiêu, Tiên Tri soi bài kèm hướng dẫn ra dấu tay, Sói Quỷ bấm nút "Nguyền thành Sói".
    - *Điều Khiển Ngày*: Bản tin tử vong tự động, Biểu quyết treo cổ (xử lý Thằng Ngốc/Thợ Săn), Huy hiệu Cảnh Sát Trưởng x2 phiếu.
    - *Dữ Liệu & Lưu Trữ*: Tự động lưu LocalStorage chống mất dữ liệu khi F5, Đồng bộ Neon Cloud khi kết thúc ván.

- **Bổ Sung Nhân Vật Sói Quỷ (Cursed Wolf-Father) Vào Toàn Hệ Thống ([roles.js](file:///home/levi/Desktop/Projects/werewolf/src/data/roles.js), [roleUtils.js](file:///home/levi/Desktop/Projects/werewolf/src/utils/roleUtils.js), [NightPhaseView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/NightPhaseView.jsx))**:
  - Cập nhật vai `soi-quy` ("Sói Quỷ / Sói Nguyền / Người Cha Của Sói - Cursed Wolf-Father"), sử dụng ảnh chính hãng `public/cards/soi-quy.png`, thêm vào `WOLF_ROLE_IDS` và kịch bản gọi đêm.

- **Tích Hợp Cẩm Nang Quản Trò Nền Giấy Da Cổ (Parchment Guide) & Tối Ưu Header 1 Dòng ([GameGuideModal.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/GameGuideModal.jsx), [App.jsx](file:///home/levi/Desktop/Projects/werewolf/src/App.jsx))**:
  - **Cẩm Nang Nền Giấy Da Cổ Điển (`public/parchment-bg.png`)**: Sử dụng hình ảnh giấy da cổ với viền cháy rách làm phông nền toàn diện cho cửa sổ Hướng Dẫn Sử Dụng. Chữ viết màu mực đen/nâu sepia cổ điển kết hợp font Cinzel sang trọng, bố cục 3 tab: *📜 Quy Trình Ván Đấu*, *🐺 Quyền Năng & Thao Tác*, *💡 Mẹo & Lưu Ý Quản Trò*.
  - **Nút Chấm Hỏi Hình Tròn Nhỏ (`?`) Trên Header**: Bổ sung icon `HelpCircle` tròn nhỏ màu vàng đất cổ điển ngay đầu cụm thao tác nhanh để Quản trò mở cẩm nang bất kỳ lúc nào.
  - **Khóa Cứng Header 1 Dòng Duy Nhất**: Tinh chỉnh kích thước các nút bấm trên mobile (`w-7 h-7 sm:w-auto sm:h-8`), đảm bảo toàn bộ thanh công cụ hàng 1 luôn hiển thị thẳng hàng trên 1 dòng duy nhất trên mọi độ phân giải màn hình từ 360px trở lên, tuyệt đối không bị gãy thành 2-3 dòng.

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

## 8. Thay Thế Toàn Bộ Icon Sói Bằng Artwork Đầu Sói Gầm Custom & Gỡ Bỏ Dấu Chấm Hỏi Header
- **Tạo và chuẩn hóa asset Artwork Đầu Sói Gầm (`public/`)**:
  - Cắt tỉa chuẩn alpha channel từ ảnh người dùng cung cấp (`uploaded_media_1794313774183.png`), lưu thành `public/wolf-head.png`, `public/wolf-icon.png`, `public/wolf-icon-128.png`.
  - Cập nhật Favicon dự án (`public/favicon.svg`) theo silhouette đầu Sói gầm mắt đỏ đồng bộ thương hiệu.
- **Cập nhật components giao diện UI (`src/components/ui/`)**:
  - `WolfIcon.jsx`: Render thẻ `<img>` với asset `/wolf-icon.png` sắc nét, kèm drop shadow đỏ nhẹ.
  - `WolfHead.jsx`: Render hình ảnh đầu Sói `/wolf-head.png` với filter drop-shadow mắt đỏ phát sáng.
- **Loại bỏ nút Dấu chấm hỏi `(?)` trên Header (`src/App.jsx`)**:
  - Đã gỡ bỏ nút `HelpCircle` mở Cẩm nang hướng dẫn theo yêu cầu người dùng, đảm bảo Header luôn gọn gàng 1 dòng duy nhất trên mọi độ phân giải.
- **Thay thế triệt để Emoji Sói `🐺` bằng `<WolfIcon />` trên toàn hệ thống**:
  - [PlayersGridView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/PlayersGridView.jsx): Huy hiệu Phe Sói còn sống và tag Sói (Bị Nguyền).
  - [DeckInventoryRadar.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/DeckInventoryRadar.jsx): Danh sách lá bài Sói còn lại trong bộ bài.
  - [WolfWhisperBox.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/WolfWhisperBox.jsx): Avatar chuyền máy bầy Sói, nút gửi tin và lịch sử nhắn tin bí mật.
  - [GameOverModal.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/GameOverModal.jsx): Cúp chiến thắng phe Sói.
  - [SetupGameModal.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/SetupGameModal.jsx), [DeckTemplateModal.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/DeckTemplateModal.jsx), [DayPhaseView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/DayPhaseView.jsx), [NightPhaseView.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/NightPhaseView.jsx), [ActionModal.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/ActionModal.jsx), [RoleLibraryModal.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/RoleLibraryModal.jsx), [RoleClaimBox.jsx](file:///home/levi/Desktop/Projects/werewolf/src/components/RoleClaimBox.jsx).
- **Kiểm tra & nghiệm thu**: `npm run build` thành công 100%, không phát sinh lỗi cú pháp hay cảnh báo logic.

## 9. Chức Năng Chỉnh Sửa Bộ Bài, Nhóm Lá Trùng Lặp (Dân Làng x4) & Background Ngày/Đêm
- **Chức năng Chỉnh Sửa Bộ Bài (Edit Template) (`src/components/DeckTemplateModal.jsx`)**:
  - Thêm nút **Sửa** (icon `Edit3`) trên từng thẻ bộ bài đã lưu.
  - Khi bấm "Sửa", modal tự động chuyển sang form biên tập, nạp sẵn toàn bộ thông tin: Tên bộ bài, Mô tả, Số lượng từng vai trò (`roleCounts`), và Danh sách tên người chơi.
  - Nút lưu hiển thị rõ ràng: `Lưu Thay Đổi Bộ Bài`. API backend (`src/server/db.js` và `src/services/api.js`) tự động thực thi `ON CONFLICT (id) DO UPDATE SET` và đồng bộ `localStorage` cache ngay lập tức.
- **Nhóm Lá Bài Trùng Lặp Trong Template (`Dân Làng x4`, `Sói Thường x2`)**:
  - Giải quyết triệt để vấn đề in lặp lại hàng loạt thẻ Dân Làng.
  - Bộ đếm tự động nhóm các `roleIds` giống nhau, hiển thị tên kèm badge số lượng `x{count}` màu hổ phách (VD: `Dân Làng x4`), phân màu phe Sói / phe Dân / phe Thứ 3 trực quan, thẩm mỹ.
- **Background Nghệ Thuật Động Cho Ngày & Đêm (`src/App.jsx`, `public/`)**:
  - Ban ngày: Artwork Mặt trời vàng xoắn ốc tỏa ánh hào quang huyền bí (`public/bg-day-sun.jpg`).
  - Ban đêm: Artwork Mặt trăng bạc xoắn ốc lạnh lẽo bí ẩn (`public/bg-night-moon.jpg`).
  - Hiệu ứng cross-fade mượt mà (`duration-1000`) khi chuyển pha Ban ngày ➔ Ban đêm, kết hợp lớp vignette tối nhẹ để các thẻ chức năng và văn bản luôn đạt độ tương phản chuẩn WCAG.

## 10. Cờ Chiến Thắng Khắc Tên Phe Thắng (Font TH Kinhdi 1) & Tinh Chỉnh Xuyên Thấu Background
- **Cờ Chiến Thắng Ragged Banner (`GameOverModal.jsx`, `public/victory-banner.png`)**:
  - Cắt tỉa chuẩn alpha asset cờ chiến trận rách cổ điển treo trên thanh sắt (`public/victory-banner.png`).
  - Hiệu ứng rơi cờ `animate-banner-drop` và hiệu ứng đóng dấu máu / mực khắc `animate-stamp-in` đập mạnh lên mặt cờ.
  - Nội dung in trực tiếp: dòng tiêu đề "PHE THẮNG LÀ:" và tên phe (MA SÓI, DÂN LÀNG, CẶP ĐÔI...).
  - Áp dụng chuẩn font rùng rợn `TH Kinhdi 1` (`font-kinhdi`) kèm fallback Google horror display fonts (`Nosifer`, `Creepster`, `Cinzel`).
- **Hiệu Ứng Xuyên Thấu Background Cho Modal & Bảng Điều Khiển**:
  - Tăng độ hiển thị của artwork Mặt trời (Day) và Mặt trăng (Night) lên 40-55% để các vòng xoắn ốc tỏa sáng ma mị phía sau giao diện.
  - Chuyển toàn bộ khung viền modal (`GothicModalContainer`, `DeckTemplateModal`, `PlayerRosterModal`, `MatchHistoryModal`, `RoleLibraryModal`, `SetupGameModal`, `ActionModal`) và khung bàn chơi (`NightPhaseView`) sang dạng kính mờ gothic (`backdrop-blur-md` kết hợp `bg-.../75-90`).
  - Đảm bảo thẻ bài, văn bản và icon vẫn giữ nền đục 100% không bị xuyên thấu ("không xuyên qua thẻ và chữ") nhằm bảo toàn độ tương phản và dễ đọc tối đa.

## 11. Gỡ Bỏ Tiếng Kêu Khi Gửi Tin Nhắn Bầy Sói
- **Xóa âm thanh beep khi gửi tin nhắn (`WolfWhisperBox.jsx`)**:
  - Đã loại bỏ các lệnh phát âm thanh `playBeep` khi người chơi bấm nút "Gửi Tin & Chuyền Cho Sói Kế Tiếp" và "Hoàn Tất Lượt Chuyền Máy Bầy Sói".
  - Giúp việc chuyền máy trong đêm hoàn toàn yên lặng, không phát ra tiếng động gây chú ý hoặc làm lộ danh tính người đang thao tác trong phòng chơi thực tế.

## 12. Tinh Gọn Chat Box Bầy Sói (Gộp Tin Nhanh Vào Dấu 3 Chấm) & Đơn Giản Hóa Thẻ Soi Tiên Tri (Nút X To Đỏ)
- **Chat Box Bầy Sói Đơn Giản & Gọn Gàng (`WolfWhisperBox.jsx`)**:
  - Loại bỏ hoàn toàn khối 6 viên thuốc (pills) tin nhắn nhanh xếp dọc từng chiếm diện tích lớn màn hình di động.
  - Tích hợp nút dấu 3 chấm `...` (`MoreHorizontal`) nằm ngay trong thanh chat input.
  - Khi bấm `...`, popover menu các tin nhắn nhanh sẽ mở ra; bấm chọn 1 tin sẽ tự động điền vào ô và đóng menu ngay.
  - Thu gọn danh sách ứng viên cắn thành các chip bo góc nhỏ gọn.
  - Tích hợp nút Gửi / Chuyền tiếp trực tiếp trên thanh chat bar, tiết kiệm tối đa diện tích dọc và triệt tiêu mọi yếu tố gây xao nhãng.
- **Tối Giản Thẻ Lật Soi Bài Của Tiên Tri (`NightPhaseView.jsx`)**:
  - Biến nút đóng thành **dấu X to đỏ** (`w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold`) gắn cố định ở góc trên thẻ bài và thanh tiêu đề.
  - Lược bỏ toàn bộ các đoạn văn giải thích dài dòng (`Thẻ bài của...`, `Phe: [?] Chưa lộ phe`, `👉 RA DẤU CHO TIÊN TRI:...`).
  - Chỉ hiển thị ngắn gọn, trực diện: Số ghế & Tên người chơi, Tên vai trò và một badge kết quả to rõ ràng: `Là Ma Sói` (đỏ) hoặc `Là Dân Làng` (xanh), giúp Quản trò ra hiệu trong 1 giây mà không bị rối mắt.

## 13. Tối Ưu UX Bình Độc Phù Thủy, Lưu Bước Đêm Khi Refresh (F5), Khung Nền Mờ 60% & Header Thương Vong Chuẩn
- **Modal Xác Nhận & Hoàn Tác Bình Độc Phù Thủy (`NightPhaseView.jsx`)**:
  - Ngăn chặn hoàn toàn việc bấm nhầm mất bình độc: Khi quản trò bấm vào người chơi trong mục "Dùng Bình Độc (Giết 1 Người)", hệ thống sẽ hiển thị một Modal cảnh báo Gothic xác nhận: `Có chắc chắn muốn Phù Thủy sử dụng BÌNH ĐỘC để tiêu diệt {player.name} (#id) đêm nay không?` kèm cảnh báo bình độc chỉ dùng 1 lần duy nhất trong cả ván đấu.
  - Khi đã chọn mục tiêu độc, hiển thị banner thông báo nổi bật màu đỏ máu cùng nút `[↩ Hủy Dùng Độc]` hoặc bấm lại vào đúng người đó để hủy ngay lập tức mà không cần xác nhận phức tạp.
- **Lưu Giữ Trạng Thái Bước Ban Đêm Qua F5/Reload (`App.jsx`, `NightPhaseView.jsx`)**:
  - Bước gọi đêm hiện tại (`currentNightStepIdx`) được lưu trữ tức thì vào cả `localStorage` (`werewolf_current_night_step`) lẫn state game `stateToSave`.
  - Khi Quản trò đang ở bước bất kỳ trong đêm (ví dụ: đã đi qua Sói, Tiên tri, Bảo vệ và đang ở bước Phù Thủy) mà vô tình bấm F5/refresh trình duyệt, hệ thống sẽ tự động khôi phục đúng ngay bước đó, không bị nhảy ngược lại bước đầu tiên.
  - Tự động dọn dẹp và reset về bước 0 khi sang Ban Ngày hoặc reset ván mới.
- **Khung Nền Trong Suốt ~60% (Translucent Frames) Xuyên Thấu Background Nghệ Thuật (`DayPhaseView.jsx`, `NightPhaseView.jsx`)**:
  - Đổi nền các panel khung vuông ở Ban Ngày (`Bản Tin Thương Vong`, `Cảnh Sát Trưởng`, `Thời Gian Thảo Luận`, `Biểu Quyết Treo Cổ`) và Ban Đêm từ nền màu đặc 100% sang `bg-[#...]/60 backdrop-blur-md`.
  - Giúp nhìn thấy trọn vẹn artwork hào quang Mặt Trời (Ban Ngày) và Mặt Trăng (Ban Đêm) huyền bí xuyên qua các khung.
  - Bảo toàn 100% độ đậm nét cho toàn bộ văn bản, hình thẻ bài nhân vật, nút bấm và badge kết quả (không làm mờ chữ và thẻ).
- **Dòng Đầu Tiên Bản Tin Thương Vong Luôn In Số Lượng & Danh Tánh Người Chết (`DayPhaseView.jsx`, `gameLogic.js`)**:
  - Dòng đầu tiên trong Bản Tin Thương Vong Trong Đêm luôn là một Banner nổi bật khẳng định:
    - Nếu có người chết: `Đêm qua có {N} người chết: {Tên 1 (#id), Tên 2 (#id)}.` (Ví dụ: `Đêm qua có 1 người chết: Ha vy (#2).`).
    - Nếu không ai chết: `Đêm qua bình yên, không có ai chết!`.
  - Toàn bộ các dòng mô tả diễn biến chi tiết (ai được Bảo Vệ che chở, ai được Phù Thủy cứu bằng thần dược, ai bị Sói Nguyền lây nhiễm,...) được hiển thị gọn gàng ở phần mô tả phía dưới.

## 14. Sửa Lỗi Luân Chuyển Vai Trò (Bán Sói, Sói Nguyền), Bộ Đếm Sói Động & Tinh Chỉnh Cờ Chiến Thắng
- **Loại Bỏ Nút X Thừa Ở Thẻ Soi Tiên Tri (`NightPhaseView.jsx`)**:
  - Đã loại bỏ nút đóng X ở thanh tiêu đề ngoài (`BẤM VÀO NGƯỜI ĐỂ LẬT THẺ BÀI:`), CHỈ GIỮ nút X tròn đỏ to nổi bật ở góc trên bên phải tấm thẻ bên trong theo đúng yêu cầu.
- **Sửa Lỗi Bộ Đếm Sói Khi Có Người Hóa Sói (`App.jsx`)**:
  - Khắc phục lỗi hiển thị tỷ lệ kỳ quặc `3/2 Sói`: Mẫu số trước đây chỉ đếm số thẻ sói tĩnh ban đầu trong deck (`totalWolvesInDeck = 2`).
  - Đã chuyển sang công thức động: `totalWolvesInGame = Math.max(initialWolvesInDeck, players.filter(isWolfPlayer).length)`. Khi có người bị lây nhiễm hoặc Bán Sói hóa Sói, mẫu số tự động tăng tương ứng (ví dụ: `3/3 Sói`). Nếu một con sói chết thì còn `2/3 Sói`.
- **Luân Chuyển Chuẩn Xác Vai Trò Nửa Người Nửa Sói (Bán Sói) (`NightPhaseView.jsx`, `gameLogic.js`)**:
  - Bổ sung `nua-nguoi-nua-soi` vào danh sách vai trò CHỈ GỌI NHẬN DIỆN ĐÊM 1 (`roundNumber === 1`). Từ Đêm 2 trở đi (`roundNumber > 1`), vai này hoàn toàn không còn xuất hiện trong quy trình gọi đêm.
  - Khi Bán Sói bị Ma Sói cắn trong đêm, người này thức tỉnh thành Ma Sói (`currentRoleId: 'soi-thuong'`, `roleId: 'soi-thuong'`, `isCursedWolf: true`), gia nhập đàn Sói và thức dậy cắn người cùng đàn Sói ở bước Bầy Ma Sói. Không còn yêu cầu gán lại vai trò Bán Sói ở các đêm sau.
- **Sửa Quyền Năng Sói Nguyền (Sói Quỷ) (`NightPhaseView.jsx`)**:
  - Xóa bỏ hoàn toàn khối code gán nhầm quyền năng Sói Nguyền vào bước Nửa Người Nửa Sói.
  - Chức năng Sói Nguyền CHỈ xuất hiện trong lượt Bầy Sói khi thỏa mãn đủ 3 điều kiện: (1) Trong bộ bài/ván đấu có thẻ Sói Nguyền (`soi-quy` / `nguoi-cha-cua-soi`), (2) Người giữ vai Sói Nguyền CÒN SỐNG, và (3) Chưa từng dùng quyền năng nguyền (`!nightState.cursedUsed`). Nếu Sói Nguyền đã chết thì mất hoàn toàn quyền năng nguyền.
- **Tinh Chỉnh Cờ Chiến Thắng & Logo Ma Sói Mobile (`GameOverModal.jsx`, `gameLogic.js`)**:
  - Đoạn text thông báo kết quả (ví dụ: `Số Ma Sói (2) đã áp đảo hoặc bằng Dân Làng (2).`) được rút ngắn súc tích, chữ font dày dặn (`font-bold text-xs sm:text-sm`), gom gọn gàng vào trung tâm dải vải cờ (`max-w-[80%] mx-auto`), không còn bị dạt ra 2 mép vải rách.
  - Trên mobile, logo đầu Ma Sói được dịch xuống dưới một khoảng hợp lý (`pt-3 sm:pt-4`), không còn bị dính sát thanh xà cừ ngang.
  - Bỏ hoàn toàn khung mờ bao quanh, hiển thị trực tiếp đầu sói to rõ nét và nổi bật trên mặt cờ.

## 15. Nhật Ký Biên Niên Sử Trận Đấu, Tinh Chỉnh Nút Tạo Bộ Bài, Tìm Kiếm Bộ Bài, Giao Diện Gán Vai & Role Thằng Ngốc
- **Quyển Nhật Ký Biên Niên Sử Ván Đấu (Diary Chronicles) (`App.jsx`, `MatchHistoryModal.jsx`, `db.js`)**:
  - Xây dựng hệ thống nhật ký thời gian thực `gameDiary`: ghi chép đầy đủ toàn bộ diễn biến ván đấu theo từng chặng nối tiếp: `Đêm 1 ➔ Ngày 1 ➔ Đêm 2 ➔ Ngày 2 ➔ ...`.
  - Khi xem Lịch sử đấu (`MatchHistoryModal.jsx`), diễn biến không còn là 1 dòng đơn điệu mà được hiển thị như một cuốn nhật ký biên niên sử cổ điển: phân chia rành mạch chặng Ban Đêm (icon Mặt Trăng tím) và chặng Ban Ngày (icon Mặt Trời vàng), ghi rõ ai bị cắn, ai được bảo vệ/cứu sống, ai bị làng biểu quyết treo cổ, Cảnh sát trưởng là ai.
- **Khắc Phục Nút "Tạo Bộ Bài Mới" Bị Broken Trên Mobile (`DeckTemplateModal.jsx`)**:
  - Tiêu đề modal được bổ sung `truncate` và `flex-1` để không chèn ép nút bấm.
  - Nút tạo mới được rút gọn text thành `+ Tạo Mới` với fixed size (`whitespace-nowrap shrink-0 h-8.5 px-3 text-xs`), loại bỏ hoàn toàn hiện tượng vỡ khung hay chữ bị gãy thành 4 dòng trên di động.
- **Tích Hợp Thanh Tìm Kiếm Nhỏ Gọn Trong Quản Lý Bộ Bài (`DeckTemplateModal.jsx`)**:
  - Màn hình danh sách template: Thêm ô tìm kiếm nhỏ gọn (`Tìm bộ bài...`) để lọc template tức thì theo tên hoặc mô tả.
  - Màn hình soạn thảo/chỉnh sửa template: Thêm ô tìm kiếm vai trò (`Tìm vai...`) ngay cạnh nhãn chọn số lượng để Quản trò lọc nhanh lá bài trong danh mục `ROLES`.
- **Giao Diện Gán Vai Mặc Định Tinh Gọn (Hình 4) (`RoleHolderBanner.jsx`, `NightPhaseView.jsx`)**:
  - Loại bỏ hoàn toàn khối `RoleClaimBox` dài ngoằng cồng kềnh đối với các vai đơn.
  - Chuẩn hóa giao diện gán vai mặc định theo đúng layout Hình 4: Dùng `RoleHolderBanner` tự động mở sẵn drawer lưới 2 cột (`grid grid-cols-2`) khi chưa có ai giữ vai để Quản trò bấm `[ Gán + ]` ngay; khi gán xong drawer tự thu gọn lại thành thanh 1 hàng tinh tế.
- **Tích Hợp Chuẩn Role Thằng Ngốc (`thang-ngoc`) (`NightPhaseView.jsx`, `App.jsx`, `roles.js`)**:
  - Cho phép Thằng Ngốc thức dậy nhận diện 1 lần duy nhất ở Đêm 1 (`wakeOrder: 3.2`, chỉ gọi khi `roundNumber === 1`) để Quản trò biết role và gán thẻ; từ Đêm 2 trở đi không gọi dậy nữa.
  - Kỹ năng ban ngày: Nếu Thằng Ngốc bị Làng biểu quyết treo cổ, hệ thống hiển thị thông báo cả làng tha thứ, Thằng Ngốc lật bài chứng minh (`isRevealedIdiot = true`), thoát chết và mất quyền biểu quyết từ đó về sau.

## 16. Chuẩn Hóa Layout Ma Trận Ghế, Loại Bỏ Thu Hà, Tinh Chỉnh Cờ Chiến Thắng, Roster & Thằng Ngố
- **Đồng Bộ Giao Diện Chọn Người Ma Trận Ghế & Slider Cho Toàn Bộ Nhân Vật (`PlayerSeatPicker.jsx`, `NightPhaseView.jsx`, `RoleClaimBox.jsx`)**:
  - Toàn bộ các bước chọn người (Bảo Vệ, Bầy Sói săn mồi, Bước nhận diện danh tính Ma Sói đêm đầu, Cupid, Tiên Tri) đều dùng chung **Layout Ma Trận Ghế (Theatre Seat Matrix)** và **Thanh Trượt (Slider)** đồng bộ tuyệt đối với layout của Cupid.
  - Mỗi vai trò có bảng tóm tắt mục tiêu (Summary Box) nổi bật ở đầu trang:
    - **Bảo Vệ**: Theme ngọc teal (`variant="protect"`), hiển thị mục tiêu bảo vệ đêm nay và cảnh báo cấm bảo vệ người của đêm trước.
    - **Bầy Sói (Săn mồi)**: Theme đỏ rose (`variant="wolf"`), hiển thị mục tiêu cắn 1 và mồi 2 (khi cuồng sát), panel Sói Nguyền lây nhiễm tức thì.
    - **Bước Nhận Diện Danh Tính Ma Sói (`RoleClaimBox.jsx`)**: Hiển thị slot các con Sói đã chọn. Nếu bộ bài có thẻ Sói Nguyền/Sói Quỷ, người được chọn đầu tiên (#1) tự động nhận vai `🔮 Sói Nguyền`, các slot tiếp theo nhận `🐺 Sói Thường`.
    - Phía dưới có nút hành động: `✕ Xóa chọn lại` và nút `🚫 Không Chọn / Xác Nhận`.
- **Loại Bỏ Vĩnh Viễn Tên "Thu Hà" Khỏi Hệ Thống (`defaultPlayers.js`, `App.jsx`)**:
  - Đã xóa triệt để tên "Thu Hà" khỏi mảng `DEFAULT_PLAYER_NAMES`.
  - Bổ sung bộ lọc sanitizer trong `App.jsx` tự động quét sạch và đổi bất kỳ bản ghi "Thu Hà" nào còn tồn đọng trong localStorage/cache trình duyệt sang `Người chơi #id`, đảm bảo không bao giờ xuất hiện lại trên bàn đấu.
- **Bó Gọn Văn Bản Cờ Chiến Thắng Vào Vùng Vải Trung Tâm (`GameOverModal.jsx`)**:
  - Giới hạn diện tích in nội dung cờ vào vùng an toàn: `left-[18%] right-[18%]` và `top-[20%] bottom-[18%]`.
  - Thêm `line-clamp` và font chữ responsive, loại bỏ triệt để hiện tượng chữ dòng `THẰNG NGỐ ĐƠN ĐỘC CHIẾN THẮNG!` và đoạn mô tả bị tràn lòi ra ngoài mép răng cưa của lá cờ.
- **Chuẩn Hóa Danh Sách Nhóm Người Chơi (`PlayerRosterModal.jsx`)**:
  - Rút gọn tiêu đề thành `LƯU TRỮ DANH SÁCH NGƯỜI CHƠI` (bỏ chữ `(NEON CLOUD)` / `(NEON DB)`).
  - Nút thêm mới đổi thành `Thêm Nhóm` (bỏ dấu `+` và chữ "Mới").
  - Nút áp dụng đổi thành `Dùng Nhóm Này` (bỏ ngoặc đơn số người vì đã có badge ở trên).
  - Bỏ icon avatar 2 người bên cạnh tiêu đề.
  - Ràng buộc logic số người: Số tên điền trong nhóm phải khớp chính xác với số lá bài trong bộ bài hiện tại (`deckSize`), hỗ trợ nút `Sửa` để chỉnh sửa trực tiếp từng nhóm.
- **Đổi Tên Vai Trò: Thằng Ngốc ➔ Thằng Ngố & Luật Thắng Treo Cổ Tức Thì (`roles.js`, `gameLogic.js`, `App.jsx`)**:
  - Đổi tên chính thức của vai trò thành **Thằng Ngố** (`ROLES.thang-ngoc.name = "Thằng Ngố"`).
  - Cập nhật logic: Nếu Thằng Ngố bị dân làng biểu quyết treo cổ vào ban ngày, ván đấu kết thúc ngay lập tức với chiến thắng độc tôn thuộc về Thằng Ngố (`THẰNG NGỐ ĐƠN ĐỘC CHIẾN THẮNG! 🃏`).
- **Lịch Sử Đấu Tinh Gọn & Modal Chi Tiết Riêng Biệt (`MatchHistoryModal.jsx`)**:
  - Chuyển giao diện lịch sử ván đấu thành danh sách lưới 2 cột tinh tế.
  - Khi bấm vào bất kỳ trận đấu nào, một sub-modal chi tiết riêng biệt sẽ mở lên, khắc phục triệt để hiện tượng nội dung hiển thị inline kéo dài vô tận gây khó chịu trên thiết bị di động.
- **Bỏ Số Người Trong Avatar Thống Kê & Custom Scrollbar (`PlayersGridView.jsx`, `index.css`)**:
  - Xóa bỏ số người lặp lại bên trong ô avatar của 4 card thống kê ở Sơ Đồ Bàn (Còn sống, Phe Sói, Phe Dân, Hy sinh), chỉ giữ icon chuyên biệt tinh tế.
  - Tích hợp `custom-scrollbar` thanh mảnh màu tím bóng mượt cho toàn bộ danh sách và lưới ghế.

## 17. Sửa Lỗi Đếm Số Ngày Lịch Sử Đấu, Modal Cài Đặt Luật Game & Đồng Bộ "Đang Dùng" / Sửa Nhóm Desktop
- **Sửa Triệt Để Lỗi Đếm Số Ngày & Sắp Xếp Nhật Ký Biên Niên Sử (`App.jsx`, `MatchHistoryModal.jsx`)**:
  - Khắc phục lỗi xuất hiện 2 lần "Ngày 1" xen kẽ "Đêm 1" và số vòng bị sai thành "1 vòng":
    - Xây dựng hàm `appendToDiary(timeline, newEntry)` tự động loại bỏ trùng lặp theo `phase` và sắp xếp các chặng chuẩn thứ tự thời gian: Đêm 1 ➔ Ngày 1 ➔ Đêm 2 ➔ Ngày 2... (Đêm luôn diễn ra trước Ngày trong cùng một vòng).
    - Tính toán chính xác số vòng tổng thể: `totalRounds = Math.max(roundNumber, totalNights, totalDays, 1)` và hiển thị chi tiết `{totalRounds} vòng ({totalNights} đêm, {totalDays} ngày)`.
- **Modal Cài Đặt Trò Chơi & Công Tắc Luật "Sói Cắn Đồng Loại" (`GameSettingsModal.jsx`, `NightPhaseView.jsx`, `App.jsx`)**:
  - Tạo mới `GameSettingsModal.jsx` với giao diện Gothic huyền bí, có nút `⚙️ Cài Đặt` trên thanh Header.
  - Công tắc iOS toggle: **"Ma Sói Có Thể Cắn Đồng Loại"** (`canWolvesKillTeammates`).
  - Ràng buộc an toàn: Khi thay đổi công tắc này, hệ thống hiển thị hộp thoại xác nhận bắt buộc thiết lập ván chơi mới (Reset Game về Đêm 1) để tránh xung đột dữ liệu logic giữa chừng.
  - Khi bật: Trong bước Bầy Sói săn mồi (`NightPhaseView.jsx`), các ghế Ma Sói không bị khóa, cho phép chọn cắn chính đồng loại, kèm thông báo badge màu tím cảnh báo Quản trò.
- **Đồng Bộ Trạng Thái "✓ Đang Dùng" Template Giữa Mobile & Desktop (`DeckTemplateModal.jsx`)**:
  - Bổ sung kiểm tra `activeTplId` từ `localStorage.getItem('werewolf_active_template_id')` song song với so sánh danh sách `roleIds`.
  - Khi áp dụng template bộ bài, lưu ngay key `werewolf_active_template_id`, đảm bảo cả desktop và mobile đều nhận diện chính xác nhãn `✓ Đang Dùng`.
- **Bổ Sung Nút Sửa Nhóm Người Rõ Ràng Trên Desktop (`PlayerRosterModal.jsx`, `PlayersGridView.jsx`, `App.jsx`)**:
  - Đổi nút `Tên` trên Header thành `Nhóm Người` trực quan.
  - Thêm nút hành động nhanh `[✏️ Sửa Nhóm Người]` nổi bật ngay trên thanh Sân Khấu Quản Trò tại tab `Sơ Đồ Bàn` (`PlayersGridView.jsx`).
  - Trong `PlayerRosterModal.jsx`, nút `[✏️ Sửa Nhóm]` được thiết kế dạng button tím viền sáng (`bg-purple-950/80 border-purple-600 font-bold`) để người dùng desktop bấm sửa tức thì.
- **Loại Bỏ Khung Thẻ Viền Ngoài Khổng Lồ Của Kịch Bản Đêm (`NightPhaseView.jsx`)**:
  - Bỏ toàn bộ lớp viền ngoài hộp card khổng lồ (`border-purple-900/60`, `rounded-3xl`, `shadow-2xl`, `p-4 md:p-6`, background gradient mờ), giúp giao diện Kịch Bản Đêm hiển thị thoáng đãng, đồng bộ hoàn toàn với phong cách phẳng trực tiếp của Ban Ngày (`DayPhaseView.jsx`).

## 18. Đồng Bộ Chuẩn Thiết Kế Cho Modal Quản Lý Nhóm & Khung Cảnh Báo Bước Đêm
- **Đồng Bộ Hoàn Toàn Giao Diện Modal Nhóm Người Chơi Với Quản Lý Bộ Bài (`PlayerRosterModal.jsx`)**:
  - **Header Modal**: Thêm icon hộp chứa `Users`, tiêu đề rút gọn `QUẢN LÝ NHÓM NGƯỜI CHƠI` co giãn theo kích thước màn hình tránh bị cắt chữ (`LƯU TRỮ DANH SÁ...`), nút thêm mới dùng chuẩn `GothicButton` với `icon={Plus}` và label `Thêm Nhóm`.
  - **Hành động thẻ nhóm**: Thay thế nút tím thô kệch `[ ✏️ Sửa Nhóm ]` bằng cặp nút hành động tinh tế đồng bộ tuyệt đối với `DeckTemplateModal`:
    - `[ 🗑 Xóa ]`: Text mờ nhạt, hover đỏ `text-slate-500 hover:text-rose-400`.
    - `[ ✏️ Sửa ]`: Text tím thanh lịch `text-purple-400 hover:text-purple-300`.
    - `[ Dùng Nhóm Này ➔ ]`: Dùng chuẩn `GothicButton` cỡ nhỏ (`size="sm"`), có mũi tên `ArrowRight` sang trọng.
- **Chuẩn Hóa Khung Cảnh Báo Kiểm Tra Bước Đêm (`NightPhaseView.jsx`)**:
  - Loại bỏ khối cảnh báo màu cam cháy (`bg-amber-950/80 border-amber-600/80`) và liên kết gạch chân thô sơ (`underline`).
  - Chuyển sang thẻ tối Gothic mờ sang trọng (`bg-[#141624]/90 backdrop-blur-md border border-amber-500/40`), có hộp icon cảnh báo chuyên dụng.
  - Nút **"Bỏ qua bắt buộc ➔"** được chuyển sang dùng chuẩn **`GothicButton` (variant `gold`, size `sm`)** ăn khớp 100% với hệ thống nút của Quản lý bộ bài.
  - Chuẩn hóa các nút "✕ Xóa chọn lại" bỏ text underline, dùng text button mượt mà.
- **Loại Bỏ Khung Viền To Bao Quanh Khu Vực Thao Tác Hành Động Đêm (`NightPhaseView.jsx`)**:
  - Đã loại bỏ hoàn toàn thẻ viền hộp bao bọc thứ hai (`p-5 rounded-3xl bg-[#0f111c] border border-purple-950/80 shadow-[0_4px_25px_rgba(0,0,0,0.6)]`) ở khu vực hành động của từng vai trò (Cupid, Bảo Vệ, Sói săn mồi, Tiên Tri...).
  - Giúp các phần tử (Ma trận ghế, hộp tóm tắt ghép đôi, bộ chọn người) hiển thị thẳng ra không gian trang thoáng đãng, loại bỏ hiện tượng đóng hộp kép (nested boxes) và tối ưu 100% diện tích chiều ngang cho thiết bị di động.

## 19. Tái Cấu Trúc Header Cố Định Tinh Gọn (Sticky Header Refinement)
- **Xóa Bỏ Triệt Để Hiện Tượng Xuống Dòng Vỡ Hàng Ở Header Mobile (`App.jsx`)**:
  - **Hàng 1 (Nhóm chức năng)**: Gom 6 nút rời rạc thành 3 cụm logic rõ ràng:
    - Nút an toàn `[ Reset Về 0 ]` (đỏ rose).
    - Cụm cấu hình `[ Bộ Bài | Nhóm Người ]` trong capsule tím obsidian sang trọng.
    - Cụm tiện ích `[ Cài Đặt | Lịch Sử | Thư Viện ]` trong capsule slate tối giản.
  - **Hàng 2 (Tabs & Chỉ số chiến trường)**: Loại bỏ `flex-wrap`, cố định **100% TRÊN 1 HÀNG DUY NHẤT**:
    - Tab Switcher: Co giãn thông minh (`Đêm 1` / `Sơ Đồ` trên mobile; `Kịch Bản Đêm 1` / `Sơ Đồ Bàn` trên desktop).
    - Bộ 3 chỉ số HUD (Sói, Dân, Chết): Đồng bộ chiều cao chuẩn (`h-7` mobile, `h-8` desktop), label tự co ngắn (`0/2`, `14`, `0 ➔` trên mobile) giúp toàn bộ chiều rộng chỉ ~285px, không bao giờ bị tràn xuống hàng thứ 3.
  - Tiết kiệm hơn 60px chiều cao màn hình di động, tạo cảm giác tinh gọn, hiện đại và cao cấp.

## 20. Tối Ưu Nút "Đi Ngủ" Tức Thì & Smart Scroll Hiding
- **Nút "Đi Ngủ" Ngay Tại Chỗ Khi Đã Chọn Xong (`NightPhaseView.jsx`)**:
  - Khi Quản trò hoàn thành thao tác chọn (Bảo vệ chọn 1 người, Sói chọn cắn mồi, Cupid ghép đủ 2 người, Tiên tri soi 1 người), nút hành động `[ Xác Nhận & Đi Ngủ 💤 ➔ ]` xuất hiện ngay bên dưới Ma trận ghế / bộ chọn mà không cần cuộn màn hình.
- **Smart Floating Advance Button Với IntersectionObserver (`NightPhaseView.jsx`)**:
  - Khi đã chọn xong (`stepValidation.isValid === true`), nếu người dùng đang ở trên cao (chưa cuộn tới thanh điều hướng gốc ở chân trang), một nút tròn nổi `[ Đi Ngủ 💤 ➔ ]` sẽ nổi ở góc dưới bên phải màn hình di động.
  - Sử dụng `IntersectionObserver` giám sát `originalFooterRef`: Ngay khi người dùng cuộn xuống dưới đáy trang và thanh điều hướng gốc xuất hiện trong tầm nhìn (`entry.isIntersecting === true`), nút nổi sẽ tự động mờ dần và ẩn đi (`opacity-0 pointer-events-none`) để chỉ hiển thị thanh điều hướng gốc duy nhất, hoàn toàn loại bỏ hiện tượng trùng lặp nút.

## 21. Hỗ Trợ Toàn Diện PWA Cho iPhone (iOS Standalone Web App)
- **Cấu Hình PWA & Apple iOS Meta Tags (`index.html`)**:
  - `apple-mobile-web-app-capable: yes` cho phép mở toàn màn hình (Standalone) không thanh URL Safari.
  - `apple-mobile-web-app-status-bar-style: black-translucent` cho thanh trạng thái trong suốt hòa vào nền game.
  - `apple-mobile-web-app-title: Quản Trò Ma Sói` hiển thị tên ứng dụng gọn gàng dưới icon màn hình chính.
  - `viewport-fit=cover` và các class `.ios-safe-top`, `.ios-safe-bottom` thích ứng hoàn hảo với tai thỏ / Dynamic Island và thanh gạt Home Bar của iPhone.
- **Tạo Bộ Icon Chuẩn Apple & Web Manifest (`public/`)**:
  - `apple-touch-icon.png` (180x180 px): Icon cao cấp sắc nét cho màn hình chính iPhone.
  - `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`: Bộ icon chuẩn PWA.
  - `manifest.json`: Khai báo thông tin PWA độc lập (display: standalone, theme-color: #07080d).
- **Service Worker Caching & Offline Ready (`public/sw.js`, `main.jsx`)**:
  - Đăng ký Service Worker lưu cache App Shell (HTML, icons, fonts, CSS, images), mở ứng dụng tức thì và dùng offline mượt mà.
- **Thẻ Hướng Dẫn Cài Đặt Cho iPhone Trong Modal Cài Đặt (`GameSettingsModal.jsx`)**:
  - Tự động nhận diện chế độ Standalone (`window.navigator.standalone`).
  - Cung cấp hướng dẫn trực quan 3 bước: Bấm Chia sẻ (Share ⎋) ➔ Chọn "Thêm vào MH chính" (Add to Home Screen ⊞) ➔ Thêm (Add).

## 22. Ưu Tiên Người Giữ Vai Bảo Vệ Đứng Đầu Ma Trận Ghế
- **Sắp Xếp Danh Sách Ghế Chọn Người Của Bảo Vệ (`NightPhaseView.jsx`)**:
  - Trong bước Bảo Vệ che chở ban đêm (`currentRole.id === 'bao-ve'`), hệ thống tự động tìm người chơi đang giữ vai Bảo Vệ (`(p.currentRoleId || p.roleId) === 'bao-ve'`) và đưa lên **vị trí đầu tiên (ô ghế #1 trên cùng bên trái)** của Ma trận ghế `PlayerSeatPicker`.
  - Các người chơi còn sống khác được xếp tiếp theo sau theo thứ tự số ghế thông thường.
  - Giúp Quản trò thao tác cực nhanh khi Bảo Vệ muốn tự bảo vệ chính mình (Self-protect) mà không cần phải tìm kiếm vị trí ghế của họ trong bàn.

## 23. Hệ Thống Phản Hồi Rung Haptic & Logic Toàn Diện Các Vai Đặc Biệt
- **Hệ Thống Phản Hồi Rung Xúc Giác & Web Audio Chime (`src/utils/haptics.js`)**:
  - Tích hợp `triggerHaptic(type)` đa nền tảng: phần cứng `navigator.vibrate` kết hợp cùng bộ âm tổng hợp Web Audio API (tactile audio clicks & chimes), bảo đảm hoạt động 100% trên iPhone / iOS WebKit và Android PWA.
  - **Hết giờ thảo luận 3-5 phút ban ngày**: Khi đồng hồ đếm ngược chạm 0, kích hoạt rung cảnh báo nhịp ba cấp thiết (`[350, 150, 350, 150, 600, 200, 600]`) và phát chuông báo Gothic, đồng thời hiển thị banner phát sáng *"HẾT GIỜ THẢO LUẬN! (RUNG & CHUÔNG BÁO)"* kèm nút rung lại.
  - Đếm ngược 5 giây cuối (5, 4, 3, 2, 1) có rung nhẹ `timer-tick`.
  - Thao tác chạm ghế (`PlayerSeatPicker.jsx`) rung xúc giác `tap`, bấm chuyển bước đêm (`NightPhaseView.jsx`) rung `confirm`.
- **Kị Sĩ Thách Đấu Quyết Đấu Ban Ngày (`ki-si`, `DayPhaseView.jsx`, `App.jsx`)**:
  - Kị Sĩ lật bài duy nhất 1 lần trong ván vào ban ngày trước giờ vote để thách đấu 1 người.
  - **Nếu mục tiêu là Ma Sói**: Sói lập tức bị chém chết tại chỗ, ngày kết thúc không cần biểu quyết treo cổ tiếp.
  - **Nếu mục tiêu là Dân Làng/Phe thiện**: Kị Sĩ ngã gục tử trận tại chỗ vì thách đấu sai lầm, làng tiếp tục biểu quyết bình thường.
- **Ảnh Tử (Bóng Ma) Thừa Kế Linh Hồn (`anh-tu`, `NightPhaseView.jsx`, `gameLogic.js`, `App.jsx`)**:
  - Đêm 1: Ảnh Tử thức dậy chọn 1 người chơi làm Bản Thể (`shadowHostId`).
  - Khi người Bản Thể bị chết (trong đêm bởi Sói/Phù Thủy hoặc ban ngày do Treo cổ/Quyết đấu): Ảnh Tử lập tức kế thừa lá bài và vai trò của người chết đó!
- **Hiệp Sĩ Kiếm Gỉ Nhiễm Độc Phục Thù (`hiep-si-kiem-gi`, `gameLogic.js`)**:
  - Khi Hiệp Sĩ Kiếm Gỉ bị Ma Sói cắn chết trong đêm, thanh kiếm gỉ làm nhiễm độc con Ma Sói sống gần nhất bên tay trái. Con Sói này sẽ phát độc chết vào đêm tiếp theo!
- **Người Thuần Phục Gấu Báo Động Ban Ngày (`nguoi-thuan-phuc-gau` / `than-gau`, `DayPhaseView.jsx`)**:
  - Tự động quét 2 người chơi còn sống ngồi sát bên trái và bên phải Thần Gấu theo vòng tròn bàn. Nếu có ít nhất 1 Ma Sói kề bên, hiển thị banner báo động nhấp nháy *"GẤU GẦM GỪZZZZ! CÓ MA SÓI NGỒI SÁT CẠNH!"*.

## 24. Audit Chuyên Sâu & Hoàn Thiện Logic Kỹ Năng Toàn Bộ Nhân Vật
- **Cáo (`cao`, `NightPhaseView.jsx`, `App.jsx`)**:
  - Mỗi đêm thức dậy chọn 1 tâm điểm. Hệ thống tự động tính nhóm 3 người liền kề theo vòng tròn bàn (trái, tâm điểm, phải).
  - Tự động kiểm tra: Nếu có Sói -> thông báo *"CÓ MA SÓI (Quản trò gật đầu)"* và Cáo giữ năng lực. Nếu không có Sói -> thông báo *"KHÔNG CÓ MA SÓI (Quản trò lắc đầu)"* và Cáo **mất vĩnh viễn năng lực** (`foxLostPower = true`, các đêm sau không gọi dậy nữa).
- **Sói Trắng (`soi-trang`, `NightPhaseView.jsx`, `gameLogic.js`)**:
  - Cứ 2 đêm 1 lần (Đêm chẵn: 2, 4, 6...), Sói Trắng thức dậy riêng một mình sau bầy Sói.
  - Có thể chọn cắn chết 1 con Ma Sói khác trong bầy hoặc bỏ qua. Nạn nhân chết trong đêm cùng đợt giải quyết thương vong.
- **Nguyệt Nữ (`nguyet-nu`, `NightPhaseView.jsx`, `App.jsx`)**:
  - Đầu mỗi đêm (Wake Order 0.5), Nguyệt Nữ thức dậy chọn 1 người chơi để khóa toàn bộ năng lực sử dụng ban đêm.
- **Con Quạ (`con-qua`, `DayPhaseView.jsx`)**:
  - Người bị Quạ gieo 2 phiếu phạt trong đêm được hiển thị huy hiệu tím nổi bật `🪶 Quạ phạt (+2)` ngay trên thẻ biểu quyết ban ngày.
- **Người Thế Thân (`nguoi-the-than`, `DayPhaseView.jsx`)**:
  - Bổ sung nút xử lý khi biểu quyết ban ngày hòa phiếu (Tie-vote): Người Thế Thân lập tức bị đưa lên giàn treo cổ chết thay theo luật chuẩn quốc tế.
- **Thiên Sứ / Thiên Thần (`thien-su`, `App.jsx`)**:
  - Kích hoạt chiến thắng ngay lập tức nếu bị Ma Sói cắn chết ở Đêm 1 hoặc bị biểu quyết treo cổ ở Ngày 1.

## 25. Tinh Giản Toàn Diện UI/UX & Loại Bỏ Thiết Kế Thừa (UI De-clutter)
- **Compact Hero Banner (`NightPhaseView.jsx`)**:
  - Thay thế thẻ Tarot to dọc 220px choán nửa màn hình bằng **Thanh Hero ngang tinh giản (~70px)**: Thumbnail thẻ bài (`w-12 h-16`), tên vai Cinzel, badge phe phái và câu hô quản trò trong 1 hàng duy nhất.
  - **Kết quả vượt trội**: Toàn bộ ma trận ghế ngồi (`PlayerSeatPicker`) hiện ngay trên màn hình đầu tiên (Above the fold), Quản trò không cần vuốt cuộn màn hình trên iPhone.
- **Xóa Sạch Đoạn Văn Hướng Dẫn Dài Dòng (Instructional Meta-Text)**:
  - Loại bỏ hoàn toàn các đoạn văn giải thích luật chơi ở từng bước vai (Bảo Vệ, Sói, Cupid, Đứa Trẻ Hoang Dã, Ảnh Tử, Thổi Sáo, Cáo, Sói Trắng, Nguyệt Nữ, Ban Ngày).
  - Giữ lại nhãn mục tiêu ngắn gọn, súc tích và trực quan.
- **Tự Động Ẩn Kho Bài (Deck Radar) Khi Đã Gán Đủ (`NightPhaseView.jsx`)**:
  - Khi tất cả người chơi đã được gán vai, thanh Kho Bài tự động ẩn khỏi giao diện gọi đêm, trả lại khoảng trống đỉnh màn hình.
- **Xóa Bỏ Thanh Trạng Thái Trùng Lặp Chân Trang (`NightPhaseView.jsx`)**:
  - Gỡ bỏ khối cảnh báo cố định lặp lại phía trên footer. Chỉ giữ lại nút bấm *"Bỏ qua bước này (Quản trò ghi đè)"* tối giản khi cần thiết.
- **Gọt Bớt Khối Bản Tin Thương Vong Ban Ngày (`DayPhaseView.jsx`)**:
  - Hợp nhất các hộp lồng nhau thành 1 banner thống nhất, xóa bỏ các câu văn thừa ở phần tiêu đề và biểu quyết.

## 26. Xử Lý Chuẩn Xác Vai Chức Năng Bị Nguyền Thành Sói (Cursed Functional Roles)
- **Chuẩn Hóa Danh Xưng & Vai Trò Khi Bị Nguyền (`src/utils/roleUtils.js`)**:
  - Khi một người chơi có vai chức năng (Tiên Tri, Bảo Vệ, Phù Thủy, Kị Sĩ, Cáo, Con Quạ, Dân Làng...) bị Sói Nguyền / Sói Quỷ đồng hóa lây nhiễm (`isCursedWolf: true`):
  - Hàm `getPlayerRole(player)` tự động sinh tên vai trò hiển thị chuẩn: **`Sói (<Tên vai gốc> bị nguyền)`** (ví dụ: `Sói (Tiên Tri bị nguyền)`, `Sói (Bảo Vệ bị nguyền)`, `Sói (Cáo bị nguyền)`).
- **Loại Bỏ Hoàn Toàn Logic Gán Lại Cho Người Khác (`src/components/RoleHolderBanner.jsx`, `src/App.jsx`)**:
  - Khi vai trò bị loại do người giữ bài ban đầu đã biến thành Sói:
  - `RoleHolderBanner`: Nhận diện vai đã bị loại khỏi làng (`isRoleCursedOut = true`), hiển thị badge tím `Vai bị loại: Tên (#Ghế) ● Đã hóa Sói 🐺🔮` và huy hiệu `Trúng Lời Nguyền`.
  - Tuyệt đối không cho phép gán lại vai này cho người khác.
- **Giữ Lượt Gọi Ban Đêm Giả Vờ Cho Quản Trò (`src/components/NightPhaseView.jsx`)**:
  - Quản trò vẫn gọi tên vai trò ban đêm theo kịch bản để che giấu danh tính, hiển thị banner hướng dẫn và nút bấm lớn **`Đã Gọi Xong & Cho Đi Ngủ 💤`**.

## 27. Sửa Lỗi Bán Sói Bị Cắn Trước Tiên Tri, Tối Ưu Modal Cài Đặt Mobile & Đơn Giản Hóa Hộp Chuyền Máy Sói
- **Xử Lý Bán Sói (Nửa Người Nửa Sói) Bị Cắn Trước Khi Gọi Tiên Tri (`NightPhaseView.jsx`, `gameLogic.js`)**:
  - Ngay trong đêm đó, khi Tiên Tri soi Bán Sói đã bị cắn, hệ thống lập tức hiển thị nhãn đỏ: **`🐺 Là Ma Sói`** kèm dòng ghi chú rõ: *(Bán Sói đã bị bầy Sói cắn đêm nay ➔ Đã thức tỉnh thành Ma Sói!)*.
  - Khi hết đêm (`resolveNightPhase`), Bán Sói sống sót và chuyển hóa hoàn toàn thành Ma Sói (`isCursedWolf: true`).
- **Khắc Phục Lỗi Modal Cài Đặt Tràn Màn Hình Mobile (`GameSettingsModal.jsx`)**:
  - Giới hạn chiều cao an toàn trên di động: `max-h-[88dvh] flex flex-col my-auto`.
  - Header và Footer cố định (`shrink-0`), nội dung thân modal cuộn mượt mà (`overflow-y-auto overscroll-contain`).
  - Hướng dẫn PWA iOS mặc định thu gọn, đóng modal nhanh bằng cách chạm ngoài backdrop.
- **Tinh Giản Triệt Để Hộp Chuyền Máy Của Bầy Sói (`WolfWhisperBox.jsx`, `NightPhaseView.jsx`)**:
  - Thu gọn mặc định thành thanh nhỏ gọn ~38px. Xóa bỏ ô gõ chữ phức tạp, chuyển sang 1-chạm: Chọn con mồi ➔ Bấm *"Chuyền Cho Sói Kế Tiếp ➔"* hoặc *"Chốt Con Mồi Này Cho Cả Bầy 🩸"*.

## 28. Di Chúc Cảnh Sát Trưởng 1 Bước, Audit Các Vai Chết Gọi Có Lệ & Fix Sói Bằng Người Thắng Cuộc
- **Gộp Di Chúc Kế Nhiệm Cảnh Sát Trưởng Vào 1 Modal Duy Nhất (`SheriffSuccessionModal.jsx`, `App.jsx`, `DayPhaseView.jsx`)**:
  - **Khử bỏ modal alert 2 bước phiền phức**: Xóa bỏ hoàn toàn popup xác nhận rườm rà. Khi Cảnh Sát Trưởng hy sinh (bị treo cổ ban ngày hoặc bị cắn trong đêm), hệ thống lập tức mở thẳng modal **`SheriffSuccessionModal`** hiển thị trực tiếp danh sách tất cả người chơi còn sống.
  - **1-Chạm trao huy hiệu tức thì**: Quản trò chỉ cần chạm 1 lần vào thẻ người chơi mong muốn để chuyển giao huy hiệu Cảnh Sát Trưởng (phiếu x2) và tự động đóng modal.
  - **Chặn tuyệt đối không cho đi ngủ nếu chưa gán CST kế nhiệm**: Nút *"HẾT NGÀY ➔ BAN ĐÊM"* tự động kiểm tra: Nếu Cảnh Sát Trưởng cũ đã qua đời mà chưa trao lại huy hiệu cho người sống khác, hệ thống sẽ rung haptic cảnh báo và bung modal bắt buộc (`isMandatory: true`), yêu cầu di chúc trao huy hiệu trước khi cả làng đi ngủ.
- **Audit Toàn Diện Các Vai Đã Chết Gọi Có Lệ Ban Đêm (`NightPhaseView.jsx`)**:
  - Khi người chơi giữ vai chức năng (Bảo Vệ, Tiên Tri, Phù Thủy, Cáo, Con Quạ, Nguyệt Nữ, Sói Trắng, Người Thổi Sáo...) đã chết (`isDeadRole: true`):
  - **Ẩn sạch toàn bộ ma trận chọn mục tiêu / thuốc cứu / thuốc độc**: Không còn hiển thị ma trận ghế ngồi hay nút bấm dùng bình gây hiểu lầm cho Quản trò.
  - **Hiển thị Banner "NGƯỜI GIỮ VAI ĐÃ HY SINH (GỌI CÓ LỆ THEO KỊCH BẢN) 💀💤"**: Nhắc Quản trò đọc to câu gọi `{currentRole.gmCall}` và đếm thầm 3-5 giây để giữ kín bí mật cho thế trận, kèm nút bấm duy nhất **`Đã Gọi Xong & Cho Đi Ngủ 💤`** để lướt qua nhanh chóng.
- **Khắc Phục Lỗi Sói Bằng Người Nhưng Chưa Kết Thúc Game (`App.jsx`, `gameLogic.js`)**:
  - Bổ sung **Reactive Game End Evaluator** (`useEffect` trong `App.jsx` theo dõi `players`): Tự động đánh giá ngay lập tức điều kiện thắng thua bất cứ khi nào danh sách người chơi thay đổi (nguyền, chết, hồi sinh, đổi vai, gán vai).
  - Trong nhánh `curse_convert`: Kích hoạt ngay `evaluateGameEnd` khi một người bị Sói Nguyền lây nhiễm thành Ma Sói, đảm bảo nếu số Sói đạt ngưỡng cân bằng hoặc áp đảo Dân Làng (`aliveWolves >= aliveVillagers`), modal **Phe Ma Sói Chiến Thắng** nổ ra ngay tức khắc.
  - Đảm bảo 100% test case logic (Sói bằng Người 2v2, Nguyền thêm Sói 2v2, Bán Sói thức tỉnh 2v1) đều chạy PASS.












