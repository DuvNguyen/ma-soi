# Asset Brief: Bộ nút & khung UI cho "Werewolf Moderator (Quản Trò Ma Sói)"

> Tài liệu để đưa cho **Gemini** (hoặc họa sĩ) tạo hình ảnh nút bấm và khung UI.
> Phần mô tả bằng tiếng Việt, **prompt bằng tiếng Anh** (Gemini cho kết quả tốt hơn).
> Dùng cho ứng dụng mobile-first của quản trò board game Ma Sói, thường dùng trong **phòng tối**, nên mọi thứ phải đọc được nhanh.

---

## 0. Đọc trước khi tạo (quan trọng)

### Giới hạn của Gemini cần biết

| Giới hạn                                        | Cách xử lý trong brief này                                                                      |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Không xuất nền trong suốt**                   | Luôn yêu cầu nền **xanh lá phẳng `#00FF00`**, sau đó tách nền bằng lệnh ở mục 3                 |
| **Không đảm bảo kích thước pixel chính xác**    | Tạo lớn rồi crop và resize. Tài liệu ghi **kích thước đích**, không phải kích thước sinh ảnh    |
| **Hay tự thêm chữ, logo, mockup**               | Mọi prompt đều có `NO text, NO letters`. Chữ sẽ do HTML/CSS vẽ. Nếu có chữ, tạo lại             |
| **Khó nhất quán giữa các lần tạo**              | Làm theo quy trình mục 2: tạo **ảnh mỏ neo (style anchor)** trước, rồi đính kèm vào mọi lần sau |
| **Trạng thái (nhấn/vô hiệu) dễ lệch hình dạng** | Tạo trạng thái _idle_ trước, rồi **đính kèm ảnh idle** và yêu cầu chỉ đổi đúng chi tiết nêu rõ  |

### Nguyên tắc thiết kế (áp dụng cho mọi asset)

1. **Chữ nằm trên vùng phẳng.** Vùng giữa nút phải trống, đồng màu, không họa tiết. Họa tiết chỉ ở **rìa và góc**.
2. **Đối xứng trái-phải**, nhìn thẳng chính diện (không phối cảnh, không xoay nghiêng).
3. **Nút co giãn (9-slice):** 4 góc và 4 cạnh giữ nguyên chi tiết, phần giữa kéo giãn. Vì vậy **không vẽ họa tiết lặp lại hay chi tiết lớn ở giữa cạnh**.
4. **Chi tiết nhô ra (máu nhỏ giọt, gai, rivet) phải nằm gọn trong vùng viền**, không tràn ra ngoài khung hình chữ nhật.
5. **Một nguồn sáng duy nhất từ trên-trái.** Bóng đổ nhẹ xuống dưới-phải.
6. **Phong cách:** dark gothic, woodcut / ink tarot, nét viền dày đều. Không 3D bóng bẩy, không neon, không gradient cầu vồng, không cartoon dễ thương.

---

## 1. STYLE BLOCK (dán vào **đầu mọi prompt**)

```
STYLE BLOCK:
Dark gothic game UI asset, hand-inked woodcut / tarot-card illustration style, bold uniform dark outlines (about 3% of image width), subtle paper grain, matte materials, no glossy plastic look. Single light source from top-left with soft drop shadow toward bottom-right. Strictly front view, orthographic, perfectly centered, left-right symmetrical. Limited palette only: near-black navy #07080d, night blue #121422, slate #2a2d45, parchment cream #faebd7, aged gold #e8b84a, wolf crimson #8f1226, deep blood #4a0a14, violet #7c3aed, ash gray #6b7280. Flat solid pure green background #00FF00 (chroma key), no gradient on the background, no shadow cast onto the background, no reflections. NO text, NO letters, NO numbers, NO watermark, NO logo, NO UI mockup, NO hands, NO characters.
```

---

## 2. Quy trình tạo (làm đúng thứ tự)

**Bước A: tạo ảnh mỏ neo phong cách (style anchor)**
Dùng prompt ở mục 4.0. Chọn 1 ảnh đẹp nhất, lưu thành `anchor.png`. Đây là "chuẩn" cho mọi thứ sau.

**Bước B: tạo từng asset**
Với mỗi asset: đính kèm `anchor.png` và nhập

```
Match the exact art style, line weight, palette and material rendering of the attached reference image. Then create the following asset:
[STYLE BLOCK]
[PROMPT của asset]
```

