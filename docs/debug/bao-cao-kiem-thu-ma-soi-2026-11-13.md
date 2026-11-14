# Báo cáo kiểm thử web Quản Trò Ma Sói

- Website: https://ma-soi-eight.vercel.app/
- Ngày kiểm tra: 13/11/2026, múi giờ báo cáo Asia/Ho_Chi_Minh.
- Phương pháp: kiểm thử trực tiếp giao diện bản đang triển khai, đọc cây accessibility/DOM và kiểm tra console của tab.
- Kết quả: **7 vấn đề đã quan sát được**, chủ yếu ở lịch sử, tính nhất quán giao diện và accessibility. Không khẳng định đã kiểm tra hết engine trò chơi.
- Không có repository, mã nguồn hoặc truy cập DB/API để xác định nguyên nhân gốc. Các tên hàm, cấu trúc dữ liệu và đoạn code bên dưới là **đề xuất**, không phải trích từ code hiện tại.

## 1. Phạm vi và giới hạn

Đã kiểm tra:

- Tải trang và tải lại; khôi phục giao diện ván đang lưu.
- Sơ đồ người chơi và các bộ đếm.
- Bước Bảo Vệ ở Đêm 2: mục tiêu đêm trước bị khóa, nút tiếp tục, cảnh báo khi nhảy bước, ma trận/slider và phân trang.
- Thiết lập bộ bài; form tạo bộ bài; nhập tên chỉ có khoảng trắng.
- Sửa nhiều tên: thử tên trùng, dòng trống rồi hủy.
- Thư viện vai trò: tổng số, bộ lọc phe, tìm kiếm, xem chi tiết Ảnh Tử.
- Danh sách lịch sử gồm 8 bản ghi và chi tiết 2 bản ghi.
- Quan sát bố cục ở viewport mặc định và 390 × 844; đã trả viewport về mặc định.

Ván tải lên đang ở Đêm 2, bước Bảo Vệ, có 13 ghế và 1 người chết. Không reset ván, không xóa lịch sử/bộ bài, không áp dụng bộ bài mới và không xác nhận hành động giết người. Do vậy chưa kiểm tra trọn một ván từ thiết lập đến kết thúc, chưa xác minh các tổ hợp vai đặc biệt, đồng bộ đa thiết bị, offline/PWA hay phân quyền backend.

“Đã xác nhận” trong báo cáo nghĩa là đã thấy hành vi trên UI; không có nghĩa đã xác định được lỗi nằm ở frontend, dữ liệu cũ hay backend. Không dùng báo cáo này như chứng nhận web đã hết lỗi.

## 2. Danh sách ưu tiên

| ID | Ưu tiên | Vấn đề | Phạm vi xác nhận |
|---|---|---|---|
| BUG-01 | P2 | Lịch sử ghi “Chưa Hoàn Thành” dù mô tả đã có kết quả thắng | Danh sách và một trang chi tiết |
| BUG-02 | P2 | Chi tiết lịch sử không hiển thị người chơi | Hai bản ghi 14 người |
| BUG-03 | P2 | Ảnh Tử mang ký hiệu V ở lưới nhưng chi tiết là phe tùy thuộc | Lưới, tìm kiếm, bộ lọc, chi tiết |
| BUG-04 | P3 | Nhãn mở thư viện ghi 48, thư viện thực tế ghi 49 | Accessibility label và tiêu đề |
| BUG-05 | P3 | Lưu bộ bài với tên toàn khoảng trắng không có phản hồi lỗi | Form tạo bộ bài |
| BUG-06 | P3 | Hai nút “Đi Ngủ” không thống nhất trạng thái disabled | Bước Bảo Vệ chưa chọn mục tiêu |
| BUG-07 | P2 | Một số nút icon thiếu tên truy cập | Thư viện, tạo bộ bài, sửa nhiều tên, lịch sử |

P2: nên sửa trong đợt gần nhất; P3: lỗi mức nhẹ về trải nghiệm/nhất quán. Chưa có đủ bằng chứng để xếp vấn đề nào thành lỗi P0/P1 làm sai kết quả ván đang chạy.

## 3. Chi tiết lỗi và hướng sửa

### BUG-01 — Nhãn kết quả lịch sử mâu thuẫn với mô tả

**Cách tái hiện**

