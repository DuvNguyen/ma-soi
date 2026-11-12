# Báo cáo kiểm thử web Quản Trò Ma Sói

- Website: https://ma-soi-eight.vercel.app/
- Ngày kiểm tra: 12/11/2026.
- Phương pháp: thao tác trực tiếp trên bản web triển khai, quan sát giao diện và kết quả xử lý. Không có mã nguồn nên hướng sửa dưới đây là đề xuất, chưa phải kết luận về dòng code gây lỗi.
- Phạm vi: ván cơ bản 8 người qua hai đêm, bộ Đại Chiến 13 người, gán vai, các hành động đêm, biểu quyết, hoàn tác, tải lại trang và chuyền máy.
- Kết quả: **7 lỗi đã tái hiện**, thêm 1 trường hợp cần chốt luật. Đây không phải chứng nhận đã kiểm tra hết 48 vai hoặc mọi tổ hợp.

## Tổng hợp ưu tiên

| ID | Ưu tiên | Lỗi |
|---|---|---|
| BUG-01 | P1 | Chuyền máy bí mật vẫn để người chơi cuộn xem vai của dân |
| BUG-02 | P1 | Chuyền máy cho phép Sói tự cắn dù luật cắn đồng loại tắt |
| BUG-03 | P1 | Hoàn tác treo cổ không hồi sinh nạn nhân của Thợ Săn |
| BUG-04 | P1 | F5 làm mất hành động bắn đang chờ của Thợ Săn |
| BUG-05 | P1 | Khôi phục sai bộ bài đã chọn, nội dung bộ Mở Rộng thay đổi |
| BUG-06 | P2 | Tiên Tri hiện thẻ Dân Làng cho người chưa gán vai |
| BUG-07 | P1 | Có Sói Lớn Xấu Xa nhưng thiếu lượt cắn thêm trong đêm đầu |

P1: nên sửa trước khi sử dụng các luồng liên quan trong ván thật. P2: thông tin sai hoặc thiếu gây nhầm lẫn, cần sửa sớm.

## BUG-01 — Chuyền máy bí mật làm lộ vai

**Các bước tái hiện**

1. Gán đủ vai trong bộ cơ bản: Đức Nam là Tiên Tri, Hoàng Long là Phù Thủy.
2. Tới bước Bầy Ma Sói, bấm **Mở Chuyền Máy**.
3. Cuộn xuống dưới hộp chuyền máy.

**Thực tế:** phần “Quản trò chọn mục tiêu bầy Sói cắn” vẫn hiện. Các ô ghi rõ “Đức Nam — Tiên Tri”, “Hoàng Long — Phù Thủy”, cùng vai của những người khác. Đã xác nhận bằng ảnh màn hình, không chỉ bằng cây giao diện.

**Mong đợi:** khi máy được đưa cho người chơi, chỉ hiển thị thông tin họ được phép biết. Không thể cuộn tới màn quản trò hoặc mở sơ đồ xem vai.

**Hướng sửa:** tạo màn chuyền máy riêng, tạm bỏ toàn bộ nội dung quản trò khỏi giao diện. Cần có cách trở về dành cho quản trò; một hộp mở rộng nằm ngay trong màn quản trò không bảo vệ được bí mật.

**Kiểm thử lại:** cuộn đầu/cuối trang, đổi kích thước màn hình, thử điều hướng bằng bàn phím và nút Sơ Đồ trong lúc chuyền máy.

## BUG-02 — Bỏ qua luật cấm cắn đồng loại qua chuyền máy

**Tiền điều kiện:** cài đặt “Ma Sói Có Thể Cắn Đồng Loại” đang tắt. Trong bộ cơ bản, Minh Hùng và Thùy Linh là hai Sói; Minh Hùng đã bị treo cổ.

**Các bước tái hiện**

1. Đêm 2, mở Chuyền Máy cho Thùy Linh.
2. Chọn **Thùy Linh (Sói)** làm con mồi.
3. Bấm **Chốt Con Mồi Này Cho Cả Bầy**.
4. Bấm **Xác Nhận & Đi Ngủ**, hoàn thành các bước còn lại, không cứu bằng Phù Thủy.
5. Cho trời sáng.