**Bước C: tạo trạng thái (pressed / disabled / active)**
Đính kèm ảnh **idle đã chọn** và nhập:

```
Use the attached image as the exact base. Keep the identical shape, size, position, outline and layout. Change ONLY the following: [mô tả thay đổi]. Same flat green #00FF00 background. NO text.
```

**Bước D: chọn lọc**
Mỗi asset tạo 4 ảnh, chọn 1. Loại ngay ảnh nếu: có chữ, nền không phẳng xanh, đối xứng lệch, họa tiết chiếm vùng giữa, chi tiết tràn ra ngoài khung.

**Mẹo giữ nhất quán:** tạo trong **cùng một cuộc hội thoại** với Gemini, không mở cuộc mới giữa chừng.

---

## 3. Hậu xử lý (cho người làm kỹ thuật)

```bash
# Tách nền xanh và lưu PNG trong suốt (ImageMagick 7)
magick in.png -fuzz 14% -transparent "#00FF00" -trim +repage out.png

# Nếu viền còn ám xanh: khử fringe nhẹ
magick out.png -channel A -morphology Erode Diamond:1 +channel out_clean.png

# Resize về chiều rộng đích (giữ tỉ lệ) rồi xuất WebP lossless cho nút nhỏ
magick out_clean.png -resize 480x out_final.png
magick out_final.png -define webp:lossless=true out_final.webp
```

- Với asset 9-slice: sau khi resize, kiểm tra **kéo giãn thử** ở các độ rộng 160px, 280px, 360px. Nếu giữa cạnh bị méo hoặc lộ họa tiết bị kéo, tạo lại với họa tiết gọn hơn.
- Với khung ghế có **lỗ giữa**: lỗ cũng tô `#00FF00` rồi tách nền (xem mục 6).
- Đặt tên và thư mục theo mục 8.

---

## 4. Danh sách asset

Bảng tổng quan:

| ID  | Tên                | Dùng ở đâu                                    | Trạng thái cần có               |
| --- | ------------------ | --------------------------------------------- | ------------------------------- |
| 4.0 | STYLE-ANCHOR       | Ảnh mẫu phong cách                            | 1 ảnh                           |
| 5.1 | BTN-PRIMARY-SEAL   | Nút chính (Đi Ngủ, Bắt Đầu Ván Đấu, Xác nhận) | idle, pressed, disabled         |
| 5.2 | BTN-DANGER-BLOOD   | Nút nguy hiểm (Treo cổ, Ván Mới)              | idle, pressed, disabled         |
| 5.3 | BTN-SECONDARY-IRON | Nút phụ (Bước Trước, Bỏ qua, nút phụ ở Setup) | idle, pressed, disabled         |
| 5.4 | BTN-ICON-RUNE      | Nút icon (header, đóng X, +/−)                | idle, pressed, disabled, active |
| 5.5 | BTN-ICON-DANGER    | Nút icon nguy hiểm (Reset, xóa)               | idle, pressed, disabled         |
| 5.6 | CHIP-LEATHER       | Chip chọn, tab, breadcrumb bước đêm           | idle, selected, disabled        |
| 5.7 | TOGGLE-CANDLE      | Công tắc trong Cài đặt                        | off, on                         |
| 6.x | SEAT-FRAME (4 phe) | Khung ô người chơi                            | idle theo phe + selected + dead |
| 7.x | STICKER (10 cái)   | Biểu tượng trạng thái người chơi              | 1 trạng thái mỗi cái            |

---

### 4.0 STYLE-ANCHOR (làm đầu tiên)

**Mục đích:** ảnh tham chiếu phong cách cho mọi lần tạo sau.
**Nội dung:** một "bảng mẫu vật liệu" gồm 4 vật thể cạnh nhau.
**Tạo ở tỉ lệ:** 16:9.

```
[STYLE BLOCK]
A material and style sample sheet showing four separate objects arranged in a row on the green background, evenly spaced: (1) a rounded rectangular red wax-seal plaque, (2) a dark oak plank with small iron corner brackets and rivets, (3) a round dark slate rune coin with a thin gold rim, (4) a small stitched dark leather tag. Each object is flat, front view, empty and plain in the center. Consistent line weight and lighting across all four.
```

---

## 5. Nút bấm

> Kích thước đích tính theo **ảnh nguồn @3x** (để nét trên màn hình Retina). `slice` là khoảng cắt 9-slice từ mỗi cạnh.

### 5.1 BTN-PRIMARY-SEAL (nút chính)