1. Mở biểu tượng lịch sử ở thanh đầu trang.
2. Xem ván 14 người hiển thị thời gian `23:54 11/11/2026`, 3 vòng.
3. Quan sát nhãn `Chưa Hoàn Thành` và mô tả `Số Ma Sói (3) đã áp đảo hoặc bằng Dân Làng (3).`
4. Mở chi tiết: vẫn hiển thị `Chưa Hoàn Thành`, với cùng mô tả kết quả.

Trong danh sách còn thấy ván `23:06 11/11/2026` có cùng kiểu mâu thuẫn; ván `23:54 10/11/2026` ghi `Toàn bộ Ma Sói độc ác đã bị thanh trừng sạch!` nhưng vẫn mang nhãn chưa hoàn thành. Các mốc này chép theo UI, không tự chuyển múi giờ.

**Mong đợi:** trạng thái, phe thắng và mô tả kết thúc nhất quán. Nếu bản ghi cũ thiếu trường kết quả, cần hiển thị “Thiếu dữ liệu kết quả” thay vì kết luận ván chưa hoàn thành.

**Tác động:** quản trò không biết lịch sử đã lưu sai hay kết quả ván bị tính sai.

**Giả thuyết cần kiểm tra:** enum phe thắng không thống nhất giữa dữ liệu lưu và component; schema cũ chưa migrate; hoặc `reason` đã lưu nhưng `status/winner` bị bỏ sót. Chưa xác định giả thuyết nào đúng.

**Hướng fix**

- Chuẩn hóa một schema kết quả dùng chung cho engine, API, DB và UI.
- Lưu kết quả trong cùng thao tác với snapshot kết thúc; không cập nhật mô tả và trạng thái bằng hai luồng độc lập.
- Phân biệt rõ `in_progress`, `finished`, `aborted`, `unknown_legacy`.
- Dùng mapper duy nhất cho badge ở danh sách và chi tiết. Giá trị không nhận diện phải có fallback rõ ràng và telemetry.
- Kiểm tra/migrate bản ghi cũ dựa trên dữ liệu có cấu trúc. Không dùng phân tích câu tiếng Việt làm logic xác định phe thắng chính.

**Test sau sửa:** ván Dân thắng, Sói thắng, phe thứ ba thắng, ván dừng giữa chừng và dữ liệu legacy thiếu trường; kiểm tra cả sau reload và tải lại từ backend.

### BUG-02 — Danh sách người chơi trong chi tiết lịch sử rỗng

**Cách tái hiện**

1. Mở chi tiết ván `23:54:52 11/11/2026` có 14 người, 3 vòng.
2. Đọc mục `DANH SÁCH NGƯỜI CHƠI LÚC KẾT THÚC VÁN:`.
3. Mục này không có hàng người chơi, không có thông báo thiếu dữ liệu.
4. Mở tiếp ván `21:44:20 11/11/2026`, 14 người, 2 vòng, phe thứ ba thắng: cùng hiện tượng.

Đã đối chiếu DOM và quan sát màn hình chi tiết bản ghi đầu tiên. Không kết luận DB đã mất dữ liệu; lỗi xác nhận là UI không cung cấp danh sách hoặc trạng thái giải thích.

**Mong đợi:** hiển thị snapshot người chơi của ván được chọn, gồm ghế, tên, vai/phe cuối cùng và trạng thái sống/chết. Nếu không có snapshot, hiển thị thông báo cụ thể cho bản ghi cũ.

**Hướng fix**

- Kiểm tra response detail có trường snapshot không; đối chiếu tên trường và kiểu JSON giữa frontend/API/DB.
- Lưu snapshot bất biến tại thời điểm kết thúc, không tham chiếu trực tiếp danh sách đang chơi vì reset/đổi tên sẽ làm lịch sử sai.
- Tách loading, lỗi tải, dữ liệu rỗng và dữ liệu không hợp lệ.
- Nếu detail cần fetch bổ sung, chỉ render bảng sau khi request thành công; có nút thử lại khi thất bại.
- Với lịch sử cũ thiếu snapshot, ghi rõ “Bản ghi này chưa lưu danh sách người chơi”; không dựng lại từ ván hiện tại.

**Test sau sửa:** lưu ván 14 người → mở detail → đủ 14 dòng; reset ván hiện tại rồi mở lại vẫn đúng; kiểm tra response lỗi, thiếu snapshot, snapshot rỗng và snapshot JSON sai dạng.

### BUG-03 — Ký hiệu phe của Ảnh Tử không thống nhất

