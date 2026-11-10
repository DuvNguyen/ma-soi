import React, { useState } from 'react';
import { 
  X, HelpCircle, BookOpen, Moon, Sun, Shield, Eye, Skull, 
  Heart, Award, Sparkles, CheckCircle2, RotateCcw, AlertTriangle, 
  Users, ChevronRight, Layers, Flame
} from 'lucide-react';
import WolfIcon from './ui/WolfIcon';

export default function GameGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [activeSection, setActiveSection] = useState('workflow'); // 'workflow' | 'mechanics' | 'tips'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in touch-manipulation">
      
      {/* Outer Parchment Container with burnt/ragged paper texture */}
      <div 
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-[0_15px_60px_rgba(0,0,0,0.95)] flex flex-col h-[90vh] max-h-[820px] border-4 border-[#52331c]/80"
        style={{
          backgroundImage: "url('/parchment-bg.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#d8b98b'
        }}
      >
        {/* Subtle dark vignette overlay to ensure pristine ink readability */}
        <div className="absolute inset-0 bg-[#3a2211]/10 pointer-events-none"></div>

        {/* ================= PARCHMENT HEADER ================= */}
        <div className="relative p-3.5 sm:p-5 border-b-2 border-[#633b1e]/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#3d2010] border border-[#7d4822] flex items-center justify-center text-[#faebd7] shadow-md shrink-0">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#f5deb3]" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-sm sm:text-base md:text-lg text-[#30160a] tracking-wider leading-tight">
                CẨM NANG QUẢN TRÒ MA SÓI
              </h2>
              <p className="text-[10px] sm:text-xs text-[#5c341b] font-medium hidden sm:block">
                Hướng dẫn vận hành ván đấu, thứ tự gọi đêm và mẹo điều khiển
              </p>
            </div>
          </div>

          {/* Antique Bronze Wax Seal Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#3d2010]/90 hover:bg-[#571c0d] border border-[#7d4822] text-[#faebd7] flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
            title="Đóng cẩm nang"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= TABS NAVIGATION (ANTIQUE INK TABS) ================= */}
        <div className="relative px-3 pt-2 sm:px-5 sm:pt-3 border-b border-[#633b1e]/20 flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto scrollbar-none">
          {[
            { id: 'workflow', label: '📜 Quy Trình Ván Đấu' },
            { id: 'mechanics', label: '🐺 Quyền Năng & Thao Tác' },
            { id: 'tips', label: '💡 Mẹo & Lưu Ý Quản Trò' }
          ].map(tab => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-1.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border-t border-x ${
                  isActive
                    ? 'bg-[#edd9b9]/90 border-[#633b1e]/40 text-[#30160a] shadow-sm font-black'
                    : 'bg-[#cfb084]/40 border-transparent text-[#5c341b] hover:bg-[#dfc399]/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================= SCROLLABLE PARCHMENT CONTENT ================= */}
        <div className="relative flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-[#2e170c] leading-relaxed font-sans text-xs sm:text-sm">
          
          {/* ---------------- SECTION 1: WORKFLOW ---------------- */}
          {activeSection === 'workflow' && (
            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-[#4a1807] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#4a1807] text-[#f5e6cc] flex items-center justify-center text-[10px]">1</span>
                  <span>Thiết Lập Bộ Bài & Danh Sách Người Chơi</span>
                </div>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  • <strong>Bộ Bài (Icon Layers 🎴)</strong>: Chọn số lượng người chơi và các lá bài tham gia ván đấu.<br/>
                  • <strong>Tên Người Chơi (Icon Users 👥)</strong>: Quản trò có thể dán sẵn danh sách tên bạn bè (Zalo/Messenger) hoặc dùng danh sách mặc định để ứng dụng gán tên lên từng ghế.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-[#4a1807] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#4a1807] text-[#f5e6cc] flex items-center justify-center text-[10px]">2</span>
                  <span>Kịch Bản Đêm (Ban Đêm Lần Lượt)</span>
                </div>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  • Quản trò chỉ cần bấm <strong>"Đi Ngủ 💤"</strong> để gọi lần lượt các vai trò theo đúng quy chuẩn luật quốc tế:<br/>
                  <span className="font-semibold text-[#5c1c0a]">
                    Bảo Vệ ➔ Bầy Ma Sói (Săn mồi & Nguyền) ➔ Tiên Tri (Soi bài) ➔ Phù Thủy (Bình cứu & độc)...
                  </span><br/>
                  • Ở mỗi bước, Quản trò chạm vào số ghế của người chơi để ghi nhận hành động đêm.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-[#4a1807] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#4a1807] text-[#f5e6cc] flex items-center justify-center text-[10px]">3</span>
                  <span>Ban Ngày (Công Bố & Biểu Quyết Treo Cổ)</span>
                </div>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  • Hệ thống tự động tổng hợp thương vong đêm (ai bị cắn chết, ai được cứu an toàn).<br/>
                  • Cả làng thảo luận tìm Sói. Quản trò chọn 1 người bị biểu quyết nhiều nhất và bấm <strong>"Xác nhận treo cổ"</strong>.<br/>
                  • Nếu Thằng Ngốc bị treo cổ: hệ thống tự động lật bài và tha thứ; nếu Thợ Săn chết: mở popup bắn phát đạn cuối cùng.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-[#4a1807] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-[#4a1807] text-[#f5e6cc] flex items-center justify-center text-[10px]">4</span>
                  <span>Tự Động Đánh Giá Kết Thúc & Lưu Lịch Sử</span>
                </div>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  • Khi phe Sói tiêu diệt hết Dân làng hoặc phe Dân làng tiêu diệt toàn bộ Sói (hoặc Phe Thứ 3 chiến thắng), ứng dụng sẽ hiện <strong>Bảng Vinh Danh Chiến Thắng</strong> và tự động lưu chi tiết toàn bộ ván đấu lên máy chủ đám mây.
                </p>
              </div>

            </div>
          )}

          {/* ---------------- SECTION 2: MECHANICS ---------------- */}
          {activeSection === 'mechanics' && (
            <div className="space-y-4">
              
              {/* Werewolf & Cursed Wolf */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#5c1c0a] font-cinzel font-black text-xs sm:text-sm uppercase">
                  <WolfIcon className="w-4 h-4 text-[#8a1c0d]" />
                  <span>Bầy Ma Sói & Quyền Năng Sói Nguyền</span>
                </div>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  • <strong>Săn Mồi</strong>: Bầy Sói chọn 1 nạn nhân đêm nay.<br/>
                  • <strong>Nguyền Thành Sói (1 lần/ván)</strong>: Nếu có Sói Nguyền (Người Cha Của Sói), sau khi chọn nạn nhân, Quản trò bấm nút <strong>"🔮 Nguyền thành Sói"</strong>. Nạn nhân lập tức gia nhập bầy Sói ngay trong đêm, và bầy Sói <strong>tiếp tục được chọn 1 con mồi khác</strong> để cắn!
                </p>
              </div>

              {/* Seer (Tiên Tri) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#3d185e] font-cinzel font-black text-xs sm:text-sm uppercase">
                  <Eye className="w-4 h-4 text-[#5c238c]" />
                  <span>Tiên Tri (Soi Thẻ Bài & Hướng Dẫn Ra Dấu)</span>
                </div>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  • Khi Tiên Tri chỉ tay vào ai, Quản trò chỉ cần <strong>chạm vào số ghế của người đó</strong>.<br/>
                  • Ứng dụng sẽ lập tức hiển thị <strong>Thẻ Bài Tarot to rõ</strong> cùng dòng nhắc nhở Quản trò ra dấu hiệu chuẩn xác: <em>"👉 RA DẤU: LÀ MA SÓI! 🐺"</em> hoặc <em>"👉 RA DẤU: LÀ DÂN LÀNG! 👨‍🌾"</em>.
                </p>
              </div>

              {/* Cupid & Lovers */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#731238] font-cinzel font-black text-xs sm:text-sm uppercase">
                  <Heart className="w-4 h-4 text-[#a6174e]" />
                  <span>Cupid Ghép Đôi & Phe Thứ 3</span>
                </div>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  • Chỉ thức dậy ở <strong>Đêm 1</strong>: Cupid chọn đúng 2 người chơi bất kỳ để kết duyên.<br/>
                  • Nếu ghép 1 Dân + 1 Sói: Hệ thống tự động chuyển cặp đôi thành <strong>Phe Thứ 3</strong> (mục tiêu: tiêu diệt toàn bộ những người còn lại để chiến thắng).<br/>
                  • Khi 1 trong 2 người chết, người kia sẽ đau đớn chết theo ngay lập tức.
                </p>
              </div>

              {/* Sheriff */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#573507] font-cinzel font-black text-xs sm:text-sm uppercase">
                  <Award className="w-4 h-4 text-[#8a550d]" />
                  <span>Cảnh Sát Trưởng (Thị Trưởng)</span>
                </div>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  • Là chức danh đặc biệt do cả làng bầu vào ngày đầu tiên.<br/>
                  • Người giữ sao có <strong>x2 giá trị phiếu bầu</strong> khi biểu quyết treo cổ.<br/>
                  • Khi Cảnh Sát Trưởng bị giết chết hoặc treo cổ, Quản trò chạm vào biểu tượng ⭐ trên ghế để chuyển quyền kế nhiệm cho một người chơi còn sống bất kỳ.
                </p>
              </div>

            </div>
          )}

          {/* ---------------- SECTION 3: TIPS ---------------- */}
          {activeSection === 'tips' && (
            <div className="space-y-4">
              
              {/* Tip 1 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-1.5">
                <h4 className="font-bold text-[#4a1807] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Tự Động Lưu Trữ (Reload F5 Không Lo Mất)</span>
                </h4>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  Tất cả diễn biến ván chơi được tự động lưu tức thì vào bộ nhớ trình duyệt điện thoại. Nếu vô tình tắt tab hoặc reload trang, toàn bộ số ghế, vai trò và trạng thái ngày đêm vẫn giữ nguyên 100%.
                </p>
              </div>

              {/* Tip 2 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-1.5">
                <h4 className="font-bold text-[#4a1807] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-700" />
                  <span>Sơ Đồ Bàn Chơi & Đổi Vai Tức Thì</span>
                </h4>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  Bất cứ lúc nào trong ván, Quản trò chỉ cần bấm vào tab <strong>"Sơ Đồ Bàn"</strong>, chạm vào ghế của bất kỳ ai để đổi vai trò, xem tình trạng sống/chết hoặc trao huy hiệu Cảnh Sát Trưởng.
                </p>
              </div>

              {/* Tip 3 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f5e6cc]/80 border border-[#804f26]/30 shadow-sm space-y-1.5">
                <h4 className="font-bold text-[#4a1807] flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-700" />
                  <span>Bắt Đầu Lại Ván Mới (Reset Về 0)</span>
                </h4>
                <p className="text-[#3b2011] text-xs leading-relaxed">
                  Khi chơi xong hoặc muốn thiết lập lại từ đầu, bấm nút <strong>"Reset Về 0"</strong> trên góc phải header. Hệ thống sẽ xóa sạch toàn bộ vai trò về trạng thái ban đầu nhưng giữ nguyên tên người chơi và thứ tự ghế ngồi để bắt đầu ván mới ngay lập tức.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* ================= PARCHMENT FOOTER ================= */}
        <div className="relative p-3 sm:p-4 border-t-2 border-[#633b1e]/30 bg-[#cfae82]/50 flex items-center justify-between text-[#472513] text-[11px] font-medium shrink-0">
          <span>✦ Quản Trò Ma Sói Pro Assistant ✦</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#3d2010] hover:bg-[#521c0b] text-[#faebd7] font-bold transition-all cursor-pointer shadow-md active:scale-95 text-xs"
          >
            Đã Hiểu & Đóng Lại ✓
          </button>
        </div>

      </div>
    </div>
  );
}