| Thuộc tính               | Giá trị                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| **Dùng cho**             | Hành động chính duy nhất mỗi màn hình: "Đi Ngủ", "Bắt Đầu Ván Đấu", "Xác nhận", "Tiếp tục" |
| **Hiển thị trong app**   | Cao 52px (size lg) hoặc 44px (md), rộng linh hoạt 140–360px                                |
| **Kích thước đích (3x)** | Rộng 480px, cao khoảng 160px (giữ tỉ lệ gốc sau khi crop)                                  |
| **Slice 9**              | 48px mỗi cạnh                                                                              |
| **Tạo ở tỉ lệ**          | 16:9 (nút nằm giữa, chừa lề rộng quanh)                                                    |
| **Vùng chữ**             | 60–70% chiều rộng ở giữa, hoàn toàn phẳng, màu đỏ sáp đồng nhất                            |
| **Chữ trên nút**         | Màu kem `#faebd7`, do HTML vẽ                                                              |

**Hình dáng:** tấm huy hiệu chữ nhật bo góc, lấy cảm hứng từ **con dấu sáp đỏ**. Thân đỏ thẫm `#8f1226`, viền ngoài sẫm `#4a0a14`. Mép viền hơi gợn như sáp chảy, nhưng **nhẹ và đối xứng** để vẫn co giãn được. Một đường chỉ vàng `#e8b84a` mảnh chạy sát bên trong viền. Hai đầu trái/phải có chi tiết nhỏ (đinh tán vàng hoặc hoa văn sáp ép) nằm trong vùng viền.

**Cảm giác:** nổi, có khối, dày dặn, xứng đáng để bấm. Đây là nút duy nhất sáng nhất màn hình.

**Trạng thái:**

- **idle:** nổi lên, bóng đổ nhẹ phía dưới, highlight nhẹ ở cạnh trên-trái.
- **pressed:** bị ép xuống, màu tối hơn ~15%, **không còn bóng đổ**, nhìn như dấu sáp đã đóng.
- **disabled:** sáp bạc màu xám tro `#6b7280`, vết nứt mảnh, **bỏ hết màu vàng**, không highlight.

```
[STYLE BLOCK]
A wide rounded-rectangle UI button plate inspired by a red wax seal. Deep crimson wax body #8f1226, darker rim #4a0a14, slightly melted wax edge that is subtle and perfectly symmetrical, a thin aged-gold #e8b84a inner border line hugging the rim, small gold rivet details only at the far left and right ends. The center 65% of the plate is completely flat, smooth, uniform crimson with no pattern, ready for text. Raised look with soft drop shadow below. Aspect ratio about 3:1, centered with wide margin on the green background.
```

**Pressed (đính kèm idle):**

```
Use the attached image as the exact base. Keep identical shape, size and outline. Change ONLY: make it look pressed down into the surface, color about 15% darker, remove the drop shadow, flatten the highlights. Same green background. NO text.
```

**Disabled (đính kèm idle):**

```
Use the attached image as the exact base. Keep identical shape, size and outline. Change ONLY: desaturate to dull ash-gray wax #6b7280, add one thin hairline crack, remove all gold, remove highlights. Same green background. NO text.
```

---

### 5.2 BTN-DANGER-BLOOD (nút nguy hiểm)

| Thuộc tính               | Giá trị                                                     |
| ------------------------ | ----------------------------------------------------------- |
| **Dùng cho**             | Hành động có hậu quả: "Treo cổ", "Hoàn tác", "Ván Mới", xóa |
| **Hiển thị trong app**   | Cao 44–52px, rộng linh hoạt                                 |
| **Kích thước đích (3x)** | Rộng 480px, cao khoảng 160px                                |
| **Slice 9**              | 48px                                                        |
| **Tạo ở tỉ lệ**          | 16:9                                                        |
| **Vùng chữ**             | 60–70% giữa, phẳng, đỏ máu sẫm đồng nhất                    |
| **Chữ trên nút**         | Hồng nhạt `#fda4af`, do HTML vẽ                             |

**Hình dáng:** tấm huy hiệu **đỏ máu rất sẫm** `#4a0a14`, tối hơn Primary để không cạnh tranh sự chú ý nhưng vẫn "báo nguy hiểm". **Vết móng vuốt cào** (3 đường chéo) ở hai đầu trái/phải. Vài **giọt máu nhỏ chỉ nằm dọc viền dưới**, không tràn ra ngoài khung. Viền đen, không có vàng (vàng dành riêng cho Primary).