**Thực tế:** mục tiêu nhận là Thùy Linh dù ô tương ứng ở phần quản trò đang bị vô hiệu hóa. Sáng hôm sau Thùy Linh chết, số Sói về 0 và web công bố Dân Làng thắng.

**Mong đợi:** mục tiêu là Sói phải bị chặn ở cả chế độ chuyền máy lẫn bước chốt hành động, khi luật này tắt.

**Hướng sửa:** dùng chung một hàm kiểm tra mục tiêu cho mọi cách nhập; kiểm tra lại tại nơi ghi nhận hành động và xử lý kết quả đêm. Không chỉ vô hiệu hóa nút ở một giao diện.

## BUG-03 — Hoàn tác treo cổ không hoàn tác phát súng

**Tiền điều kiện:** bộ Đại Chiến; Bảo Ngọc là Thợ Săn, Anh Quân là Dân Làng, được Cupid ghép đôi. Minh Hùng là Sói. Đầu ngày cả ba còn sống.

**Các bước tái hiện**

1. Treo cổ Bảo Ngọc.
2. Ghi nhận Anh Quân chết theo người yêu.
3. Cho Thợ Săn bắn Minh Hùng.
4. Bấm **Hoàn tác treo cổ**.

**Thực tế:** trước hoàn tác có 3 người chết. Sau hoàn tác Bảo Ngọc và Anh Quân sống lại nhưng Minh Hùng vẫn chết; bộ đếm còn 1 người chết và chỉ 3/4 Sói sống.

**Mong đợi:** hoàn tác phải đưa ván về trạng thái trước án treo cổ, bao gồm mọi cái chết phát sinh từ án đó. Nếu chỉ hỗ trợ hoàn tác một phần, cần công bố rõ và có cách sửa toàn bộ trạng thái; hiện tại rất dễ làm sai ván.

**Hướng sửa:** lưu snapshot trước hành động hoặc gom các hiệu ứng dây chuyền thành một giao dịch có thể hoàn tác. Bao gồm người yêu, phát súng, năng lực bị tiêu hao, trạng thái mất kỹ năng, chức vụ và kết quả thắng/thua.

**Kiểm thử lại:** treo Thợ Săn → bắn một người đang yêu người khác → hoàn tác; tất cả người chết trong chuỗi phải được khôi phục đúng.

## BUG-04 — Tải lại trang làm mất phát súng đang chờ

**Các bước tái hiện**

1. Treo cổ Bảo Ngọc là Thợ Săn.
2. Đóng thông báo người yêu chết theo nếu có.
3. Khi hộp **Phát súng cuối cùng của Thợ Săn** đang mở, chưa chọn người bị bắn, tải lại trang.

**Thực tế:** Thợ Săn vẫn được ghi nhận đã chết và án treo cổ vẫn tồn tại, nhưng hộp chọn mục tiêu biến mất. Màn hình cho phép kết thúc ngày, không có điều khiển tiếp tục phát súng trong màn ngày đã quan sát.

**Mong đợi:** khôi phục cả hành động bắt buộc đang chờ, không chỉ trạng thái sống/chết. Không cho chuyển pha trước khi giải quyết hoặc chủ động bỏ qua theo luật đã chọn.

**Hướng sửa:** lưu pending actions trong trạng thái ván, ví dụ loại hành động, người sở hữu và trạng thái hoàn tất. Hiển thị hộp thoại từ dữ liệu đó thay vì chỉ dùng trạng thái mở/đóng tạm thời của giao diện.

**Lưu ý:** F5 ở bước Phù Thủy thông thường giữ được trạng thái thuốc độc. Lỗi này cụ thể ở hành động Thợ Săn đang chờ, không phải toàn bộ cơ chế lưu đều hỏng.

## BUG-05 — Khôi phục sai danh tính bộ bài

**Các bước tái hiện**

1. Mở Thiết Lập, chọn **Cơ Bản (6–8 Người)**, 8 lá.
2. Áp dụng và bắt đầu ván.
3. Tải lại trang rồi mở Thiết Lập.

