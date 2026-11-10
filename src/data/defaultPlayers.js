/**
 * Danh sách tên người chơi mẫu thực tế cho các ván Ma Sói
 * Tự nhiên, thân thuộc và trực quan quanh bàn chơi
 */
export const DEFAULT_PLAYER_NAMES = [
  "Quang Tuấn", "Minh Hùng", "Thùy Linh", "Đức Nam",
  "Hoàng Long", "Khánh Vy", "Văn Dũng", "Thanh Mai",
  "Bảo Ngọc", "Gia Bảo", "Phương Lan", "Việt Phong",
  "Anh Quân", "Thu Hà", "Đình Trọng", "Ngọc Ánh",
  "Tuấn Kiệt", "Mai Anh", "Tiến Dũng", "Hồng Hạnh"
];

/**
 * Trả về mảng tên theo số lượng người chơi
 */
export function getDefaultPlayerNames(count) {
  return Array.from({ length: count }, (_, i) => {
    return DEFAULT_PLAYER_NAMES[i] || `Người chơi ${i + 1}`;
  });
}
