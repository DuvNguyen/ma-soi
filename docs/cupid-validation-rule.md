# Đặc Tả Kỹ Thuật: Strict Rule-Based Validation Cho Cupid

> **Mã quy tắc:** `RULE-NIGHT-CUPID-01`  
> **Phạm vi áp dụng:** `NightPhaseView.jsx`, `ActionModal.jsx`, `gameLogic.js`  
> **Trạng thái:** Đề xuất triển khai (Draft / Proposed)

---

## 1. Bối cảnh & Vấn đề Hiện tại

### 1.1. Hiện trạng luật chơi
Theo luật Ma Sói chuẩn quốc tế:
- **Cupid (Thần Tình Yêu)** chỉ thức dậy **DUY NHẤT một lần trong Đêm đầu tiên (Đêm 1)** để bắn 2 mũi tên tình yêu ghép đôi 2 người chơi.
- Sau Đêm 1, Cupid không bao giờ thức dậy nữa.
- Cặp đôi này gắn kết sinh tử đến hết ván đấu. Nếu một trong hai người chết, người kia sẽ lập tức chết theo.
- Nếu cặp đôi gồm 1 Sói + 1 Dân/Phe thứ 3, họ tạo thành **Phe Tình Nhân** (Phe thứ ba) với mục tiêu sinh tồn duy nhất.

### 1.2. Lỗ hổng trên hệ thống hiện tại
- **Tại `NightPhaseView.jsx`:** Nút điều hướng stepper:
  ```jsx
  <GothicButton
    variant={isWolfStep ? 'blood' : 'witch'}
    size="lg"
    onClick={handleNextStep}
  >
    <span>Cho {currentRole.name} Ngủ & Tiếp Tục 💤</span>
    <ChevronRight className="w-5 h-5 ml-1 inline" />
  </GothicButton>
  ```
  Hàm `handleNextStep()` chuyển thẳng sang bước tiếp theo mà **không có bất kỳ ràng buộc (validation) nào**.
- **Hậu quả:** 
  1. Quản trò có thể vô tình bấm bỏ qua bước của Cupid khi `cupidChosenIds` vẫn là rỗng `[]` hoặc chỉ mới chọn 1 người.
  2. Ván đấu bước sang các lượt sau và chuyển sang Ban Ngày mà không có cặp đôi nào được tạo.
  3. Vì Cupid không thức dậy ở các đêm sau, tính năng Cặp đôi bị vô hiệu hoá hoàn toàn trong cả ván đấu, làm sai lệch logic cascade deaths (`checkLoversDeath`) và điều kiện thắng của Phe thứ ba.
- **Sự không nhất quán:** Trong khi `ActionModal.jsx` đã chặn bằng `disabled={selectedPair.length !== 2}`, thì màn hình chính `NightPhaseView` (dạng Stepper theo đêm) lại cho phép skip tự do.

---

## 2. Quy Tắc Nghiêm Ngặt (Strict Validation Rules)

### Quy tắc 1: Điều kiện chuyển bước của Cupid (Step Gatekeeper)
Quản trò **KHÔNG ĐƯỢC PHÉP** bấm hoàn tất bước Cupid nếu chưa chọn đủ đúng 2 người chơi còn sống:
$$\text{isValidCupidAction} \iff \text{Array.isArray(cupidChosenIds)} \land \text{cupidChosenIds.length} = 2$$

### Quy tắc 2: Ràng buộc người được chọn
- Hai ID người chơi được chọn phải khác nhau: `cupidChosenIds[0] !== cupidChosenIds[1]`.
- Cả hai người chơi phải đang ở trạng thái còn sống (`isAlive: true`).
- Cupid có thể tự chọn chính mình ghép đôi với người khác (hợp lệ theo luật chuẩn).

### Quy tắc 3: Hiển thị trạng thái rõ ràng (UI Feedback)
- Khi số người chọn $= 0$: Nút Next bị disabled, hiển thị văn bản `Cần chọn 2 người yêu nhau (0/2)`.
- Khi số người chọn $= 1$: Nút Next bị disabled, hiển thị văn bản `Cần chọn thêm 1 người nữa (1/2)`.
- Khi số người chọn $= 2$: Nút Next được kích hoạt (active), hiển thị văn bản `Xác Nhận Cặp Đôi & Cho Cupid Ngủ 💤 (2/2)`.

### Quy tắc 4: Cơ chế Bỏ qua có kiểm soát (Emergency Override / Admin Bypass)
Trong một số tình huống ngoại lệ tại bàn chơi thực tế (ví dụ: Cupid từ chối hành động, người chơi Cupid bị loại đột xuất do vi phạm luật trước đêm 1, hoặc Quản trò cố tình chơi biến thể không dùng cặp đôi):
- Không cung cấp nút Skip mặc định dễ bấm nhầm.
- Cung cấp một nút phụ nhỏ (Ghost/Danger style): **"Bỏ qua Cupid (Không ghép đôi)"** đi kèm hộp thoại xác nhận (Confirm Dialog):
  > *"Cảnh báo: Nếu bỏ qua, ván chơi này sẽ không có cặp đôi Cupid. Bạn có chắc chắn muốn bỏ qua?"*