**Cảm giác:** thô ráp, đe dọa, nhưng chữ vẫn rõ.

**Trạng thái:**

- **idle:** như mô tả, có độ ướt nhẹ ở giọt máu.
- **pressed:** tối hơn, ánh ướt tăng, bóng đổ biến mất.
- **disabled:** máu khô nâu xám `#4b4443`, không giọt ướt, không ánh.

```
[STYLE BLOCK]
A wide rounded-rectangle UI button plate, very dark blood-red #4a0a14 body with a near-black rim, three diagonal claw-scratch marks carved into the far left end and mirrored on the far right end, a few small blood droplets only along the bottom border strip staying inside the rectangle outline, no gold. The center 65% is completely flat dark blood-red with no pattern, ready for text. Menacing but clean. Soft drop shadow below. Aspect ratio about 3:1, centered with wide margin on the green background.
```

**Pressed:**

```
Use the attached image as the exact base. Keep identical shape and layout. Change ONLY: darker color, wetter glossy sheen on the blood droplets, remove the drop shadow, look pressed in. Same green background. NO text.
```

**Disabled:**

```
Use the attached image as the exact base. Keep identical shape and layout. Change ONLY: dried brown-gray blood #4b4443, remove all wet sheen, remove droplets' highlights, flat and lifeless. Same green background. NO text.
```

---

### 5.3 BTN-SECONDARY-IRON (nút phụ)

| Thuộc tính               | Giá trị                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Dùng cho**             | "Bước Trước", "Bỏ qua", "Hủy", nút phụ ở Setup ("Gán tên mặc định", "Xóa hết tên", "Sửa nhiều", "Lưu nhóm") |
| **Hiển thị trong app**   | Cao 44px (md) hoặc 36px (sm, có vùng chạm mở rộng lên 44)                                                   |
| **Kích thước đích (3x)** | Rộng 480px, cao khoảng 140px                                                                                |
| **Slice 9**              | 42px                                                                                                        |
| **Tạo ở tỉ lệ**          | 16:9                                                                                                        |
| **Vùng chữ**             | 65% giữa, phẳng, gỗ tối đồng nhất                                                                           |
| **Chữ trên nút**         | Màu kem nhạt `#e2e8f0`, do HTML vẽ                                                                          |

**Hình dáng:** tấm **gỗ sồi tối** `#2a2118` với **4 góc bọc sắt** và 4 đinh tán nhỏ. Vân gỗ **chạy ngang, mảnh, đều**, chỉ ở phần viền (giữa phẳng). Viền sắt xám `#2a2d45`. Không vàng, không đỏ.

**Cảm giác:** khiêm tốn, chắc chắn, "nền" của giao diện. Không thu hút mắt, để Primary nổi bật.

**Trạng thái:**

- **idle:** phẳng, bóng đổ rất nhẹ.
- **pressed:** tối hơn ~12%, lõm nhẹ, mất bóng.
- **disabled:** gỗ bạc màu, sắt mờ, độ tương phản thấp.

```
[STYLE BLOCK]
A wide rounded-rectangle UI button plate made of dark oak wood #2a2118 with four small iron corner brackets (#2a2d45) and four tiny iron rivets, thin horizontal wood grain visible only near the border strip, iron-gray rim. The center 65% is completely flat, uniform dark wood with no grain and no pattern, ready for text. Humble, sturdy, low-contrast. Very soft drop shadow. Aspect ratio about 3.4:1, centered with wide margin on the green background.
```

**Pressed:**

```
Use the attached image as the exact base. Keep identical shape and layout. Change ONLY: about 12% darker, look slightly recessed, remove the drop shadow. Same green background. NO text.
```

**Disabled:**

```
Use the attached image as the exact base. Keep identical shape and layout. Change ONLY: faded washed-out wood, dull iron, lower contrast overall. Same green background. NO text.
```

---

### 5.4 BTN-ICON-RUNE (nút icon tròn)

| Thuộc tính               | Giá trị                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Dùng cho**             | 8 nút header (Thiết lập, Đêm/Ngày, Luật, Sổ tay, Lịch sử, Cài đặt, Trình diễn), nút X đóng modal, nút +/− |
| **Hiển thị trong app**   | 32–40px (vùng chạm mở rộng lên 44px bằng CSS)                                                             |
| **Kích thước đích (3x)** | **144×144px**, không dùng 9-slice (đĩa tròn cố định)                                                      |
| **Tạo ở tỉ lệ**          | 1:1                                                                                                       |
| **Vùng icon**            | Vòng tròn trong cùng, đường kính ~60% đĩa, **hoàn toàn trống** (icon Lucide sẽ đặt lên bằng code)         |