**Cách tái hiện**

1. Mở thư viện, chọn `Tất Cả (49)` và tìm `Ảnh Tử`.
2. Thẻ `Ảnh Tử (Bóng Ma)` hiện ký hiệu `V`.
3. Chọn `Phe Dân (28)`: kết quả là `Không tìm thấy vai trò nào phù hợp`.
4. Quay về Tất Cả, mở thẻ: chi tiết ghi `[ ? ] Tùy Thuộc / Kế Thừa`.

**Mong đợi:** thẻ và chi tiết dùng cùng phân loại. Nếu đây là vai tùy thuộc/kế thừa thì thẻ phải hiển thị `?` hoặc nhãn tương ứng, thay vì V gây hiểu nhầm.

**Hướng fix**

- Dùng một bảng ánh xạ đầy đủ cho `village`, `wolf`, `third_party`, `conditional` ở mọi nơi.
- Tránh fallback dạng “không phải Sói/Thứ ba thì là Dân”.
- Tách metadata phe ban đầu của vai khỏi phe hiện tại của người chơi và điều kiện thắng.
- Bổ sung bộ lọc `Tùy thuộc / Kế thừa` hoặc giải thích nhóm này. Hiện ba bộ lọc ghi 28 + 8 + 6 = 42, trong khi Tất Cả là 49; đây không tự động chứng minh thiếu vai, nhưng UI chưa giải thích 7 vai ngoài ba nhóm.

**Test sau sửa:** mọi thẻ có cùng badge ở lưới/danh sách/chi tiết; mỗi vai thuộc nhóm lọc được công bố hoặc có nhãn giải thích. Test riêng Ảnh Tử và các vai có thể đổi phe.

### BUG-04 — Nhãn mở thư viện vẫn ghi 48 vai trò

**Tái hiện:** nút trên header có accessible name `Thư viện 48 vai trò Ma Sói`; mở ra tiêu đề và bộ lọc đều ghi 49.

**Hướng fix:** tính nhãn từ cùng danh sách vai được hiển thị, ví dụ `roles.length`, thay vì hard-code. Cập nhật đồng thời `title`, `aria-label`, heading và bộ đếm.

**Test sau sửa:** thêm/bớt một vai trong fixture; tất cả nơi hiển thị số lượng cùng thay đổi.

### BUG-05 — Tên bộ bài toàn khoảng trắng bị chặn im lặng

**Cách tái hiện**

1. Thiết Lập → Chọn Bộ Bài → Tạo Bộ Bài Mới.
2. Thay tên mặc định bằng ba dấu cách.
3. Bấm `Lưu Bộ Bài`.
4. Form không đổi, nút vẫn khả dụng, không thấy thông báo validation.

Không có bằng chứng bộ bài rỗng được lưu. Lỗi ở đây là **thiếu phản hồi cho người dùng**, không phải xác nhận thiếu validation phía server. Đã đóng form, không tạo bộ bài mới.

**Hướng fix**

- Chuẩn hóa tên bằng `trim()`; kiểm tra độ dài tối thiểu/tối đa ở cả client và server.
- Hiện lỗi sát ô nhập: “Vui lòng nhập tên bộ bài”.
- Gắn `aria-invalid`, `aria-describedby`; đưa focus về trường lỗi.
- Phân biệt lỗi validation với lỗi mạng; khi đang lưu, vô hiệu hóa nút để tránh gửi trùng.

**Test sau sửa:** chuỗi rỗng, spaces, tab/newline nếu có thể nhập, tên tiếng Việt hợp lệ, tên quá dài và lỗi lưu phía server.

### BUG-06 — Nút “Đi Ngủ” thứ hai còn enabled khi bước chưa hợp lệ

**Cách tái hiện**

1. Ở bước Bảo Vệ Đêm 2, chưa chọn mục tiêu và chưa chọn không bảo vệ ai.
2. UI có một nút `Đi Ngủ 💤` disabled, kèm “Chưa chọn bảo vệ”.
3. Cây accessibility đồng thời có một nút cùng tên khác còn enabled.
4. Bấm nút enabled: không chuyển bước, không thấy phản hồi mới.

**Kết luận giới hạn:** chưa thấy vượt qua validation. Vấn đề xác nhận là trạng thái nút/khả năng tương tác không đồng bộ và thao tác không có phản hồi.

