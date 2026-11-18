# UI Redesign Spec: Werewolf Moderator (Quản Trò Ma Sói)

> Tài liệu này dành cho coding agent. Đọc toàn bộ trước khi sửa bất kỳ file nào.
> Nguồn số liệu: `docs/ui-audit.md` (báo cáo audit hiện trạng).

---

## 0. Bối cảnh & mục tiêu

Web app mobile-first cho quản trò board game Ma Sói. Stack: React 19, Tailwind CSS v4, Lucide, Vite, Neon Postgres.

**Vấn đề:** UI chung chung, "mùi AI", to nhỏ lẫn lộn (nút, chữ, heading), thiếu bản sắc hình ảnh.

**Mục tiêu:**

1. Xây một Design System thống nhất (token, type scale, primitives) bằng cách **nâng cấp những gì đã có** (`GothicButton`, `GothicBadge`, `GothicModalContainer`), không viết lại từ đầu.
2. Thêm hình ảnh vai trò (role art) để cá nhân hóa nút/ô ghế.
3. Giữ nguyên UX và luồng chơi.

### Quy tắc bất khả xâm phạm

- **KHÔNG đổi luồng UX, logic game, thứ tự các bước.** Chỉ đổi giao diện.
- **KHÔNG sửa** `src/domain/**`, `src/utils/gameLogic.js`, `src/services/**`, `src/server/**`, `api/**`, `tests/**` (trừ khi test hỏng vì đổi selector, và phải báo cáo rõ).
- **Giữ CLS = 0:** ảnh luôn có `width`/`height`, vùng chứa sự kiện động phải có chiều cao dành sẵn.
- **Mobile-first:** thiết kế ở 390×844 trước. Vùng chạm tối thiểu 44×44px.
- Mỗi phase = một nhánh/PR riêng, commit nhỏ, chạy test sau mỗi phase.
- Nếu một yêu cầu trong tài liệu này mâu thuẫn với code thực tế, **dừng lại và báo cáo** thay vì đoán.

### Quy trình bắt buộc mỗi phase

1. Chạy `npm test` (hoặc lệnh test của dự án), ghi lại kết quả gốc.
2. Thực hiện phase.
3. Chạy lại test + `npm run build` + `npm run lint` (nếu có). Không được hỏng thêm.
4. Chụp ảnh màn hình trước/sau (xem mục 9) và liệt kê màn hình bị ảnh hưởng.
5. Viết tóm tắt phase: file đã đổi, số liệu trước/sau theo bảng ở mục 10.

---

## 1. Hiện trạng (tóm tắt từ audit)

| Chỉ số                                  | Hiện tại                        | Mục tiêu                     |
| --------------------------------------- | ------------------------------- | ---------------------------- |
| Khối `@theme` / CSS variables cho token | Không có                        | Có đầy đủ                    |
| Hex tự do trong JSX (`bg-[#...]`...)    | 578 lần, 283 mã khác nhau       | ≤ 30 (chỉ nhóm parchment)    |
| Cỡ chữ khác nhau                        | 13                              | 5 vai trò                    |
| Chữ dưới 12px                           | 329 lần (`[8px]`–`[11px]`)      | 0                            |
| `<button>` thô / `GothicButton`         | 234 / 51 (17.9% dùng primitive) | ≥ 95% qua primitive          |
| `<div onClick>` / `<span onClick>`      | 14                              | 0                            |
| Vùng chạm < 44px                        | ≥ 22 vị trí                     | 0                            |
| Clone card ghế người chơi               | 6 nơi                           | 1 component                  |
| Modal tự viết overlay                   | 11 / 14                         | 0                            |
| `aria-label` trên nút                   | 20 / 234                        | 100% nút chỉ có icon         |
| `focus-visible:`                        | 0                               | Có style toàn cục            |
| `motion-reduce`                         | 0                               | Có                           |
| Ảnh bài                                 | 49 ảnh, 4 định dạng, 0 webp     | WebP, đặt tên theo `role.id` |
| `<img>` có width/height/lazy            | 0%                              | 100%                         |

### Phát hiện quan trọng cần nhớ