**Hình dáng:** **đĩa đá rune tròn** màu xanh đen `#121422`, viền ngoài đồng thau/vàng cổ `#e8b84a` mảnh, một vòng khắc ngay trong viền (vạch rune nhỏ chạy quanh). Phần giữa là mặt đá phẳng tối.

**Trạng thái (4):**

- **idle:** như mô tả.
- **pressed:** tối hơn, lún xuống.
- **disabled:** xám, mất vàng, mờ.
- **active** (đang chọn, ví dụ chế độ Đêm đang bật): vòng khắc **phát sáng tím** `#7c3aed`, rim sáng hơn.

```
[STYLE BLOCK]
A single round rune-stone coin UI button, dark night-blue slate disc #121422 with a thin aged-gold #e8b84a rim, a ring of tiny carved rune notches just inside the rim, the inner circle (about 60% of the diameter) is completely empty flat dark slate with no symbol, ready for an icon. Slight raised look with soft shadow. Square image, coin centered with margin on the green background.
```

**Pressed:**

```
Use the attached image as the exact base. Keep identical shape. Change ONLY: darker, pressed into the surface, remove drop shadow. Same green background. NO text.
```

**Disabled:**

```
Use the attached image as the exact base. Keep identical shape. Change ONLY: desaturate to gray, remove the gold from the rim, lower contrast. Same green background. NO text.
```

**Active:**

```
Use the attached image as the exact base. Keep identical shape. Change ONLY: the carved rune ring glows soft violet #7c3aed, the gold rim is slightly brighter, subtle violet halo staying inside the coin outline. Same green background. NO text.
```

---

### 5.5 BTN-ICON-DANGER (nút icon nguy hiểm)

| Thuộc tính               | Giá trị                           |
| ------------------------ | --------------------------------- |
| **Dùng cho**             | Nút "Ván Mới/Reset", nút xóa item |
| **Hiển thị trong app**   | 32–40px (vùng chạm 44px)          |
| **Kích thước đích (3x)** | 144×144px                         |
| **Tạo ở tỉ lệ**          | 1:1                               |

**Hình dáng:** giống BTN-ICON-RUNE nhưng **viền đỏ máu** `#8f1226` thay vì vàng, vòng khắc là vết cào móng, mặt đá tối pha đỏ rất nhẹ. Không vàng.

```
[STYLE BLOCK]
A single round dark slate coin UI button, near-black disc with a blood-crimson #8f1226 rim, a ring of three-line claw scratch marks carved just inside the rim, the inner circle (about 60%) is completely empty flat dark with no symbol. Square image, coin centered with margin on the green background.
```

**Pressed / Disabled:** dùng lại câu lệnh của 5.4, nhưng với disabled thì đổi viền đỏ thành xám tro.

---

### 5.6 CHIP-LEATHER (chip / tab / breadcrumb)

| Thuộc tính               | Giá trị                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| **Dùng cho**             | Chip chọn người chơi trong Setup, tab ("Thiết Lập Ván Chơi" / "Kho Bộ Bài"), breadcrumb các bước đêm, filter |
| **Hiển thị trong app**   | Cao 32–36px (vùng chạm 44px), rộng linh hoạt                                                                 |
| **Kích thước đích (3x)** | Rộng 360px, cao khoảng 108px                                                                                 |
| **Slice 9**              | 40px                                                                                                         |
| **Tạo ở tỉ lệ**          | 16:9                                                                                                         |

**Hình dáng:** **nhãn da** hình viên thuốc (pill), da tối `#1d1a24`, **đường khâu chỉ** chạy quanh sát mép (chỉ xám nhạt). Vùng giữa phẳng. Rất ít chi tiết, nhỏ gọn.

**Trạng thái:**

- **idle:** da tối, chỉ khâu xám.
- **selected:** chỉ khâu chuyển **vàng cổ** `#e8b84a`, da sáng hơn một chút.
- **disabled:** da nhạt màu, chỉ khâu mờ.

```
[STYLE BLOCK]
A small pill-shaped stitched leather tag UI chip, dark leather #1d1a24, a thin dashed stitch line in light gray thread running around just inside the edge, center completely flat and plain, very low detail, matte. Aspect ratio about 3.3:1, centered with wide margin on the green background.
```

