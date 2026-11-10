# UI/UX & Design Rules — Werewolf Moderator Web App

Tài liệu quy định bắt buộc về thiết kế giao diện (UI/UX) cho công cụ Quản trò Ma Sói. Mọi tính năng, màn hình và component mới BẮT BUỘC phải tuân thủ nghiêm ngặt các quy tắc này.

---

## 1. Zero Layout Shift (CLS = 0) & Stable Geometry (Ổn Định Hình Học)
- **Tuyệt đối KHÔNG chèn thêm banner / khối alert đẩy layout**: Khi người dùng thao tác chọn người chơi (ví dụ Cupid chọn cặp đôi, Tiên Tri soi, Phù Thủy chọn bình), **TUYỆT ĐỐI KHÔNG render thêm các khối div/banner giải thích đột ngột xuất hiện làm đẩy tụt (push down) các component/control tương tác phía dưới** (như ma trận ghế, bàn phím, nút bấm).
- **Trải nghiệm thao tác (Muscle Memory)**: Vị trí của các nút bấm và ma trận ghế phải đứng yên tuyệt đối, tránh hiện tượng giật cục gây cảm giác "nhôm nhựa", rẻ tiền và gây bấm trượt nhầm.
- **Phản hồi trạng thái Inline & Cố định chiều cao**:
  - Nếu cần hiển thị trạng thái (ví dụ: Cặp đôi khác phe thành Phe Thứ 3 hay cùng phe), **CHỈ ĐƯỢC dùng 1 chip/badge inline nằm ngay trên hàng tiêu đề sẵn có** (ví dụ: `🔥 Phe Thứ 3 (1 Sói + 1 Dân)`), không mở thêm bất kỳ dòng hay khối alert mới nào.
  - Các ô card tóm tắt (như `Người Yêu 1`, `Người Yêu 2`) phải có chiều cao đồng nhất, dù đã chọn hay chưa chọn người.

---

## 2. Loại Bỏ Hoàn Toàn Meta-Text "AI-Style" & Giải Thích Luật Rườm Rà
- **Không viết text dạy luật chơi trong màn hình thao tác**: Quản trò là người điều khiển ván đấu. Ứng dụng đã có riêng **Thư viện thẻ bài (`RoleLibraryModal`)** để tra cứu luật.
- **Cấm các đoạn văn mô tả thừa thãi**:
  - ❌ *CẤM*: "Hai người này lập thành một phe độc lập. Điều kiện thắng duy nhất của họ là tiêu diệt toàn bộ người chơi còn lại trong làng..."
  - ❌ *CẤM*: "Họ vẫn chiến thắng theo phe gốc của mình nhưng cùng chia sẻ số phận sinh tử..."
  - ❌ *CẤM*: "Hãy chọn 2 người bất kỳ dưới đây để kết duyên..."
  - ✅ *ĐÚNG*: Để giao diện và dữ liệu tự lên tiếng. Chỉ hiển thị thông tin nghiệp vụ trực tiếp: Tên người chơi, số ghế, vai trò, trạng thái.
- **Cấm Nút Bấm & Nhãn "Over-Explained" (Người dùng hiểu luật, không cầm tay chỉ việc)**:
  - ❌ *CẤM*: "🔮 Nguyền Thu Hà Thành Sói & Cắn Tiếp ➔", "Xác Nhận Treo Cổ Người Này (Chỉ 1 người)", "🚫 Đêm Nay Bỏ Qua (Chưa Dùng)".
  - ✅ *ĐÚNG*: Ngắn gọn, chuẩn xác, đủ nghĩa: "🔮 Nguyền thành Sói", "Xác nhận treo cổ", "Bỏ qua", "Xác nhận (2/2) ✓".
- **Nút Đặt Lại / Xóa Chọn Lại Phải Đặt Ở Dưới Cùng (Zero Shift Reset Buttons)**:
  - Các nút hành động xuất hiện theo điều kiện (như `✕ Xóa chọn lại` khi chọn người) **BẮT BUỘC đặt ở đáy khu vực chọn** (bên dưới ma trận ghế) hoặc nằm trong flex container có chiều cao cố định.
  - **TUYỆT ĐỐI KHÔNG chèn nút vào giữa tiêu đề và phần mô tả/ghế ngồi**, tránh làm đẩy component bên dưới xuống gây giật khựng màn hình.
- **Không Gán Vai / Đoán Phe Giả Lập Cho Người Chưa Có Vai**:
  - Khi một người chơi chưa được gán vai trò (`currentRoleId === null`), **TUYỆT ĐỐI KHÔNG tự tiện fallback thành `Dân` hay `Dân làng`**. Phải hiển thị trung thực là `Chưa lộ vai` hoặc `Chưa gán vai`.
  - Không được tính toán phe phái non nớt (ví dụ khi Cupid ghép đôi ở Đêm 1 mà hầu hết người chơi chưa lộ vai thì không được phán bừa là "Cùng phe Dân" hay "Phe thứ 3").

## 3. Nút Thao Tác Ngắn Gọn & Bottom Clearance Trên Mobile
- **Nút hành động chuyển bước súc tích**:
  - Dùng nhãn ngắn gọn, tập trung vào hành động cốt lõi: **`Đi Ngủ 💤`** thay vì những chuỗi text dài lê thê làm choán hết chiều rộng màn hình như `Cho Nửa Người Nửa Sói (Bán Sói) Ngủ & Tiếp Tục 💤`.
- **Khoảng trống đáy (Bottom Clearance `pb-24`)**:
  - Mọi container nội dung cuộn bên trên thanh Bottom Action Bar cố định (sticky footer) BẮT BUỘC phải có khoảng đệm tối thiểu `pb-24 sm:pb-8` để khi người dùng cuộn kịch sàn, toàn bộ banner cảnh báo và thông tin ở đáy trang không bị thanh bar che khuất hay đè lên.

---

## 3. Dark Gothic Minimalism & Thẩm Mỹ Cao Cấp (No Cheap / "Nhôm Nhựa" UI)
- **Bảng màu chủ đạo**: Nền đen tuyền huyền bí (`#07080d`, `#0b0c16`), khung thẻ dark slate (`#101322`, `#120d20`).
- **Phân định Phe phái bằng Viền Tinh Tế & Ánh Sáng Neon Nhẹ**:
  - **Phe Ma Sói**: Viền hồng ngọc / đỏ sẫm (`border-rose-600/80`, bóng đổ nhẹ `shadow-[0_0_15px_rgba(225,29,72,0.35)]`).
  - **Phe Dân Làng / Thần**: Viền tím thẫm / xanh lam (`border-purple-800/80`, `border-blue-500/60`).
  - **Cặp đôi Tình yêu**: Hồng sen / tím neon (`border-pink-500`, tim `Heart` nhỏ gọn).
- **Bo góc hiện đại đồng nhất**:
  - `rounded-xl` cho các nút bấm, item danh sách nhỏ.
  - `rounded-2xl` cho các card chính, container.

---

## 4. Mobile One-Screen Viewport First (Tối Ưu 1 Màn Hình)
- Ưu tiên hiển thị trọn vẹn toàn bộ các tương tác trong tầm nhìn của 1 màn hình điện thoại (không phải cuộn qua cuộn lại nhiều lần).
- Ma trận ghế (`PlayerSeatPicker`) tích hợp cả 2 chế độ:
  - **Ma Trận Ghế**: Xem toàn cảnh tất cả ghế ngồi cùng lúc.
  - **Thanh Trượt (Slider)**: Vuốt ngang mượt mà, không kéo dài trang web theo chiều dọc.
