import React, { useState } from 'react';
import { 
  X, HelpCircle, Layers, Users, Moon, Sun, 
  Shield, Eye, Skull, Sparkles, CheckCircle2, 
  RotateCcw, Sliders, FileText, Database, Compass
} from 'lucide-react';
import WolfIcon from './ui/WolfIcon';

export default function GameGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeSection, setActiveSection] = useState('setup'); // 'setup' | 'night' | 'day' | 'data'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fade-in touch-manipulation">
      
      {/* Outer Parchment Container - transparent background, dropshadow follows burned edges */}
      <div 
        className="relative w-full max-w-3xl flex flex-col h-[90vh] max-h-[820px] bg-transparent filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
        style={{
          backgroundImage: "url('/parchment-bg.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Semi-transparent dark ink wash overlay for readability */}
        <div className="absolute inset-0 bg-[#2b170c]/5 pointer-events-none rounded-2xl"></div>

        {/* ================= PARCHMENT HEADER ================= */}
        <div className="relative pt-6 px-6 sm:pt-8 sm:px-10 pb-3 border-b border-[#542d13]/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#241007] border border-[#5e2e15] flex items-center justify-center text-[#faebd7] shadow-md shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-sm sm:text-base md:text-lg text-[#260e05] tracking-widest leading-tight uppercase">
                SỔ TAY QUẢN TRÒ
              </h2>
              <p className="text-[10px] sm:text-xs text-[#522812] font-semibold tracking-wide">
                HƯỚNG DẪN THAO TÁC &amp; VẬN HÀNH ỨNG DỤNG
              </p>
            </div>
          </div>

          {/* Antique Bronze Wax Seal Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#241007] hover:bg-[#451608] border border-[#5e2e15] text-[#faebd7] flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
            title="Đóng sổ tay"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= GOTHIC INK TABS NAVIGATION ================= */}
        <div className="relative px-6 sm:px-10 pt-2 border-b border-[#542d13]/25 flex items-center gap-1 sm:gap-2 shrink-0 overflow-x-auto scrollbar-none">
          {[
            { id: 'setup', label: 'THIẾT LẬP BÀN', icon: Sliders },
            { id: 'night', label: 'ĐIỀU KHIỂN ĐÊM', icon: Moon },
            { id: 'day', label: 'ĐIỀU KHIỂN NGÀY', icon: Sun },
            { id: 'data', label: 'DỮ LIỆU & LƯU TRỮ', icon: Database }
          ].map(tab => {
            const isActive = activeSection === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-1.5 rounded-t-lg text-xs sm:text-xs font-cinzel font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-t border-x ${
                  isActive
                    ? 'bg-[#3b1d0c]/15 border-[#542d13]/40 text-[#240e05] font-black border-b-2 border-b-transparent'
                    : 'bg-transparent border-transparent text-[#61361c] hover:bg-[#3b1d0c]/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#240e05]' : 'text-[#61361c]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= SCROLLABLE PARCHMENT CONTENT (PURE DARK INK ON PARCHMENT) ================= */}
        <div className="relative flex-1 overflow-y-auto px-6 sm:px-10 py-5 space-y-4 text-[#241209] leading-relaxed font-sans text-xs sm:text-sm">
          
          {/* ---------------- SECTION 1: SETUP ---------------- */}
          {activeSection === 'setup' && (
            <div className="space-y-4">
              
              {/* Item 1 */}
              <div className="pb-3 border-b border-[#542d13]/20 space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">I</span>
                  <span>Thiết Lập Bộ Bài (Nút Bộ Bài trên Header)</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Quản trò chạm vào nút <strong>Bộ Bài</strong> để điều chỉnh tổng số người chơi và kích hoạt các thẻ bài đặc biệt sẽ tham gia ván đấu (Bảo Vệ, Tiên Tri, Phù Thủy, Sói Quỷ, Thợ Săn...). Ứng dụng tự động tính toán tỷ lệ cân bằng giữa phe Dân và phe Sói.
                </p>
              </div>

              {/* Item 2 */}
              <div className="pb-3 border-b border-[#542d13]/20 space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">II</span>
                  <span>Nạp Danh Sách Người Chơi (Nút Tên trên Header)</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Chạm vào nút <strong>Tên</strong> để dán trực tiếp danh sách người chơi từ clipboard (Zalo, Messenger) hoặc chọn một nhóm bạn bè đã lưu từ Neon Cloud. <em>Bàn chơi sẽ tự động co giãn khớp chính xác với số lượng người nạp vào</em>, không phát sinh dư thừa ghế.
                </p>
              </div>

              {/* Item 3 */}
              <div className="pb-3 border-b border-[#542d13]/20 space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">III</span>
                  <span>Sơ Đồ Bàn &amp; Hoán Đổi Vai Trò Nhanh</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Chuyển sang tab <strong>Sơ Đồ Bàn</strong> để nhìn toàn cảnh bàn chơi thực tế. Nếu Quản trò phát nhầm thẻ bài Tarot ngoài đời, chỉ cần chạm trực tiếp vào ghế tương ứng để đổi vai trò ngay lập tức mà không cần tạo lại ván.
                </p>
              </div>

              {/* Item 4 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">IV</span>
                  <span>Nút Reset Về 0 (Khởi Động Ván Mới)</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Khi kết thúc hoặc muốn chia lại từ đầu, bấm nút <strong>Reset Về 0</strong> trên header. Hệ thống sẽ thu hồi toàn bộ vai trò về trạng thái chưa chia nhưng <strong>giữ nguyên danh sách tên người chơi và thứ tự chỗ ngồi</strong> để bắt đầu ván mới ngay lập tức.
                </p>
              </div>

            </div>
          )}

          {/* ---------------- SECTION 2: NIGHT ---------------- */}
          {activeSection === 'night' && (
            <div className="space-y-4">
              
              {/* Item 1 */}
              <div className="pb-3 border-b border-[#542d13]/20 space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">I</span>
                  <span>Thao Tác Chuyển Lượt: Bấm Nút "Đi Ngủ"</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Quản trò chỉ cần bấm nút <strong>"Đi Ngủ"</strong> ở thanh điều hướng dưới đáy. Ứng dụng sẽ tự động chuyển lần lượt qua từng vai trò thức dậy theo đúng thứ tự quốc tế. Hệ thống tự động cuộn màn hình đưa lá bài Tarot của vai trò hiện tại vào tầm nhìn rõ ràng nhất.
                </p>
              </div>

              {/* Item 2 */}
              <div className="pb-3 border-b border-[#542d13]/20 space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">II</span>
                  <span>Gán Mục Tiêu: Chạm Trực Tiếp Vào Ghế</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Khi vai trò thức dậy (Bảo Vệ chọn người che chở, Ma Sói chọn người để cắn, Phù Thủy ném bình độc...), Quản trò chỉ cần <strong>chạm vào số ghế của người được chọn</strong> trên danh sách để ứng dụng tự động ghi nhận hành động.
                </p>
              </div>

              {/* Item 3 */}
              <div className="pb-3 border-b border-[#542d13]/20 space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">III</span>
                  <span>Tiên Tri Soi Bài &amp; Hướng Dẫn Ra Dấu</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Ở lượt Tiên Tri, Quản trò chạm vào ghế người bị soi. Ứng dụng lập tức lật lá bài Tarot lớn và hiển thị hướng dẫn ra dấu tay bí mật: <em>"RA DẤU: LÀ MA SÓI"</em> hoặc <em>"RA DẤU: LÀ DÂN LÀNG"</em>, giúp Quản trò không bao giờ nhầm lẫn danh tính.
                </p>
              </div>

              {/* Item 4 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">IV</span>
                  <span>Quyền Năng Sói Nguyền (Sói Quỷ)</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Sau khi bầy Sói chỉ định con mồi, nếu trong ván có Sói Quỷ, nút <strong>"Nguyền thành Sói"</strong> sẽ sáng lên. Quản trò bấm nút để biến nạn nhân thành Sói ngay trong đêm; đồng thời bầy Sói được tiếp tục chọn thêm một con mồi thứ hai để cắn.
                </p>
              </div>

            </div>
          )}

          {/* ---------------- SECTION 3: DAY ---------------- */}
          {activeSection === 'day' && (
            <div className="space-y-4">
              
              {/* Item 1 */}
              <div className="pb-3 border-b border-[#542d13]/20 space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">I</span>
                  <span>Bản Tin Tổng Hợp Thương Vong Tự Động</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Khi trời sáng, ứng dụng tự động đối chiếu các hành động trong đêm (Sói cắn, Bảo vệ hộ tống, Phù thủy cứu/độc) và đưa ra danh sách chính xác những người đã chết. Quản trò chỉ việc đọc bản tin cho cả làng mà không cần nhẩm tính trong đầu.
                </p>
              </div>

              {/* Item 2 */}
              <div className="pb-3 border-b border-[#542d13]/20 space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">II</span>
                  <span>Biểu Quyết Treo Cổ &amp; Xử Lý Kỹ Năng Tự Động</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Sau khi cả làng tranh luận và bỏ phiếu, Quản trò chạm vào người bị nhiều phiếu nhất và bấm <strong>"Xác nhận treo cổ"</strong>. Nếu người chết là <em>Thằng Ngốc</em>, hệ thống tự động lật bài và tha thứ; nếu là <em>Thợ Săn</em>, popup bắn đạn trả đũa sẽ lập tức mở ra.
                </p>
              </div>

              {/* Item 3 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">III</span>
                  <span>Huy Hiệu Cảnh Sát Trưởng (Thị Trưởng)</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Chạm vào biểu tượng ngôi sao trên ghế người chơi để trao quyền Cảnh Sát Trưởng (tính 2 phiếu khi treo cổ). Khi Cảnh Sát Trưởng bị giết chết, Quản trò chỉ cần chạm vào người sống bất kỳ để di chúc chuyển giao huy hiệu.
                </p>
              </div>

            </div>
          )}

          {/* ---------------- SECTION 4: DATA ---------------- */}
          {activeSection === 'data' && (
            <div className="space-y-4">
              
              {/* Item 1 */}
              <div className="pb-3 border-b border-[#542d13]/20 space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">I</span>
                  <span>Tự Động Lưu Trình Duyệt (Chống Mất Dữ Liệu)</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Mọi thao tác gán vai trò, số vòng đêm ngày, tình trạng sống/chết đều được lưu tức thời vào bộ nhớ điện thoại. Nếu lỡ tay tắt tab trình duyệt, bấm reload (F5) hay khóa màn hình điện thoại, toàn bộ diễn biến ván đấu vẫn được giữ nguyên vẹn 100%.
                </p>
              </div>

              {/* Item 2 */}
              <div className="pb-3 border-b border-[#542d13]/20 space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">II</span>
                  <span>Đồng Bộ Neon Cloud &amp; Biên Bản Ván Đấu</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Khi một phe giành chiến thắng chung cuộc, hệ thống sẽ mở <strong>Bảng Vinh Danh Chiến Thắng</strong> và tự động đồng bộ kết quả chi tiết của ván đấu lên cơ sở dữ liệu Neon Cloud để theo dõi tỷ lệ thắng và lịch sử thi đấu của nhóm.
                </p>
              </div>

              {/* Item 3 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[#3b1206] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#2b1207] text-[#faebd7] flex items-center justify-center text-[10px] font-bold">III</span>
                  <span>Tối Ưu Phản Hồi Trên Thiết Bị Di Động</span>
                </div>
                <p className="text-[#30180c] text-xs leading-relaxed pl-7">
                  Ứng dụng đã triệt tiêu độ trễ 300ms của cảm ứng trên màn hình cảm ứng, khóa cố định trượt ngang và hỗ trợ cuộn mượt tự động giúp Quản trò thao tác nhanh chóng và chính xác trong phòng chơi tối.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* ================= PARCHMENT FOOTER ================= */}
        <div className="relative px-6 sm:px-10 py-3 pb-6 sm:pb-7 border-t border-[#542d13]/30 flex items-center justify-between text-[#381a0b] text-[11px] font-bold shrink-0">
          <span className="tracking-widest uppercase font-cinzel">MA SÓI GM TOOL</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#241007] hover:bg-[#451608] text-[#faebd7] font-cinzel font-bold tracking-wider transition-all cursor-pointer shadow-md active:scale-95 text-xs"
          >
            ĐÓNG LẠI
          </button>
        </div>

      </div>
    </div>
  );
}