**Selected:**

```
Use the attached image as the exact base. Keep identical shape. Change ONLY: the stitch thread becomes aged gold #e8b84a, the leather becomes about 10% lighter. Same green background. NO text.
```

**Disabled:**

```
Use the attached image as the exact base. Keep identical shape. Change ONLY: faded washed-out leather, very faint stitch thread, low contrast. Same green background. NO text.
```

---

### 5.7 TOGGLE-CANDLE (công tắc)

| Thuộc tính               | Giá trị                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| **Dùng cho**             | Công tắc bật/tắt trong Cài đặt (Chế độ thử nghiệm, Tự động lưu ván, ...) |
| **Hiển thị trong app**   | Rộng ~56px, cao ~32px                                                    |
| **Kích thước đích (3x)** | **Hai ảnh: `off` và `on`**, mỗi ảnh 168×96px                             |
| **Tạo ở tỉ lệ**          | 16:9 (một vật thể: cây nến ngang trên đế)                                |

**Ý tưởng đơn giản hóa:** thay vì "track + knob", dùng **thanh gỗ ngắn có một ngọn nến nhỏ ở đầu bên phải**. **off** = nến tắt (khói mảnh), **on** = nến cháy ngọn lửa vàng ấm.

```
[STYLE BLOCK]
A small short horizontal dark wooden bar with a single small candle standing at its right end, the candle is UNLIT with a thin wisp of gray smoke, simple and compact, rounded wooden bar #2a2118. Centered with margin on the green background.
```

**On (đính kèm off):**

```
Use the attached image as the exact base. Keep the same wooden bar and candle. Change ONLY: the candle is lit with a small warm gold #e8b84a flame and a soft warm glow staying close to the candle, remove the smoke. Same green background. NO text.
```

---

## 6. Khung ô người chơi (SEAT-FRAME)

| Thuộc tính               | Giá trị                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Dùng cho**             | Ô ghế người chơi ở: chọn ghế, lưới người chơi, biểu quyết, hộp thoại hành động            |
| **Hiển thị trong app**   | Ô khoảng 64–90px cao, rộng 56–80px                                                        |
| **Kích thước đích (3x)** | **360×420px**, tỉ lệ ~6:7                                                                 |
| **Slice 9**              | 60px                                                                                      |
| **Tạo ở tỉ lệ**          | 3:4 (rồi crop)                                                                            |
| **Lỗ giữa**              | Vùng giữa tô `#00FF00` (sẽ thành trong suốt) để đặt avatar vai trò, tên, số ghế bằng code |

**Yêu cầu chung cho 4 khung:** cùng kích thước, cùng độ dày viền, cùng vị trí lỗ giữa, **chỉ khác họa tiết và màu theo phe**. Họa tiết chỉ ở viền và 4 góc. Góc dưới-trái và trên-phải để trống một ô nhỏ cho badge số ghế và sticker.

### 6.1 SEAT-FRAME-VILLAGE (Dân làng / mặc định)

**Hình dáng:** khung đá hoặc gỗ tối, viền **tím đậm** `#7c3aed` mờ, góc có **hoa văn dây leo khô** gọn. Cảm giác yên tĩnh.

```
[STYLE BLOCK]
A portrait rectangle picture frame for a player card, thick dark carved stone-and-wood border in night-blue #121422 with a thin violet #7c3aed inner line, small dry-vine ornaments only at the four corners, the whole center area is a clean empty rectangle filled with solid flat #00FF00 (to be cut out), no content inside. Frame fills most of the image. Aspect ratio 3:4.
```

### 6.2 SEAT-FRAME-WOLF (Phe Sói)

**Hình dáng:** khung tối viền **đỏ sẫm** `#8f1226`, **vết xước móng 3 đường** ở hai góc trên, gai nhỏ ở góc dưới. Cảm giác đe dọa.

```
[STYLE BLOCK]
A portrait rectangle picture frame for a player card, thick dark border in near-black with a crimson #8f1226 inner line, three diagonal claw scratches across the two top corners, small jagged thorn details at the bottom corners, the whole center area is a clean empty rectangle filled with solid flat #00FF00 (to be cut out), no content inside. Frame fills most of the image. Aspect ratio 3:4.
```

### 6.3 SEAT-FRAME-LOVER (Tình nhân)