- `GothicButton` (size `sm` = `min-h-[34px]`) đang vi phạm 44px cho 37 nút. **Sửa file này trước, hiệu quả nhất.**
- `src/data/roles.js` có sẵn `colors` theo phe nhưng **không component nào dùng**. Dùng nó làm nguồn sự thật cho theme phe.
- `h1` ở `App.jsx:1366` là `text-xs` nhỏ hơn `h2`/`h3` ở màn con. Thẻ và kiểu chữ phải tách rời.
- Font `Cinzel` **không hỗ trợ đầy đủ tiếng Việt**. `Creepster`, `Nosifer` không có tiếng Việt. `TH Kinhdi 1` dùng `local()` nên vô dụng trên điện thoại.
- 8 sắc xanh-tím đêm gần giống nhau (`#121422`, `#14121e`, `#0f111d`, `#141624`, `#0a0c16`, `#181a2e`, `#10121d`, `#111320`) cần gom về 3 surface token.
- Nhóm nâu giấy cổ (`#faebd7`, `#542d13`, `#3b1206`, `#2b1207`, `#30180c`) chủ yếu ở `ActionModal.jsx`. Giữ lại nhưng đổi thành token `parchment-*`.

---

## 2. Design Tokens (Phase 1)

Thêm vào `src/index.css` (Tailwind v4). Điều chỉnh giá trị nếu cần nhưng **phải giữ cấu trúc**.

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-display:
    "Cormorant Garamond", "Playfair Display", serif; /* phải có subset vietnamese */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Surface: gom 8 sắc xanh đêm thành 3 */
  --color-bg: #07080d;
  --color-surface-1: #121422;
  --color-surface-2: #181a2e;
  --color-line: #2a2d45;

  /* Chữ: 2 mức, cả hai đạt WCAG AA */
  --color-ink: #e2e8f0;
  --color-ink-muted: #94a3b8;

  /* Phe (đồng bộ với src/data/roles.js) */
  --color-wolf: #e11d48;
  --color-village: #7c3aed;
  --color-lover: #ec4899;
  --color-neutral: #f59e0b;
  --color-danger: #ef4444;

  /* Parchment (chỉ cho modal lật bài của ActionModal) */
  --color-parchment-edge: #faebd7;
  --color-parchment-wood: #542d13;
  --color-parchment-deep: #2b1207;
  --color-parchment-mid: #30180c;
  --color-parchment-red: #3b1206;

  /* Type scale: 5 vai trò, sàn 12px */
  --text-caption: 0.75rem;
  --text-caption--line-height: 1rem;
  --text-body: 0.875rem;
  --text-body--line-height: 1.25rem;
  --text-title: 1.125rem;
  --text-title--line-height: 1.5rem;
  --text-headline: 1.5rem;
  --text-headline--line-height: 2rem;
  --text-display: 2.25rem;
  --text-display--line-height: 2.5rem;

  /* Radius: 2 mức chính */
  --radius-control: 0.75rem;
  --radius-card: 1.25rem;
}

/* Mở rộng vùng chạm lên 44px mà không đổi kích thước nhìn thấy */
@utility hit-44 {
  position: relative;
  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: max(100%, 44px);
    height: max(100%, 44px);
    transform: translate(-50%, -50%);
  }
}

/* Theme phe: một component, đổi phe bằng data-faction */
[data-faction="wolf"] {
  --f-line: #e11d48;
  --f-bg: #1c0305;
  --f-ink: #fda4af;
  --f-glow: rgb(225 29 72 / 0.35);
}
[data-faction="village"] {
  --f-line: #7c3aed;
  --f-bg: #121422;
  --f-ink: #c4b5fd;
  --f-glow: rgb(124 58 237 / 0.3);
}
[data-faction="lover"] {
  --f-line: #ec4899;
  --f-bg: #3a0a20;
  --f-ink: #f9a8d4;
  --f-glow: rgb(236 72 153 / 0.35);
}
[data-faction="neutral"] {
  --f-line: #f59e0b;
  --f-bg: #1f1405;
  --f-ink: #fcd34d;
  --f-glow: rgb(245 158 11 / 0.3);
}