---

## 3. Thiết Kế Kỹ Thuật (Technical Specification)

### 3.1. Hàm kiểm tra hợp lệ tổng quát (`canAdvanceStep`)
Tại `src/components/NightPhaseView.jsx`, bổ sung hàm validate trước khi cho phép chuyển bước:

```javascript
/**
 * Kiểm tra xem bước hiện tại của Quản trò đã đạt yêu cầu bắt buộc hay chưa
 * @param {Object} role - Role hiện tại đang thức dậy
 * @param {Object} nightState - Trạng thái đêm hiện tại
 * @param {Array} players - Danh sách người chơi
 * @param {number} roundNumber - Đêm thứ mấy
 * @returns {{ canAdvance: boolean, reason?: string }}
 */
export const validateNightStep = (role, nightState, players, roundNumber) => {
  // Chỉ kiểm tra Đêm 1 đối với Cupid
  if (role.id === 'cupid' && roundNumber === 1) {
    const chosen = nightState?.cupidChosenIds || [];
    if (chosen.length !== 2) {
      return {
        canAdvance: false,
        reason: `Cupid phải chọn đủ 2 người yêu nhau (Hiện tại: ${chosen.length}/2)`
      };
    }
  }

  // Mở rộng cho các vai trò nghiêm ngặt khác (ví dụ: Sói phải cắn 1 người, trừ khi cố tình không cắn)
  return { canAdvance: true };
};
```

### 3.2. Cập nhật UI Stepper Footer trong `NightPhaseView.jsx`

```jsx
// Tính toán trạng thái hợp lệ của bước hiện tại
const currentValidation = validateNightStep(currentRole, nightState, players, roundNumber);
const isCupidStep = currentRole.id === 'cupid' && roundNumber === 1;
const cupidCount = (nightState.cupidChosenIds || []).length;

// Nút Tiếp Tục:
<GothicButton
  variant={isWolfStep ? 'blood' : 'witch'}
  size="lg"
  disabled={!currentValidation.canAdvance}
  onClick={handleNextStep}
  className={`shadow-2xl transition-all ${
    !currentValidation.canAdvance ? 'opacity-50 cursor-not-allowed filter grayscale' : ''
  }`}
>
  {isCupidStep && cupidCount < 2 ? (
    <span>Chọn Đủ 2 Người ({cupidCount}/2) Để Tiếp Tục 🔒</span>
  ) : (
    <>
      <span>Cho {currentRole.name} Ngủ & Tiếp Tục 💤</span>
      <ChevronRight className="w-5 h-5 ml-1 inline" />
    </>
  )}
</GothicButton>
```

### 3.3. Thông báo chỉ dẫn trực quan (Visual Banner)
Thêm thanh thông báo nhắc nhở ngay trên danh sách chọn người chơi của Cupid:
- **Nếu chọn 0 người:** Hộp cảnh báo màu hổ phách/đỏ: `⚠️ Bắt buộc: Quản trò cần chọn đúng 2 người chơi trước khi chuyển sang lượt tiếp theo.`
- **Nếu chọn 1 người:** Hộp trạng thái màu tím: `💜 Đã chọn [Tên Người 1] - Hãy chọn thêm 1 người nữa để hoàn tất kết duyên.`
- **Nếu chọn đủ 2 người:** Hộp thành công màu hồng neon: `💘 Đã kết đôi thành công giữa [Tên 1] và [Tên 2]! Có thể cho Cupid ngủ.`

---

## 4. Kế Hoạch Triển Khai (Implementation Checklist)

- [ ] **Bước 1: Viết logic validation**
  Tạo helper `validateNightStep` trong `src/utils/gameLogic.js` hoặc trực tiếp trong `NightPhaseView.jsx`.
- [ ] **Bước 2: Ràng buộc nút "Tiếp Tục" trong `NightPhaseView.jsx`**
  Gán thuộc tính `disabled={!canAdvance}` và hiển thị đếm số lượng `(X/2)` trên label nút.
- [ ] **Bước 3: Hiển thị Banner hướng dẫn trạng thái**
  Render thanh chỉ báo trạng thái ghép đôi (0/2, 1/2, 2/2) giúp Quản trò không bị bỡ ngỡ khi nút Next bị disable.
- [ ] **Bước 4: Nút Override khẩn cấp (Tùy chọn)**
  Thêm liên kết nhỏ "Bỏ qua vai trò này" có modal xác nhận dành riêng cho Quản trò khi có tình huống đặc biệt.
- [ ] **Bước 5: Kiểm thử (Test Cases)**
  1. *Test case 1:* Vào Đêm 1 -> tới lượt Cupid -> Không chọn ai -> Nút Tiếp Tục bị disabled.
  2. *Test case 2:* Chọn 1 người -> Nút Tiếp Tục vẫn disabled, hiển thị (1/2).
  3. *Test case 3:* Chọn người thứ 2 -> Nút Tiếp Tục sáng lên, cho phép bấm chuyển sang bước tiếp theo.
  4. *Test case 4:* Vào Đêm 2 trở đi -> Cupid không xuất hiện trong danh sách thức dậy.