**Hình dáng:** viền **hồng magenta** `#ec4899`, **sợi dây đỏ quấn** ở hai cạnh bên, trái tim nhỏ ở góc trên. Cảm giác lãng mạn nhưng u tối.

```
[STYLE BLOCK]
A portrait rectangle picture frame for a player card, dark border with a magenta-pink #ec4899 inner line, a thin red thread winding along the left and right sides and tied in a small bow at the top, a tiny heart ornament at the top center, the whole center area is a clean empty rectangle filled with solid flat #00FF00 (to be cut out), no content inside. Frame fills most of the image. Aspect ratio 3:4.
```

### 6.4 SEAT-FRAME-NEUTRAL (Phe thứ ba / trung lập)

**Hình dáng:** viền **vàng cổ** `#e8b84a`, góc có **ngôi sao nhọn / vòng mặt trăng** nhỏ. Cảm giác bí ẩn.

```
[STYLE BLOCK]
A portrait rectangle picture frame for a player card, dark border with an aged-gold #e8b84a inner line, small crescent-moon and pointed-star ornaments at the corners, the whole center area is a clean empty rectangle filled with solid flat #00FF00 (to be cut out), no content inside. Frame fills most of the image. Aspect ratio 3:4.
```

### 6.5 Trạng thái khung (overlay, tạo riêng)

**SEAT-SELECTED** (lớp phủ đang chọn, 360×420):

```
[STYLE BLOCK]
Only a soft violet #7c3aed glow outline hugging the outer edge of a portrait rectangle (same size as a player card frame), transparent-looking glow rendered on the green background, the center is solid #00FF00, no frame detail, no icon. Aspect ratio 3:4.
```

**SEAT-DEAD** (lớp phủ người chết, 360×420):

```
[STYLE BLOCK]
Only a faded grayscale stone cracked texture overlay in a portrait rectangle shape, thin crack lines radiating from one corner, a small simple cross-and-skull stamp mark at the bottom center without any letters, the rest is solid #00FF00. Aspect ratio 3:4.
```

> Người chết còn có ảnh avatar chuyển xám bằng CSS (`grayscale`). Overlay này chỉ thêm vết nứt/bia mộ.

---

## 7. Sticker trạng thái (10 cái)

| Thuộc tính               | Giá trị                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| **Dùng cho**             | Biểu tượng nhỏ ở góc ô người chơi để quản trò quét nhanh trạng thái                        |
| **Hiển thị trong app**   | 20–24px                                                                                    |
| **Kích thước đích (3x)** | **96×96px** mỗi sticker                                                                    |
| **Tạo ở tỉ lệ**          | 1:1                                                                                        |
| **Yêu cầu**              | Hình đơn giản, **đọc được ở 20px**, viền đen dày, một màu nhấn chủ đạo, không chi tiết nhỏ |

Mẫu prompt chung (thay `[SUBJECT]`):

```
[STYLE BLOCK]
A single bold simple game status icon sticker, [SUBJECT], thick dark outline, flat shading with only two tones, very simple readable silhouette that still reads clearly at 20 pixels, centered with generous margin on the green background. Square image.
```

| ID          | Tên           | `[SUBJECT]`                                                                              | Màu nhấn                                                                                 |
| ----------- | ------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| STK-SHERIFF | Cảnh trưởng   | a five-pointed sheriff star badge                                                        | vàng `#e8b84a`                                                                           |
| STK-LOVER   | Tình nhân     | a red heart tied with a thin thread knot                                                 | hồng `#ec4899`                                                                           |
| STK-CURSED  | Bị nguyền     | a violet skull-rune curse mark inside a circle                                           | tím `#7c3aed`                                                                            |
| STK-SLEEP   | Đang ngủ      | three stacked letter-free sleep swirls like a crescent moon with small dots (no letters) | xanh đêm                                                                                 |
| STK-HYPNO   | Bị thôi miên  | a spiral hypnosis swirl                                                                  | tím                                                                                      |
| STK-PROTECT | Được bảo vệ   | a small round shield                                                                     | xanh bạc                                                                                 |
| STK-POISON  | Bị đầu độc    | a small round potion vial with green-black liquid and a skull                            | xanh độc (ngoại lệ cho phép màu xanh lá, **nhưng không dùng `#00FF00`**, dùng `#2f6b3a`) |
| STK-HEAL    | Được cứu      | a small round potion vial with warm red-pink liquid and a plus sign made of shapes       | đỏ hồng                                                                                  |
| STK-CHARM   | Bị mê hoặc    | a small flute with musical swirl (no notes as letters)                                   | vàng                                                                                     |
| STK-ELDER   | Còn thêm mạng | two small stacked hearts                                                                 | đỏ                                                                                       |