**Hướng fix:** mọi phiên bản nút tiếp tục (inline/sticky/responsive) dùng chung kết quả validation và handler. Nếu một nút chỉ dành cho breakpoint khác, phải thực sự ẩn khỏi layout, cây accessibility và tab order. Không để handler `return` im lặng trong khi nút vẫn báo có thể bấm.

```tsx
// Minh họa, không phải tên hàm hiện tại của dự án.
const validation = validateCurrentStep(game);
<button
  disabled={!validation.ok || submitting}
  aria-describedby={!validation.ok ? 'step-error' : undefined}
  onClick={handleAdvance}
>
  Đi Ngủ 💤
</button>
```

**Test sau sửa:** cả hai bố cục đều disabled khi thiếu mục tiêu; chọn hợp lệ thì enabled; bỏ chọn thì disabled; thao tác bàn phím và click cho cùng kết quả.

### BUG-07 — Các nút icon thiếu accessible name

**Bằng chứng:** cây accessibility chỉ ghi `button` không có tên cho một số nút trong thư viện, form Tạo Bộ Bài Mới, cửa sổ Sửa Nhiều Người Chơi, cửa sổ lịch sử và chi tiết lịch sử. Một số nút này được dùng để đóng cửa sổ/form trong phiên kiểm thử.

**Tác động:** người dùng screen reader không biết nút thực hiện thao tác gì; tự động hóa theo semantic locator cũng không thể định vị ổn định.

**Hướng fix**

- Dùng `<button type="button" aria-label="Đóng thư viện vai trò">` với tên phù hợp từng ngữ cảnh.
- Đặt icon trang trí `aria-hidden="true"`; không dùng icon làm nguồn duy nhất của tên nút.
- Với modal, bổ sung `role="dialog"`, `aria-modal="true"`, liên kết heading, focus trap và trả focus về nút mở. Đây là khuyến nghị cần kiểm tra thêm, chưa khẳng định tất cả modal hiện thiếu các thuộc tính này.
- Bảo đảm phím Escape chỉ đóng modal trên cùng khi có modal lồng nhau.

**Test sau sửa:** kiểm tra mọi nút icon có accessible name không rỗng; Tab/Shift+Tab đi đúng vùng; đóng modal trả focus đúng vị trí.

## 4. Dấu hiệu cần xác minh thêm — không tính là bug đã xác nhận

### OBS-01 — Có các cặp lịch sử hiển thị giống nhau

Danh sách có hai bản ghi phe thứ ba thắng cùng thông tin `23:01 10/11/2026`, 14 người, 1 vòng, Cupid #5 & #12; và hai bản ghi 13 người lúc `20:37 10/11/2026`, 1 vòng, không có Cupid.

Chưa kiểm tra ID, timestamp đầy đủ hoặc nguồn dữ liệu nên **không khẳng định bị insert trùng**. Có thể là hai ván khác nhau hoặc hiển thị thời gian làm tròn đến phút.

Hướng điều tra: so sánh `gameId/historyId`, timestamp, payload; kiểm tra merge LocalStorage + DB, retry request, effect lưu kết quả và double-click. Nếu là cùng ván, dùng ID ổn định, unique constraint, upsert/idempotency key. Không deduplicate chỉ bằng tên và phút vì có thể xóa nhầm ván hợp lệ.

### OBS-02 — Lần mở đầu tiên hiển thị trắng, reload thì hoạt động

Lần đầu mở chỉ thấy trang trắng và tiêu đề tài liệu. Sau reload, ứng dụng hiển thị ván đang lưu. Console truy xuất trong phiên không trả lỗi/warning.

Chưa tái hiện độc lập đủ để quy nguyên nhân cho ứng dụng: có thể do tải tài nguyên, khởi tạo client, dữ liệu hoặc môi trường trình duyệt kiểm thử. Cần thử phiên sạch/cold load và mạng chậm; ghi network waterfall, lỗi script và thời gian render. Nếu xác nhận do web, bổ sung loading shell, Error Boundary, timeout/retry cho bootstrap và khả năng hiển thị lỗi thay vì trang trắng.

### OBS-03 — Bộ đếm tổng sống chưa giải thích đủ các phe

Sơ Đồ ghi 12 người sống, 3 Sói, 7 Dân. Có 2 vai Người Thổi Sáo và Thằng Ngố trong bàn, nên không thể kết luận phép đếm sai chỉ vì 3 + 7 khác 12. Có thể thêm bộ đếm phe thứ ba và chú giải cách đếm Sói Trắng để quản trò hiểu rõ. Chưa kiểm tra code tính điều kiện thắng từ các bộ đếm này.

