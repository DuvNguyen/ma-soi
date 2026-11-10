# 🐺 TỔNG HỢP TOÀN BỘ LUẬT CHƠI VÀ CẨM NANG 44 NHÂN VẬT MA SÓI (WEREWOLF)

> **Tài liệu chuẩn dành cho Quản Trò (Game Master) & Đội Ngũ Phát Triển Logic Game**
> *Nguồn đối chiếu chuẩn mực*: Chuẩn hóa theo 44 lá trong bộ bài thực tế, đối chiếu trực tiếp các sách luật chính thức của dòng game quốc tế:
> - *The Werewolves of Miller's Hollow (Bộ cơ bản)*
> - *New Moon (Bản mở rộng Trăng Non)*
> - *Characters (Bản mở rộng Nhân vật)*
> - *The Village (Ngôi làng)*
> - *The Pact (Tuyển tập luật chuẩn Asmodee)*
> - *Characters Plus & Biến thể mở rộng Việt hóa*
> 
> 🎯 **Đặc biệt bổ sung**: Mục `- **Phe và thời điểm.**` rõ ràng cho từng nhân vật, giúp Quản trò và Lập trình viên xác định chính xác ai thức trước, ai thức sau để viết code logic và xử lý thứ tự sự kiện chuẩn xác tuyệt đối.

---