> **Lưu ý riêng cho STK-POISON:** vì nền chroma là `#00FF00`, thêm vào prompt: _"the potion liquid is a dark muted green #2f6b3a#2f6b3a, clearly different from the pure bright green background"_. Nếu tách nền bị ăn vào lọ độc, tạo lại với nền chroma **xanh dương `#0000FF`** và đổi lệnh tách nền tương ứng.

---

## 8. Cấu trúc file đầu ra & đặt tên

```
public/ui/
  btn/
    btn-primary-idle.webp
    btn-primary-pressed.webp
    btn-primary-disabled.webp
    btn-danger-idle.webp / -pressed / -disabled
    btn-secondary-idle.webp / -pressed / -disabled
    btn-icon-idle.webp / -pressed / -disabled / -active
    btn-icon-danger-idle.webp / -pressed / -disabled
    chip-idle.webp / chip-selected.webp / chip-disabled.webp
    toggle-off.webp / toggle-on.webp
  seat/
    seat-frame-village.webp
    seat-frame-wolf.webp
    seat-frame-lover.webp
    seat-frame-neutral.webp
    seat-selected.webp
    seat-dead.webp
  sticker/
    stk-sheriff.webp  stk-lover.webp  stk-cursed.webp  stk-sleep.webp  stk-hypno.webp
    stk-protect.webp  stk-poison.webp stk-heal.webp    stk-charm.webp  stk-elder.webp
```

Quy ước: chữ thường, gạch ngang, `loại-biến thể-trạng thái`. Định dạng cuối: **WebP** (nền trong suốt). Dung lượng mỗi file nên < 25KB cho nút, < 40KB cho khung ghế.

### Gợi ý CSS áp dụng (cho tham khảo, agent sẽ làm)

```css
.btn-primary {
  border: 16px solid transparent; /* 48px @3x = 16px css */
  border-image: url("/ui/btn/btn-primary-idle.webp") 48 fill / 16px stretch;
  min-height: 44px;
}
.btn-primary:active {
  border-image-source: url("/ui/btn/btn-primary-pressed.webp");
  transform: translateY(1px);
}
.btn-primary:disabled {
  border-image-source: url("/ui/btn/btn-primary-disabled.webp");
}
```

---

## 9. Checklist kiểm tra mỗi asset (trước khi chốt)

- [ ] Không có chữ, số, logo, watermark.
- [ ] Nền là xanh `#00FF00` phẳng, tách nền sạch, không ám xanh ở viền.
- [ ] Đối xứng trái-phải, nhìn thẳng chính diện.
- [ ] Vùng giữa **trống và phẳng** (nút: chừa chỗ cho chữ; khung ghế: lỗ giữa sạch).
- [ ] Kéo giãn thử 9-slice (nút) ở 160px, 280px, 360px không méo họa tiết.
- [ ] Các trạng thái **cùng hình dạng, cùng kích thước**, chỉ khác màu/độ nổi.
- [ ] Giữ đúng bảng màu: không xuất hiện màu lạ (cam chói, xanh neon, trắng tinh).
- [ ] Chữ HTML đặt lên vẫn **đọc rõ trong phòng tối** (tương phản ≥ 4.5:1 so với nền nút).
- [ ] Mỗi phe (khung ghế) nhận diện được ngay khi nheo mắt (màu viền khác biệt rõ).
- [ ] Dung lượng trong giới hạn mục 8.

---

## 10. Gợi ý thứ tự tạo (hiệu quả cao nhất trước)

1. **STYLE-ANCHOR** (4.0)
2. **BTN-PRIMARY-SEAL** (3 trạng thái)
3. **BTN-DANGER-BLOOD** (3 trạng thái)
4. **BTN-SECONDARY-IRON** (3 trạng thái)
5. **BTN-ICON-RUNE** (4 trạng thái) + **BTN-ICON-DANGER**
6. **SEAT-FRAME** 4 phe + SEAT-SELECTED + SEAT-DEAD
7. **STICKER** 10 cái
8. **CHIP-LEATHER**, **TOGGLE-CANDLE**

Nếu hết thời gian, riêng bước 1–5 đã thay đổi cảm giác của toàn bộ app.