## 5. Những kiểm tra chưa phát hiện lỗi trong phạm vi đã thử

| Kiểm tra | Kết quả quan sát |
|---|---|
| Bảo Vệ không được chọn lại mục tiêu đêm trước | Ghế #6 bị disabled trong cả ma trận và slider |
| Người đã chết trong danh sách mục tiêu Bảo Vệ | Ghế #2 không xuất hiện trong tập mục tiêu |
| Nhảy từ bước Bảo Vệ chưa hoàn thành sang bước khác | Hiện cảnh báo, cho chọn ở lại hoặc ghi đè; đã chọn ở lại |
| Phân trang slider | Trang 1/2 hiển thị các ghế tương ứng; nút trước/sau bị khóa đúng ở biên |
| Sửa nhiều tên có dòng trống | Bộ đếm bỏ dòng trống; đã hủy, chưa kiểm tra lưu |
| Reload | Sau reload hiển thị được ván đang lưu ở Đêm 2 |
| Console tab | Không có error/warn trong kết quả truy xuất; không chứng minh toàn ứng dụng không có lỗi |

## 6. Checklist kiểm thử tiếp cho engine và persistence

Các mục sau **chưa chạy đủ, không phải kết luận có bug**. Nên thực hiện trên bản staging hoặc ván test riêng với luật của dự án được chốt trước.

| Nhóm | Ca kiểm thử cần bổ sung | Tiêu chí |
|---|---|---|
| Thiết lập | 0 người, số người lệch số bài, số lượng role duy nhất vượt giới hạn, tên rất dài | Chặn cấu hình không hợp lệ, giải thích rõ |
| Đêm | Bảo vệ, cắn, cứu, độc cùng mục tiêu; nhiều nguồn chết | Resolve theo luật đã chọn, không chết/lưu hai lần |
| Sói đặc biệt | Sói Lớn sau khi có Sói chết; Sói Trắng đêm chẵn/lẻ; Sói nguyền hết lượt | Quyền dùng kỹ năng theo state và ruleset |
| Thừa kế/đổi phe | Ảnh Tử nhận vai đã dùng kỹ năng; chủ thể bị nguyền rồi chết | Phe, vai, tài nguyên kỹ năng nhất quán |
| Chết dây chuyền | Cặp đôi, Thợ Săn, vai bị giết nhiều nguồn | Hàng đợi sự kiện xử lý một lần, không lặp vô hạn |
| Ban ngày | Hòa phiếu, bỏ treo, vai thắng khi bị treo, sửa thao tác | Kết quả khớp ruleset và nhật ký |
| Kết thúc | Các phe thắng; còn phe thứ ba; không còn người sống | Thứ tự xét thắng rõ, lưu đúng một kết quả |
| Persistence | Reload trước/sau xác nhận kỹ năng, API lỗi, offline, dữ liệu cũ | Không mất state hoặc hồi lại lượt đã dùng |
| Đa tab | Hai tab chỉnh cùng ván, response đến sai thứ tự | Có version/conflict policy, tránh ghi đè state mới |
| Phân quyền | Hai tài khoản/phòng riêng, thử đọc/sửa lịch sử phòng kia bằng fixture được phép | Cách ly server-side; chưa kiểm tra trong phiên này |
| Mobile/PWA | Safari iOS, bàn phím ảo, cuộn modal, landscape, cài PWA | Không che nút chính, focus/scroll sử dụng được |

## 7. Thứ tự sửa đề xuất

1. BUG-01 và BUG-02: chuẩn hóa kết quả và snapshot lịch sử, xử lý dữ liệu cũ.
2. BUG-03 và BUG-04: thống nhất metadata vai trò và số lượng.
3. BUG-05, BUG-06 và BUG-07: sửa validation, trạng thái nút và tên truy cập.
4. Điều tra OBS-01 bằng ID thực trước khi sửa logic chống trùng.
5. Chạy một ván test hoàn chỉnh và ma trận tương tác đặc biệt ở trên trước khi kết luận engine ổn định.

**Báo cáo này phản ánh hành vi của bản deploy trong phiên kiểm tra ngày 13/11/2026. Hướng fix cần được đối chiếu với mã nguồn trước khi áp dụng.**