## 📑 MỤC LỤC TÀI LIỆU
1. [Quy Trình & Luật Chơi Cơ Bản Cho Quản Trò](#1-quy-trình--luật-chơi-cơ-bản-cho-quản-trò)
2. [Điều Kiện Thắng Của Các Phe (Win Conditions)](#2-điều-kiện-thắng-của-các-phe-win-conditions)
3. [Quy Chuẩn Thiết Kế Thẻ Bài Quản Trò (Card UI Standard)](#3-quy-chuẩn-thiết-kế-thẻ-bài-quản-trò-card-ui-standard)
4. [Bảng Thứ Tự Thức Dậy Ban Đêm & Kích Hoạt Sự Kiện (Wake-up Sequence)](#4-bảng-thứ-tự-thức-dậy-ban-đêm--kích-hoạt-sự-kiện)
   - [4.1. Giai Đoạn A: Đêm Đầu Tiên Duy Nhất (First Night Setup)](#41-giai-đoạn-a-đêm-đầu-tiên-duy-nhất-first-night-setup)
   - [4.2. Giai Đoạn B: Ban Đêm Thường Xuyên (Regular Night Loop)](#42-giai-đoạn-b-ban-đêm-thường-xuyên-regular-night-loop)
   - [4.3. Giai Đoạn C: Ban Ngày & Kỹ Năng Kích Hoạt (Day Phase & Triggers)](#43-giai-đoạn-c-ban-ngày--kỹ-năng-kích-hoạt-sự-kiện)
5. [Danh Sách Chi Tiết 44 Nhân Vật Chuẩn Theo 5 Phần](#5-danh-sách-chi-tiết-44-nhân-vật-chuẩn-theo-5-phần)
   - [Phần 1: Bộ Cơ Bản · 9 Lá & Chức Vụ (01 – 09)](#phần-1-bộ-cơ-bản--9-lá-và-chức-vụ)
   - [Phần 2: New Moon · 5 Vai Mở Rộng (10 – 14)](#phần-2-new-moon--5-vai)
   - [Phần 3: Characters · 15 Vai Mở Rộng (15 – 29)](#phần-3-characters--15-vai)
   - [Phần 4: The Village & Bài Sự Kiện New Moon (30 – 32)](#phần-4-the-village-và-các-vai-dùng-bài-sự-kiện-new-moon--3-lá)
   - [Phần 5: Mười Hai Lá Biến Thể Việt Hóa (33 – 44)](#phần-5-mười-hai-lá-biến-thể-việt-hóa)
6. [Phụ Lục: Các Vai Mở Rộng Cổ Điển Khác](#6-phụ-lục-các-vai-mở-rộng-cổ-điển-khác)
7. [Gợi Ý Thiết Lập Bàn Chơi Cho Quản Trò (Presets)](#7-gợi-ý-thiết-lập-bàn-chơi-cho-quản-trò-presets)

---

## 1. QUY TRÌNH & LUẬT CHƠI CƠ BẢN CHO QUẢN TRÒ

### 1.1. Chuẩn Bị & Phát Thẻ Bài
- **Xác định sĩ số làng**: Thích hợp từ 8 đến 30+ người chơi.
- **Quy tắc thêm thẻ Kẻ Trộm**: Khi có **Kẻ Trộm (#07)** trong ván chơi, Quản trò **bắt buộc thêm 2 lá Dân Làng thường** vào xấp bài chia, xáo đều và phát cho mỗi người 1 lá úp. **Hai lá còn dư được đặt úp giữa bàn** để Kẻ Trộm xem vào đêm đầu tiên.
- **Bảo mật danh tính**: Người chơi nhận bài, xem bí mật trong yên lặng và úp thẻ bài xuống bàn trước mặt.

### 1.2. Chu Kỳ Trò Chơi (Ban Đêm & Ban Ngày)
Trò chơi luân phiên tuần hoàn qua 2 giai đoạn chính liên tục cho đến khi xuất hiện phe đạt điều kiện chiến thắng:

#### 🌙 Giai Đoạn Ban Đêm (Night Phase)
1. **Quản trò hô**: *'Trời tối rồi, tất cả mọi người đi ngủ (nhắm mắt lại, cúi đầu xuống)'*.
2. Quản trò gọi lần lượt từng nhân vật theo **Thứ Tự Thức Dậy (Wake-up Sequence)** chuẩn xác.
3. Các nhân vật thức dậy **hoàn toàn im lặng**, chỉ giao tiếp bằng cử chỉ tay, ánh mắt hoặc gật/lắc đầu với Quản trò.
4. **Thứ tự gọi chuẩn quốc tế**:
   - **Đêm đầu tiên**: Gọi các vai thiết lập (Thiên Thần ngày 0 -> Kẻ Trộm -> Cupid -> Cặp đôi nhận mặt -> Hai Chị Em -> Ba Anh Em -> Anh Em Sói nhận mặt -> Tarzan chọn Thần Tượng -> Sói Lai chọn phe -> Ảnh Tử chọn bản thể -> Thẩm Phán ký hiệu).
   - **Mỗi đêm thường xuyên**: `Nguyệt Nữ -> Kịch Sĩ -> Bảo Vệ -> Tiên Tri -> Cáo -> Cổ Hoặc Sư -> Đàn Ma Sói (Cô Bé lén nhìn, Sói Quỷ nguyền, Sói Trùm cắn thêm, Sói Trắng giết sói) -> Phù Thủy -> Dược Sĩ -> Thổi Sáo -> Những người bị mê hoặc nhận mặt -> Quạ -> Người Digan`.

#### ☀️ Giai Đoạn Ban Ngày (Day Phase)
1. **Quản trò hô**: *'Trời sáng rồi, tất cả mọi người thức dậy!'*.
2. **Xử lý sự kiện đầu ngày**:
   - Công bố nạn nhân ban đêm (nếu có). Người bị loại lật bài (trừ khi có Người Hầu cướp bài) và rời ván.
   - **Thần Gấu (#18)**: Quản trò kiểm tra 2 người sống ngồi cạnh Thần Gấu, nếu có Sói thì Quản trò gầm lớn `GRỪZZZZZ!`.
   - **Hiệp Sĩ Già (#20)**: Nếu bị Sói cắn đêm qua, con Sói sống gần nhất bên trái bị nhiễm độc chết vào đêm tiếp theo.
   - **Bầu Cảnh Sát Trưởng (#09)**: Vào sáng ngày thứ nhất, làng tiến hành tranh cử và bầu ra Cảnh Sát Trưởng công khai.
3. **Tranh luận công khai**: Cả làng có khoảng 3-5 phút để thảo luận, tra hỏi, thanh minh và tìm kiếm kẻ đáng ngờ.
4. **Biểu quyết treo cổ (Voting)**:
   - Quản trò hô 1, 2, 3: Mọi người đồng thời chỉ tay vào người mình muốn treo cổ.
   - **Phiếu Cảnh Sát Trưởng tính gấp đôi (x2 phiếu)** ngay khi kiểm phiếu.
   - **Quy tắc hòa phiếu (Tie-vote)**:
     + **Theo bộ cơ bản**: Nếu số phiếu cao nhất bị bằng nhau giữa 2 hoặc nhiều người -> **KHÔNG AI BỊ LOẠI** trong ngày hôm đó!
     + **Khi có Oan Nhân (#12)**: Oan Nhân bị đưa lên giàn treo cổ thay thế ngay lập tức. Trước khi chết, Oan Nhân chỉ định ai được quyền bỏ phiếu vào ngày hôm sau.
   - **Xử lý đặc biệt khi bị treo**:
     + **Kẻ Ngốc (#13)**: Lật bài, được làng tha bổng và tiếp tục chơi, nhưng **mất vĩnh viễn quyền bỏ phiếu**.
     + **Người Hầu (#22)**: Trước khi người bị vote lật bài, Người Hầu có thể lật bài mình để lấy lá bài của người đó và nhận vai mới.
     + **Thẩm Phán (#19)**: Có thể dùng ám hiệu bí mật yêu cầu Quản trò mở ngay lượt bỏ phiếu treo thứ hai.

---

## 2. ĐIỀU KIỆN THẮNG CỦA CÁC PHE (WIN CONDITIONS)

| Ký Hiệu | Phe Phái (Team) | Màu Nhận Diện | Điều Kiện Chiến Thắng Chi Tiết (Win Conditions) |
|:---:|:---|:---:|:---|
| **[V]** | **Phe Dân Làng** *(Villagers)* | 🔵 Xanh Dương | **Chiến thắng khi TOÀN BỘ Ma Sói trong làng bị tiêu diệt sạch** (kể cả Sói Lai, Sói Con, Con Hoang hóa sói, Sói Quỷ...). |
| **[W]** | **Phe Ma Sói** *(Werewolves)* | 🔴 Đỏ | **Chiến thắng khi số lượng Ma Sói bằng hoặc nhiều hơn số lượng Dân Làng còn sống**, hoặc tiêu diệt toàn bộ dân làng. |
| **[3]** | **Phe Thứ Ba / Độc Lập** *(Neutral / 3rd Party)* | 🟣 Tím Đậm / Vàng | Có điều kiện thắng độc lập:<br>• **Sói Trắng (#27)**: Thắng khi là người sống sót duy nhất.<br>• **Thổi Sáo (#14)**: Thắng ngay khi toàn bộ người còn sống ngoài Thổi Sáo đều đã bị mê hoặc.<br>• **Cặp đôi khác phe (Cupid)**: Thắng khi chỉ còn 2 người họ sống sót cuối cùng.<br>• **Thiên Thần (#28)**: Thắng ngay nếu bị treo cổ ở lượt vote ngày 1 hoặc bị Sói cắn chết ở Đêm 1.<br>• **Bô Lão (#29)**: Thắng ngay khi toàn bộ người thuộc nhóm đối diện bị loại sạch.<br>• **Thích Khách (#44)**: Thắng khi hoàn thành mục tiêu trả thù. |
| **[?]** | **Phe Biến Đổi / Kế Thừa** *(Variable)* | ⚪ Xám / Đa sắc | Ban đầu thuộc Dân hoặc chưa xác định, sau đó đổi phe theo diễn biến game:<br>• **Kẻ Trộm (#07)**: Theo phe của lá bài mới chọn.<br>• **Tarzan (#23)**: Phe Dân, hóa Sói khi Thần Tượng bị loại.<br>• **Sói Lai (#24)**: Tự chọn cố định làm Dân hoặc Sói vào Đêm 1.<br>• **Bán Sói (#33) / Kẻ Bị Nguyền (#34)**: Phe Dân, hóa Sói khi bị Sói cắn.<br>• **Nạn nhân của Sói Quỷ (#26)**: Hóa Sói, giữ kỹ năng cũ và đổi phe sang thắng cùng Sói.<br>• **Ảnh Tử (#35) / Người Hầu (#22)**: Thừa kế vai và phe của người chết. |

---

## 3. QUY CHUẨN THIẾT KẾ THẺ BÀI QUẢN TRÒ (CARD UI STANDARD)
> **Thiết kế theo chuẩn Manager Chuyên Nghiệp:** Thẻ bài trực quan, đồng bộ ảnh chuẩn, hiển thị rõ vai trò và mã phe.

```text
+-----------------------------------------+
|  [TÊN NHÂN VẬT - VIETNAMESE / ENGLISH]  | <- Header vai trò & phân loại
+-----------------------------------------+
|                                         |
|           [HÌNH ẢNH LÁ BÀI]             | <- Ảnh lá bài chuẩn từ thư mục images/cards/
|                                         |
+-----------------------------------------+
|  - Phe và thời điểm: [Dân/Sói/3/Biến đổi] | <- THÔNG TIN TỐI QUAN TRỌNG ĐỂ CODE LOGIC
|  - Chức năng: [Tóm tắt kỹ năng]          |
|                                    [V]  | <- Badge mã phe [V], [W], [3], [?]
+-----------------------------------------+
```

---

## 4. BẢNG THỨ TỰ THỨC DẬY BAN ĐÊM & KÍCH HOẠT SỰ KIỆN
Để điều hành ván chơi mượt mà và lập trình logic game không bị xung đột, Quản trò tuân thủ nghiêm ngặt 3 bảng thứ tự thời điểm dưới đây:

### 4.1. Giai Đoạn A: Đêm Đầu Tiên Duy Nhất (First Night Setup)
*Các vai này chỉ được gọi DUY NHẤT một lần vào đêm đầu tiên để thiết lập liên kết ban đầu:*

| Thứ Tự | Nhân Vật | Mã Phe | Thời Điểm | Hành Động Của Quản Trò & Người Chơi |
|:---:|:---|:---:|:---|:---|
| **0.1** | **Thiên Thần (#28)** | `3` | Ban ngày trước Đêm 1 | Tranh luận và biểu quyết trước đêm 1. Nếu bị loại hoặc bị cắn đêm 1 -> Thắng ngay. |
| **0.3** | **Kẻ Trộm (#07)** | `?` | Đầu đêm 1 duy nhất | Thức dậy xem 2 lá bài thừa ngoài cuộc. Bắt buộc đổi bài khi cả hai lá đều là Sói. |
| **1.0** | **Cupid (#06)** | `V` | Đêm 1 duy nhất | Thức dậy chọn 2 người làm cặp đôi yêu nhau. Quản trò chạm vai 2 người. |
| **1.1** | **Cặp Đôi (Lovers)** | `V/3` | Đêm 1 (sau Cupid) | Hai người được ghép đôi thức dậy nhận diện nhau, giữ kín lá nhân vật. |
| **1.2** | **Hai Chị Em (#15)** | `V` | Đêm 1 duy nhất | Thức dậy cùng nhau để nhận diện đồng đội phe Dân. |
| **1.3** | **Ba Anh Em (#16)** | `V` | Đêm 1 duy nhất | Thức dậy cùng nhau để nhận diện đồng đội phe Dân. |
| **1.4** | **Anh Em Sói (#36, #37)** | `W` | Đêm 1 duy nhất | Sói Anh và Sói Em thức dậy nhận mặt nhau. Sau đó Sói Em ngủ tiếp cho đến khi Sói Anh chết. |
| **1.5** | **Tarzan / Con Hoang (#23)** | `?` | Đêm 1 duy nhất | Thức dậy chọn 1 người làm Thần Tượng. Khi Thần Tượng chết, Tarzan hóa Sói từ đêm sau. |
| **1.6** | **Sói Lai (#24)** | `?` | Đêm 1 duy nhất | Thức dậy chọn cố định làm Dân Làng hoặc Ma Sói cho đến hết ván. |
| **1.7** | **Ảnh Tử (#35)** | `?` | Đêm 1 duy nhất | Thức dậy bí mật chọn 1 người làm bản thể (khi người đó chết sẽ lấy bài thừa kế vai). |
| **1.8** | **Kẻ Báo Thù (#43)** | `?` | Đêm 1 duy nhất | Thức dậy chọn phe Dân hoặc Sói. |
| **1.9** | **Thẩm Phán (#19)** | `V` | Đêm 1 duy nhất | Thức dậy thống nhất một ám hiệu bí mật với Quản trò để kích hoạt vote lần 2. |

### 4.2. Giai Đoạn B: Ban Đêm Thường Xuyên (Regular Night Loop)
*Trình tự chuẩn mực lặp lại mỗi đêm (bỏ qua các vai vắng mặt hoặc đã chết):*

| Thứ Tự | Nhân Vật | Mã Phe | Tần Suất | Hành Động Của Quản Trò & Người Chơi |
|:---:|:---|:---:|:---|:---|
| **2.0** | **Nguyệt Nữ (#40)** | `V` | Đầu mỗi đêm | Chọn 1 người để phong ấn kỹ năng ban đêm (không chọn trùng người 2 đêm liên tiếp). |
| **2.5** | **Kịch Sĩ (#21)** | `V` | Mỗi đêm (khi còn bài) | Chọn 1 trong số lá bài phụ để mượn kỹ năng đến đêm tiếp theo. |
| **3.0** | **Bảo Vệ (#10)** | `V` | Mỗi đêm | Chọn 1 người bảo vệ khỏi cú cắn của Sói (không chọn trùng người 2 đêm liên tiếp). |
| **4.0** | **Tiên Tri (#03)** | `V` | Mỗi đêm (trước Sói) | Chọn 1 người. Quản trò cho xem bí mật TOÀN BỘ lá bài của người đó. |
| **4.5** | **Cáo (#17)** | `V` | Mỗi đêm (khi còn quyền) | Chọn nhóm 3 người ngồi liền kề. Nếu có Sói -> Giữ kỹ năng. Không có Sói -> Mất vĩnh viễn. |
| **4.8** | **Cổ Hoặc Sư (#39)** | `?` | Mỗi đêm | Chọn 1 người thế mạng nếu đêm nay mình chết. |
| **5.0** | **Đàn Ma Sói (#02)** | `W` | Mỗi đêm | Cả đàn Sói thức dậy thống nhất cắn 1 người. **Cô Bé Ti Hí (#08)** có thể lén hé mắt nhìn. |
| **5.2** | **Sói Quỷ (#26)** | `W` | Mỗi đêm (sau đàn Sói) | 1 lần mỗi ván: Biến nạn nhân vừa bị Sói cắn thành Ma Sói (nạn nhân giữ kỹ năng cũ). |
| **5.4** | **Sói Trùm (#25)** | `W` | Mỗi đêm (sau đàn Sói) | Khi chưa có con Sói nào chết, thức riêng cắn thêm 1 nạn nhân ngoài đàn. |
| **5.6** | **Sói Trắng (#27)** | `3` | Cách 1 đêm (từ Đêm 2) | Thức dậy riêng sau đàn Sói để chọn giết 1 con Sói khác. Thắng khi là người sống sót duy nhất. |
| **5.8** | **Sói Lửa (#38)** | `W` | Sau khi có Sói chết | Đêm tiếp theo được chọn 1 người để tước kỹ năng vĩnh viễn. |
| **6.0** | **Phù Thủy (#04)** | `V` | Mỗi đêm (sau đàn Sói) | Quản trò báo nạn nhân bị Sói cắn. Phù Thủy chọn dùng bình cứu và/hoặc bình độc (mỗi bình 1 liều). |
| **6.5** | **Dược Sĩ (#41)** | `V` | Mỗi đêm | Dùng bình Mê Hồn (cấm nói/vote 1 ngày) hoặc Hồi Phục (hồi bình cứu cho Phù Thủy). |
| **7.0** | **Thổi Sáo (#14)** | `3` | Mỗi đêm (sau Phù Thủy) | Chọn mê hoặc 2 người. Sau đó tất cả người bị mê hoặc thức dậy nhận mặt nhau rồi ngủ. |
| **8.0** | **Quạ (#30)** | `V` | Cuối mỗi đêm | Chọn đặt dấu tố cáo trước nhà 1 người (người này nhận sẵn 2 phiếu phạt vào sáng hôm sau). |
| **8.5** | **Người Digan (#31)** | `V` | Mỗi đêm | Chọn có dùng lá Gọi Hồn không, chọn câu hỏi và chỉ định người đọc vào sáng hôm sau. |

### 4.3. Giai Đoạn C: Ban Ngày & Kỹ Năng Kích Hoạt Sự Kiện
*Các kỹ năng kích hoạt theo thời điểm ban ngày hoặc sự kiện đặc thù:*

| STT | Nhân Vật | Mã Phe | Thời Điểm Kích Hoạt | Cơ Chế Thực Thi |
|:---:|:---|:---:|:---|:---|
| **9.0** | **Thần Gấu (#18)** | `V` | Mỗi buổi sáng sớm | Quản trò kiểm tra 2 người sống ngồi cạnh. Nếu có ít nhất 1 Sói -> Quản trò gầm lớn `GRỪZZZZZ!`. |
| **9.1** | **Hiệp Sĩ Già (#20)** | `V` | Khi bị Sói cắn chết | Con Sói sống gần nhất về bên trái bị nhiễm độc, sống thêm 1 ngày và chết vào đêm tiếp theo. |
| **9.2** | **Cảnh Sát Trưởng (#09)** | `V` | Sáng ngày thứ nhất | Làng bầu cử công khai. Giữ thẻ chức vụ song song thẻ vai. Phiếu tính x2. Chết chỉ định người kế vị. |
| **9.3** | **Kỵ Sĩ (#42)** | `V` | Ban ngày trước khi vote | Lật bài thách đấu 1 người. Trúng Sói -> Sói chết ngay, hết ngày. Sai -> Kỵ Sĩ chết sáng hôm sau. |
| **9.4** | **Thẩm Phán (#19)** | `V` | Trong lúc bỏ phiếu | Dùng ám hiệu bí mật yêu cầu Quản trò mở ngay lượt bỏ phiếu treo thứ 2 không qua tranh luận. |
| **9.5** | **Người Hầu (#22)** | `?` | Khi có người bị treo | Trước khi nạn nhân lật bài, lật bài mình để lấy bài người đó và nhận vai trò mới. |
| **9.6** | **Oan Nhân (#12)** | `V` | Khi phiếu biểu quyết hòa | Bị đưa lên giàn treo thay thế. Trước khi chết chỉ định ai được quyền bỏ phiếu vào ngày hôm sau. |
| **9.7** | **Kẻ Ngốc (#13)** | `V` | Khi bị bỏ phiếu treo | Lật bài công khai, được tha bổng nhưng mất vĩnh viễn quyền bỏ phiếu đến hết ván. |
| **9.8** | **Thợ Săn (#05)** | `V` | Khi chết (cắn/treo/cặp) | Lập tức chỉ tay bắn chết 1 người trước khi rời ván. |
| **9.9** | **Già Làng (#11)** | `V` | Bị động khi bị tấn công | Sống qua cú cắn đầu của Sói. Nếu bị Dân treo / Phù Thủy độc / Thợ Săn bắn -> Làng mất sạch kỹ năng! |

---

## 5. DANH SÁCH CHI TIẾT 44 NHÂN VẬT CHUẨN THEO 5 PHẦN

### Phần 1: Bộ Cơ Bản · 9 Lá và Chức Vụ
*Nguồn đối chiếu chính thức: The Werewolves of Miller's Hollow (tr. 3–9 và 12–18) & The Pact (tr. 8–12).*

### 01. Dân Làng — Simple Villager

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Dân Làng** |
| **Tên Tiếng Anh** | *Simple Villager* |
| **Thuộc Bộ Mở Rộng** | Bộ cơ bản |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#99** (Ngủ suốt đêm) |
| **Thời Điểm Gọi (Timing)** | **Dân Làng: Ban ngày suy luận, thảo luận và bỏ phiếu.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  01. DÂN LÀNG — SIMPLE VILLAGER            |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/la-bai-dan-lang.jpg]
> +-----------------------------------------+
> |  Dân Làng: Ban ngày suy luận, thảo lu  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Dân Làng — Simple Villager](images/cards/la-bai-dan-lang.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Ngủ suốt đêm.
- **Chức năng.** Ban ngày dựa vào lời khai, hành vi và phiếu bầu để tìm Sói. Bỏ phiếu như các vai khác.
- **Lưu ý.** Dân Làng có thể được bầu làm Cảnh Sát Trưởng và nhận quyền của chức vụ.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Không có lượt gọi ban đêm."*

---

### 02. Ma Sói — Werewolf

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Ma Sói** |
| **Tên Tiếng Anh** | *Werewolf* |
| **Thuộc Bộ Mở Rộng** | Bộ cơ bản |
| **Phe Phái (Team)** | `W` **Phe Ma Sói (Werewolf)** |
| **Thứ Tự Thức Dậy** | **#5.0** (Mỗi đêm) |
| **Thời Điểm Gọi (Timing)** | **Đàn Ma Sói thức dậy cùng nhau, bàn bằng cử chỉ thống nhất chọn 1 nạn nhân cắn chết.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  02. MA SÓI — WEREWOLF                     |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/la-bai-ma-soi.jpg]
> +-----------------------------------------+
> |  Đàn Ma Sói thức dậy cùng nhau, bàn b  |
> |                                    [W]  |
> +-----------------------------------------+
> ```

![Ma Sói — Werewolf](images/cards/la-bai-ma-soi.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Sói. Thức cùng đàn mỗi đêm.
- **Chức năng.** Đàn Sói bàn bằng cử chỉ và chọn chung **một** nạn nhân. Ban ngày Sói tranh luận và bỏ phiếu như những người khác.
- **Lưu ý.** *The Pact* nói rõ đàn chỉ được chọn người ngoài đàn và nếu cả đàn không thống nhất được thì không có nạn nhân của lượt cắn chung. [The Pact, tr. 8][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Ma Sói thức dậy! Hãy nhận diện đồng bọn và chọn con mồi đêm nay.' -> Bầy Sói bàn bằng cử chỉ và thống nhất chỉ vào 1 người -> 'Ma Sói đi ngủ.'"*

---

### 03. Tiên Tri — Seer / Fortune Teller

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Tiên Tri** |
| **Tên Tiếng Anh** | *Seer / Fortune Teller* |
| **Thuộc Bộ Mở Rộng** | Bộ cơ bản |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#4.0** (Mỗi đêm (trước Sói)) |
| **Thời Điểm Gọi (Timing)** | **Tiên Tri thức dậy chọn 1 người. Quản trò cho xem trọn vẹn lá nhân vật của người đó.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  03. TIÊN TRI — SEER / FORTUNE TELLER      |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/nhan_vat_ma_soi.jpg]
> +-----------------------------------------+
> |  Tiên Tri thức dậy chọn 1 người. Quản  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Tiên Tri — Seer / Fortune Teller](images/cards/nhan_vat_ma_soi.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Thức mỗi đêm.
- **Chức năng.** Chọn một người. Quản trò cho Tiên Tri xem riêng **lá nhân vật** của người đó. Trong bộ cơ bản, Tiên Tri hành động trước đàn Sói.
- **Lưu ý với bộ của bạn.** Lá **Tiên Tri bị in nhầm mô tả của Ma Sói**. Dùng tên và hình lá để nhận vai, rồi áp dụng chức năng ở trên.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Tiên Tri thức dậy! Hãy chọn một người để soi.' -> Tiên Tri chỉ 1 người -> Quản trò bí mật cho Tiên Tri xem trọn vẹn lá nhân vật của người đó -> 'Tiên Tri đi ngủ.'"*

---

### 04. Phù Thủy — Witch

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Phù Thủy** |
| **Tên Tiếng Anh** | *Witch* |
| **Thuộc Bộ Mở Rộng** | Bộ cơ bản |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#6.0** (Mỗi đêm (sau Sói)) |
| **Thời Điểm Gọi (Timing)** | **Phù Thủy thức dậy. Quản trò báo ai bị Sói cắn. Phù Thủy chọn dùng bình cứu và/hoặc bình độc.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  04. PHÙ THỦY — WITCH                      |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/la-bai-phu-thuy.jpg]
> +-----------------------------------------+
> |  Phù Thủy thức dậy. Quản trò báo ai b  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Phù Thủy — Witch](images/cards/la-bai-phu-thuy.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Được gọi sau lượt cắn của đàn Sói.
- **Chức năng.** Quản trò báo ai vừa bị Sói tấn công. Phù Thủy có thể dùng **bình cứu** cho nạn nhân đó hoặc dùng **bình độc** để loại một người mình chỉ định. Mỗi bình chỉ có một liều cho cả ván. Có thể giữ bình, dùng một bình hoặc dùng cả hai trong cùng một đêm.
- **Lưu ý.** Nếu chính Phù Thủy là nạn nhân, có thể dùng bình cứu cho mình. Quản trò theo dõi riêng hai bình và công bố kết quả vào sáng. Theo *The Pact*, bình cứu không giải mê của Thổi Sáo hay lời nguyền của Sói Quỷ. [The Pact, tr. 9][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Phù Thủy thức dậy!' -> Quản trò ra dấu cho biết ai bị Sói cắn -> 'Phù Thủy có muốn dùng bình cứu không? (Gật/Lắc)' -> 'Phù Thủy có muốn dùng bình độc không? (Nếu có hãy chỉ người)' -> 'Phù Thủy đi ngủ.'"*

---

### 05. Thợ Săn — Hunter

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Thợ Săn** |
| **Tên Tiếng Anh** | *Hunter* |
| **Thuộc Bộ Mở Rộng** | Bộ cơ bản |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#9.8** (Khi bị loại (Sói cắn/treo/chết theo cặp)) |
| **Thời Điểm Gọi (Timing)** | **Thợ Săn lập tức bắn chết 1 người trước khi rời ván.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  05. THỢ SĂN — HUNTER                      |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/la-bai-tho-san.jpg]
> +-----------------------------------------+
> |  Thợ Săn lập tức bắn chết 1 người trư  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Thợ Săn — Hunter](images/cards/la-bai-tho-san.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Kích hoạt khi bị Sói giết hoặc bị làng loại qua bỏ phiếu.
- **Chức năng.** Trước khi rời ván, chọn ngay một người chơi khác để bắn. Người bị bắn bị loại ngay.
- **Lưu ý.** Lá in của bạn ghi chung là “khi chết”. Mục nhân vật trong sách cơ bản nêu hai nguyên nhân ở trên. *The Pact* bổ sung trường hợp Thợ Săn là một nửa cặp Cupid và chết theo người yêu thì vẫn được bắn. [Bộ cơ bản, tr. 5][base] · [The Pact, tr. 10][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Kích hoạt khi Thợ Săn chết: Quản trò hô: 'Thợ Săn đã bị loại! Trước khi chết, Thợ Săn hãy chọn một người để bắn hạ!' -> Thợ Săn chỉ 1 người -> Người đó bị loại ngay lập tức."*

---

### 06. Cupid — Thần Tình Yêu

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Cupid** |
| **Tên Tiếng Anh** | *Cupid* |
| **Thuộc Bộ Mở Rộng** | Bộ cơ bản |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#1.0** (Đêm đầu tiên duy nhất) |
| **Thời Điểm Gọi (Timing)** | **Cupid thức dậy ghép đôi 2 người yêu nhau. Quản trò chạm vai 2 người, sau đó gọi riêng cặp đôi thức nhận mặt.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  06. CUPID — THẦN TÌNH YÊU                 |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/la-bai-than-tinh-yeu.jpg]
> +-----------------------------------------+
> |  Cupid thức dậy ghép đôi 2 người yêu   |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Cupid — Thần Tình Yêu](images/cards/la-bai-than-tinh-yeu.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Mặc định thuộc phe Dân. Chỉ dùng kỹ năng vào đêm đầu.
- **Chức năng.** Chọn hai người làm cặp đôi, có thể chọn chính mình làm một nửa. Quản trò bí mật chạm vai hai người, sau đó gọi riêng cặp đôi thức để nhận mặt. Họ nhìn mặt nhau, còn lá nhân vật giữ kín.
- **Lưu ý.** Một người bị loại thì người còn lại chết theo ngay. Hai người không được bỏ phiếu treo nhau, kể cả để đánh lạc hướng. Cặp Dân–Sói có mục tiêu riêng là trở thành hai người sống cuối. Cupid chỉ chịu ràng buộc của cặp đôi nếu tự ghép mình vào cặp. Theo bộ cơ bản, quản trò gọi cặp đôi nhận mặt ở đêm đầu. *The Pact* ghi cặp Dân–Thổi Sáo cũng có mục tiêu sống cuối cùng như cặp Dân–Sói. [The Pact, tr. 9][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Đêm 1): 'Cupid thức dậy! Hãy chọn hai người để ghép đôi tình yêu.' -> Cupid chỉ 2 người -> 'Cupid đi ngủ.' -> Quản trò đi quanh chạm vai 2 người được chọn -> 'Cặp đôi thức dậy nhận mặt nhau!' -> 2 người mở mắt nhìn nhau -> 'Cặp đôi đi ngủ.'"*

---

### 07. Kẻ Trộm — Thief

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Kẻ Trộm** |
| **Tên Tiếng Anh** | *Thief* |
| **Thuộc Bộ Mở Rộng** | Bộ cơ bản |
| **Phe Phái (Team)** | `?` **Tùy Biến / Kế Thừa (Variable)** |
| **Thứ Tự Thức Dậy** | **#0.3** (Đầu đêm 1 duy nhất) |
| **Thời Điểm Gọi (Timing)** | **Kẻ Trộm thức dậy xem 2 lá bài úp ngoài cuộc. Bắt buộc đổi bài chỉ khi cả hai lá đều là Sói.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  07. KẺ TRỘM — THIEF                       |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/an_trom.PNG]
> +-----------------------------------------+
> |  Kẻ Trộm thức dậy xem 2 lá bài úp ngo  |
> |                                    [?]  |
> +-----------------------------------------+
> ```

![Kẻ Trộm — Thief](images/cards/an_trom.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe phụ thuộc lá nhận được. Thức vào đầu đêm thứ nhất.
- **Chuẩn bị.** Thêm hai lá Dân thường vào bộ bài chuẩn bị chia, xáo và phát bài như bình thường. Đặt **hai lá còn dư sau khi chia** úp giữa bàn.
- **Chức năng.** Kẻ Trộm xem hai lá dư và có thể đổi sang một trong hai. **Chỉ bắt buộc đổi khi cả hai lá dư đều là Sói.** Nếu đổi, giữ vai mới cho phần còn lại của ván.
- **Lưu ý với bộ của bạn.** Dòng bắt buộc chọn Sói khi chỉ một trong hai lá là Sói thuộc luật in trên lá. Khi chơi theo sách, Kẻ Trộm vẫn có quyền lựa chọn trong tình huống đó.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Đầu Đêm 1): 'Kẻ Trộm thức dậy! Hãy xem hai lá bài thừa ngoài cuộc.' -> Kẻ Trộm xem 2 lá và chọn đổi hoặc giữ -> 'Kẻ Trộm đi ngủ.'"*

---

### 08. Cô Bé Ti Hí — Little Girl

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Cô Bé Ti Hí** |
| **Tên Tiếng Anh** | *Little Girl* |
| **Thuộc Bộ Mở Rộng** | Bộ cơ bản |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#5.0a** (Trong lúc đàn Sói thức) |
| **Thời Điểm Gọi (Timing)** | **Cô Bé Ti Hí có thể hé mắt lén nhìn Sói. Nếu bị Sói phát hiện thì chết thay cho nạn nhân.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  08. CÔ BÉ TI HÍ — LITTLE GIRL             |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/huong-dan-choi-ma-soi4.jpg]
> +-----------------------------------------+
> |  Cô Bé Ti Hí có thể hé mắt lén nhìn S  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Cô Bé Ti Hí — Little Girl](images/cards/huong-dan-choi-ma-soi4.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Có thể hé mắt ngay từ **đêm đầu**, trong đúng lượt đàn Sói đang thức.
- **Chức năng.** Lén nhìn để nhận diện Sói. Nếu đàn Sói phát hiện, cô bé chết **thay cho nạn nhân đàn đã chọn** trong lượt đó.
- **Lưu ý.** Quản trò không gọi riêng. Khi dùng vai này, người chơi để lộ mặt lúc nhắm mắt. *The Pact* nói rõ cô bé chỉ được hé mắt, không được mở hẳn để giả làm Sói. Trong *New Moon*, Bảo Vệ không che chở được cô bé. [Bộ cơ bản, tr. 8 và 13–14][base] · [New Moon, tr. 27][newmoon] · [The Pact, tr. 10][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Không gọi riêng. Trong lúc đàn Sói thức dậy, Cô Bé Ti Hí có thể lén hé mắt nhìn. Nếu Quản trò thấy Sói bắt quả tang Cô Bé, ghi nhận Cô Bé chết thay cho nạn nhân."*

---

### 09. Cảnh Sát Trưởng — Sheriff

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Cảnh Sát Trưởng** |
| **Tên Tiếng Anh** | *Sheriff* |
| **Thuộc Bộ Mở Rộng** | Bộ cơ bản (Chức vụ) |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#9.2** (Sáng ngày thứ nhất) |
| **Thời Điểm Gọi (Timing)** | **Cảnh Sát Trưởng: Bầu cử công khai sáng ngày 1. Phiếu tính x2. Khi chết chỉ định người kế nhiệm.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  09. CẢNH SÁT TRƯỞNG — SHERIFF             |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Canh_sat.jpg]
> +-----------------------------------------+
> |  Cảnh Sát Trưởng: Bầu cử công khai sá  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Cảnh Sát Trưởng — Sheriff](images/cards/Canh_sat.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Loại lá.** Chức vụ công khai do người chơi bầu, giữ cùng lá nhân vật chính. Người được bầu phải nhận chức. Lá này sẽ được bầu cử ngay buổi sáng đầu tiên, tức là một người chơi đã có role sẽ nhận thêm role cảnh sát trưởng.
- **Chức năng.** Lá phiếu treo tính **hai phiếu cùng chỉ vào một người**. Khi bị loại, Cảnh Sát Trưởng chỉ định người kế nhiệm.
- **Lưu ý về hòa phiếu.** Sách bộ cơ bản ghi hòa sau khi tính phiếu thì không ai bị loại. Mục *Sheriff* trong *The Pact* còn ghi quyền bỏ phiếu quyết định khi hòa. Tài liệu này dùng cách xử lý của **bộ cơ bản và New Moon**, kể cả khi trên lá của bạn có in quyền phân xử. [Bộ cơ bản, tr. 8–9 và 17][base] · [The Pact, tr. 12][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Ban ngày sáng ngày 1: Quản trò thông báo: 'Làng hãy tiến hành tranh cử và bỏ phiếu bầu ra Cảnh Sát Trưởng!' -> Người có nhiều phiếu nhất nhận thẻ Cảnh Sát Trưởng."*

---

### Phần 2: New Moon · 5 Vai
*Nguồn đối chiếu chính thức: New Moon (tr. 23–28) & The Pact (tr. 10–15).*

### 10. Bảo Vệ — Defender / Savior

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Bảo Vệ** |
| **Tên Tiếng Anh** | *Defender / Savior* |
| **Thuộc Bộ Mở Rộng** | New Moon |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#3.0** (Mỗi đêm (trước Tiên Tri & Sói)) |
| **Thời Điểm Gọi (Timing)** | **Bảo Vệ thức dậy chọn 1 người để bảo vệ khỏi cú cắn của Sói (không chọn trùng 2 đêm liên tiếp).** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  10. BẢO VỆ — DEFENDER / SAVIOR            |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/la-bai-bao-ve.jpg]
> +-----------------------------------------+
> |  Bảo Vệ thức dậy chọn 1 người để bảo   |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Bảo Vệ — Defender / Savior](images/cards/la-bai-bao-ve.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Thức mỗi đêm, trước Tiên Tri và đàn Sói theo thứ tự của *New Moon*.
- **Chức năng.** Chọn một người để bảo vệ khỏi cú cắn của Sói trong đêm đó. Có thể tự chọn mình. Không được chọn cùng một người hai đêm liên tiếp.
- **Lưu ý.** Kỹ năng này không có tác dụng với Cô Bé Ti Hí. Phạm vi bảo vệ là cú cắn, nên thuốc độc và bỏ phiếu treo vẫn có tác dụng. *The Pact* ghi rõ mê hoặc của Thổi Sáo và lây nhiễm của Sói Quỷ cũng nằm ngoài phạm vi bảo vệ. [The Pact, tr. 10][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Bảo Vệ thức dậy! Hãy chọn một người để bảo vệ đêm nay (không chọn người đêm trước).' -> Bảo Vệ chỉ 1 người -> 'Bảo Vệ đi ngủ.'"*

---

### 11. Già Làng — Elder

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Già Làng** |
| **Tên Tiếng Anh** | *Elder* |
| **Thuộc Bộ Mở Rộng** | New Moon |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#9.9** (Bị động) |
| **Thời Điểm Gọi (Timing)** | **Già Làng sống qua cú cắn đầu của Sói. Nếu bị làng treo/Phù Thủy độc/Thợ Săn bắn -> Làng mất hết kỹ năng!** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  11. GIÀ LÀNG — ELDER                      |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/la-bai-gia-lang.jpg]
> +-----------------------------------------+
> |  Già Làng sống qua cú cắn đầu của Sói  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Già Làng — Elder](images/cards/la-bai-gia-lang.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Quản trò tự theo dõi khả năng chịu đòn, không có lượt thức riêng.
- **Chức năng.** Sống qua cú cắn đầu tiên của Sói và giữ kín thân phận. Cú cắn thứ hai có thể loại Già Làng. Bình cứu của Phù Thủy chỉ hồi lại **một mạng**.
- **Lưu ý.** Treo cổ, thuốc độc của Phù Thủy và phát bắn của Thợ Săn có thể loại Già Làng ngay. Nếu Già Làng bị loại theo một trong ba cách này, **phe Dân mất kỹ năng đặc biệt đến hết ván**. Khi Sói cắn chết Già Làng, phe Dân giữ kỹ năng. Biến thể tùy chọn của *New Moon* cho Kẻ Ngốc đã lật bài bị loại cùng Già Làng khi làng mất kỹ năng. *The Pact* bổ sung rằng cú cắn đầu tiên cũng không thể hóa Sói Già Làng. [The Pact, tr. 10][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò âm thầm theo dõi số mạng của Già Làng. Nếu Sói cắn lần 1, không công bố Già Làng chết. Nếu Già Làng bị treo/thuốc độc/bắn, thông báo cả làng mất kỹ năng đặc biệt."*

---

### 12. Oan Nhân — Scapegoat

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Oan Nhân** |
| **Tên Tiếng Anh** | *Scapegoat* |
| **Thuộc Bộ Mở Rộng** | New Moon |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#9.6** (Khi bỏ phiếu hòa) |
| **Thời Điểm Gọi (Timing)** | **Oan Nhân bị treo cổ thay khi hòa phiếu. Trước khi chết, chỉ định những ai được quyền vote vào ngày hôm sau.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  12. OAN NHÂN — SCAPEGOAT                  |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi_Scapegoat.jpg]
> +-----------------------------------------+
> |  Oan Nhân bị treo cổ thay khi hòa phi  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Oan Nhân — Scapegoat](images/cards/Nhan_vat_Ma_soi_Scapegoat.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Kích hoạt khi lượt bỏ phiếu treo của làng bị hòa.
- **Chức năng.** Oan Nhân bị loại thay những người hòa phiếu, kể cả khi chính Oan Nhân không nằm trong số đó. Sách cũng quy định khi bị loại, Oan Nhân chỉ định **một hoặc nhiều người được quyền bỏ phiếu vào ngày hôm sau** trước khi rời ván.
- **Lưu ý.** Nếu sáng hôm sau tất cả người được chỉ định đều đã bị loại, làng bỏ qua lượt bỏ phiếu hôm đó. Lá của bạn in hiệu ứng chọn một người bị treo vào sáng sau. Khi chơi theo sách, người được chọn chỉ **có quyền bỏ phiếu**.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Khi kiểm phiếu ban ngày bị hòa: Quản trò hô: 'Phiếu bầu bị hòa! Oan Nhân sẽ bị đưa lên giàn treo cổ thế mạng!' -> 'Oan Nhân trước khi rời ván hãy chỉ định ai được quyền bỏ phiếu vào ngày mai!'"*

---

### 13. Kẻ Ngốc — Village Idiot

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Kẻ Ngốc** |
| **Tên Tiếng Anh** | *Village Idiot* |
| **Thuộc Bộ Mở Rộng** | New Moon |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#9.7** (Khi bị bỏ phiếu treo) |
| **Thời Điểm Gọi (Timing)** | **Kẻ Ngốc lật bài được làng tha bổng, sống tiếp nhưng mất vĩnh viễn quyền bỏ phiếu đến hết ván.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  13. KẺ NGỐC — VILLAGE IDIOT               |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi__Thang_ngoc.jpg]
> +-----------------------------------------+
> |  Kẻ Ngốc lật bài được làng tha bổng,   |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Kẻ Ngốc — Village Idiot](images/cards/Nhan_vat_Ma_soi__Thang_ngoc.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Kích hoạt khi bị làng chọn treo.
- **Chức năng.** Lật bài công khai, được tha và tiếp tục chơi. Vẫn có thể tham gia thảo luận nhưng mất quyền bỏ phiếu đến hết ván.
- **Lưu ý.** Sói vẫn cắn chết và Thợ Săn vẫn bắn chết Kẻ Ngốc. Nếu đang giữ chức Cảnh Sát Trưởng khi được tha, chức vụ bị bỏ và không truyền lại. *The Pact* ghi rõ không mở lượt bỏ phiếu thay thế trong tình huống này. Luật thắng riêng khi bị treo của nhóm bạn là biến thể riêng. [The Pact, tr. 11][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Khi Kẻ Ngốc bị biểu quyết treo cổ: Quản trò hô: 'Người bị chọn là Kẻ Ngốc! Kẻ Ngốc lật bài công khai và được làng tha bổng, nhưng mất vĩnh viễn quyền bỏ phiếu!'"*

---

### 14. Thổi Sáo — Piper

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Thổi Sáo** |
| **Tên Tiếng Anh** | *Piper* |
| **Thuộc Bộ Mở Rộng** | New Moon |
| **Phe Phái (Team)** | `3` **Phe Thứ Ba / Độc Lập (Neutral / 3rd Party)** |
| **Thứ Tự Thức Dậy** | **#7.0** (Mỗi đêm (sau Phù Thủy)) |
| **Thời Điểm Gọi (Timing)** | **Thổi Sáo thức dậy chọn mê hoặc 2 người. Sau đó tất cả người bị mê hoặc thức dậy nhận mặt nhau.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  14. THỔI SÁO — PIPER                      |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/thoisao.jpg]
> +-----------------------------------------+
> |  Thổi Sáo thức dậy chọn mê hoặc 2 ngư  |
> |                                    [3]  |
> +-----------------------------------------+
> ```

![Thổi Sáo — Piper](images/cards/thoisao.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe riêng. Gọi sau Phù Thủy mỗi đêm.
- **Chức năng.** Mỗi đêm chọn hai người để mê hoặc. Quản trò chạm vai họ. Sau khi Thổi Sáo nhắm mắt, gọi **tất cả những người còn sống đã bị mê hoặc**, cả cũ lẫn mới, thức để nhận mặt nhau.
- **Điều kiện thắng.** Thắng ngay khi mọi người còn sống ngoài Thổi Sáo đều đã bị mê hoặc. Có thể đạt điều kiện ngay sau một lượt bỏ phiếu hoặc một ca bị loại.
- **Lưu ý.** Thổi Sáo không tự mê hoặc mình. Người bị mê hoặc giữ phe và kỹ năng cũ. Có thể mê hoặc Sói, và mê hoặc một người trong cặp Cupid không tự lan sang người còn lại. Theo *The Pact*, nếu bị Sói Quỷ hóa Sói, Thổi Sáo bỏ mục tiêu riêng và thành Sói thường. [The Pact, tr. 15][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Người Thổi Sáo thức dậy! Hãy chọn hai người để mê hoặc.' -> Thổi Sáo chỉ 2 người -> 'Thổi Sáo đi ngủ.' -> Quản trò chạm vai 2 người mới -> 'Tất cả những người bị mê hoặc hãy thức dậy nhận mặt nhau!' -> Họ mở mắt nhìn nhau -> 'Những người bị mê hoặc đi ngủ.'"*

---

### Phần 3: Characters · 15 Vai
*Nguồn đối chiếu chính thức: Characters (tr. 4–21 và 28–31) & The Pact (tr. 8 và 11–15).*

### 15. Hai Chị Em — Two Sisters

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Hai Chị Em** |
| **Tên Tiếng Anh** | *Two Sisters* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#1.2** (Đêm đầu tiên duy nhất) |
| **Thời Điểm Gọi (Timing)** | **Hai Chị Em thức dậy nhận mặt nhau.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  15. HAI CHỊ EM — TWO SISTERS              |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi__Hai_chi_em.PNG]
> +-----------------------------------------+
> |  Hai Chị Em thức dậy nhận mặt nhau.    |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Hai Chị Em — Two Sisters](images/cards/Nhan_vat_Ma_soi__Hai_chi_em.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Hai người phe Dân, mỗi người nhận một lá. Thức cùng nhau trong đêm đầu để nhận mặt.
- **Chức năng.** Thông tin nhận mặt giúp hai người biết một đồng đội ngay từ đầu. Họ vẫn bỏ phiếu và bị loại riêng.
- **Lưu ý.** Luật nâng cao cho phép quản trò thỉnh thoảng gọi họ dậy lại để trao đổi nhanh, yên lặng bằng cử chỉ. Thứ tự cơ bản chỉ có lượt nhận mặt đêm đầu.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Đêm 1): 'Hai Chị Em thức dậy nhận mặt nhau!' -> Hai Chị Em mở mắt nhìn nhau -> 'Hai Chị Em đi ngủ.'"*

---

### 16. Ba Anh Em — Three Brothers

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Ba Anh Em** |
| **Tên Tiếng Anh** | *Three Brothers* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#1.3** (Đêm đầu tiên duy nhất) |
| **Thời Điểm Gọi (Timing)** | **Ba Anh Em thức dậy nhận mặt nhau.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  16. BA ANH EM — THREE BROTHERS            |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi___Ba_anh_em.PNG]
> +-----------------------------------------+
> |  Ba Anh Em thức dậy nhận mặt nhau.     |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Ba Anh Em — Three Brothers](images/cards/Nhan_vat_Ma_soi___Ba_anh_em.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Ba người phe Dân, mỗi người nhận một lá. Đêm đầu gọi cả ba dậy để nhận mặt.
- **Chức năng.** Ba người nhận diện được hai đồng đội. Họ vẫn bỏ phiếu và bị loại riêng.
- **Lưu ý.** Có thể gọi lại thỉnh thoảng theo luật nâng cao. Sách *Characters* dành bộ ba cho làng đông và chỉ gợi ý dùng chung cả bộ ba lẫn Hai Chị Em khi làng rất đông.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Đêm 1): 'Ba Anh Em thức dậy nhận mặt nhau!' -> Ba Anh Em mở mắt nhìn nhau -> 'Ba Anh Em đi ngủ.'"*

---

### 17. Cáo — Fox

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Cáo** |
| **Tên Tiếng Anh** | *Fox* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#4.5** (Mỗi đêm (trước Sói)) |
| **Thời Điểm Gọi (Timing)** | **Cáo chọn nhóm 3 người ngồi liền kề. Nếu có ít nhất 1 Sói -> Giữ kỹ năng. Không có Sói -> Mất kỹ năng vĩnh viễn.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  17. CÁO — FOX                             |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi___Cao.PNG]
> +-----------------------------------------+
> |  Cáo chọn nhóm 3 người ngồi liền kề.   |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Cáo — Fox](images/cards/Nhan_vat_Ma_soi___Cao.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Được gọi mỗi đêm khi còn kỹ năng, có thể bỏ qua lượt.
- **Chức năng.** Chỉ người ở giữa một nhóm **ba người còn sống ngồi liền nhau**. Quản trò chỉ báo có ít nhất một Sói trong nhóm hay không. Nếu có thì giữ kỹ năng để dùng tiếp. Nếu không thì mất kỹ năng vĩnh viễn.
- **Lưu ý.** Quản trò không cho xem lá và không tiết lộ số lượng hay danh tính Sói. Khi xác định ba người ngồi liền nhau, bỏ qua chỗ của người đã bị loại.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Cáo thức dậy! Hãy chọn người đứng giữa một nhóm ba người liền kề.' -> Cáo chỉ 1 người -> Quản trò kiểm tra 3 người và ra dấu (Gật đầu nếu có ít nhất 1 Sói, Lắc đầu nếu không có Sói nào) -> 'Cáo đi ngủ.'"*

---

### 18. Thần Gấu — Bear Tamer

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Thần Gấu** |
| **Tên Tiếng Anh** | *Bear Tamer* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#9.0** (Mỗi buổi sáng) |
| **Thời Điểm Gọi (Timing)** | **Thần Gấu: Quản trò kiểm tra 2 người sống ngồi cạnh. Nếu có ít nhất 1 Sói -> Quản trò gầm lớn cho cả làng nghe.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  18. THẦN GẤU — BEAR TAMER                 |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi__Nguoi_thuan_phuc_gau.PNG]
> +-----------------------------------------+
> |  Thần Gấu: Quản trò kiểm tra 2 người   |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Thần Gấu — Bear Tamer](images/cards/Nhan_vat_Ma_soi__Nguoi_thuan_phuc_gau.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Quản trò kiểm tra vào mỗi sáng, ngay sau khi công bố nạn nhân ban đêm.
- **Chức năng.** Xét người còn sống gần nhất ở mỗi phía của Thần Gấu. Nếu ít nhất một trong hai là Sói, quản trò gầm để cả làng nghe.
- **Lưu ý.** Hàng xóm có thể thay đổi sau khi có người bị loại. Nếu Thần Gấu bị Sói Quỷ hóa Sói, quản trò gầm mỗi sáng cho tới khi Thần Gấu bị loại.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Sáng sớm sau khi công bố nạn nhân: Quản trò kiểm tra 2 người sống ngồi cạnh Thần Gấu. Nếu có Sói, Quản trò gầm lớn: 'GRỪZZZZZ!' thông báo cho cả làng."*

---

### 19. Thẩm Phán — Stuttering Judge / Wandering Judge

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Thẩm Phán** |
| **Tên Tiếng Anh** | *Stuttering Judge* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#1.9** (Đêm 1 thống nhất ám hiệu) |
| **Thời Điểm Gọi (Timing)** | **Thẩm Phán: 1 lần mỗi ván, ra ám hiệu để mở ngay lượt bỏ phiếu treo thứ 2 mà không cần tranh luận.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  19. THẨM PHÁN — STUTTERING JUDGE / WANDER |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi___Tham_phan_lap_bap.PNG]
> +-----------------------------------------+
> |  Thẩm Phán: 1 lần mỗi ván, ra ám hiệu  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Thẩm Phán — Stuttering Judge / Wandering Judge](images/cards/Nhan_vat_Ma_soi___Tham_phan_lap_bap.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Đêm đầu thống nhất một ám hiệu với quản trò.
- **Chức năng.** Một lần mỗi ván, dùng ám hiệu trong lượt bỏ phiếu để yêu cầu **lượt bỏ phiếu treo thứ hai ngay sau lượt đầu**.
- **Lưu ý.** Quản trò xử lý lượt đầu rồi mở lượt hai ngay, không có vòng tranh luận mới. Đây là hai lượt bỏ phiếu riêng.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Đêm 1: Quản trò gọi Thẩm Phán thức dậy để thống nhất một ám hiệu bí mật (gãi cằm, nháy mắt, v.v.). Trong lượt vote ban ngày, nếu Thẩm Phán ra ám hiệu, Quản trò tuyên bố mở vòng vote thứ 2."*

---

### 20. Hiệp Sĩ Già — Knight with the Rusty Sword

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Hiệp Sĩ Già** |
| **Tên Tiếng Anh** | *Knight with the Rusty Sword* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#9.1** (Khi bị Sói cắn chết) |
| **Thời Điểm Gọi (Timing)** | **Hiệp Sĩ Già: Con Sói sống gần nhất về bên trái bị thương, sống thêm 1 ngày và chết vào đêm kế tiếp.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  20. HIỆP SĨ GIÀ — KNIGHT WITH THE RUSTY S |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi___Hiep_si_Kiem_gi.PNG]
> +-----------------------------------------+
> |  Hiệp Sĩ Già: Con Sói sống gần nhất v  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Hiệp Sĩ Già — Knight with the Rusty Sword](images/cards/Nhan_vat_Ma_soi___Hiep_si_Kiem_gi.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Kích hoạt nếu bị đàn Sói cắn chết.
- **Chức năng.** Trong số Sói tham gia cú cắn, con Sói gần nhất về bên trái Hiệp Sĩ Già bị thương. Nó sống thêm một ngày và chết vào **đêm kế tiếp**. Sáng sau đó, quản trò công bố Sói chết vì vết thương.
- **Lưu ý.** Dùng thứ tự chỗ ngồi vòng tròn để tìm mục tiêu. Nếu Hiệp Sĩ Già chết do treo hoặc thuốc độc thì không kích hoạt. Lá Kỵ Sĩ ở phần 5 có cơ chế ban ngày riêng.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Khi Hiệp Sĩ Già bị Sói cắn: Quản trò âm thầm đánh dấu con Sói sống gần nhất bên tay trái Hiệp Sĩ Già bị nhiễm độc và sẽ chết vào đêm sau."*

---

### 21. Kịch Sĩ — Actor

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Kịch Sĩ** |
| **Tên Tiếng Anh** | *Actor* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#2.5** (Mỗi đêm (khi còn lá chọn)) |
| **Thời Điểm Gọi (Timing)** | **Kịch Sĩ chọn 1 trong 3 lá có kỹ năng để dùng đến đêm tiếp theo.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  21. KỊCH SĨ — ACTOR                       |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi__Dien_vien.PNG]
> +-----------------------------------------+
> |  Kịch Sĩ chọn 1 trong 3 lá có kỹ năng  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Kịch Sĩ — Actor](images/cards/Nhan_vat_Ma_soi__Dien_vien.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Thức mỗi đêm khi còn lá để chọn.
- **Chuẩn bị.** Quản trò để riêng ba lá có kỹ năng, đặt úp và không dùng lá Sói cho bộ ba này. Nếu có Kẻ Trộm, *The Pact* hướng dẫn chuẩn bị bài Kẻ Trộm trước rồi mới đến bài Kịch Sĩ.
- **Chức năng.** Mỗi đêm có thể chọn một trong số lá còn lại và dùng kỹ năng tương ứng đến đêm tiếp theo. Lá đã dùng rời khỏi bộ lựa chọn.
- **Lưu ý.** Có thể bỏ qua lượt để dành lựa chọn cho đêm khác. Khi dùng hết ba lá, Kịch Sĩ vẫn thắng theo phe Dân. [The Pact, tr. 13][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Kịch Sĩ thức dậy! Hãy chọn một lá bài chức năng cho đêm nay và ngày mai.' -> Kịch Sĩ chọn 1 lá bài trong bộ 3 lá phụ -> 'Kịch Sĩ đi ngủ.'"*

---

### 22. Người Hầu — Devoted Servant

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Người Hầu** |
| **Tên Tiếng Anh** | *Devoted Servant* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `?` **Tùy Biến / Kế Thừa (Variable)** |
| **Thứ Tự Thức Dậy** | **#9.5** (Ban ngày (khi có người bị treo)) |
| **Thời Điểm Gọi (Timing)** | **Người Hầu: Trước lúc người bị treo lật bài, có thể công khai lá Người Hầu để lấy bài người đó và nhận vai mới.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  22. NGƯỜI HẦU — DEVOTED SERVANT           |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi___Nguoi_day_to_tan_tuy.jpg]
> +-----------------------------------------+
> |  Người Hầu: Trước lúc người bị treo l  |
> |                                    [?]  |
> +-----------------------------------------+
> ```

![Người Hầu — Devoted Servant](images/cards/Nhan_vat_Ma_soi___Nguoi_day_to_tan_tuy.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe theo vai đang giữ. Hành động ban ngày sau khi làng đã chọn người bị loại, **trước lúc lật bài người đó**.
- **Chức năng.** Có thể công khai lá Người Hầu để lấy kín lá của người vừa bị làng loại. Người bị treo vẫn rời ván. Người Hầu bỏ lá cũ, nhận vai mới và thông thường nhận kỹ năng ở trạng thái mới. Đêm sau, quản trò gọi theo vai vừa nhận để xử lý phần thiết lập nếu có.
- **Lưu ý.** Người Hầu đang trong cặp Cupid thì không được đổi vai. Trạng thái bị mê hoặc, bị hóa Sói, tình trạng cặp đôi và chức vụ của người chết không đi theo lá. Nếu bản thân Người Hầu đã bị hóa Sói thì trạng thái đó vẫn còn. Khi nhận Thổi Sáo, quản trò chỉ những người đã bị mê hoặc. Khi nhận Kịch Sĩ hoặc Người Digan, dùng số lá hỗ trợ còn lại. [Characters, tr. 10–12 và 28–30][characters]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Ban ngày khi có người bị vote treo: Quản trò hỏi: 'Người Hầu có muốn lật bài cướp vai trước khi nạn nhân lật bài không?' -> Nếu có, Người Hầu lật bài lấy bài người chết và đổi vai."*

---

### 23. Tarzan — Wild Child / Con Hoang

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Tarzan** |
| **Tên Tiếng Anh** | *Wild Child / Tarzan* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `?` **Tùy Biến / Kế Thừa (Variable)** |
| **Thứ Tự Thức Dậy** | **#1.5** (Đêm đầu tiên duy nhất) |
| **Thời Điểm Gọi (Timing)** | **Tarzan bí mật chọn 1 người làm hình mẫu. Khi hình mẫu chết, Tarzan hóa Sói từ đêm sau.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  23. TARZAN — WILD CHILD / CON HOANG       |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi___Dua_tre_hoang_da.PNG]
> +-----------------------------------------+
> |  Tarzan bí mật chọn 1 người làm hình   |
> |                                    [?]  |
> +-----------------------------------------+
> ```

![Tarzan — Wild Child / Con Hoang](images/cards/Nhan_vat_Ma_soi___Dua_tre_hoang_da.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Khởi đầu thuộc phe Dân. Đêm đầu bí mật chọn một người làm hình mẫu.
- **Chức năng.** Khi hình mẫu bị loại, Tarzan thành Sói và thức cùng đàn từ đêm sau. Trước thời điểm đó, Tarzan vẫn chơi cho phe Dân.
- **Lưu ý với bộ của bạn.** Phe của hình mẫu không quyết định phe ban đầu của Tarzan theo sách. Tarzan vẫn được bỏ phiếu chống hình mẫu của mình.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Đêm 1): 'Tarzan thức dậy! Hãy chọn một người làm Thần Tượng / Hình Mẫu của bạn.' -> Tarzan chỉ 1 người -> 'Tarzan đi ngủ.'"*

---

### 24. Sói Lai — Wolf Hound

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Sói Lai** |
| **Tên Tiếng Anh** | *Wolf Hound* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `?` **Tùy Biến / Kế Thừa (Variable)** |
| **Thứ Tự Thức Dậy** | **#1.6** (Đêm đầu tiên duy nhất) |
| **Thời Điểm Gọi (Timing)** | **Sói Lai bí mật chọn cố định làm Dân thường hoặc Ma Sói cho đến hết ván.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  24. SÓI LAI — WOLF HOUND                  |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi___Cho_soi.jpg]
> +-----------------------------------------+
> |  Sói Lai bí mật chọn cố định làm Dân   |
> |                                    [?]  |
> +-----------------------------------------+
> ```

![Sói Lai — Wolf Hound](images/cards/Nhan_vat_Ma_soi___Cho_soi.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Chọn làm Dân thường hoặc Ma Sói vào **đêm đầu**.
- **Chức năng.** Nếu chọn Sói, thức cùng đàn để cắn người. Nếu chọn Dân, ngủ trong lượt Sói và thắng cùng Dân.
- **Lưu ý với bộ của bạn.** Lựa chọn là **một lần và cố định**. Lá in ghi gọi mỗi đêm để chọn phe, khác với sách.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Đêm 1): 'Sói Lai thức dậy! Bạn muốn chọn làm Dân Làng (ra dấu ngón tay chỉ lên) hay Ma Sói (ra dấu vuốt cào)?' -> Ghi nhận phe cố định -> 'Sói Lai đi ngủ.'"*

---

### 25. Sói Trùm — Big Bad Wolf

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Sói Trùm** |
| **Tên Tiếng Anh** | *Big Bad Wolf* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `W` **Phe Ma Sói (Werewolf)** |
| **Thứ Tự Thức Dậy** | **#5.4** (Mỗi đêm (sau lượt cắn chung)) |
| **Thời Điểm Gọi (Timing)** | **Sói Trùm: Khi chưa có bất kỳ Sói nào chết, được thức riêng cắn thêm 1 nạn nhân ngoài đàn.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  25. SÓI TRÙM — BIG BAD WOLF               |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi___Soi_lon_xau_xa.PNG]
> +-----------------------------------------+
> |  Sói Trùm: Khi chưa có bất kỳ Sói nào  |
> |                                    [W]  |
> +-----------------------------------------+
> ```

![Sói Trùm — Big Bad Wolf](images/cards/Nhan_vat_Ma_soi___Soi_lon_xau_xa.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Sói. Thức cùng đàn mỗi đêm và có thể thức riêng thêm một lượt.
- **Chức năng.** Sau lượt cắn chung, Sói Trùm có thể cắn thêm một nạn nhân ngoài đàn. Lượt riêng chỉ còn hiệu lực chừng nào chưa có Sói, Con Hoang hoặc Sói Lai nào bị loại, theo cách liệt kê trong sách *Characters*.
- **Lưu ý.** Khi điều kiện bị phá vỡ, ngừng lượt cắn riêng. Sói Trùm vẫn tiếp tục thức và cắn cùng đàn.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Sói Trùm thức dậy! Khi chưa có con Sói nào chết, hãy chọn thêm một nạn nhân ngoài đàn để cắn!' -> Sói Trùm chỉ 1 người -> 'Sói Trùm đi ngủ.'"*

---

### 26. Sói Quỷ — Cursed Wolf-Father

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Sói Quỷ** |
| **Tên Tiếng Anh** | *Cursed Wolf-Father* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `W` **Phe Ma Sói (Werewolf)** |
| **Thứ Tự Thức Dậy** | **#5.2** (Mỗi đêm (sau lượt Sói cắn)) |
| **Thời Điểm Gọi (Timing)** | **Sói Quỷ: 1 lần mỗi ván, nguyền nạn nhân vừa bị Sói cắn biến thành Ma Sói (giữ nguyên kỹ năng cũ).** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  26. SÓI QUỶ — CURSED WOLF-FATHER          |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi___Cha_cho_soi.jpg]
> +-----------------------------------------+
> |  Sói Quỷ: 1 lần mỗi ván, nguyền nạn n  |
> |                                    [W]  |
> +-----------------------------------------+
> ```

![Sói Quỷ — Cursed Wolf-Father](images/cards/Nhan_vat_Ma_soi___Cha_cho_soi.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Sói. Cắn cùng đàn và có thể dùng lời nguyền **một lần mỗi ván** sau khi đàn nhắm mắt.
- **Chức năng.** Nếu dùng lời nguyền, **chính nạn nhân vừa bị đàn chọn** được hóa Sói thay vì bị ăn thịt. Quản trò chạm bí mật để báo. Người đó đổi phe ngay và thức cùng đàn từ những đêm sau.
- **Lưu ý.** Theo luật gốc, người hóa Sói thường **giữ kỹ năng nhân vật đang có** và đổi mục tiêu sang thắng cùng Sói. Theo *The Pact*, Thổi Sáo và Bô Lão bỏ mục tiêu riêng và trở thành Sói thường. Bảo Vệ không ngăn lây nhiễm và bình cứu không giải lời nguyền. Già Làng miễn nhiễm ở cú cắn đầu. Luật Sói Nguyền làm mất kỹ năng cũ là biến thể nhóm bạn từng dùng. [The Pact, tr. 8–10 và 15][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Sói Quỷ hãy ra dấu nếu muốn dùng lời nguyền biến nạn nhân vừa bị cắn thành Ma Sói!' -> Nếu Sói Quỷ gật đầu -> Quản trò chạm vai báo hiệu cho nạn nhân."*

---

### 27. Sói Trắng — White Werewolf

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Sói Trắng** |
| **Tên Tiếng Anh** | *White Werewolf* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `3` **Phe Thứ Ba / Độc Lập (Neutral / 3rd Party)** |
| **Thứ Tự Thức Dậy** | **#5.6** (Cách 1 đêm (từ Đêm 2)) |
| **Thời Điểm Gọi (Timing)** | **Sói Trắng thức dậy riêng sau đàn Sói để chọn giết 1 con Sói khác.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  27. SÓI TRẮNG — WHITE WEREWOLF            |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/soi_trang.jpg]
> +-----------------------------------------+
> |  Sói Trắng thức dậy riêng sau đàn Sói  |
> |                                    [3]  |
> +-----------------------------------------+
> ```

![Sói Trắng — White Werewolf](images/cards/soi_trang.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe riêng. Thức cùng đàn mỗi đêm. Lượt riêng diễn ra **cách một đêm**, bắt đầu từ đêm thứ hai theo bảng gọi vai của *The Pact*.
- **Chức năng.** Ở lượt riêng, có thể chọn giết **một con Sói**. Sói Trắng thắng khi là người sống sót duy nhất.
- **Lưu ý với bộ của bạn.** Luật gốc giới hạn lượt riêng vào mục tiêu là Sói. Nếu phe Sói thông thường đạt điều kiện thắng trước, *The Pact* ghi Sói Trắng không được tính là cùng thắng. [The Pact, tr. 15 và 24][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Cách 1 đêm, từ đêm 2): 'Sói Trắng thức dậy! Bạn có muốn chọn giết một con Sói nào đêm nay không?' -> Sói Trắng chỉ 1 con Sói -> 'Sói Trắng đi ngủ.'"*

---

### 28. Thiên Thần — Angel

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Thiên Thần** |
| **Tên Tiếng Anh** | *Angel* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `3` **Phe Thứ Ba / Độc Lập (Neutral / 3rd Party)** |
| **Thứ Tự Thức Dậy** | **#0.1** (Trước Đêm 1) |
| **Thời Điểm Gọi (Timing)** | **Thiên Thần: Làng tranh luận & vote trước Đêm 1. Nếu bị loại ngày 1 hoặc bị cắn đêm 1 -> Thiên Thần thắng ngay.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  28. THIÊN THẦN — ANGEL                    |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi__Thien_su.PNG]
> +-----------------------------------------+
> |  Thiên Thần: Làng tranh luận & vote t  |
> |                                    [3]  |
> +-----------------------------------------+
> ```

![Thiên Thần — Angel](images/cards/Nhan_vat_Ma_soi__Thien_su.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Bắt đầu với mục tiêu riêng. Có Thiên Thần thì ván mở bằng **tranh luận và bỏ phiếu trước đêm đầu**.
- **Chức năng.** Nếu Thiên Thần bị loại trong lần bỏ phiếu mở màn hoặc trong đêm đầu, Thiên Thần thắng và ván kết thúc. Sống qua cả hai mốc thì trở thành Dân thường từ ngày thứ hai.
- **Lưu ý.** Quản trò nên kiểm tra kết quả ở cả hai mốc. *The Pact* ghi nếu Thiên Thần trở thành một nửa cặp Cupid thì từ bỏ mục tiêu riêng. Lá của bạn chỉ nhắc ngày đầu. [Characters, tr. 6][characters] · [The Pact, tr. 15][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Ban ngày trước Đêm 1: Quản trò tuyên bố mở phiên tranh luận và bỏ phiếu ngay. Nếu Thiên Thần bị vote treo hoặc bị Sói cắn đêm 1 -> Thiên Thần chiến thắng ván chơi ngay lập tức."*

---

### 29. Bô Lão — Prejudiced Manipulator

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Bô Lão** |
| **Tên Tiếng Anh** | *Prejudiced Manipulator / Elder* |
| **Thuộc Bộ Mở Rộng** | Characters |
| **Phe Phái (Team)** | `3` **Phe Thứ Ba / Độc Lập (Neutral / 3rd Party)** |
| **Thứ Tự Thức Dậy** | **#0.0** (Trước ván chơi) |
| **Thời Điểm Gọi (Timing)** | **Bô Lão: Quản trò chia làng làm 2 nhóm. Bô Lão vận động loại sạch nhóm đối diện để thắng.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  29. BÔ LÃO — PREJUDICED MANIPULATOR       |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nhan_vat_Ma_soi___Thanh_vien_giao_phai.jpg]
> +-----------------------------------------+
> |  Bô Lão: Quản trò chia làng làm 2 nhó  |
> |                                    [3]  |
> +-----------------------------------------+
> ```

![Bô Lão — Prejudiced Manipulator](images/cards/Nhan_vat_Ma_soi___Thanh_vien_giao_phai.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe riêng. Trước ván, **quản trò** công bố cách chia người chơi thành hai nhóm theo một tiêu chí dễ thấy. Hai nhóm có thể khác số lượng.
- **Chức năng.** Bô Lão vận động trong làng để loại hết người thuộc nhóm đối diện. Bô Lão không có kỹ năng tự giết.
- **Lưu ý.** *The Pact* ghi Bô Lão thắng ngay khi nhóm đối diện bị loại hết, rồi rời bàn và ván tiếp tục nếu còn có thể chơi. Nếu bị Sói Quỷ hóa Sói, Bô Lão mất mục tiêu riêng. [Characters, tr. 14–15][characters] · [The Pact, tr. 15][pact]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Trước ván chơi: Quản trò công bố cách phân chia làng thành 2 nhóm rõ rệt (nam/nữ, đeo kính/không đeo kính, v.v.). Bô Lão thắng khi nhóm đối diện bị loại sạch."*

---

### Phần 4: The Village và các vai dùng bài sự kiện New Moon · 3 Lá
*Nguồn đối chiếu chính thức: The Village & Characters (tr. 26–27) & The Pact (tr. 19 và 23).*

### 30. Quạ — Scandalmonger / Raven

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Quạ** |
| **Tên Tiếng Anh** | *Scandalmonger / Raven* |
| **Thuộc Bộ Mở Rộng** | The Village |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#8.0** (Cuối mỗi đêm) |
| **Thời Điểm Gọi (Timing)** | **Quạ thức dậy chọn đặt dấu tố cáo (người này nhận sẵn 2 phiếu phạt vào sáng hôm sau).** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  30. QUẠ — SCANDALMONGER / RAVEN           |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/ma_soi_the_village___con_qua.PNG]
> +-----------------------------------------+
> |  Quạ thức dậy chọn đặt dấu tố cáo (ng  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Quạ — Scandalmonger / Raven](images/cards/ma_soi_the_village___con_qua.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Thức mỗi đêm khi chơi biến thể có **nhà** của *The Village*.
- **Chức năng.** Chọn một người có nhà. Quản trò đặt dấu tố cáo trước nhà họ. Người đó nhận sẵn **hai phiếu chống** vào lượt bỏ phiếu tiếp theo.
- **Lưu ý.** Người vô gia cư không phải mục tiêu hợp lệ. Lá Quạ của bạn thêm điều kiện không chọn cùng người hai đêm liên tiếp. Nếu dùng Quạ với cơ chế gốc thì dùng cả quy tắc nhà và người vô gia cư.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Con Quạ thức dậy! Hãy chỉ một người có nhà mà bạn muốn tố cáo.' -> Quạ chỉ 1 người -> 'Con Quạ đi ngủ.' -> Quản trò đặt dấu tố cáo (2 phiếu phạt)."*

---

### 31. Người Digan — Gypsy

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Người Digan** |
| **Tên Tiếng Anh** | *Gypsy* |
| **Thuộc Bộ Mở Rộng** | The Village / New Moon |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#8.5** (Mỗi đêm) |
| **Thời Điểm Gọi (Timing)** | **Người Digan chọn dùng lá Gọi Hồn, chọn câu hỏi và chỉ định người đọc vào sáng hôm sau.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  31. NGƯỜI DIGAN — GYPSY                   |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nguoi_goi_hon.png]
> +-----------------------------------------+
> |  Người Digan chọn dùng lá Gọi Hồn, ch  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Người Digan — Gypsy](images/cards/Nguoi_goi_hon.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Phe và thời điểm.** Phe Dân. Quản trò tách sẵn năm lá **Gọi Hồn** của *New Moon*. Mỗi đêm hỏi Người Digan có muốn dùng kỹ năng hay không.
- **Chức năng.** Nếu dùng, quản trò đọc bốn câu trên một lá Gọi Hồn. Người Digan ra dấu chọn một câu và chỉ một người chơi. Sáng hôm sau người được chỉ định đọc câu đó trước làng. Người **bị loại đầu tiên của ván** trả lời “Có” hoặc “Không”, rồi bỏ lá Gọi Hồn đã dùng.
- **Lưu ý.** Người Digan có thể giữ lượt cho đêm khác. Vai này cần lá Gọi Hồn và có bước trả lời của người đã bị loại.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Người Digan thức dậy! Bạn có muốn dùng lá bài Gọi Hồn đêm nay không?' -> Nếu dùng, Quản trò đọc 4 câu hỏi -> Người Digan chọn 1 câu và chỉ 1 người sáng mai đọc trước làng."*

---

### 32. Thằng Mõ — Town Crier

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Thằng Mõ** |
| **Tên Tiếng Anh** | *Town Crier* |
| **Thuộc Bộ Mở Rộng** | The Village |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#9.2a** (Ban ngày) |
| **Thời Điểm Gọi (Timing)** | **Thằng Mõ do Cảnh Sát Trưởng bổ nhiệm, đọc công khai 1 lá sự kiện New Moon.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  32. THẰNG MÕ — TOWN CRIER                 |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Truong_lang.PNG]
> +-----------------------------------------+
> |  Thằng Mõ do Cảnh Sát Trưởng bổ nhiệm  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Thằng Mõ — Town Crier](images/cards/Truong_lang.PNG)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Loại lá.** Chức vụ công khai kiêm với lá nhân vật. Cảnh Sát Trưởng bổ nhiệm **một người khác**, không kiêm hai chức.
- **Chuẩn bị và chức năng.** Quản trò chọn trước một số lá Sự Kiện ngoài nhóm Gọi Hồn rồi giao cho Thằng Mõ. Từ sáng hôm sau khi được bổ nhiệm, Thằng Mõ có thể chọn một lá, đọc công khai, áp dụng hiệu ứng và bỏ lá đã đọc.
- **Lưu ý.** Sau khi công bố sự kiện và trước lượt bỏ phiếu, Cảnh Sát Trưởng có thể đổi người giữ chức. Nếu Thằng Mõ bị loại, Cảnh Sát Trưởng bổ nhiệm người mới và bàn giao các lá sự kiện còn lại. Nếu Thằng Mõ lên làm Cảnh Sát Trưởng thì phải chuyển chức Thằng Mõ cho người khác.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Ban ngày: Thằng Mõ chọn 1 lá sự kiện được Quản trò phát và đọc to trước toàn làng để áp dụng hiệu ứng."*

---

### Phần 5: Mười Hai Lá Biến Thể Việt Hóa
*Khi chơi thuần luật gốc quốc tế, để riêng 12 lá này. Khi chơi bàn mở rộng Việt hóa (Characters Plus / Luật Boardgame Đà Nẵng), áp dụng luật chi tiết dưới đây:*

### 33. Bán Sói

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Bán Sói** |
| **Tên Tiếng Anh** | *Half-Werewolf* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `?` **Tùy Biến / Kế Thừa (Variable)** |
| **Thứ Tự Thức Dậy** | **#9.9a** (Khi bị Sói cắn) |
| **Thời Điểm Gọi (Timing)** | **Bán Sói: Khởi đầu phe Dân, khi bị Sói cắn thì sống và hóa thành Ma Sói.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  33. BÁN SÓI                               |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/nua_nguoi_nua_soi.jpg]
> +-----------------------------------------+
> |  Bán Sói: Khởi đầu phe Dân, khi bị Só  |
> |                                    [?]  |
> +-----------------------------------------+
> ```

![Bán Sói](images/cards/nua_nguoi_nua_soi.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Khởi đầu phe Dân. Khi bị Sói cắn, sống và hóa thành Ma Sói.
- **Lưu ý.** Lá mô tả việc hóa Sói gắn với cú cắn. Lá Kẻ Bị Nguyền bên dưới ghi thêm mốc đêm hôm sau.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Bán Sói: Khi bị Sói cắn trong đêm, Quản trò không công bố Bán Sói chết vào sáng hôm sau mà âm thầm chuyển phe thành Ma Sói."*

---

### 34. Kẻ Bị Nguyền

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Kẻ Bị Nguyền** |
| **Tên Tiếng Anh** | *Cursed One* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `?` **Tùy Biến / Kế Thừa (Variable)** |
| **Thứ Tự Thức Dậy** | **#9.9b** (Đêm sau khi bị Sói cắn) |
| **Thời Điểm Gọi (Timing)** | **Kẻ Bị Nguyền: Khởi đầu phe Dân, khi bị Sói cắn sẽ hóa Sói vào đêm hôm sau.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  34. KẺ BỊ NGUYỀN                          |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/la-bai-ban-soi.jpg]
> +-----------------------------------------+
> |  Kẻ Bị Nguyền: Khởi đầu phe Dân, khi   |
> |                                    [?]  |
> +-----------------------------------------+
> ```

![Kẻ Bị Nguyền](images/cards/la-bai-ban-soi.jpg)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Khởi đầu phe Dân. Khi bị Sói cắn, hóa Sói vào đêm hôm sau.
- **Lưu ý.** Đây là người **nhận** hiệu ứng đổi phe khi bị cắn. Vai có quyền **chủ động** lây lời nguyền trong luật chính thức là Sói Quỷ.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Kẻ Bị Nguyền: Khi bị Sói cắn, sống qua ngày và được Quản trò gọi thức dậy cùng bầy Sói từ đêm tiếp theo."*

---

### 35. Ảnh Tử

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Ảnh Tử** |
| **Tên Tiếng Anh** | *Shadow* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `?` **Tùy Biến / Kế Thừa (Variable)** |
| **Thứ Tự Thức Dậy** | **#1.7** (Đêm đầu tiên duy nhất) |
| **Thời Điểm Gọi (Timing)** | **Ảnh Tử chọn 1 người làm bản thể. Khi người đó chết thì lấy bài và trở thành nhân vật đó.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  35. ẢNH TỬ                                |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/anh_tu.png]
> +-----------------------------------------+
> |  Ảnh Tử chọn 1 người làm bản thể. Khi  |
> |                                    [?]  |
> +-----------------------------------------+
> ```

![Ảnh Tử](images/cards/anh_tu.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Đêm đầu bí mật chọn một người. Khi người đó chết, lấy lá của họ và trở thành nhân vật đó.
- **Lưu ý.** Luật Việt hóa xếp Ảnh Tử theo điều kiện thắng của Dân khi chưa đổi vai. Lá in chưa quy định cách kế thừa trạng thái ghép đôi, hóa Sói hoặc kỹ năng đã tiêu hết. [Characters Plus][plus]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Đêm 1): 'Ảnh Tử thức dậy! Hãy chọn một người để làm bản thể gắn kết.' -> Ảnh Tử chỉ 1 người -> 'Ảnh Tử đi ngủ.'"*

---

### 36. Anh Em Sói (Sói Anh)

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Anh Em Sói (Sói Anh)** |
| **Tên Tiếng Anh** | *Wolf Brother (Elder)* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `W` **Phe Ma Sói (Werewolf)** |
| **Thứ Tự Thức Dậy** | **#1.4a** (Đêm 1 nhận mặt, mỗi đêm đi săn) |
| **Thời Điểm Gọi (Timing)** | **Sói Anh thức cùng đàn mỗi đêm. Khi Sói Anh chết sẽ kích hoạt kỹ năng của Sói Em.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  36. ANH EM SÓI (SÓI ANH)                  |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/anh_em_soi.png]
> +-----------------------------------------+
> |  Sói Anh thức cùng đàn mỗi đêm. Khi S  |
> |                                    [W]  |
> +-----------------------------------------+
> ```

![Anh Em Sói (Sói Anh)](images/cards/anh_em_soi.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Đêm đầu nhận mặt Sói Em. Thức cùng đàn mỗi đêm để chọn nạn nhân.
- **Lưu ý.** Việc Sói Anh chết là mốc kích hoạt Sói Em. Hai lá có chức năng riêng.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Đêm 1): 'Sói Anh và Sói Em thức dậy nhận mặt nhau!' -> 2 người mở mắt -> 'Sói Em đi ngủ, Sói Anh cùng đàn Sói thức dậy đi săn.'"*

---

### 37. Anh Em Sói (Sói Em)

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Anh Em Sói (Sói Em)** |
| **Tên Tiếng Anh** | *Wolf Brother (Younger)* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `W` **Phe Ma Sói (Werewolf)** |
| **Thứ Tự Thức Dậy** | **#1.4b** (Đêm 1 nhận mặt, ngủ tiếp) |
| **Thời Điểm Gọi (Timing)** | **Sói Em chưa thức cùng đàn. Khi Sói Anh chết, Sói Em được giết 1 người rồi nhập đàn Sói.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  37. ANH EM SÓI (SÓI EM)                   |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/anh_em_soi.png]
> +-----------------------------------------+
> |  Sói Em chưa thức cùng đàn. Khi Sói A  |
> |                                    [W]  |
> +-----------------------------------------+
> ```

![Anh Em Sói (Sói Em)](images/cards/anh_em_soi.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Đêm đầu nhận mặt Sói Anh. Ban đầu không thức cùng đàn. Khi Sói Anh chết, Sói Em có lượt giết riêng rồi bắt đầu thức cùng đàn hằng đêm.
- **Lưu ý.** Theo bản *Characters Plus* đối chiếu, Tiên Tri, Cáo và Thần Gấu không nhận diện Sói Em là Sói **trước khi Sói Anh chết**. Dòng in về thời điểm bị dò vai diễn đạt chưa rõ. [Characters Plus][plus]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Khi Sói Anh chết, Quản trò gọi riêng Sói Em thức dậy vào ban đêm: 'Sói Em thức dậy! Sói Anh đã chết, hãy chọn một người để trả thù!' -> Sói Em chỉ 1 người cắn chết -> Từ đêm sau thức cùng đàn."*

---

### 38. Sói Lửa

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Sói Lửa** |
| **Tên Tiếng Anh** | *Fire Wolf* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `W` **Phe Ma Sói (Werewolf)** |
| **Thứ Tự Thức Dậy** | **#5.8** (Sau khi có Sói chết) |
| **Thời Điểm Gọi (Timing)** | **Sói Lửa: Sau khi có Sói bị giết, đêm tiếp theo được chọn 1 người để tước kỹ năng vĩnh viễn.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  38. SÓI LỬA                               |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Cao_lua.png]
> +-----------------------------------------+
> |  Sói Lửa: Sau khi có Sói bị giết, đêm  |
> |                                    [W]  |
> +-----------------------------------------+
> ```

![Sói Lửa](images/cards/Cao_lua.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Sau khi có Sói bị giết lần đầu, Sói Lửa có thể chọn một người vào buổi tối để tước kỹ năng của họ vĩnh viễn.
- **Lưu ý.** Lá cho dùng thêm một lần nếu hai Sói chết cùng một ngày.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Đêm sau khi có Sói chết: Quản trò hô: 'Sói Lửa thức dậy! Hãy chọn một người để tước bỏ vĩnh viễn kỹ năng!' -> Sói Lửa chỉ 1 người -> 'Sói Lửa đi ngủ.'"*

---

### 39. Cổ Hoặc Sư

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Cổ Hoặc Sư** |
| **Tên Tiếng Anh** | *Enchanter / Puppet Master* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `?` **Tùy Biến / Kế Thừa (Variable)** |
| **Thứ Tự Thức Dậy** | **#4.8** (Mỗi đêm) |
| **Thời Điểm Gọi (Timing)** | **Cổ Hoặc Sư thức dậy chọn 1 người thế mạng nếu đêm nay mình chết.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  39. CỔ HOẶC SƯ                            |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Thay_thoi_mien.png]
> +-----------------------------------------+
> |  Cổ Hoặc Sư thức dậy chọn 1 người thế  |
> |                                    [?]  |
> +-----------------------------------------+
> ```

![Cổ Hoặc Sư](images/cards/Thay_thoi_mien.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Mỗi đêm chọn một người. Nếu Cổ Hoặc Sư chết trong đêm đó, người đã chọn chết thay.
- **Lưu ý.** Không chọn cùng người hai đêm liên tiếp. Cơ chế chuyển cái chết trong đêm này là hiệu ứng riêng của lá.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Cổ Hoặc Sư thức dậy! Hãy chọn một người thế mạng trong đêm nay.' -> Cổ Hoặc Sư chỉ 1 người -> 'Cổ Hoặc Sư đi ngủ.'"*

---

### 40. Nguyệt Nữ

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Nguyệt Nữ** |
| **Tên Tiếng Anh** | *Moon Maiden* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#2.0** (Đầu mỗi đêm) |
| **Thời Điểm Gọi (Timing)** | **Nguyệt Nữ thức dậy chọn 1 người để phong ấn kỹ năng ban đêm (không chọn trùng 2 đêm liên tiếp).** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  40. NGUYỆT NỮ                             |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Nguyet_nu.png]
> +-----------------------------------------+
> |  Nguyệt Nữ thức dậy chọn 1 người để p  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Nguyệt Nữ](images/cards/Nguyet_nu.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Mỗi đêm chọn một người để khóa kỹ năng trong đêm đó. Kỹ năng ban ngày vẫn hoạt động.
- **Lưu ý.** Không chọn cùng người hai đêm liên tiếp. Một số hướng dẫn Việt hóa ghi riêng ngoại lệ cho Bảo Vệ, nên chi tiết có thể khác giữa các bộ. [Characters Plus][plus]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Đầu đêm): 'Nguyệt Nữ thức dậy! Hãy chọn một người để phong ấn kỹ năng đêm nay (không chọn người đêm trước).' -> Nguyệt Nữ chỉ 1 người -> 'Nguyệt Nữ đi ngủ.'"*

---

### 41. Dược Sĩ

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Dược Sĩ** |
| **Tên Tiếng Anh** | *Pharmacist* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#6.5** (Mỗi đêm) |
| **Thời Điểm Gọi (Timing)** | **Dược Sĩ dùng bình Mê Hồn (cấm nói/vote 1 ngày) hoặc Hồi Phục (hồi bình cứu cho Phù Thủy).** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  41. DƯỢC SĨ                               |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/duoc_si.png]
> +-----------------------------------------+
> |  Dược Sĩ dùng bình Mê Hồn (cấm nói/vo  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Dược Sĩ](images/cards/duoc_si.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Có một bình Mê Hồn và một bình Hồi Phục, mỗi bình dùng một lần. Mê Hồn khiến người được chọn mất quyền nói và bỏ phiếu trong một ngày. Hồi Phục nhắm trúng Phù Thủy để hồi bình thuốc.
- **Lưu ý.** Lá in không nêu tên bình được hồi. Một bản Việt hóa ghi cụ thể là **bình cứu**. [Luật Ma Sói Việt hóa][viet]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô: 'Dược Sĩ thức dậy! Bạn muốn dùng bình Mê Hồn (cấm nói/vote 1 người) hay bình Hồi Phục (hồi bình cứu cho Phù Thủy)?' -> Dược Sĩ ra dấu -> 'Dược Sĩ đi ngủ.'"*

---

### 42. Kỵ Sĩ

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Kỵ Sĩ** |
| **Tên Tiếng Anh** | *Knight* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `V` **Phe Dân Làng (Villager)** |
| **Thứ Tự Thức Dậy** | **#9.3** (Ban ngày trước bỏ phiếu) |
| **Thời Điểm Gọi (Timing)** | **Kỵ Sĩ: Lật bài thách đấu 1 người. Chọn trúng Sói thì Sói chết ngay. Sai thì Kỵ Sĩ chết sáng sau.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  42. KỴ SĨ                                 |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Ky_si.png]
> +-----------------------------------------+
> |  Kỵ Sĩ: Lật bài thách đấu 1 người. Ch  |
> |                                    [V]  |
> +-----------------------------------------+
> ```

![Kỵ Sĩ](images/cards/Ky_si.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Ban ngày, trước lúc có người bị treo, có thể lật bài và chọn một người. Chọn trúng Sói thì Sói chết và ngày kết thúc ngay. Chọn nhầm thì Kỵ Sĩ chết **sáng hôm sau**.
- **Lưu ý.** Một số bản Việt hóa xử lý cái chết của Kỵ Sĩ ngay lúc chọn nhầm. **Hiệp Sĩ Già** ở mục 20 mới là vai trong *Characters*, với hiệu ứng trả đòn sau khi bị Sói cắn chết. [Luật Ma Sói Việt hóa][viet]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Ban ngày trước giờ bỏ phiếu: Kỵ Sĩ đứng dậy lật thẻ bài: 'Ta là Kỵ Sĩ, ta chọn thách đấu người này!' -> Quản trò xác nhận. Nếu là Sói, Sói chết ngay. Nếu là Dân, Kỵ Sĩ chết sáng hôm sau."*

---

### 43. Kẻ Báo Thù

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Kẻ Báo Thù** |
| **Tên Tiếng Anh** | *Avenger* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `?` **Tùy Biến / Kế Thừa (Variable)** |
| **Thứ Tự Thức Dậy** | **#1.8** (Đêm đầu tiên duy nhất) |
| **Thời Điểm Gọi (Timing)** | **Kẻ Báo Thù chọn phe Dân hoặc Sói. Khi chết, chỉ 1 người. Người đó chết theo nếu thuộc phe đối địch.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  43. KẺ BÁO THÙ                            |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Ke_bao_thu.png]
> +-----------------------------------------+
> |  Kẻ Báo Thù chọn phe Dân hoặc Sói. Kh  |
> |                                    [?]  |
> +-----------------------------------------+
> ```

![Kẻ Báo Thù](images/cards/Ke_bao_thu.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Đêm đầu chọn phe Dân hoặc Sói. Khi chết, chỉ một người. Người đó chết theo nếu thuộc phe đối địch với mình.
- **Lưu ý.** Chọn nhầm người cùng phe thì hiệu ứng không loại người đó. Lá in chưa nêu cách xét một mục tiêu thuộc phe thứ ba. [Characters Plus][plus]

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Quản trò hô (Đêm 1): 'Kẻ Báo Thù thức dậy! Hãy chọn phe phái bạn muốn phụng sự (Dân Làng hay Ma Sói).' -> Kẻ Báo Thù ra dấu -> 'Kẻ Báo Thù đi ngủ.'"*

---

### 44. Thích Khách

| Thuộc Tính | Chi Tiết Nhân Vật |
|:---|:---|
| **Tên Tiếng Việt** | **Thích Khách** |
| **Tên Tiếng Anh** | *Assassin* |
| **Thuộc Bộ Mở Rộng** | Biến thể Việt hóa |
| **Phe Phái (Team)** | `3` **Phe Thứ Ba / Độc Lập (Neutral / 3rd Party)** |
| **Thứ Tự Thức Dậy** | **#7.5** (Tối kế tiếp khi đủ 4 phiếu) |
| **Thời Điểm Gọi (Timing)** | **Thích Khách: Cứ 2 ngày gom đủ 4 phiếu treo thì được giết 1 người vào tối kế tiếp.** |

> **Thẻ bài Quản trò mô phỏng**:
> ```text
> +-----------------------------------------+
> |  44. THÍCH KHÁCH                           |
> +-----------------------------------------+
> |  [Hình ảnh: images/cards/Thich_khach.png]
> +-----------------------------------------+
> |  Thích Khách: Cứ 2 ngày gom đủ 4 phiế  |
> |                                    [3]  |
> +-----------------------------------------+
> ```

![Thích Khách](images/cards/Thich_khach.png)

#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):
- **Theo lá in.** Cứ hai ngày cộng số phiếu treo chỉ vào Thích Khách. Nếu đạt ít nhất bốn phiếu, Thích Khách được giết một người vào tối kế tiếp.
- **Lưu ý.** Lá không nêu phe, điều kiện thắng riêng hoặc cách xử lý phiếu dồn nếu Thích Khách bị loại trước khi đến lượt giết.

#### 📢 Lời Gọi Quản Trò (GM Call Script):
> *"Ban đêm khi Thích Khách tích lũy đủ 4 phiếu vote phạt: Quản trò hô: 'Thích Khách thức dậy! Hãy chỉ định mục tiêu bạn muốn ám sát đêm nay.' -> Thích Khách chỉ 1 người -> 'Thích Khách đi ngủ.'"*

---

## 6. PHỤ LỤC: CÁC VAI MỞ RỘNG CỔ ĐIỂN KHÁC
Dưới đây là một số lá bài có trong các bộ sưu tập mở rộng khác mà Quản trò có thể gặp:

### 45. Sói Con — Wolf Cub
- **Phe và thời điểm.** Phe Sói. Thức cùng đàn mỗi đêm.
- **Chức năng.** Khi Sói Con bị loại (bị làng treo hoặc trúng độc/bắn), đêm tiếp theo bầy Sói được cắn **hai người** thay vì một.

### 46. Kẻ Đốt Nhà — Pyromaniac (The Village)
- **Phe và thời điểm.** Phe Dân / Trung lập. Thức mỗi đêm.
- **Chức năng.** Chọn đốt một tòa nhà. Nếu tòa nhà đó là nơi nạn nhân của Sói đang ở, Sói bị khói xua đuổi và nạn nhân sống sót; người chủ nhà trở thành vô gia cư.

### 47. Người Múa Rối — Puppeteer
- **Phe và thời điểm.** Phe Dân. Dùng một lần trong ván.
- **Chức năng.** Thao túng đàn Sói phải ăn thịt chính người do Người Múa Rối chỉ định.

---

## 7. GỢI Ý THIẾT LẬP BÀN CHƠI CHO QUẢN TRÒ (PRESETS)

### Bàn Cơ Bản (8 – 10 Người Chơi) — Tân Thủ
- 2 Ma Sói (`#02`)
- 1 Tiên Tri (`#03`)
- 1 Bảo Vệ (`#10`)
- 1 Phù Thủy (`#04`)
- 1 Thợ Săn (`#05`)
- 3–4 Dân Làng (`#01`)
- *Bầu 1 Cảnh Sát Trưởng (`#09`) vào sáng ngày 1*.

### Bàn Trăng Non Cân Não (11 – 14 Người Chơi)
- 3 Ma Sói (`#02`)
- 1 Tiên Tri (`#03`)
- 1 Bảo Vệ (`#10`)
- 1 Phù Thủy (`#04`)
- 1 Thợ Săn (`#05`)
- 1 Già Làng (`#11`)
- 1 Oan Nhân (`#12`)
- 1 Thổi Sáo (`#14` - Phe thứ 3)
- 3–4 Dân Làng (`#01`)

### Bàn Đại Chiến Characters (15 – 20+ Người Chơi)
- 1 Sói Quỷ (`#26`), 1 Sói Trùm (`#25`), 1 Sói Trắng (`#27`), 1 Ma Sói thường (`#02`)
- 1 Tiên Tri (`#03`), 1 Cáo (`#17`), 1 Thần Gấu (`#18`)
- 1 Bảo Vệ (`#10`), 1 Phù Thủy (`#04`), 1 Thợ Săn (`#05`), 1 Hiệp Sĩ Già (`#20`)
- 1 Thẩm Phán (`#19`), 1 Người Hầu (`#22`), 1 Tarzan (`#23`)
- 1 Hai Chị Em (`#15` - 2 lá) hoặc Ba Anh Em (`#16` - 3 lá)
- Dân Làng bổ sung.

---
*Tài liệu được cập nhật và kiểm duyệt toàn diện theo bộ luật gốc quốc tế và danh mục 44 lá bài thực tế.*