**Thực tế:** mục “Đang Chọn Cho Ván” nằm ở **Mở Rộng Kịch Tính (9–11 Người)**. Mục này lại hiện 8 lá với thành phần của bộ Cơ Bản.

**Tái hiện lần hai:** chọn **Đại Chiến Ngôi Làng**, áp dụng, F5 rồi mở Thiết Lập. Mục Mở Rộng lại được đánh dấu đang chọn, lần này có 13 lá với thành phần của bộ Đại Chiến.

**Mong đợi:** tên/ID bộ được chọn, số lá và thành phần vai phải được khôi phục nhất quán. Chọn bộ A để chơi không được làm nội dung bộ mẫu B đổi theo.

**Hướng sửa:** kiểm tra quá trình lưu/khôi phục ID bộ bài; tách bản sao bộ bài đang dùng khỏi danh sách bộ mẫu. Kiểm tra effect đồng bộ có đang ghi bộ bài hiện hành vào một ID mặc định hay không.

**Giới hạn kết luận:** đã xác nhận sai dữ liệu hiển thị sau F5 trong phiên thử nghiệm. Chưa kiểm tra database nên chưa kết luận bộ mẫu của tài khoản khác hoặc dữ liệu lưu trên máy chủ bị ghi đè.

## BUG-06 — Tiên Tri hiển thị vai chưa biết thành Dân Làng

**Các bước tái hiện**

1. Dùng bộ Cơ Bản và gán vai tuần tự theo kịch bản đêm.
2. Đến Tiên Tri, soi Hoàng Long khi ô người này vẫn ghi **Chưa lộ vai**.
3. Sang bước Phù Thủy, gán Hoàng Long là Phù Thủy.

**Thực tế:** ở bước 2, thẻ soi đã ghi tên vai **Dân Làng**. Sau khi gán đúng và soi lại ở đêm sau, thẻ hiện **Phù Thủy**.

**Mong đợi:** không suy diễn vai chưa gán thành một vai cụ thể. Nếu chỉ trả kết quả phe, phải thể hiện rõ đó là “không phải Sói” và chỉ kết luận khi đã đủ thông tin; không hiển thị thẻ vai Dân Làng sai.

**Hướng sửa:** phân biệt rõ unknown, villager và faction; với vai chưa biết, yêu cầu quản trò xác nhận/gán vai hoặc hiện “Chưa xác định”.

## BUG-07 — Sói Lớn Xấu Xa thiếu hành động đặc biệt

**Tiền điều kiện:** dùng bộ Đại Chiến, gán Đức Nam là Sói Lớn Xấu Xa, tất cả Sói còn sống trong đêm 1.

**Các bước tái hiện**

1. Gán đủ 13 vai, trong đó có 2 Sói thường, Sói Lớn và Sói Trắng.
2. Đi lần lượt qua kịch bản đêm đầu.
3. Chọn con mồi cho bầy Sói và tiếp tục tới tổng kết.

**Thực tế:** chỉ có một mục tiêu cắn của bầy Sói. Kịch bản có Cupid, Thằng Ngố, Bảo Vệ, Bầy Sói, Tiên Tri, Phù Thủy, Người Thổi Sáo và Tổng Kết; không có bước hay điều khiển chọn con mồi bổ sung cho Sói Lớn. Tổng kết chỉ ghi một mục tiêu cắn.

**Mong đợi theo mô tả ngay trong web:** Sói Lớn được cắn thêm một người mỗi đêm khi chưa có Sói nào chết. Điều kiện này thỏa ở đêm đầu đã thử.

**Hướng sửa:** bổ sung hành động riêng và đưa nó vào xử lý đêm, bao gồm tương tác Bảo Vệ/Phù Thủy/Già Làng. Khi điều kiện hết hiệu lực phải loại bỏ hoặc vô hiệu hóa lượt cắn thêm.

**Đối chiếu:** bước riêng của Sói Trắng có xuất hiện ở đêm 2, nên không gộp Sói Trắng vào lỗi này.

## Trường hợp cần chốt luật — Thợ Săn chết theo người yêu