/* Focus và reduced motion toàn cục */
:where(button, [role="button"], a, input, select, textarea):focus-visible {
  outline: 2px solid var(--color-village);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Type scale: quy tắc sử dụng

| Vai trò  | Class           | Dùng cho                                                   | Weight  |
| -------- | --------------- | ---------------------------------------------------------- | ------- |
| Display  | `text-display`  | Tên phase lớn, màn Game Over                               | 800     |
| Headline | `text-headline` | Tên vai đang gọi, tiêu đề modal                            | 700     |
| Title    | `text-title`    | Tiêu đề card/section                                       | 600     |
| Body     | `text-body`     | Nội dung, tên người chơi, nhãn nút                         | 400–600 |
| Caption  | `text-caption`  | Badge, nhãn phụ, trạng thái (uppercase + tracking khi cần) | 500–600 |

- **Cấm** `text-[Npx]`, `text-xs` (12px, thay bằng `text-caption`), và mọi cỡ chữ ngoài 5 vai trò trên. Ngoại lệ duy nhất: số đếm ngược lớn của timer (ghi chú rõ trong code).
- `font-black` chỉ dành cho Display. Weight còn lại dùng 400/500/600/700.
- Thẻ HTML quyết định ngữ nghĩa, class quyết định hình dáng. Một trang chỉ có một `h1` (tên app), các `h2/h3` dùng class `text-headline`/`text-title` tùy vị trí, không phụ thuộc thẻ.

### Font

- Thay `Cinzel` bằng font display **có subset Vietnamese** (ví dụ Cormorant Garamond, Playfair Display, hoặc Be Vietnam Pro cho đậm). Kiểm tra bằng chuỗi: `Ươ ẫ ệ ộ ằ ữ Đ`.
- `Creepster` và `Nosifer`: bỏ khỏi chữ UI. Chỉ dùng cho logo nếu muốn, và render dưới dạng SVG/ảnh.
- Bỏ `@font-face 'TH Kinhdi 1'` dạng `local()`. Nếu muốn giữ, phải tự host file `.woff2` (kiểm tra license).
- Sửa `index.html:24-25` tương ứng, chỉ tải weight thực sự dùng, `display=swap`.

---

## 3. Primitives (Phase 2)

Đặt trong `src/components/ui/`. Các component này **không chứa logic game**.

### 3.1 `GothicButton` (nâng cấp, giữ API cũ)

- Giữ nguyên các `variant` hiện có (`blood`, `dark`...). Thêm/chuẩn hóa: `primary`, `secondary`, `danger`, `ghost`.
- Đổi size:
  - `sm`: `min-h-9` (36px) + `hit-44`
  - `md`: `min-h-11` (44px)
  - `lg`: `min-h-[52px]`
- Nhãn nút dùng `text-body` (600). Không dùng cỡ chữ dưới 12px.
- Có `focus-visible` ring (từ style toàn cục) và trạng thái `disabled` rõ ràng.
- Mọi dùng cũ vẫn chạy được (không làm hỏng call site hiện có).

### 3.2 `IconButton` (mới)

- Hiển thị 32–40px nhưng có `hit-44`. **Bắt buộc prop `label`** (render thành `aria-label` và `title`).
- Variant: `ghost` (mặc định), `solid`, `danger`.
- Thay thế: 12 nút Micro Header, 18 nút tròn Compact Round (nút X đóng modal, xóa item), nút +/− của `DeckTemplateModal`.

### 3.3 `GothicBadge` (chuẩn hóa)

- Props: `tone` (`neutral | wolf | village | lover | success | warning | danger`), `size` (`sm | md`).
- Chữ `text-caption`. Thay 23 badge thủ công dạng `text-[10px] bg-teal-500/20 ...`.

### 3.4 `GothicModal` (hợp nhất)

- Dựa trên `GothicModalContainer` hiện có. Gồm overlay, panel, header (title + `IconButton` đóng), vùng cuộn, footer cố định tùy chọn, safe-area iOS (`modal-safe-overlay`).
- Thay 11 modal tự viết `fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in`.

### 3.5 `SectionTitle`, `SearchInput` (mới, nhỏ)

- `SectionTitle`: chuẩn hóa tiêu đề section trong card (`text-title` + caption phụ tùy chọn).
- `SearchInput`: gom ô tìm kiếm lặp ở `PlayerSeatPicker`, `DeckTemplateModal`, `RoleLibraryModal`.

### 3.6 Di cư `<button>` thô

Thay `<button className="...">` bằng primitive theo thứ tự (số nút gốc trong ngoặc):

1. `UnifiedGameSetupModal.jsx` (31 thô + 9 `div onClick`)
2. `night/NightSpecialRolesStep.jsx` (44)
3. `ActionModal.jsx` (35)
4. `WolfWhisperBox.jsx` (13)
5. `App.jsx` (11)
6. `RoleLibraryModal.jsx` (10), `RoleClaimBox.jsx` (8), `DeckTemplateModal.jsx` (8), `NightWerewolvesStep.jsx` (7), `PlayerSeatPicker.jsx` (6), `MatchHistoryModal.jsx` (6), các file còn lại

Mọi `div/span/a` có `onClick` phải đổi thành `<button type="button">` (hoặc primitive).

**Quy tắc phân cấp:** mỗi màn hình/modal chỉ **một** nút Primary. Nút phụ ở Setup ("Gán tên mặc định", "Xóa hết tên", "Sửa nhiều", "Lưu nhóm") dùng `secondary`/`ghost`. Nút phá hủy dùng `danger`.

### Danh sách 22 vị trí vi phạm vùng chạm cần xử lý (từ audit)

`App.jsx` 2917, 2936, 2951, 2964, 2974, 2986, 2997, 3008, 3081 · `DeckTemplateModal.jsx` 432, 442 · `GameGuideModal.jsx` 46 · `GameSettingsModal.jsx` 279 · `MatchHistoryModal.jsx` 349 · `RoleLibraryModal.jsx` 87 · `RoleClaimBox.jsx` 78, 88 · `UnifiedGameSetupModal.jsx` 889, 1012, 1022 · `CemeteryModal.jsx` 33 · `GothicButton.jsx` 18 (size `sm`).

(Số dòng có thể đã lệch sau khi sửa; tìm theo nội dung.)

---

## 4. Role Art Pipeline (Phase 3)

Mục tiêu: hiển thị ảnh vai trò ở nơi đang dùng icon Lucide trừu tượng (`PlayersGridView`, `PlayerSeatPicker`, `DayVotingSection`, `NightStepHeader`), để quản trò nhận ra vai trò nhanh.

### 4.1 Chuẩn hóa file ảnh

- Nguồn: `public/cards/` (49 ảnh; `docs/images/cards/` là bản mirror, không phải nguồn chạy).
- Tạo script `scripts/build-role-art.mjs` (dùng `sharp`, cài như devDependency):
  - Ảnh thẻ đầy đủ: `public/cards/<role.id>.webp`, 360×540, quality ~82.
  - Avatar vuông: `public/cards/avatars/<role.id>.webp`, 160×160, `position: "attention"` hoặc crop vùng mặt, quality ~80.
- Cập nhật `image` trong `src/data/roles.js` trỏ về file mới theo `role.id`. Xóa phụ thuộc vào tên file cũ (`Truong_lang.PNG`, `la-bai-ma-soi.jpg`...). **Giữ file cũ cho đến khi xác nhận mọi tham chiếu đã chuyển**, rồi mới dọn.
- Ghi vào README ngắn: cách chạy script, quy ước đặt tên.

### 4.2 Component `RoleAvatar`

```jsx
const SIZE = { sm: 32, md: 48, lg: 64 };

export function RoleAvatar({ role, size = "md", dead = false }) {
  const px = SIZE[size];
  return (
    <img
      src={`/cards/avatars/${role.id}.webp`}
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      alt=""
      className={`rounded-control object-cover ring-2 ring-[var(--f-line)] ${dead ? "grayscale opacity-50" : ""}`}
    />
  );
}
```

- Có fallback khi thiếu ảnh (`onError`): nền theo phe + icon Lucide cùng kích thước, **không gây layout shift**.
- `alt=""` vì tên vai đã có chữ bên cạnh. Nếu avatar đứng một mình, truyền `aria-label`.

### 4.3 Vai trò có vấn đề art (cần xử lý hoặc báo cáo)

| `role.id`                          | Vấn đề                    | Việc cần làm                            |
| ---------------------------------- | ------------------------- | --------------------------------------- |
| `co-be`                            | Đang dùng ảnh Bán Sói     | Đánh dấu cần art mới, dùng fallback phe |
| `soi-con`                          | Dùng chung ảnh Sói Thường | Cần art riêng, fallback                 |
| `soi-bi-nguyen`                    | Dùng chung ảnh Sói Thường | Cần art riêng, fallback                 |
| `ba-dong`                          | Dùng ảnh bìa hộp game     | Cần art mới, fallback                   |
| `soi-lua`                          | File tên `Cao_lua.png`    | Đổi tên theo `role.id` qua script       |
| `an-trom`, `con-qua`, `dan-thuong` | PNG nặng (165–217KB)      | Nén qua pipeline WebP                   |

Không tự bịa ảnh. Với vai trò thiếu art, dùng fallback và liệt kê trong báo cáo để chủ dự án bổ sung.

### 4.4 Áp dụng ảnh vào UI

- Ô ghế người chơi (Phase 4): hiển thị `RoleAvatar` khi **được phép lộ vai** (xem lưu ý dưới).
- `NightStepHeader`: dùng ảnh thẻ `lg` có `width`/`height`.
- `RoleLibraryModal`, `DeckTemplateModal`: dùng avatar `sm`/`md`.
- Mọi `<img>`: `width`, `height`, `loading="lazy"` (trừ ảnh ở viewport đầu), `decoding="async"`.

> **Lưu ý bí mật vai trò:** app là công cụ của quản trò, màn hình có thể bị người chơi nhìn thấy. **Không đổi** logic hiện tại về lúc nào vai trò được hiển thị. Chỉ thay icon bằng avatar ở những chỗ **đang hiển thị vai trò sẵn**. Nếu không chắc một chỗ có lộ vai hay không, hỏi lại thay vì đoán.

---

## 5. `PlayerSeatCard` (Phase 4, phase giá trị nhất)

Gom 6 bản clone về một component:

- `PlayerSeatPicker.jsx` (75–134)
- `PlayersGridView.jsx` (128–230)
- `night/NightWerewolvesStep.jsx` (140–180)
- `day/DayVotingSection.jsx` (160–230)
- `SheriffSuccessionModal.jsx` (60–110)
- `ActionModal.jsx` (1200–1260)

### Thiết kế

- Props gợi ý: `player`, `role` (tùy chọn), `faction`, `mode` (`pick | view | vote`), `selected`, `disabled`, `badges`, `onClick`.
- Cấu trúc cố định, **kích thước ô không đổi theo trạng thái**: avatar/icon + tên + badge số ghế (góc) + dòng trạng thái ngắn.
- Phe qua `data-faction`. Trạng thái thể hiện bằng:
  - Viền và badge góc: chết, tình nhân, cảnh trưởng, bị nguyền, được chọn.
  - `grayscale` + giảm opacity cho người chết (thay `text-slate-600`, tỉ lệ 2.38:1 không đạt AA).
- Là `<button>` thật, có `aria-pressed` khi chọn, `aria-label` đầy đủ ("Ghế 5, Nguyễn Văn A, còn sống").
- Chữ không nhỏ hơn `text-caption` (12px). Tên người chơi dùng `text-body`.

### Quy tắc glow (giảm cảm giác "AI")

- Glow/shadow màu chỉ bật khi trạng thái `selected`, `active`, hoặc `danger`.
- Thẻ tĩnh: nền phẳng + viền 1px. Mỗi màn hình tối đa **một** điểm phát sáng nổi bật.
- Giảm dần số `shadow-[...]` (248), `glow` (269), `bg-gradient-*` (130). Ưu tiên bỏ ở `ActionModal`, `DayVotingSection`, `NightSpecialRolesStep`, `RoleLibraryModal`, `NightStepHeader`.

---

## 6. Chỉnh từng màn hình (Phase 5, không đổi luồng)

### Header (`App.jsx`)

- 8 nút → `IconButton` (hit-44). Giữ thứ tự nút hiện tại.
- Tách nút "Reset Về 0" khỏi nhóm nút thường: đưa vào menu Cài đặt, **hoặc** yêu cầu nhấn giữ ~600ms. (Đây là thay đổi UX duy nhất được phép, vì nút đỏ đang sát nút "Thiết Lập Ván" dễ bấm nhầm. Giữ nguyên hộp thoại xác nhận hiện có.)
- Chấm trạng thái "Neon DB" thu nhỏ thành biểu tượng trạng thái kết nối, không chiếm hàng với tên app.
- `h1` dùng `text-title` + font display; không còn `text-xs`.

### Night Wizard (`NightPhaseView`, `NightStepHeader`)

- Hero Card hiện chiếm ~35% chiều cao màn hình. Thu gọn: một hàng ngang gồm avatar/ảnh thẻ (~56px), tên vai (`text-headline`), hộp gán người giữ vai (`RoleClaimBox`). Mục tiêu: lưới ghế hiện trong màn hình đầu mà không cần cuộn.
- Sticky footer: giữ cấu trúc hiện có, dùng `GothicButton lg` cho Primary "Đi Ngủ", `secondary` cho "Bước Trước".
- Breadcrumb pills: chữ `text-caption`, vùng chạm đủ 44px (dùng `hit-44` nếu cần).

### Day (`DayPhaseView`, `DayVotingSection`)

- Gom các banner sự kiện (Cảnh Sát Trưởng, Thợ Săn, Kị Sĩ, Kẻ Báo Thù) vào **một khối "Sự kiện"** có thứ tự ưu tiên cố định. Khối này có chiều cao dành sẵn hoặc animate chiều cao, **không chèn đột ngột đẩy layout**.
- Khi biểu quyết chưa xong, nút "Chuyển sang Đêm X" hạ xuống `secondary`; "Xác nhận treo cổ" (`danger`/`blood`) là Primary duy nhất.

### Setup (`UnifiedGameSetupModal`)

- Chỉ "Bắt Đầu Ván Đấu" là Primary (cố định đáy). Các nút phụ `secondary`/`ghost`.
- Nút đóng X → `IconButton`.

### Modals còn lại

- Chuyển hết sang `GothicModal`. Nút đóng thống nhất ở cùng vị trí.

---

## 7. Copywriting (Phase 6)

| Hiện tại                          | Đề xuất                      | Vị trí                      |
| --------------------------------- | ---------------------------- | --------------------------- |
| "Lưu Danh Sách Vào Neon DB"       | "Lưu Nhóm Người Chơi"        | `PlayerRosterModal.jsx:334` |
| `title="Xóa bộ bài khỏi Neon DB"` | "Xóa bộ bài"                 | `DeckTemplateModal.jsx:658` |
| `title="...lưu trên Neon DB"`     | "Xem lịch sử các ván đã lưu" | `App.jsx:3000`              |
| "QUẢN LÝ BỘ BÀI & TEMPLATE"       | "QUẢN LÝ BỘ BÀI"             | `DeckTemplateModal.jsx:266` |
| "Chế Độ Thử Nghiệm (Test Mode)"   | "Chế Độ Thử Nghiệm"          | `GameSettingsModal.jsx:110` |
| "Lưu Trữ State Game Tự Động"      | "Tự Động Lưu Ván"            | `GameSettingsModal.jsx:136` |
| "Ứng Dụng PWA Cho iPhone (iOS)"   | "Cài Lên Màn Hình iPhone"    | `GameSettingsModal.jsx:223` |
| "Reset Về 0"                      | "Ván Mới"                    | `App.jsx:2924`              |

- Không để lộ thuật ngữ kỹ thuật (DB, state, template, PWA) trong UI.
- Giữ giọng ma mị nhất quán với các nhãn thân thiện hiện có ("Đi Ngủ 💤"...). Không dịch/đổi tên vai trò.
- Các chuỗi dùng làm key trong test hoặc logic: kiểm tra trước khi đổi.

---

## 8. Accessibility & hiệu năng (xuyên suốt, hoàn tất ở Phase 6)

- Mọi nút chỉ có icon phải có `aria-label` (qua `IconButton label`). Hiện chỉ 20/234.
- Contrast: không dùng `text-slate-600` hay `text-slate-500` cho chữ có nội dung quan trọng trên nền tối. Dùng `ink-muted` (#94a3b8, ~5.4:1). Sửa `NightStepHeader.jsx:87` (`text-purple-400/60`, ~2.9:1).
- Animation có `prefers-reduced-motion` (đã xử lý toàn cục ở mục 2).
- Layout shift: ảnh có `width`/`height`, banner động có chỗ dành sẵn.
- Không dùng `div`/`span` có `onClick`.

---

## 9. Kiểm chứng

### Ảnh chụp trước/sau (Playwright)

- Viewport 390×844 (mobile) và 768×1024 (tablet).
- Màn hình tối thiểu: Setup (2 tab), Night (bước Sói, Tiên Tri, Phù Thủy, Cupid, Tóm tắt), Day (có/không có sự kiện, biểu quyết), RoleLibrary, DeckTemplate, MatchHistory, ActionModal.
- Lưu `docs/screenshots/baseline/` **trước khi sửa Phase 1**, và `docs/screenshots/phase-N/` sau mỗi phase.

### Guard chống thụt lùi

Thêm script `lint:ui` vào `package.json`. Lệnh nào có kết quả thì fail:

```bash
# Cỡ chữ tự do
grep -rnE "text-\[[0-9.]+(px|rem)\]" src/components
# Hex tự do (ngoại trừ file parchment có chú thích)
grep -rnE "(bg|text|border|from|via|to|ring|shadow)-\[#" src/components --exclude=ActionModal.jsx
# Nút thô ngoài thư mục ui
grep -rn "<button" src --include=*.jsx --exclude-dir=ui
# div/span có onClick
grep -rnE "<(div|span)\b[^>]*onClick" src --include=*.jsx
```

Với hex trong `ActionModal.jsx`: chuyển sang token `parchment-*`; nếu còn sót thì ghi chú lý do.

---

## 10. Tiêu chí hoàn thành (Definition of Done)

| Hạng mục       | Điều kiện đạt                                                                      |
| -------------- | ---------------------------------------------------------------------------------- |
| Token          | Có `@theme` đầy đủ, hex tự do trong JSX ≤ 30                                       |
| Type           | Chỉ 5 vai trò chữ, 0 chữ < 12px, `h1` đúng cấp                                     |
| Nút            | ≥ 95% qua primitive, 0 vùng chạm < 44px, 0 `div onClick`, mỗi màn hình một Primary |
| Card ghế       | 1 component `PlayerSeatCard` dùng ở cả 6 nơi                                       |
| Modal          | 100% qua `GothicModal`                                                             |
| Ảnh            | WebP theo `role.id`, `RoleAvatar` có fallback, 100% `<img>` có width/height/lazy   |
| A11y           | `aria-label` đủ, focus-visible, reduced-motion, contrast AA                        |
| Copy           | Không còn "Neon DB", "State", "Template", "PWA" trong UI                           |
| Không thụt lùi | Test cũ đều pass, `build` pass, `lint:ui` pass                                     |
| UX             | Luồng game, thứ tự các bước **không đổi** (ngoại lệ đã nêu: vị trí nút Reset)      |

---

## 11. Thứ tự thực hiện & báo cáo

| Phase | Nội dung                                                                       | Rủi ro               |
| ----- | ------------------------------------------------------------------------------ | -------------------- |
| 0     | Chụp baseline Playwright, thêm script `lint:ui` (chưa bắt buộc pass)           | Thấp                 |
| 1     | Token, font, type utilities, focus/motion toàn cục                             | Thấp                 |
| 2     | `GothicButton` nâng cấp, `IconButton`, `GothicBadge`, `GothicModal`, di cư nút | Trung bình           |
| 3     | Pipeline ảnh WebP, `RoleAvatar`, fallback theo phe                             | Thấp                 |
| 4     | `PlayerSeatCard` thay 6 clone, quy tắc glow                                    | Cao (nhiều chỗ dùng) |
| 5     | Chỉnh Header, Night Hero, Day events, Setup                                    | Trung bình           |
| 6     | Copywriting, aria-label, dọn ảnh/file cũ, bật `lint:ui` bắt buộc               | Thấp                 |

**Sau mỗi phase, báo cáo gồm:**

1. Danh sách file đã đổi.
2. Bảng số liệu trước/sau (các dòng liên quan ở mục 1).
3. Kết quả test, build, lint.
4. Màn hình bị ảnh hưởng + đường dẫn ảnh chụp.
5. Mọi chỗ không chắc chắn hoặc cần quyết định từ chủ dự án (đặc biệt: art thiếu, nơi có thể lộ vai trò, chuỗi dùng trong test).

**Bắt đầu từ Phase 0 và Phase 1. Dừng lại và báo cáo sau Phase 1 trước khi sang Phase 2.**
