# Báo Cáo Hiện Trạng Giao Diện (UI/UX Presentation Audit)
**Dự án**: Werewolf Moderator (Quản Trò Ma Sói)  
**Công nghệ**: React 19 + Tailwind CSS v4 + Lucide Icons + Vite 8  
**Phạm vi**: Lớp Presentation (Toàn bộ component `src/components/**`, `src/App.jsx`, `src/context/GothicDialogContext.jsx`, `src/index.css`, `public/`, `docs/images/cards/`)  
**Mục tiêu**: Khảo sát đo lường hiện trạng định lượng phục vụ xây dựng Design System thống nhất (CLS = 0, Mobile-First, Accessible).

---

## 1. Tóm Tắt Điều Hành (Executive Summary)

1. **Token Sprawl & Phân Mảnh Giá Trị Tự Do**: Hệ thống hoàn toàn không có khối `@theme` hoặc CSS Custom Properties cho Design Tokens; có tới **578 lần sử dụng mã màu hex tự do (arbitrary values)** với **283 sắc thái hex khác nhau** rải rác trực tiếp trong JSX.
2. **Né Tránh Component Chuẩn & Bẫy Vùng Chạm Mobile**: Component [GothicButton.jsx](file:///projects/werewolf/src/components/ui/GothicButton.jsx) chỉ được dùng 51 lần, trong khi có tới **234 thẻ `<button>` viết thô** (chiếm 82.1%); ít nhất **22 vị trí nút bấm có chiều cao < 44px** (nhiều nút thanh công cụ chỉ đạt 24px `h-6`, vi phạm nghiêm trọng chuẩn Apple HIG/WCAG).
3. **Loạn Thang Chữ & Đảo Ngược Cấp Bậc Heading**: Tồn tại **13 cỡ chữ khác nhau** với **329 lần sử dụng cỡ chữ siêu nhỏ (< 12px)**; thẻ tiêu đề cấp cao nhất `<h1>` tại [App.jsx:1366](file:///projects/werewolf/src/App.jsx#L1366) bị gán kích thước siêu nhỏ `text-xs font-black`, trong khi các thẻ `<h2>` và `<h3>` ở màn hình con nhảy loạn xạ từ `text-xs`, `text-sm` đến `text-2xl`.
4. **Vắng Bóng Khả Năng Tiếp Cận (A11Y Zero-State)**: Chỉ **8.5% nút bấm (20/234)** có thuộc tính `aria-label`; **0 vị trí nào dùng `focus-visible:`** (người dùng bàn phím bị tước đoạt chỉ báo con trỏ) và **0 vị trí nào dùng `motion-reduce:`** để bảo vệ người dùng nhạy cảm tiền đình.
5. **Định Dạng Ảnh Hỗn Hợp & Nguy Cơ CLS**: Thư mục thẻ bài chứa **49 ảnh thẻ** nhưng lưu trữ ở 4 định dạng lộn xộn (`.jpg`, `.PNG`, `.png`, `.jpeg`), không có bất kỳ ảnh hiện đại WebP/AVIF nào; 100% thẻ `<img>` không khai báo kích thước cứng `width/height` tự nhiên và thiếu cờ `loading="lazy"`.

---

## 2. Chi Tiết Thu Thập Định Lượng

### 2.1. Design Tokens Hiện Có

#### Kiểm Tra Khối `@theme` & CSS Variables
- Trong [src/index.css](file:///projects/werewolf/src/index.css):
  - `@theme`: **Không tìm thấy** (không tồn tại khối `@theme` của Tailwind v4).
  - CSS Variables: Chỉ có 1 biến toàn cục mặc định `:root { color-scheme: dark; }` (Dòng 5-7). Hoàn toàn **không có biến CSS** cho `--color-*`, `--font-*`, `--spacing-*`, `--radius-*` hay `--shadow-*`.
  - Khai báo utility thủ công:
    - Font classes: `.font-cinzel` (Dòng 52-54), `.font-mono` (Dòng 56-58), `.font-kinhdi` (Dòng 65-67).
    - Animation: `.animate-banner-drop` (Dòng 86-88), `.animate-stamp-in` (Dòng 109-111).
    - Scrollbar: `.custom-scrollbar` (Dòng 137-154).
    - Safe-area utilities: `.ios-safe-top`, `.ios-safe-bottom`, `.modal-safe-overlay` (Dòng 38-50).

#### Arbitrary Values Trong JSX/CSS
- Tổng số lần xuất hiện mã màu hex trong mã nguồn `src`: **811 lần** (trên 62 files).
- Tổng số lần dùng cú pháp arbitrary color class trong JSX (`bg-[#...]`, `text-[#...]`, `border-[#...]`): **578 lần** với **283 mã màu hex độc nhất**.
- **Bảng Top 15 Mã Màu Hex Tự Do Xuất Hiện Nhiều Nhất Trong JSX**:

| Hạng | Mã Màu Hex | Số lần xuất hiện | Ví dụ File:Dòng | Ngữ cảnh sử dụng thực tế |
| :--- | :--- | :---: | :--- | :--- |
| 1 | `#121422` | 32 | [DayVotingSection.jsx:136](file:///projects/werewolf/src/components/day/DayVotingSection.jsx#L136) | Nền card/ghế chưa chọn |
| 2 | `#14121e` | 20 | [RoleClaimBox.jsx:138](file:///projects/werewolf/src/components/RoleClaimBox.jsx#L138) | Nền khu vực gán vai |
| 3 | `#faebd7` | 17 | [ActionModal.jsx:254](file:///projects/werewolf/src/components/ActionModal.jsx#L254) | Màu viền parchment giả cổ |
| 4 | `#542d13` | 14 | [ActionModal.jsx:260](file:///projects/werewolf/src/components/ActionModal.jsx#L260) | Viền gỗ hộp thoại |
| 5 | `#3b1206` | 14 | [ActionModal.jsx:265](file:///projects/werewolf/src/components/ActionModal.jsx#L265) | Nền gradient nâu đỏ cổ |
| 6 | `#2b1207` | 14 | [ActionModal.jsx:272](file:///projects/werewolf/src/components/ActionModal.jsx#L272) | Nền đậm hộp thoại thẻ bài |
| 7 | `#30180c` | 14 | [ActionModal.jsx:276](file:///projects/werewolf/src/components/ActionModal.jsx#L276) | Nền trung gian hộp thoại |
| 8 | `#0f111d` | 10 | [NightStepHeader.jsx:116](file:///projects/werewolf/src/components/night/NightStepHeader.jsx#L116) | Nền card Hero bước đêm |
| 9 | `#120204` | 10 | [NightWerewolvesStep.jsx:87](file:///projects/werewolf/src/components/night/NightWerewolvesStep.jsx#L87) | Đáy gradient thẻ Ma Sói |
| 10 | `#141624` | 10 | [DayPhaseView.jsx:153](file:///projects/werewolf/src/components/DayPhaseView.jsx#L153) | Nền card sự kiện ban ngày |
| 11 | `#0a0c16` | 9 | [NightPhaseView.jsx:234](file:///projects/werewolf/src/components/NightPhaseView.jsx#L234) | Nền tổng thể kịch bản đêm |
| 12 | `#181a2e` | 9 | [DeckTemplateModal.jsx:322](file:///projects/werewolf/src/components/DeckTemplateModal.jsx#L322) | Nền modal bộ bài |
| 13 | `#18080a` | 8 | [ActionModal.jsx:1198](file:///projects/werewolf/src/components/ActionModal.jsx#L1198) | Nền hành động Sói cắn |
| 14 | `#10121d` | 8 | [UnifiedGameSetupModal.jsx:898](file:///projects/werewolf/src/components/UnifiedGameSetupModal.jsx#L898) | Nền danh sách người chơi |
| 15 | `#111320` | 7 | [NightStickyFooter.jsx:112](file:///projects/werewolf/src/components/night/NightStickyFooter.jsx#L112) | Nền footer cố định bước đêm |

#### Khảo Sát Font Chữ
- **Nguồn nhúng**: [index.html:24-25](file:///projects/werewolf/index.html#L24-L25):
  - Google Fonts: `Cinzel (600, 700, 800, 900)`, `Creepster`, `Nosifer`, `Inter (400, 500, 600, 700)`, `JetBrains Mono (400, 500, 600, 700)`.
  - Local font: `@font-face { font-family: 'TH Kinhdi 1'; src: local('TH Kinhdi 1'); }` ([src/index.css:61-63](file:///projects/werewolf/src/index.css#L61-L63)).
- **Khả năng hỗ trợ tiếng Việt**:
  - `Inter`: Hỗ trợ đầy đủ bộ dấu tiếng Việt tiêu chuẩn (Latin Extended).
  - `JetBrains Mono`: Hỗ trợ đầy đủ bộ dấu tiếng Việt trong bảng mã lập trình.
  - `Cinzel`: **Không hỗ trợ đầy đủ tiếng Việt**. Khi render các ký tự có dấu phức (ư, ơ, ẫ, ệ, ộ...), trình duyệt buộc phải fallback về font serif hệ thống hoặc chắp vá glyph khiến nét chữ bị biến dạng, lệch độ dày nét.
  - `Creepster` & `Nosifer`: Hoàn toàn không hỗ trợ tiếng Việt, chỉ có ký tự ASCII tiếng Anh cơ bản.
  - `TH Kinhdi 1`: Định nghĩa `src: local(...)`, trên 100% thiết bị di động của người dùng (iOS/Android) không có sẵn font này nên lệnh này hoàn toàn vô hiệu.

---

### 2.2. Type Scale (Thang Kiểu Chữ)

#### Thống Kê Các Lớp Kích Thước Chữ Trong JSX
Tổng số kích thước chữ khác nhau được sử dụng: **13 kích cỡ**.

| Cỡ Chữ | Tên Lớp Tailwind | Số lần xuất hiện | Đánh giá phân loại |
| :--- | :--- | :---: | :--- |
| 8px | `text-[8px]` | 9 | Micro (Vi phạm accessibility) |
| 9px | `text-[9px]` | 31 | Micro (Vi phạm accessibility) |
| 10px | `text-[10px]` | 152 | Micro (Khó đọc trên mobile trong tối) |
| 11px | `text-[11px]` | 137 | Micro (Lệch chuẩn thang điểm) |
| 12px | `text-xs` | 546 | Chuẩn Body Small |
| 14px | `text-sm` | 163 | Chuẩn Body Regular |
| 16px | `text-base` | 20 | Chuẩn Body Large |
| 18px | `text-lg` | 9 | Sub-heading |
| 20px | `text-xl` | 15 | Heading 3 |
| 24px | `text-2xl` | 7 | Heading 2 |
| 30px | `text-3xl` | 2 | Display Small |
| 36px | `text-4xl` | 1 | Display Medium |
| 60px | `text-6xl` | 1 | Display Large ([GameOverModal.jsx:38](file:///projects/werewolf/src/components/GameOverModal.jsx#L38)) |

> **Cảnh báo**: Có tới **329 lần sử dụng cỡ chữ dưới 12px** (`[8px]`, `[9px]`, `[10px]`, `[11px]`). Điều này gây nhức mắt nghiêm trọng cho Quản trò khi vận hành trong phòng tối.

#### Thống Kê Độ Dày Font (Font Weight)

| Độ Dày | Lớp Tailwind | Số lần xuất hiện | Tỉ lệ (%) | Đánh giá |
| :--- | :--- | :---: | :---: | :--- |
| Regular (400) | `font-normal` | 9 | 1.1% | Cực kỳ hiếm dùng |
| Medium (500) | `font-medium` | 47 | 5.7% | Ít dùng |
| Semibold (600) | `font-semibold` | 66 | 8.0% | Dùng cho nhãn phụ |
| Bold (700) | `font-bold` | 577 | 70.3% | Chiếm đa số áp đảo |
| Black (900) | `font-black` | 122 | 14.9% | Lạm dụng cho heading và counter |

#### Bảng Kiểm Toán Tiêu Đề Heading (Heading Hierarchy Audit)
Tổng số thẻ `<h1-h6>` được khai báo tường minh: **76 thẻ**.

| Màn hình | Thẻ | Nội dung văn bản | Cỡ chữ | Font Weight | Bằng chứng File:Dòng | Nhận xét xung đột thứ bậc |
| :--- | :---: | :--- | :---: | :---: | :--- | :--- |
| Toàn cục | `h1` | "QUẢN TRÒ MA SÓI" | `text-xs` | `font-black` | [App.jsx:1366](file:///projects/werewolf/src/App.jsx#L1366) | **Nghịch lý**: h1 tiêu đề ứng dụng nhỏ hơn cả h2, h3, h4! |
| Ban Ngày | `h2` | "LÀNG THỨC GIẤC & BIỂU QUYẾT" | `text-2xl` | `font-black` | [DayPhaseView.jsx:96](file:///projects/werewolf/src/components/DayPhaseView.jsx#L96) | Cỡ chữ 24px |
| Bộ Bài | `h2` | "QUẢN LÝ BỘ BÀI & TEMPLATE" | `text-sm` | `font-black` | [DeckTemplateModal.jsx:266](file:///projects/werewolf/src/components/DeckTemplateModal.jsx#L266) | Cùng thẻ `h2` nhưng lại là 14px (thu nhỏ 58% so với DayPhase) |
| Thiết Lập | `h2` | "THIẾT LẬP VÁN CHƠI MỚI" | `text-lg` | `font-black` | [SetupGameModal.jsx:75](file:///projects/werewolf/src/components/SetupGameModal.jsx#L75) | Cùng thẻ `h2` nhưng lại là 18px |
| Thư Viện Vai | `h2` | "THƯ VIỆN {ROLES.length} VAI TRÒ" | `text-sm` | `font-black` | [RoleLibraryModal.jsx:75](file:///projects/werewolf/src/components/RoleLibraryModal.jsx#L75) | Cùng thẻ `h2` nhưng lại là 14px |
| Thư Viện Vai | `h3` | "{activeRole.name}" | `text-xl` | `font-black` | [RoleLibraryModal.jsx:266](file:///projects/werewolf/src/components/RoleLibraryModal.jsx#L266) | **Đảo nghịch**: Tiêu đề con h3 (20px) to hơn tiêu đề cha h2 (14px) |
| Ban Đêm | `h3` | "{currentRole.name}" | `text-base` | `font-black` | [NightStepHeader.jsx:132](file:///projects/werewolf/src/components/night/NightStepHeader.jsx#L132) | Cỡ 16px |
| Ban Đêm | `h3` | "BÌNH MINH ĐANG ĐẾN VỚI NGÔI LÀNG" | `text-2xl` | `font-black` | [NightSummaryStep.jsx:14](file:///projects/werewolf/src/components/night/NightSummaryStep.jsx#L14) | Cùng thẻ `h3` nhưng lại nhảy vọt lên 24px |
| Modal Hành Động | `h4` | "BẢO VỆ", "TIÊN TRI", "BẦY MA SÓI" | `text-sm` | `font-bold` | [ActionModal.jsx:108](file:///projects/werewolf/src/components/ActionModal.jsx#L108) | Cỡ 14px |
| Ban Đêm | `h4` | "Mục tiêu bảo vệ đêm nay" | `text-sm` | `font-bold` | [NightBodyguardStep.jsx:32](file:///projects/werewolf/src/components/night/NightBodyguardStep.jsx#L32) | Cỡ 14px |
| Ban Ngày | `h4` | "Hết giờ thảo luận" | `text-sm` | `font-bold` | [DayDiscussionTimer.jsx:119](file:///projects/werewolf/src/components/day/DayDiscussionTimer.jsx#L119) | Cỡ 14px |

---

### 2.3. Spacing & Radius (Khoảng Cách & Bo Góc)

#### Thống Kê Spacing
- Tổng số class spacing khác nhau: **94 class**.
- **Top 10 Spacing Dùng Nhiều Nhất**:
  1. `gap-2` (8px): 236 lần
  2. `gap-3` (12px): 136 lần
  3. `gap-1.5` (6px): 119 lần
  4. `gap-1` (4px): 114 lần
  5. `px-2.5` (10px): 108 lần
  6. `px-2` (8px): 93 lần
  7. `mt-0.5` (2px): 76 lần
  8. `gap-2.5` (10px): 63 lần
  9. `p-2.5` (10px): 56 lần
  10. `p-4` (16px): 55 lần
- **Độ Lệch Hệ Thống 4px Grid**:
  - Hầu hết các class tuân thủ bước 2px/4px tiêu chuẩn của Tailwind (`0.5` = 2px, `1` = 4px, `1.5` = 6px, `2` = 8px, `2.5` = 10px).
  - Có 1 giá trị arbitrary calculation: `pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]` tại [NightStickyFooter.jsx:112](file:///projects/werewolf/src/components/night/NightStickyFooter.jsx#L112) phục vụ iOS Home Bar.

#### Thống Kê Border Radius (Bo Góc)
Tổng số mức bo góc khác nhau: **7 mức cơ bản** với 770 lần xuất hiện.

| Tên Lớp | Giá Trị Thực Tế | Số lần xuất hiện | Vị trí đại diện |
| :--- | :---: | :---: | :--- |
| `rounded` | 4px | 85 | Tag nhỏ, badge số ghế ([PlayerSeatPicker.jsx:163](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx#L163)) |
| `rounded-md` | 6px | 34 | Nút bấm thanh công cụ nhỏ ([App.jsx:2974](file:///projects/werewolf/src/App.jsx#L2974)) |
| `rounded-lg` | 8px | 143 | Nút bấm cỡ vừa, ô input tìm kiếm |
| `rounded-xl` | 12px | 311 | Ghế người chơi, nút `GothicButton`, card con |
| `rounded-2xl` | 16px | 156 | Container chính, Modal, Banner sự kiện |
| `rounded-3xl` | 24px | 10 | Hộp thoại đặc biệt, Hero Card |
| `rounded-full` | 9999px | 61 | Nút tròn đóng/mở (X), chip trạng thái oval |

---

### 2.4. Button Audit (Kiểm Toán Nút Bấm & Phần Tử Tương Tác)

#### Thống Kê Tổng Thể
- Tổng số thẻ `<button>` thô trong JSX: **234 thẻ**.
- Tổng số component `<GothicButton>` được tái sử dụng: **51 lần** (chỉ chiếm **17.9%** tổng số nút).
- Tổng số phần tử `role="button"`: **0**.
- Tổng số thẻ không phải nút nhưng gán `onClick` (`<div onClick>`, `<span onClick>`): **14 vị trí** (vi phạm tiêu chuẩn HTML ngữ nghĩa).
- Số lượng chuỗi `className` khác nhau trên thẻ `<button>` thô: **41 chuỗi cấu hình style độc lập**.

#### Phân Bố Nút Bấm Theo File

| Tên File | Thẻ `<button>` thô | Component `<GothicButton>` | `div/span` có `onClick` | Tổng phần tử bấm |
| :--- | :---: | :---: | :---: | :---: |
| [src/App.jsx](file:///projects/werewolf/src/App.jsx) | 11 | 0 | 0 | 11 |
| [src/components/ActionModal.jsx](file:///projects/werewolf/src/components/ActionModal.jsx) | 35 | 5 | 0 | 40 |
| [src/components/night/NightSpecialRolesStep.jsx](file:///projects/werewolf/src/components/night/NightSpecialRolesStep.jsx) | 44 | 0 | 0 | 44 |
| [src/components/UnifiedGameSetupModal.jsx](file:///projects/werewolf/src/components/UnifiedGameSetupModal.jsx) | 31 | 8 | 9 | 48 |
| [src/components/WolfWhisperBox.jsx](file:///projects/werewolf/src/components/WolfWhisperBox.jsx) | 13 | 0 | 0 | 13 |
| [src/components/RoleLibraryModal.jsx](file:///projects/werewolf/src/components/RoleLibraryModal.jsx) | 10 | 0 | 0 | 10 |
| [src/components/RoleClaimBox.jsx](file:///projects/werewolf/src/components/RoleClaimBox.jsx) | 8 | 1 | 0 | 9 |
| [src/components/DeckTemplateModal.jsx](file:///projects/werewolf/src/components/DeckTemplateModal.jsx) | 8 | 4 | 0 | 12 |
| [src/components/night/NightWerewolvesStep.jsx](file:///projects/werewolf/src/components/night/NightWerewolvesStep.jsx) | 7 | 0 | 0 | 7 |
| [src/components/PlayerSeatPicker.jsx](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx) | 6 | 0 | 0 | 6 |
| [src/components/MatchHistoryModal.jsx](file:///projects/werewolf/src/components/MatchHistoryModal.jsx) | 6 | 2 | 1 | 9 |
| [src/components/DayPhaseView.jsx](file:///projects/werewolf/src/components/DayPhaseView.jsx) | 5 | 0 | 0 | 5 |
| [src/components/PlayerRosterModal.jsx](file:///projects/werewolf/src/components/PlayerRosterModal.jsx) | 5 | 4 | 0 | 9 |
| [src/components/day/DayVotingSection.jsx](file:///projects/werewolf/src/components/day/DayVotingSection.jsx) | 1 | 5 | 0 | 6 |
| [src/components/day/DayDiscussionTimer.jsx](file:///projects/werewolf/src/components/day/DayDiscussionTimer.jsx) | 1 | 4 | 0 | 5 |
| [src/components/night/NightStickyFooter.jsx](file:///projects/werewolf/src/components/night/NightStickyFooter.jsx) | 0 | 2 | 0 | 2 |
| [src/components/ui/GothicDialog.jsx](file:///projects/werewolf/src/components/ui/GothicDialog.jsx) | 0 | 2 | 0 | 2 |
| Các file khác gộp lại | 48 | 13 | 4 | 65 |
| **Tổng cộng** | **234** | **51** | **14** | **299** |

#### Bảng Gom Nhóm Nút Theo Hình Dáng & Kích Thước Thực Tế

| Nhóm Nút | Số lượng ước tính | Chiều cao ước tính (px) | Ví dụ File:Dòng | Đặc điểm Style |
| :--- | :---: | :---: | :--- | :--- |
| **Micro Header Action** | 12 | **24px – 28px** | [App.jsx:2974](file:///projects/werewolf/src/App.jsx#L2974), [App.jsx:2986](file:///projects/werewolf/src/App.jsx#L2986) | `h-6 sm:h-7 px-1.5 rounded-md` (Vi phạm touch target) |
| **Compact Round Icon** | 18 | **28px – 32px** | [MatchHistoryModal.jsx:349](file:///projects/werewolf/src/components/MatchHistoryModal.jsx#L349), [GameGuideModal.jsx:46](file:///projects/werewolf/src/components/GameGuideModal.jsx#L46) | `w-8 h-8 rounded-full` (Nút X đóng modal, nút xóa item) |
| **Seat / Player Tile** | 75 | **64px – 90px** | [PlayerSeatPicker.jsx:83](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx#L83), [PlayersGridView.jsx:128](file:///projects/werewolf/src/components/PlayersGridView.jsx#L128) | `p-2 rounded-xl border flex flex-col justify-between` |
| **Standard Gothic Small** | 37 | **34px** | [DayVotingSection.jsx:103](file:///projects/werewolf/src/components/day/DayVotingSection.jsx#L103) | `GothicButton size="sm"` (`min-h-[34px]`) |
| **Standard Gothic Medium**| 6 | **40px** | [DayVotingSection.jsx:290](file:///projects/werewolf/src/components/day/DayVotingSection.jsx#L290) | `GothicButton size="md"` (`min-h-[40px]`) |
| **Primary Sticky Large** | 8 | **48px** | [NightStickyFooter.jsx:136](file:///projects/werewolf/src/components/night/NightStickyFooter.jsx#L136) | `GothicButton size="lg"` (`min-h-[48px] uppercase`) |
| **Inline Custom Badges/Pills** | 52 | **28px – 36px** | [NightSpecialRolesStep.jsx:144](file:///projects/werewolf/src/components/night/NightSpecialRolesStep.jsx#L144) | `px-3 py-1.5 rounded-xl border bg-slate-900` |

#### Danh Sách 22 Vị Trí Vi Phạm Vùng Chạm Tối Thiểu (< 44px)
Các nút dưới đây có kích thước vật lý nhỏ hơn chuẩn tiếp cận 44x44px của Apple Human Interface Guidelines và Google Material Design:

1. [App.jsx:2917](file:///projects/werewolf/src/App.jsx#L2917): `h-7 w-7` (28x28px trên mobile) — Nút "Reset Về 0"
2. [App.jsx:2936](file:///projects/werewolf/src/App.jsx#L2936): `h-6 sm:h-7` (24px trên mobile) — Nút "Thiết Lập Ván"
3. [App.jsx:2951](file:///projects/werewolf/src/App.jsx#L2951): `h-6 w-6` (24x24px) — Nút shortcut nhóm người chơi
4. [App.jsx:2964](file:///projects/werewolf/src/App.jsx#L2964): `h-6 w-6` (24x24px) — Nút shortcut bộ bài mẫu
5. [App.jsx:2974](file:///projects/werewolf/src/App.jsx#L2974): `h-6 sm:h-7` (24px) — Nút chuyển tab Đêm/Ngày
6. [App.jsx:2986](file:///projects/werewolf/src/App.jsx#L2986): `h-6 w-6` (24x24px) — Nút Thư Viện Luật
7. [App.jsx:2997](file:///projects/werewolf/src/App.jsx#L2997): `h-6 w-6` (24x24px) — Nút Sổ Tay Hướng Dẫn
8. [App.jsx:3008](file:///projects/werewolf/src/App.jsx#L3008): `h-6 w-6` (24x24px) — Nút Lịch Sử Ván Đấu
9. [App.jsx:3081](file:///projects/werewolf/src/App.jsx#L3081): `h-7 sm:h-8` (28px) — Nút Chế Độ Trình Diễn
10. [DeckTemplateModal.jsx:432](file:///projects/werewolf/src/components/DeckTemplateModal.jsx#L432): `w-6 h-6` (24x24px) — Nút giảm số lượng lá bài (-)
11. [DeckTemplateModal.jsx:442](file:///projects/werewolf/src/components/DeckTemplateModal.jsx#L442): `w-6 h-6` (24x24px) — Nút tăng số lượng lá bài (+)
12. [GameGuideModal.jsx:46](file:///projects/werewolf/src/components/GameGuideModal.jsx#L46): `w-8 h-8` (32x32px) — Nút Đóng Modal
13. [GameSettingsModal.jsx:279](file:///projects/werewolf/src/components/GameSettingsModal.jsx#L279): `h-9` (36px) — Nút Reset Dữ Liệu Cài Đặt
14. [MatchHistoryModal.jsx:349](file:///projects/werewolf/src/components/MatchHistoryModal.jsx#L349): `w-8 h-8` (32x32px) — Nút Đóng Chi Tiết Ván Đấu
15. [RoleLibraryModal.jsx:87](file:///projects/werewolf/src/components/RoleLibraryModal.jsx#L87): `w-8 h-8` (32x32px) — Nút Đóng Thư Viện Vai
16. [RoleClaimBox.jsx:78](file:///projects/werewolf/src/components/RoleClaimBox.jsx#L78): `h-7` (28px) — Nút Lùi Người Chơi
17. [RoleClaimBox.jsx:88](file:///projects/werewolf/src/components/RoleClaimBox.jsx#L88): `h-7` (28px) — Nút Tiến Người Chơi
18. [UnifiedGameSetupModal.jsx:889](file:///projects/werewolf/src/components/UnifiedGameSetupModal.jsx#L889): `w-7 h-7` (28x28px) — Nút X Đóng Setup
19. [UnifiedGameSetupModal.jsx:1012](file:///projects/werewolf/src/components/UnifiedGameSetupModal.jsx#L1012): `h-8` (32px) — Nút "Gán Tên Mặc Định"
20. [UnifiedGameSetupModal.jsx:1022](file:///projects/werewolf/src/components/UnifiedGameSetupModal.jsx#L1022): `h-8` (32px) — Nút "Xóa Hết Tên"
21. [CemeteryModal.jsx:33](file:///projects/werewolf/src/components/CemeteryModal.jsx#L33): `w-7 h-7` (28x28px) — Nút Đóng Nghĩa Trang
22. [GothicButton.jsx:18](file:///projects/werewolf/src/components/ui/GothicButton.jsx#L18): `min-h-[34px]` — Toàn bộ 37 nút dùng `GothicButton size="sm"` đều vi phạm mốc 44px!

#### Phân Biệt Nút Nguy Hiểm (Dangerous Actions)
- **Treo cổ (Lynch)**: Phân biệt tốt bằng `GothicButton variant="blood"` ([DayVotingSection.jsx:291](file:///projects/werewolf/src/components/day/DayVotingSection.jsx#L291)) với gradient đỏ sẫm và viền đỏ hoa hồng.
- **Hoàn tác treo cổ (Undo Lynch)**: Dùng `GothicButton variant="dark" size="sm"` ([DayVotingSection.jsx:104](file:///projects/werewolf/src/components/day/DayVotingSection.jsx#L104)). Màu tối trầm tĩnh, an toàn, không xung đột với nút Treo cổ.
- **Xóa bộ bài / nhóm người chơi**: Dùng nút văn bản thô màu đỏ `hover:text-rose-400` kèm popup cảnh báo xác nhận `GothicDialog` ([DeckTemplateModal.jsx:656](file:///projects/werewolf/src/components/DeckTemplateModal.jsx#L656)).
- **Reset game về 0**: [App.jsx:2917](file:///projects/werewolf/src/App.jsx#L2917) dùng class `bg-rose-950/70 border-rose-700/80` nổi bật trên thanh header, có modal cảnh báo xác nhận `confirmText: 'Reset Về 0 Ngay 🩸'`.

---

### 2.5. Component Trùng Lặp (Duplication & Clones)

#### Thư Mục `src/components/ui/` Hiện Có
Chỉ có 7 file:
1. `GothicButton.jsx`
2. `GothicBadge.jsx` (chỉ dùng duy nhất 1 lần trong toàn dự án!)
3. `GothicDialog.jsx`
4. `GothicModalContainer.jsx` (chỉ dùng trong 3/14 modal)
5. `WolfIcon.jsx`
6. `WolfHead.jsx`
7. `ClawMarks.jsx`

#### Các Cụm Code Trùng Lặp Xuất Hiện $\ge$ 3 Lần

1. **Modal Overlay Container Khắc Họa Thủ Công (Lặp 11 lần)**:
   - Thay vì dùng `GothicModalContainer`, các modal tự viết lại:
     `fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in`
   - Bằng chứng:
     - [MatchHistoryModal.jsx:171](file:///projects/werewolf/src/components/MatchHistoryModal.jsx#L171)
     - [DeckTemplateModal.jsx:254](file:///projects/werewolf/src/components/DeckTemplateModal.jsx#L254)
     - [PlayerRosterModal.jsx:163](file:///projects/werewolf/src/components/PlayerRosterModal.jsx#L163)
     - [GameGuideModal.jsx:15](file:///projects/werewolf/src/components/GameGuideModal.jsx#L15)
     - [ActionModal.jsx:1816](file:///projects/werewolf/src/components/ActionModal.jsx#L1816)
     - [RoleLibraryModal.jsx:64](file:///projects/werewolf/src/components/RoleLibraryModal.jsx#L64)

2. **Player Tile / Ghế Ngồi Tự Viết Lại (Lặp 6 nơi)**:
   - Cụm cấu trúc thẻ ghế (Seat Header + Tên người chơi + Badge số ghế + Viền trạng thái) được code lại riêng rẽ với các class gradient khác nhau:
     - [PlayerSeatPicker.jsx:75-134](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx#L75-L134)
     - [PlayersGridView.jsx:128-230](file:///projects/werewolf/src/components/PlayersGridView.jsx#L128-L230)
     - [NightWerewolvesStep.jsx:140-180](file:///projects/werewolf/src/components/night/NightWerewolvesStep.jsx#L140-L180)
     - [DayVotingSection.jsx:160-230](file:///projects/werewolf/src/components/day/DayVotingSection.jsx#L160-L230)
     - [SheriffSuccessionModal.jsx:60-110](file:///projects/werewolf/src/components/SheriffSuccessionModal.jsx#L60-L110)
     - [ActionModal.jsx:1200-1260](file:///projects/werewolf/src/components/ActionModal.jsx#L1200-L1260)

3. **Status Badge Tự Chế (Lặp 23 lần)**:
   - Các đoạn mã dạng: `<span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/40">`
   - Bằng chứng:
     - [ActionModal.jsx:127](file:///projects/werewolf/src/components/ActionModal.jsx#L127)
     - [DayPhaseView.jsx:89](file:///projects/werewolf/src/components/DayPhaseView.jsx#L89)
     - [DeckInventoryRadar.jsx:71](file:///projects/werewolf/src/components/DeckInventoryRadar.jsx#L71)
     - [GameSettingsModal.jsx:97](file:///projects/werewolf/src/components/GameSettingsModal.jsx#L97)

4. **Nút Tròn Đóng Modal (Close Button) (Lặp 9 lần)**:
   - `<button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center">`
   - Bằng chứng:
     - [RoleLibraryModal.jsx:87](file:///projects/werewolf/src/components/RoleLibraryModal.jsx#L87)
     - [GameGuideModal.jsx:46](file:///projects/werewolf/src/components/GameGuideModal.jsx#L46)
     - [MatchHistoryModal.jsx:349](file:///projects/werewolf/src/components/MatchHistoryModal.jsx#L349)

#### Đề Xuất Danh Sách UI Component Cần Tách (Refactor Proposals)
1. `src/components/ui/PlayerSeatCard.jsx`: Thống nhất hiển thị ghế người chơi ở mọi chế độ (picker, view, voting).
2. `src/components/ui/GothicModal.jsx`: Hợp nhất `GothicModalContainer` và chuẩn hóa 100% modal trong app.
3. `src/components/ui/GothicBadge.jsx` (chuẩn hóa lại): Thay thế toàn bộ 23 inline badge rải rác.
4. `src/components/ui/IconButton.jsx`: Chuẩn hóa các nút tròn icon đóng modal, edit, delete với kích thước tối thiểu 44px.
5. `src/components/ui/SearchInput.jsx`: Ô tìm kiếm nhỏ gọn (đang lặp lại ở `PlayerSeatPicker`, `DeckTemplateModal`, `RoleLibraryModal`).

---

### 2.6. Hình Ảnh & Icon

#### Thư Mục Hình Ảnh Hiện Có
- Thư mục: `public/cards/` (chứa 49 tệp ảnh bài) và thư mục mirror `docs/images/cards/` (49 tệp ảnh bài).
- Tổng dung lượng: **2.6 MB**.
- **Định dạng file lộn xộn**:
  - `.jpg`: 21 file
  - `.PNG` (in hoa): 14 file
  - `.png` (thường): 13 file
  - `.jpeg`: 1 file
  - `.webp` / `.avif`: **0 file** (chưa được nén hiện đại).

#### Bảng Kiểm Kê Thẻ Bài Của 49 Vai Trò Trong Game

| STT | ID Vai Trò | Tên Hiển Thị | Phe Phái | Tệp Hình Ảnh (`public/cards/`) | Kích thước | Tình trạng khớp Art |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| 1 | `dan-lang` | Dân Làng | Dân Làng | `la-bai-dan-lang.jpg` | 33KB | Chuẩn |
| 2 | `tien-tri` | Tiên Tri | Dân Làng | `huong-dan-choi-ma-soi4.jpg` | 22KB | Tên file sai chuẩn nhưng có art |
| 3 | `bao-ve` | Bảo Vệ | Dân Làng | `la-bai-bao-ve.jpg` | 39KB | Chuẩn |
| 4 | `tho-san` | Thợ Săn | Dân Làng | `la-bai-tho-san.jpg` | 40KB | Chuẩn |
| 5 | `phu-thuy` | Phù Thủy | Dân Làng | `la-bai-phu-thuy.jpg` | 38KB | Chuẩn |
| 6 | `cupid` | Cupid | Dân Làng | `la-bai-than-tinh-yeu.jpg` | 37KB | Chuẩn |
| 7 | `canh-sat-truong` | Cảnh Sát Trưởng | Chức vị | `Truong_lang.PNG` | 86KB | Chuẩn |
| 8 | `co-be` | Cô Bé | Dân Làng | `la-bai-ban-soi.jpg` | 38KB | **LỆCH ART** (Dùng nhầm ảnh Bán Sói) |
| 9 | `soi-thuong` | Sói Thường | Phe Sói | `la-bai-ma-soi.jpg` | 33KB | Chuẩn |
| 10 | `soi-con` | Sói Con | Phe Sói | `la-bai-ma-soi.jpg` | 33KB | **DÙNG CHUNG** ảnh Sói Thường |
| 11 | `nua-nguoi-nua-soi`| Bán Sói | Biến Đổi | `nua_nguoi_nua_soi.jpg` | 30KB | Chuẩn |
| 12 | `soi-trang` | Sói Trắng | Phe Thứ 3 | `soi_trang.jpg` | 31KB | Chuẩn |
| 13 | `an-trom` | Ăn Trộm | Tùy Chọn | `an_trom.PNG` | 217KB | Dung lượng nặng bất thường |
| 14 | `thang-ngoc` | Thằng Ngố | Phe Thứ 3 | `Nhan_vat_Ma_soi__Thang_ngoc.jpg` | 18KB | Chuẩn |
| 15 | `gia-lang` | Già Làng | Dân Làng | `la-bai-gia-lang.jpg` | 42KB | Chuẩn |
| 16 | `nguoi-the-than` | Oan Nhân | Dân Làng | `Nhan_vat_Ma_soi_Scapegoat.jpg` | 17KB | Chuẩn |
| 17 | `nguoi-thoi-sao` | Người Thổi Sáo | Phe Thứ 3 | `thoisao.jpg` | 38KB | Chuẩn |
| 18 | `ke-dot-nha` | Kẻ Đốt Nhà | Phe Dân | `ma_soi_the_village___hoa_hoan_ke_dot_nha.jpeg` | 39KB | Chuẩn |
| 19 | `con-qua` | Con Quạ | Dân Làng | `ma_soi_the_village___con_qua.PNG` | 200KB | Dung lượng nặng |
| 20 | `dan-thuong` | Dân Thường | Dân Làng | `Nhan_vat_Ma_soi__Dan_lang.PNG` | 165KB | Chuẩn |
| 21 | `hai-chi-em` | Hai Chị Em | Dân Làng | `Nhan_vat_Ma_soi__Hai_chi_em.PNG` | 49KB | Chuẩn |
| 22 | `ba-anh-em` | Ba Anh Em | Dân Làng | `Nhan_vat_Ma_soi___Ba_anh_em.PNG` | 88KB | Chuẩn |
| 23 | `thien-su` | Thiên Sứ | Phe Thứ 3 | `Nhan_vat_Ma_soi__Thien_su.PNG` | 75KB | Chuẩn |
| 24 | `tham-phan-lap-bap`| Thẩm Phán Lắp Bắp| Dân Làng | `Nhan_vat_Ma_soi___Tham_phan_lap_bap.PNG` | 49KB | Chuẩn |
| 25 | `hiep-si-kiem-gi` | Hiệp Sĩ Kiếm Gỉ | Dân Làng | `Nhan_vat_Ma_soi___Hiep_si_Kiem_gi.PNG` | 48KB | Chuẩn |
| 26 | `cao` | Cáo | Dân Làng | `Nhan_vat_Ma_soi___Cao.PNG` | 43KB | Chuẩn |
| 27 | `nguoi-thuan-phuc-gau`| Thuần Hóa Gấu | Dân Làng | `Nhan_vat_Ma_soi__Nguoi_thuan_phuc_gau.PNG` | 47KB | Chuẩn |
| 28 | `dien-vien` | Diễn Viên | Tùy Chọn | `Nhan_vat_Ma_soi__Dien_vien.PNG` | 46KB | Chuẩn |
| 29 | `nguoi-day-to-tan-tuy`| Đầy Tớ Tận Tụy | Biến Đổi | `Nhan_vat_Ma_soi___Nguoi_day_to_tan_tuy.jpg` | 28KB | Chuẩn |
| 30 | `thanh-vien-giao-phai`| Giáo Phái | Phe Thứ 3 | `Nhan_vat_Ma_soi___Thanh_vien_giao_phai.jpg` | 30KB | Chuẩn |
| 31 | `dua-tre-hoang-da`| Đứa Trẻ Hoang Dã| Biến Đổi | `Nhan_vat_Ma_soi___Dua_tre_hoang_da.PNG` | 45KB | Chuẩn |
| 32 | `cho-soi-soi-lai` | Chó Sói | Tự Chọn | `Nhan_vat_Ma_soi___Cho_soi.jpg` | 30KB | Chuẩn |
| 33 | `soi-lon-xau-xa` | Sói Lớn Xấu Xa | Phe Sói | `Nhan_vat_Ma_soi___Soi_lon_xau_xa.PNG` | 89KB | Chuẩn |
| 34 | `soi-quy` | Sói Quỷ | Phe Sói | `soi-quy.png` | 113KB | Chuẩn |
| 35 | `soi-bi-nguyen` | Sói Bị Nguyền | Phe Sói | `la-bai-ma-soi.jpg` | 33KB | **DÙNG CHUNG** ảnh Sói Thường |
| 36 | `ba-dong` | Bà Đồng | Dân Làng | `nhan_vat_ma_soi.jpg` | 18KB | **LỆCH ART** (Dùng ảnh bìa hộp game) |
| 37 | `canh-sat-characters`| Cảnh Sát | Chức vị | `Canh_sat.jpg` | 57KB | Chuẩn |
| 38 | `nguyet-nu` | Nguyệt Nữ | Dân Làng | `Nguyet_nu.png` | 31KB | Chuẩn |
| 39 | `thay-thoi-mien` | Thầy Thôi Miên | Dân Làng | `Thay_thoi_mien.png` | 31KB | Chuẩn |
| 40 | `duoc-si` | Dược Sĩ | Dân Làng | `duoc_si.png` | 34KB | Chuẩn |
| 41 | `nguoi-mua-roi` | Người Múa Rối | Biến Đổi | `Nguoi_mua_roi.png` | 35KB | Chuẩn |
| 42 | `sat-thu` | Sát Thủ | Phe Độc Lập | `Thich_khach.png` | 34KB | Chuẩn |
| 43 | `ki-si` | Kị Sĩ | Dân Làng | `Ky_si.png` | 32KB | Chuẩn |
| 44 | `con-qua-plus` | Con Quạ (Plus) | Dân Làng | `Con_qua.png` | 43KB | Chuẩn |
| 45 | `nguoi-goi-hon` | Người Gọi Hồn | Dân Làng | `Nguoi_goi_hon.png` | 37KB | Chuẩn |
| 46 | `soi-lua` | Sói Lửa | Phe Sói | `Cao_lua.png` | 33KB | **LỆCH TÊN FILE** (`Cao_lua.png`) |
| 47 | `anh-em-soi` | Anh Em Sói | Phe Sói | `anh_em_soi.png` | 63KB | Chuẩn |
| 48 | `anh-tu` | Ảnh Tử | Kế Thừa | `anh_tu.png` | 42KB | Chuẩn |
| 49 | `ke-bao-thu` | Kẻ Báo Thù | Tự Chọn | `Ke_bao_thu.png` | 39KB | Chuẩn |

#### Đánh Giá Sử Dụng Icon Thay Thế Role Art
- Có tới **81 loại icon Lucide khác nhau** được import trong mã nguồn.
- Trong các màn hình tác vụ quan trọng như [PlayersGridView.jsx](file:///projects/werewolf/src/components/PlayersGridView.jsx), [PlayerSeatPicker.jsx](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx), và [DayVotingSection.jsx](file:///projects/werewolf/src/components/day/DayVotingSection.jsx), các vai trò hoàn toàn **không hiển thị ảnh thẻ bài avatar** mà chỉ được đại diện bằng các icon trừu tượng (Ví dụ: Ma Sói dùng `<Skull>`, Tiên Tri dùng `<Eye>`, Bảo Vệ dùng `<Shield>`, Thần Tình Yêu dùng `<Heart>`, Kị Sĩ dùng `<Swords>`). Điều này làm Quản trò khó nhận biết nhanh các vai phức tạp nếu không đọc tên chữ.
- **Rủi Ro Hiệu Năng & CLS**:
  - Không có bất kỳ thẻ `<img>` nào trong toàn dự án khai báo kích thước cứng `width={...}` và `height={...}` (ví dụ: [NightStepHeader.jsx:124](file:///projects/werewolf/src/components/night/NightStepHeader.jsx#L124) chỉ có `className="w-14 h-20 sm:w-16 sm:h-24 object-cover"`).
  - Không có thuộc tính `loading="lazy"` hoặc `decoding="async"`. Khi mạng chậm, ảnh tải trễ có thể gây giật đẩy bố cục (Layout Shift).

---

### 2.7. Bố Cục Từng Màn Hình Chính (Screen Layout Audit)

#### 1. Màn Hình Header Chung ([src/App.jsx](file:///projects/werewolf/src/App.jsx))
- **Bố cục**: Thanh top-bar cố định chiều cao `h-11 sm:h-12`. Bên trái: Logo + `h1` ("QUẢN TRÒ MA SÓI") + chấm đèn trạng thái Neon DB. Bên phải: Cụm 8 nút thao tác nhanh (Reset, Thiết lập, Sổ tay, Lịch sử, Cài đặt, Toggle Đêm/Ngày).
- **Câu hỏi chính**: "Ván game đang ở giai đoạn nào và cần kích hoạt công cụ hỗ trợ nào?"
- **Cạnh tranh sự chú ý**: Có tới 8 nút icon chen chúc nhau trong một diện tích nhỏ trên mobile. Nút "Reset Về 0" màu đỏ nằm ngay sát cạnh nút "Thiết Lập Ván", rất dễ bấm nhầm khi tay chạm vội.
- **Vấn đề phân cấp**: Thông tin kỹ thuật (chấm xanh `Neon DB`) nằm ngang hàng với tên game và trạng thái vòng chơi.

#### 2. Kịch Bản Gọi Đêm (Night Wizard — [src/components/NightPhaseView.jsx](file:///projects/werewolf/src/components/NightPhaseView.jsx))
- **Bố cục từ trên xuống**:
  1. Breadcrumb step pills (cuộn ngang).
  2. Hero Card đại diện nhân vật ([NightStepHeader.jsx](file:///projects/werewolf/src/components/night/NightStepHeader.jsx)): Ảnh bài + Tên vai + Box gán người giữ vai (`RoleClaimBox`).
  3. Action Body theo vai: Ma trận chọn ghế ([PlayerSeatPicker.jsx](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx)) hoặc hộp nhắn tin bí mật bầy sói ([WolfWhisperBox.jsx](file:///projects/werewolf/src/components/WolfWhisperBox.jsx)).
  4. Sticky Footer dính đáy ([NightStickyFooter.jsx](file:///projects/werewolf/src/components/night/NightStickyFooter.jsx)): Nút `Bước Trước` + Huy hiệu trạng thái đã chọn + Nút `Đi Ngủ 💤`.
- **Câu hỏi chính**: "Đêm nay nhân vật này gọi ai và mục tiêu hành động là ghế số mấy?"
- **Cạnh tranh sự chú ý**: Khu vực Hero Card chiếm gần 35% chiều cao màn hình trên điện thoại, đẩy ma trận ghế xuống thấp khiến Quản trò phải cuộn trang để thấy đủ các ghế.
- **Sticky Footer**: Thiết kế tốt, có nút Primary duy nhất `Đi Ngủ 💤` và có vùng đệm an toàn `pb-24`.

#### 3. Ban Ngày & Biểu Quyết ([src/components/DayPhaseView.jsx](file:///projects/werewolf/src/components/DayPhaseView.jsx))
- **Bố cục từ trên xuống**:
  1. Header Ban Ngày + Huy hiệu Ngày số X.
  2. Danh sách nạn nhân tử nạn trong đêm ([DayCasualtyAnnouncement.jsx](file:///projects/werewolf/src/components/day/DayCasualtyAnnouncement.jsx)).
  3. Cụm banner phản ứng khẩn cấp (Huy hiệu Cảnh Sát Trưởng, Thợ Săn nổ súng, Kị Sĩ thách đấu, Kẻ Báo Thù).
  4. Đồng hồ đếm ngược thảo luận làng ([DayDiscussionTimer.jsx](file:///projects/werewolf/src/components/day/DayDiscussionTimer.jsx)).
  5. Khu vực Biểu Quyết Treo Cổ ([DayVotingSection.jsx](file:///projects/werewolf/src/components/day/DayVotingSection.jsx)): Ma trận ghế sống + Nút "Xác nhận treo cổ".
  6. Nút chuyển giao Đêm Mới ([DayNightTransition.jsx](file:///projects/werewolf/src/components/day/DayNightTransition.jsx)).
- **Câu hỏi chính**: "Ai tử nạn trong đêm và hôm nay dân làng quyết định treo cổ ai?"
- **Cạnh tranh sự chú ý**: Khi có nhiều sự kiện cùng xảy ra (ví dụ: 2 người chết + Thợ Săn bắn + Kị Sĩ đấu), các banner cảnh báo xếp tầng đẩy khu vực thảo luận và nút biểu quyết trôi khỏi màn hình đầu tiên (Above the fold).
- **Vấn đề phân cấp**: Nút "Chuyển sang Đêm X" và nút "Xác nhận treo cổ" cùng xuất hiện khi chưa có án mạng, có thể khiến Quản trò lúng túng chưa biết chuyển bước nào trước.

#### 4. Thiết Lập Ván Đấu ([src/components/UnifiedGameSetupModal.jsx](file:///projects/werewolf/src/components/UnifiedGameSetupModal.jsx))
- **Bố cục**: Modal toàn màn hình với 2 tab chính ("Thiết Lập Ván Chơi" và "Kho Bộ Bài"). Trong tab Thiết lập: Thanh trượt số lượng người chơi (8-24) -> Danh sách chip tên người chơi -> Bộ bài đang chọn -> Nút cố định đáy "Bắt Đầu Ván Đấu ✓".
- **Câu hỏi chính**: "Ván này có bao nhiêu người chơi và áp dụng bộ bài nào?"
- **Cạnh tranh sự chú ý**: Các nút phụ ("Gán tên mặc định", "Xóa hết tên", "Sửa nhiều", "Lưu nhóm") có độ tương phản và màu sắc tương đương nút chọn bài mẫu, gây xao nhãng khỏi nút hành động chính "Bắt Đầu Ván Đấu".

---

### 2.8. Màu Phe Phái & Hiệu Ứng (Factions & State Styling)

#### Phân Tán Mã Màu Phe Phái
- Dữ liệu `colors` khai báo trong [src/data/roles.js](file:///projects/werewolf/src/data/roles.js) hoàn toàn **bị bỏ quên và không được sử dụng ở bất kỳ component nào**.
- Thay vào đó, mỗi component tự định nghĩa màu phe bằng các chuỗi Tailwind độc lập:
  - **Phe Ma Sói**:
    - [PlayersGridView.jsx:132](file:///projects/werewolf/src/components/PlayersGridView.jsx#L132): `from-[#280509] via-[#160205] to-[#0c0203] border-rose-600/90 shadow-[0_0_15px_rgba(225,29,72,0.4)]`
    - [PlayerSeatPicker.jsx:63](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx#L63): `from-[#22070a] to-[#120305] border-rose-600/90`
    - [GothicButton.jsx:28](file:///projects/werewolf/src/components/ui/GothicButton.jsx#L28): `from-[#450a0a] to-[#1c0305] text-rose-200 border-rose-800/80`
  - **Phe Dân Làng / Thần Thánh**:
    - [PlayersGridView.jsx:136](file:///projects/werewolf/src/components/PlayersGridView.jsx#L136): `from-[#121422] to-[#0a0c16] border-purple-900/60`
    - [PlayerSeatPicker.jsx:66](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx#L66): `bg-[#101322] border-slate-800`
  - **Cặp Đôi Tình Yêu (Cupid Lovers)**:
    - [PlayerSeatPicker.jsx:104](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx#L104): `from-[#3a0a20] to-[#1c0410] border-pink-500 text-pink-400`
    - [NightCupidStep.jsx:101](file:///projects/werewolf/src/components/night/NightCupidStep.jsx#L101): `border-pink-500 bg-pink-950/40 text-pink-300`

#### Thống Kê Hiệu Ứng Glow, Shadow & Gradient
- Tổng số lần dùng arbitrary box-shadow (`shadow-[...]`): **248 lần**.
- Tổng số hiệu ứng hào quang phát sáng (glow + drop-shadow): **269 lần**.
- Tổng số dải màu gradient (`bg-gradient-to-*`): **130 lần**.
- **Top 5 Màn Hình Lạm Dụng Glow & Gradient Nhiều Nhất**:
  1. [ActionModal.jsx](file:///projects/werewolf/src/components/ActionModal.jsx): 49 glow, 16 gradient.
  2. [DayVotingSection.jsx](file:///projects/werewolf/src/components/day/DayVotingSection.jsx): 16 glow, 4 gradient.
  3. [NightSpecialRolesStep.jsx](file:///projects/werewolf/src/components/night/NightSpecialRolesStep.jsx): 14 glow, 6 gradient.
  4. [RoleLibraryModal.jsx](file:///projects/werewolf/src/components/RoleLibraryModal.jsx): 12 glow, 8 gradient.
  5. [NightStepHeader.jsx](file:///projects/werewolf/src/components/night/NightStepHeader.jsx): 12 glow, 8 gradient.

---

### 2.9. Khả Năng Tiếp Cận (Accessibility - A11Y) & Hiệu Năng UI

#### Độ Tương Phản Màu Sắc (WCAG Contrast Audit)

| Cặp Màu (Chữ / Nền) | Mã Màu Thực Tế | Tỉ Lệ Tương Phản | Chuẩn WCAG AA (Tối thiểu 4.5:1) | Vị trí đại diện File:Dòng |
| :--- | :--- | :---: | :---: | :--- |
| `text-slate-600` trên nền tối | `#475569` trên `#08080c` | **2.38 : 1** | **KHÔNG ĐẠT** (Rất mờ) | [PlayersGridView.jsx:153](file:///projects/werewolf/src/components/PlayersGridView.jsx#L153) (Người chơi đã chết) |
| `text-slate-500` trên card tối | `#64748b` trên `#121422` | **3.56 : 1** | **KHÔNG ĐẠT** (Dưới 4.5:1) | [PlayerSeatPicker.jsx:130](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx#L130) (Ghi chú ghế bị cấm) |
| `text-purple-400/60` trên nền đen | `#c084fc` mờ trên `#07080d`| **2.91 : 1** | **KHÔNG ĐẠT** | [NightStepHeader.jsx:87](file:///projects/werewolf/src/components/night/NightStepHeader.jsx#L87) |
| `text-slate-400` trên card tối | `#94a3b8` trên `#121422` | **5.42 : 1** | **ĐẠT** | [DayVotingSection.jsx:136](file:///projects/werewolf/src/components/day/DayVotingSection.jsx#L136) |
| `text-slate-200` trên nền tối | `#e2e8f0` trên `#06070b` | **13.8 : 1** | **ĐẠT** (Xuất sắc) | [index.css:20](file:///projects/werewolf/src/index.css#L20) (Văn bản chính) |
| `text-rose-300` trên card Sói | `#fda4af` trên `#160205` | **8.64 : 1** | **ĐẠT** | [PlayersGridView.jsx:155](file:///projects/werewolf/src/components/PlayersGridView.jsx#L155) |

#### Khảo Sát Tương Tác A11Y
- **`aria-label`**: Chỉ có **20 nút** có khai báo `aria-label` trên tổng số 234 nút. Hơn **90% nút icon** không có nhãn âm thanh cho screen-reader.
- **Focus States**: Toàn bộ dự án có **0 lần xuất hiện `focus-visible:`**. Người dùng bàn phím (Tab) hoàn toàn không nhìn thấy viền focus outline khi duyệt qua các nút.
- **Motion Preferences**: Toàn bộ dự án có **0 lần xuất hiện `motion-reduce:`**. Các animation như `.animate-stamp-in`, `.animate-banner-drop`, `animate-bounce` vẫn tự động chạy bất kể cài đặt hệ điều hành của người dùng.
- **Nguy Cơ Layout Shift (CLS)**:
  - 100% thẻ `<img>` không có thuộc tính `width` và `height` cố định theo tỷ lệ ảnh gốc.
  - Các alert banner xuất hiện có điều kiện ở [DayPhaseView.jsx](file:///projects/werewolf/src/components/DayPhaseView.jsx) (như Banner Thợ Săn nổ súng) đột ngột chèn vào đầu trang làm xô lệch vị trí danh sách người chơi bên dưới.

---

### 2.10. Copywriting & Ngôn Ngữ Nhãn (UI Strings & Brand Consistency)

#### Sự Lẫn Lộn Thuật Ngữ Kỹ Thuật (Tech Jargon Leakage)
Nhiều chuỗi giao diện để lộ tên gọi kỹ thuật nội bộ của hệ thống thay vì dùng ngôn ngữ board game thân thiện với Quản trò:

1. **Rò rỉ thương hiệu Database ("Neon DB")**:
   - [PlayerRosterModal.jsx:334](file:///projects/werewolf/src/components/PlayerRosterModal.jsx#L334): `"Lưu Danh Sách Vào Neon DB"` $\rightarrow$ Nên đổi thành `"Lưu Danh Sách Vào Đám Mây"` hoặc `"Lưu Nhóm Người Chơi"`.
   - [DeckTemplateModal.jsx:658](file:///projects/werewolf/src/components/DeckTemplateModal.jsx#L658): `title="Xóa bộ bài khỏi Neon DB"`.
   - [App.jsx:3000](file:///projects/werewolf/src/App.jsx#L3000): `title="Xem lịch sử các trận đấu đã lưu trên Neon DB"`.
2. **Thuật ngữ phát triển phần mềm chưa Việt hóa**:
   - [DeckTemplateModal.jsx:266](file:///projects/werewolf/src/components/DeckTemplateModal.jsx#L266): `"QUẢN LÝ BỘ BÀI & TEMPLATE"` (chữ "Template" thừa thãi khi đã có "Bộ Bài").
   - [GameSettingsModal.jsx:110](file:///projects/werewolf/src/components/GameSettingsModal.jsx#L110): `"Chế Độ Thử Nghiệm (Test Mode)"`.
   - [GameSettingsModal.jsx:136](file:///projects/werewolf/src/components/GameSettingsModal.jsx#L136): `"Lưu Trữ State Game Tự Động"` (chữ "State Game" mang tính lập trình).
   - [GameSettingsModal.jsx:223](file:///projects/werewolf/src/components/GameSettingsModal.jsx#L223): `"Ứng Dụng PWA Cho iPhone (iOS)"`.
   - [App.jsx:2924](file:///projects/werewolf/src/App.jsx#L2924): `"Reset Về 0"` $\rightarrow$ Nên đổi thành `"Ván Mới"` hoặc `"Chơi Lại Từ Đầu"`.

---

## 3. Top 10 Điểm Không Nhất Quán (Inconsistencies) Xếp Theo Mức Ảnh Hưởng

| Hạng | Vấn đề không nhất quán | Mức độ | Bằng chứng File:Dòng | Hậu quả UI/UX |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Vùng chạm nút bấm bị bóp nghẹt dưới 44px** | **Nghiêm trọng** | [App.jsx:2917](file:///projects/werewolf/src/App.jsx#L2917) (`h-7 w-7`), [App.jsx:2974](file:///projects/werewolf/src/App.jsx#L2974) (`h-6 sm:h-7`) | Quản trò bấm trượt hoặc bấm nhầm nút Reset khi đang thao tác gấp trên mobile |
| **2** | **Né tránh GothicButton để viết thô `<button>` (82%)** | **Nghiêm trọng** | 234 thẻ `<button>` rải khắp `src/components/` | Không thể cập nhật style hay theme đồng bộ từ một nơi |
| **3** | **Đảo ngược cấp bậc Heading (`h1` nhỏ hơn `h2`, `h3`)** | **Cao** | [App.jsx:1366](file:///projects/werewolf/src/App.jsx#L1366) (`h1 text-xs`), [DayPhaseView.jsx:96](file:///projects/werewolf/src/components/DayPhaseView.jsx#L96) (`h2 text-2xl`) | Phá vỡ Semantic HTML, ảnh hưởng SEO/Screen-reader |
| **4** | **Lạm dụng cỡ chữ siêu nhỏ < 12px (329 lần)** | **Cao** | [PlayersGridView.jsx:220](file:///projects/werewolf/src/components/PlayersGridView.jsx#L220) (`text-[9px]`), [ActionModal.jsx:127](file:///projects/werewolf/src/components/ActionModal.jsx#L127) (`text-[10px]`) | Gây mỏi mắt, khó đọc tên người chơi và chức năng trong điều kiện phòng tối |
| **5** | **Bỏ quên token `colors` trong `roles.js`, tự chế hex 578 lần** | **Cao** | [roles.js:22-27](file:///projects/werewolf/src/data/roles.js#L22-L27) (không dùng), [PlayersGridView.jsx:132](file:///projects/werewolf/src/components/PlayersGridView.jsx#L132) | Màu phe phái lệch nhau giữa các màn hình, code CSS phình to |
| **6** | **Card ghế người chơi bị clone 6 lần độc lập** | **Vừa** | [PlayerSeatPicker.jsx:83](file:///projects/werewolf/src/components/PlayerSeatPicker.jsx#L83), [PlayersGridView.jsx:128](file:///projects/werewolf/src/components/PlayersGridView.jsx#L128) | Thay đổi visual ghế ngồi phải sửa tại 6 file khác nhau |
| **7** | **11 Modal tự viết lại khung overlay thô thay vì dùng GothicModalContainer** | **Vừa** | [MatchHistoryModal.jsx:171](file:///projects/werewolf/src/components/MatchHistoryModal.jsx#L171), [DeckTemplateModal.jsx:254](file:///projects/werewolf/src/components/DeckTemplateModal.jsx#L254) | Hiệu ứng backdrop blur, bo góc và nút đóng lệch chuẩn giữa các popup |
| **8** | **Font Cinzel và font ma mị lỗi dấu tiếng Việt** | **Vừa** | [index.html:24](file:///projects/werewolf/index.html#L24), [index.css:65](file:///projects/werewolf/src/index.css#L65) (`TH Kinhdi 1`) | Dấu tiếng Việt bị méo mó, biến dạng glyph trên các tiêu đề lớn |
| **9** | **Ảnh thẻ bài không khai báo width/height cố định** | **Vừa** | [NightStepHeader.jsx:124](file:///projects/werewolf/src/components/night/NightStepHeader.jsx#L124) (`className="w-14 h-20"`) | Nguy cơ giật khung hình (CLS) khi ảnh tải trên kết nối 4G yếu |
| **10**| **Lộ thuật ngữ kỹ thuật "Neon DB", "State Game" ra UI** | **Thấp** | [PlayerRosterModal.jsx:334](file:///projects/werewolf/src/components/PlayerRosterModal.jsx#L334), [GameSettingsModal.jsx:136](file:///projects/werewolf/src/components/GameSettingsModal.jsx#L136) | Giảm tính ma mị, huyền bí của không gian board game Gothic |

---

## 4. Bảng Độ Ưu Tiên Cải Tiến (Action Priority Matrix)

| Vấn đề cần giải quyết | Mức độ ảnh hưởng | Công sức ước tính | Đề xuất giải pháp kỹ thuật |
| :--- | :---: | :---: | :--- |
| **1. Chuẩn hóa chiều cao nút bấm $\ge$ 44px trên mobile** | **Cao** | **M** (Vừa) | Sửa base class `GothicButton`: nâng `sm` lên `min-h-[44px]`, thay thế 22 nút thô < 44px trên header và toolbar |
| **2. Tái cấu trúc `@theme` token trong Tailwind v4** | **Cao** | **M** (Vừa) | Khai báo biến theme trong `src/index.css` (`--color-faction-wolf`, `--color-surface-card`, v.v.) và thay thế 15 mã hex phổ biến nhất |
| **3. Gom card ghế người chơi thành `<PlayerSeatCard />`** | **Cao** | **L** (Lớn) | Trích xuất 1 component ghế duy nhất, dùng chung cho cả Picker, Grid và Voting |
| **4. Chuẩn hóa Type Scale & Sửa lỗi cấp bậc Heading** | **Vừa** | **S** (Nhỏ) | Đổi `h1` tại `App.jsx` thành kích thước chuẩn, chuyển các heading con về thang 5 cấp (Display, Title, Subtitle, Body, Caption $\ge$ 12px) |
| **5. Chuẩn hóa toàn bộ modal qua `<GothicModal />`** | **Vừa** | **M** (Vừa) | Đưa 11 modal tự do về kế thừa `GothicModalContainer`, đồng bộ backdrop và nút đóng (X) |
| **6. Bổ sung `focus-visible:` và `motion-reduce:`** | **Vừa** | **S** (Nhỏ) | Thêm `focus-visible:ring-2 focus-visible:ring-purple-500` vào `GothicButton` và bọc animation trong `@media (prefers-reduced-motion: no-preference)` |
| **7. Tối ưu ảnh thẻ bài (WebP + width/height + lazy loading)**| **Thấp** | **M** (Vừa) | Convert 49 ảnh sang WebP, gắn kích thước tỉ lệ cố định và thuộc tính `loading="lazy"` |
| **8. Tinh chỉnh từ ngữ Copywriting (xóa "Neon DB", "Reset Về 0")**| **Thấp** | **S** (Nhỏ) | Việt hóa thân thiện hóa 5 vị trí text kỹ thuật sang ngôn ngữ board game |

---

## 5. Phụ Lục: Các Lệnh Kiểm Toán Đã Chạy

```bash
# 1. Kiểm tra cấu hình Tailwind & CSS gốc
cat index.html src/index.css

# 2. Đếm số lần xuất hiện mã màu Hex và tìm các mã màu tự do lặp lại nhiều nhất
node --input-type=module -e '
import fs from "fs";
import path from "path";
function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith(".jsx") || file.endsWith(".css")) results.push(file);
  });
  return results;
}
const files = walk("./src");
const arbColorRegex = /\b(bg|text|border|ring|stroke|fill|from|to|via)-\[#([0-9a-fA-F]{3,8})\]/g;
const counts = {};
let total = 0;
files.forEach(f => {
  const content = fs.readFileSync(f, "utf8");
  let match;
  while ((match = arbColorRegex.exec(content)) !== null) {
    const val = `#${match[2].toLowerCase()}`;
    counts[val] = (counts[val] || 0) + 1;
    total++;
  }
});
console.log("Total arbitrary hex in JSX className:", total);
console.log("Top 15 arbitrary hex in JSX:", Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 15));
'

# 3. Thống kê Type Scale & Font Weight chính xác
node --input-type=module -e '
import fs from "fs";
import path from "path";
function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith(".jsx")) results.push(file);
  });
  return results;
}
const files = walk("./src");
const sizeRegex = /(?:^|\s|")text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|\[[0-9]+px\]|\[[0-9.]+rem\])(?:$|\s|"|:)/g;
const weightRegex = /\bfont-(normal|medium|semibold|bold|extrabold|black)\b/g;
const sizeCounts = {}, weightCounts = {};
files.forEach(f => {
  const content = fs.readFileSync(f, "utf8");
  let m;
  while ((m = sizeRegex.exec(content)) !== null) sizeCounts[m[1]] = (sizeCounts[m[1]] || 0) + 1;
  while ((m = weightRegex.exec(content)) !== null) weightCounts[m[1]] = (weightCounts[m[1]] || 0) + 1;
});
console.log("Sizes:", Object.entries(sizeCounts).sort((a,b) => b[1] - a[1]));
console.log("Weights:", Object.entries(weightCounts).sort((a,b) => b[1] - a[1]));
'

# 4. Kiểm toán Button: GothicButton vs raw <button> và các nút < 44px
node --input-type=module -e '
import fs from "fs";
import path from "path";
function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith(".jsx")) results.push(file);
  });
  return results;
}
const files = walk("./src");
let rawBtn = 0, gothicBtn = 0, nonBtnClick = 0;
files.forEach(f => {
  const content = fs.readFileSync(f, "utf8");
  rawBtn += (content.match(/<button\b/g) || []).length;
  gothicBtn += (content.match(/<GothicButton\b/g) || []).length;
  nonBtnClick += (content.match(/<(div|span|a)\b[^>]*\bonClick\b/g) || []).length;
});
console.log({ rawBtn, gothicBtn, nonBtnClick });
'

# 5. Kiểm tra tính toàn vẹn của 49 ảnh thẻ bài
node --input-type=module -e '
import { ROLES } from "./src/data/roles.js";
import fs from "fs";
const summary = ROLES.map(r => ({
  id: r.id,
  name: r.name,
  exists: fs.existsSync("./public" + r.image),
  image: r.image
}));
console.log("Total roles:", ROLES.length);
console.log("Missing images count:", summary.filter(s => !s.exists).length);
'

# 6. Kiểm tra các yếu tố Accessibility (A11Y)
node --input-type=module -e '
import fs from "fs";
import path from "path";
function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith(".jsx")) results.push(file);
  });
  return results;
}
const files = walk("./src");
let aria = 0, focusVisible = 0, motionReduce = 0;
files.forEach(f => {
  const content = fs.readFileSync(f, "utf8");
  aria += (content.match(/aria-label=/g) || []).length;
  focusVisible += (content.match(/focus-visible:/g) || []).length;
  motionReduce += (content.match(/motion-reduce/g) || []).length;
});
console.log({ aria, focusVisible, motionReduce });
'
```