- Ghép Bảo Ngọc (Thợ Săn) với Anh Quân (Dân Làng).
- Treo Anh Quân, xác nhận Bảo Ngọc chết theo.
- Web không mở phát súng cho Bảo Ngọc. Ngược lại, treo trực tiếp Bảo Ngọc có mở phát súng.

Đây là khác biệt đã quan sát. Cần chốt luật của nhóm về quyền bắn khi chết theo người yêu trước khi coi là lỗi luật. Không tính vào 7 lỗi chính. Nếu nhóm cho phép bắn trong trường hợp này, nên xử lý mọi nguyên nhân chết qua cùng một cơ chế phát sinh hành động, thay vì chỉ bắt sự kiện treo cổ trực tiếp.

## Các kiểm tra đã cho kết quả đúng

| Tình huống | Kết quả quan sát |
|---|---|
| Chuyển bước Cupid khi chưa gán vai | Chặn và báo chưa gán Cupid |
| Gán vai trùng cho người đã có vai trong luồng thường | Các ô tương ứng bị khóa |
| Chọn đủ hai Sói trong bộ cơ bản | Không cho chọn thêm ở bước nhận diện |
| Cắn đồng loại ở giao diện quản trò thường | Ô Sói bị vô hiệu hóa khi luật tắt |
| Sói cắn người được Bảo Vệ | Người đó sống khi trời sáng |
| Phù Thủy đầu độc Bảo Vệ | Bảo Vệ chết đúng mục tiêu |
| Bình độc đã dùng | Đêm tiếp theo không dùng lại được |
| F5 ở bước Phù Thủy sau khi dùng độc | Giữ vai, mục tiêu và trạng thái bình độc |
| Bảo Vệ đã chết | Đêm sau không được thực hiện chức năng |
| Bảo vệ cùng người hai đêm liên tiếp | Đêm 2 khóa mục tiêu đêm trước |
| Hoàn tác treo cổ Sói thông thường | Khôi phục người và bộ đếm |
| Cupid: một người yêu bị treo cổ | Người còn lại chết theo |
| Hoàn tác treo cổ có người yêu, chưa phát súng | Cả cặp sống lại |
| Già Làng bị cắn lần đầu | Sống và thông báo còn một mạng |
| Thợ Săn bị treo trực tiếp rồi chọn mục tiêu | Người bị bắn chết |
| Không còn Sói trong ván cơ bản | Hiện Dân Làng thắng |
| Sói Trắng đêm chẵn | Có bước riêng trong kịch bản đêm 2 |

## Giới hạn và kiểm thử tiếp theo

- Chưa có repository: chưa review reducer, state persistence, API, database hay kiểm thử tự động; không xác định tên hàm/dòng code thực tế.
- Chưa kiểm tra đầy đủ Sói Nguyền, Ảnh Tử, đổi phe, thắng cặp đôi, thắng Người Thổi Sáo, thắng Thằng Ngố và mọi chuỗi chết phức tạp.
- Chưa kiểm chứng cách ly dữ liệu giữa nhiều người quản trò, nhiều thiết bị hoặc nhiều tab; chưa kiểm tra mạng mất/kết nối lại và xung đột lưu.
- Chưa kiểm tra ma trận trình duyệt/thiết bị hoặc PWA iOS thật. Những ảnh quan sát ở khung trình duyệt hẹp không đủ để kết luận toàn bộ responsive đã đúng.
- Không sửa mã nguồn hay triển khai bản mới trong lần kiểm tra này.

## Thứ tự sửa đề xuất

1. Khóa màn chuyền máy và kiểm tra mục tiêu chung — BUG-01, BUG-02.
2. Hoàn thiện mô hình hành động dây chuyền, pending actions và undo — BUG-03, BUG-04.
3. Sửa lưu/khôi phục bộ bài — BUG-05.
4. Bổ sung hành động Sói Lớn và xử lý vai chưa biết — BUG-07, BUG-06.
5. Chạy lại các ca hồi quy trong báo cáo và bổ sung các tổ hợp đổi phe/thắng riêng.
