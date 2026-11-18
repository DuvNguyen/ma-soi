# Quản Trò Ma Sói (One Night & Classic Werewolf Game Assistant)

Ứng dụng web hỗ trợ Quản Trò (Game Master) điều phối ván bài Ma Sói nhanh, tiện lợi và không bị nhầm lẫn hay bỏ sót nhân vật.

## ✨ Tính Năng Nổi Bật

- 🐺 **Quy Trình Gọi Đêm Tuần Tự (Guided Night Wizard)**:
  - Tự động sắp xếp thứ tự gọi các nhân vật theo đúng quy chuẩn ban đêm (Ảnh Tử ➔ Cupid ➔ Bảo Vệ ➔ Sói Nguyền ➔ Bầy Ma Sói ➔ Tiên Tri ➔ Phù Thủy...).
  - Quản trò không bao giờ sợ quên bước hay đọc sai khẩu lệnh.
- 🩸 **Hộp Nhắn Tin Bí Mật Của Bầy Sói (Wolf Whisper Box)**:
  - Cơ chế **chuyền máy cho từng con Sói** trong im lặng (không cần nói để lộ giọng).
  - **Bộ đếm thời gian 25 giây** cho mỗi con Sói (có thể chỉnh thành 15s, 20s, 30s, 45s, 60s trong cài đặt).
  - Sói chọn mục tiêu cắn và để lại lời nhắn bí mật cho đồng bọn.
  - Tự động tổng hợp ý kiến đồng thuận của bầy Sói.
- 🔮 **Giao Diện Dark Gothic & Viền Đỏ Nổi Bật Cho Phe Sói**:
  - Tông màu ma mị huyền bí (Tím Phù Thủy, Đen Obsidian, Đỏ Huyết Nguyệt).
  - Tất cả người chơi hoặc thẻ bài thuộc Phe Sói đều có **viền ánh đỏ phát sáng** để Quản trò nhận diện ngay trong bóng tối.
- ⚖️ **Luật Biểu Quyết Ban Ngày Chuẩn**:
  - Mỗi buổi sáng chỉ được biểu quyết treo cổ **tối đa 1 người**.
  - Có tính năng kích hoạt quyền năng Thẩm Phán Lắp Bắp (treo thêm lượt 2) và tính năng tha bổng Thằng Ngốc.
  - Đồng hồ đếm ngược thảo luận làng (3 phút / 5 phút).
- ☁️ **Lưu Trữ Neon Database (Postgres & Realtime)**:
  - Lưu và tải các mẫu bộ bài (Deck Templates) tùy chỉnh theo số lượng người chơi.
  - Lưu danh sách người chơi (Roster) theo nhóm để không phải nhập lại tên mỗi lần chơi.
  - Đồng bộ trạng thái ván game liên tục.
- 📱 **Mobile-First & Responsive Đa Thiết Bị**:
  - Đã được kiểm thử tự động với Playwright trên iPhone SE, iPhone 14/15/16 Pro, Samsung Galaxy, Pixel và iPad.

## 🚀 Cài Đặt & Khởi Chạy

```bash
# Cài đặt thư viện
npm install

# Khởi chạy môi trường phát triển
npm run dev

# Build bản production
npm run build
```

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide Icons
- **Backend / Database**: Neon Postgres (Serverless driver `@neondatabase/serverless`)
- **Testing**: Playwright (Mobile Device Auditing)

## 🎨 Role Art Pipeline (Tối Ưu Ảnh Thẻ Bài & Avatar)

Dự án sử dụng WebP tối ưu hóa cao cho 49 thẻ vai trò (Full Card 360×540 px & Avatar vuông 160×160 px):

```bash
# Xử lý và nén ảnh sang định dạng WebP chuẩn
npm run build:art
```

- **Quy ước đặt tên**: File ảnh được đặt theo `role.id` (ví dụ: `public/cards/<role.id>.webp` và `public/cards/avatars/<role.id>.webp`).
- **Tự động crop thông minh**: Avatar vuông 160×160 sử dụng thuật toán crop `attention` của `sharp` để giữ nét mặt nhân vật và giảm dung lượng tải trang.
