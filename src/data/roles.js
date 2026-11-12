// Auto-generated roles list from thuthuatchoi.com
export const ROLES = [
  {
    "id": "dan-lang",
    "name": "Dân Làng",
    "enName": "Simple Villager",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 99,
    "wakeTime": "Không thức dậy",
    "shortDesc": "Không có năng lực đặc biệt trong đêm. Cùng dân làng suy luận, thảo luận và bỏ phiếu tìm Ma Sói vào ban ngày.",
    "fullDesc": "Dân làng chiếm đại đa số trong các nhân vật. Nhiệm vụ của Dân làng là tìm ra ai là Ma Sói đang trà trộn trong dân chúng để đưa lên giàn treo cổ vào ban ngày. Dân làng cần vận dụng suy luận logic, phân tích biểu cảm và lời nói của người khác để đưa ra quyết định chính xác.",
    "gmCall": "Không gọi thức dậy vào ban đêm.",
    "notes": [
      "Bị chết nếu bị Ma Sói cắn trúng trong đêm hoặc bị dân làng bỏ phiếu treo cổ ban ngày.",
      "Sức mạnh của Dân làng nằm ở lá phiếu và khả năng lập luận sắc bén."
    ],
    "image": "/cards/la-bai-dan-lang.jpg",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "tien-tri",
    "name": "Tiên Tri",
    "enName": "Seer",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 4,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Mỗi đêm thức dậy soi danh tính 1 người chơi. Quản trò báo cho biết người đó có phải là Sói hay không.",
    "fullDesc": "Mỗi đêm, Tiên Tri được Quản trò gọi thức dậy và được quyền chỉ tay vào một người chơi bất kỳ để kiểm tra thân phận. Quản trò sẽ ra dấu ngầm (gật đầu/giơ ngón tay cái nếu là Ma Sói, lắc đầu nếu là Dân làng hoặc phe khác).",
    "gmCall": "Quản trò hô: 'Tiên Tri thức dậy. Hãy chọn một người để soi.' -> Tiên tri chỉ tay -> Quản trò ra dấu hiệu -> 'Tiên Tri nhắm mắt lại.'",
    "notes": [
      "Nhiệm vụ của Tiên Tri là dẫn dắt dân làng bỏ phiếu đúng Sói nhưng phải ẩn mình khéo léo để không bị Sói phát hiện và cắn chết vào đêm tiếp theo.",
      "Sẽ bị chết nếu bị Ma Sói cắn trúng mà không được Bảo Vệ hoặc Phù Thủy cứu."
    ],
    "image": "/cards/huong-dan-choi-ma-soi4.jpg",
    "colors": {
      "bg": "#3b1c71",
      "border": "#7c3aed",
      "banner": "#6d28d9",
      "text": "#c4b5fd"
    }
  },
  {
    "id": "bao-ve",
    "name": "Bảo Vệ",
    "enName": "Bodyguard / Defender",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 3,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Mỗi đêm bảo vệ 1 người không bị Sói cắn chết (có thể tự bảo vệ mình, không chọn 1 người 2 đêm liên tiếp).",
    "fullDesc": "Mỗi đêm Quản trò sẽ gọi Bảo Vệ thức dậy. Nhiệm vụ của Bảo Vệ là lựa chọn 1 người để bảo vệ an toàn khỏi nanh vuốt của Ma Sói. Bảo Vệ có thể chọn tự bảo vệ chính mình. Người được Bảo Vệ lựa chọn nếu bị Ma Sói cắn trong đêm đó sẽ vẫn bình an vô sự vào sáng hôm sau.",
    "gmCall": "Quản trò hô: 'Bảo Vệ thức dậy. Hãy chọn một người bạn muốn bảo hộ đêm nay.' -> Bảo Vệ chỉ tay -> Quản trò ghi nhận -> 'Bảo Vệ nhắm mắt lại.'",
    "notes": [
      "Bảo Vệ KHÔNG được phép bảo vệ cùng một người chơi trong 2 đêm liên tiếp.",
      "Lưu ý quan trọng: Người được Bảo Vệ bảo vệ chỉ miễn nhiễm vết cắn của Ma Sói, vẫn có thể chết do bình thuốc độc của Phù Thủy hoặc bị Thợ Săn bắn."
    ],
    "image": "/cards/la-bai-bao-ve.jpg",
    "colors": {
      "bg": "#0f766e",
      "border": "#14b8a6",
      "banner": "#0d9488",
      "text": "#99f6e4"
    }
  },
  {
    "id": "tho-san",
    "name": "Thợ Săn",
    "enName": "Hunter",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 98,
    "wakeTime": "Khi chết",
    "shortDesc": "Khi bị loại (bị Sói cắn hoặc bị treo cổ), lập tức nổ súng bắn chết thêm 1 người chơi khác theo ý mình.",
    "fullDesc": "Thợ Săn là một vị trí có sức mạnh răn đe cực lớn của phe Dân Làng. Khi Thợ Săn bị chết (dù là bị Ma Sói cắn chết trong đêm, bị treo cổ ban ngày, hay bị Phù Thủy đầu độc), trước khi rời cuộc chơi Thợ Săn có quyền nổ một phát súng chỉ định 1 người chơi bất kỳ cùng chết theo mình.",
    "gmCall": "Khi công bố Thợ Săn chết: 'Thợ Săn đã chết. Thợ Săn có quyền nổ một phát súng kéo theo một người.' -> Thợ Săn chỉ định nạn nhân.",
    "notes": [
      "Người bị Thợ Săn bắn sẽ chết ngay lập tức và không thể được cứu.",
      "Nếu Thợ Săn bị chết vì tình yêu (người yêu trong cặp đôi Cupid chết), Thợ Săn vẫn được bắn phát súng cuối cùng."
    ],
    "image": "/cards/la-bai-tho-san.jpg",
    "colors": {
      "bg": "#78350f",
      "border": "#f59e0b",
      "banner": "#d97706",
      "text": "#fde68a"
    }
  },
  {
    "id": "phu-thuy",
    "name": "Phù Thủy",
    "enName": "Witch",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 6,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Sở hữu 2 bình thuốc: 1 bình cứu sống người bị Sói cắn, 1 bình độc giết chết 1 người. Mỗi bình chỉ dùng 1 lần cả ván.",
    "fullDesc": "Phù Thủy sở hữu hai bình thần dược ma thuật cực mạnh: một bình Cứu người (màu trắng/hồi sinh) và một bình Giết người (màu đen/thuốc độc). Mỗi đêm sau khi Sói hành động xong, Quản trò gọi Phù Thủy dậy và ra dấu cho biết ai vừa bị Sói cắn. Phù Thủy có quyền dùng bình cứu để giữ mạng cho người đó, hoặc dùng bình độc để tiêu diệt một người mình nghi ngờ, hoặc không dùng gì cả.",
    "gmCall": "Quản trò hô: 'Phù Thủy thức dậy. Đêm nay người này bị Sói cắn (Quản trò chỉ vào nạn nhân). Bạn có muốn dùng bình cứu không? (Phù Thủy ra hiệu Có/Không). Bạn có muốn dùng bình độc không? (Nếu có thì chỉ tay vào người muốn đầu độc).' -> 'Phù Thủy nhắm mắt lại.'",
    "notes": [
      "Mỗi bình thuốc chỉ được sử dụng đúng 1 lần trong toàn bộ ván chơi. Phù Thủy có thể dùng cả 2 bình trong cùng một đêm.",
      "Nếu đêm đó Bảo Vệ đã bảo vệ đúng nạn nhân của Sói, Quản trò sẽ ra dấu lắc tay báo không có ai bị thương/chết.",
      "Dù đã dùng hết 2 bình thuốc, mỗi đêm Phù Thủy vẫn được gọi dậy để biết nạn nhân của Sói nhưng không thể can thiệp."
    ],
    "image": "/cards/la-bai-phu-thuy.jpg",
    "colors": {
      "bg": "#581c87",
      "border": "#c084fc",
      "banner": "#a855f7",
      "text": "#f3e8ff"
    }
  },
  {
    "id": "cupid",
    "name": "Cupid (Thần Tình Yêu)",
    "enName": "Cupid",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Phe Dân Làng (Có thể tạo Phe Thứ 3)",
    "teamCode": "V",
    "wakeOrder": 1,
    "wakeTime": "Chỉ đêm đầu tiên",
    "shortDesc": "Đêm đầu tiên ghép đôi 2 người bất kỳ yêu nhau. Nếu 1 người chết, người kia chết theo. Khác phe sẽ thành Phe Thứ 3.",
    "fullDesc": "Đầu ván (chỉ trong đêm đầu tiên), Cupid thức dậy và bắn 2 mũi tên tình yêu ghép đôi hai người chơi bất kỳ. Cupid có thể tự ghép đôi cho bản thân với người khác. Sau khi Cupid nhắm mắt, Quản trò cho hai người được ghép đôi thức dậy nhìn mặt nhau.",
    "gmCall": "Quản trò hô: 'Cupid thức dậy. Hãy chọn hai người yêu nhau.' -> Cupid chọn 2 người -> 'Cupid nhắm mắt lại.' -> 'Hai người yêu nhau thức dậy nhận diện nhau.' -> 'Hai người yêu nhau nhắm mắt lại.'",
    "notes": [
      "Nếu một trong hai người yêu nhau chết (dù bằng bất cứ nguyên nhân gì), người còn lại đau buồn chết theo ngay lập tức.",
      "Nếu 2 người yêu nhau cùng phe (Dân + Dân hoặc Sói + Sói), họ giữ nguyên điều kiện thắng của phe mình.",
      "ĐẶC BIỆT: Nếu 1 Sói yêu 1 Dân, cả hai trở thành PHE THỨ 3 độc lập. Mục tiêu thắng duy nhất của họ là tiêu diệt toàn bộ người chơi khác để trở thành 2 người sống sót cuối cùng!"
    ],
    "image": "/cards/la-bai-than-tinh-yeu.jpg",
    "colors": {
      "bg": "#831843",
      "border": "#f43f5e",
      "banner": "#e11d48",
      "text": "#fecdd3"
    }
  },
  {
    "id": "canh-sat-truong",
    "name": "Cảnh Sát Trưởng / Trưởng Làng",
    "enName": "Sheriff / Mayor",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Tất Cả Phe (Chức vị phong thêm)",
    "teamCode": "V",
    "isPlayableDeckCard": false,
    "isAppointedTitle": true,
    "wakeOrder": 97,
    "wakeTime": "Bầu chọn ban ngày",
    "shortDesc": "Chức vị do làng bầu chọn vào ban ngày. Phiếu bầu treo cổ của Cảnh Sát Trưởng tính bằng 2 phiếu. Khi chết được di chúc lại.",
    "fullDesc": "Đây là danh hiệu bổ sung được trao cho một người chơi thông qua cuộc bỏ phiếu công khai của cả làng vào ngày đầu tiên. Phiếu biểu quyết của Cảnh Sát Trưởng có trọng số gấp đôi (tính bằng 2 phiếu). Khi có tình huống biểu quyết hòa phiếu, quyền quyết định tối hậu thuộc về Cảnh Sát Trưởng.",
    "gmCall": "Ban ngày sau khi thảo luận xong: 'Cả làng tiến hành bầu Cảnh Sát Trưởng.' Khi Cảnh Sát Trưởng chết: 'Cảnh Sát Trưởng hãy chỉ định người kế nhiệm huy hiệu.'",
    "notes": [
      "Bất kỳ ai (dù là Dân, Sói hay Phe thứ 3) đều có thể được bầu làm Cảnh Sát Trưởng.",
      "Khi Cảnh Sát Trưởng bị loại khỏi cuộc chơi, người đó có toàn quyền di chúc chuyển lại huy hiệu cho bất kỳ ai còn sống."
    ],
    "image": "/cards/Truong_lang.PNG",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "co-be",
    "name": "Cô Bé",
    "enName": "Little Girl",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 5,
    "wakeTime": "Trong lúc Sói thức",
    "shortDesc": "Có quyền hé mắt lén nhìn khi bầy Sói thức dậy để tìm ra Sói. Nếu bị Sói bắt gặp sẽ chết ngay.",
    "fullDesc": "Cô Bé là một quân bài tình báo cực kỳ quan trọng của Dân Làng. Từ đêm thứ hai trở đi, khi Quản trò gọi bầy Ma Sói thức dậy săn mồi, Cô Bé có quyền hí mắt (hé mở mắt nhìn trộm) để nhận diện danh tính của những con Sói.",
    "gmCall": "Quản trò gọi Ma Sói dậy săn mồi, đồng thời quan sát bí mật xem Cô Bé có bị lộ không.",
    "notes": [
      "Cô Bé phải hết sức khéo léo và thận trọng. Nếu bất kỳ con Sói nào phát hiện Cô Bé đang nhìn trộm, Sói có thể ra hiệu cho Quản trò để giết chết Cô Bé ngay trong đêm thay vì nạn nhân bình thường.",
      "Cô Bé không được phép giả vờ làm Sói để giơ tay chỉ người."
    ],
    "image": "/cards/la-bai-ban-soi.jpg",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "soi-thuong",
    "name": "Sói Thường (Ma Sói)",
    "enName": "Werewolf",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Phe Sói",
    "teamCode": "W",
    "wakeOrder": 5,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Mỗi đêm cùng bầy Sói thức dậy, thống nhất chọn cắn chết 1 người dân. Ban ngày giả dạng dân làng để trà trộn.",
    "fullDesc": "Các con Ma Sói tạo thành một bầy đoàn kết. Mỗi đêm khi Quản trò gọi, toàn bộ bầy Sói mở mắt, nhìn nhận đồng bọn và dùng ám hiệu im lặng để thống nhất chọn ra 1 nạn nhân xấu số để cắn chết. Sáng hôm sau người này sẽ bị loại khỏi cuộc chơi.",
    "gmCall": "Quản trò hô: 'Ma Sói thức dậy. Hãy nhận diện đồng bọn và chọn con mồi đêm nay.' -> Bầy Sói chỉ tay thống nhất nạn nhân -> Quản trò ghi nhận -> 'Ma Sói nhắm mắt lại.'",
    "notes": [
      "Sói có thể chọn không cắn ai trong đêm nếu muốn tạo kế nghi binh.",
      "Sói cũng có thể tự cắn đồng bọn của mình để đánh lừa Tiên Tri và dân làng.",
      "Điều kiện thắng: Khi số lượng Sói bằng hoặc lớn hơn số lượng Dân làng còn sống."
    ],
    "image": "/cards/la-bai-ma-soi.jpg",
    "colors": {
      "bg": "#7f1d1d",
      "border": "#ef4444",
      "banner": "#dc2626",
      "text": "#fca5a5"
    }
  },
  {
    "id": "soi-con",
    "name": "Sói Con",
    "enName": "Wolf Pup",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Phe Sói",
    "teamCode": "W",
    "wakeOrder": 5,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Thức dậy chung với bầy Sói. Khi Sói Con bị chết, vào đêm tiếp theo bầy Sói phẫn nộ được cắn 2 người liên tục.",
    "fullDesc": "Sói Con là thành viên nhỏ tuổi nhất trong đàn Sói. Hằng đêm, Sói Con thức dậy cùng Sói Thường và tham gia biểu quyết cắn người. Điểm đặc biệt: Nếu Sói Con bị dân làng treo cổ hoặc bị giết chết, đêm hôm sau bầy Sói vì trả thù sẽ được Quản trò cho phép cắn chết 2 nạn nhân liên tiếp.",
    "gmCall": "Thức dậy chung với Sói Thường. Nếu Sói Con chết đêm trước, đêm nay Quản trò cho bầy Sói chọn 2 nạn nhân.",
    "notes": [
      "Là nhân vật mang tính báo thù cực cao của phe Sói.",
      "Dân làng cần cân nhắc khi phát hiện ra tung tích của Sói Con để tránh hậu quả thảm sát vào đêm sau."
    ],
    "image": "/cards/la-bai-ma-soi.jpg",
    "colors": {
      "bg": "#7f1d1d",
      "border": "#ef4444",
      "banner": "#dc2626",
      "text": "#fca5a5"
    }
  },
  {
    "id": "nua-nguoi-nua-soi",
    "name": "Nửa Người Nửa Sói",
    "enName": "Wild-card / Cursed",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Biến Đổi (Phe Dân -> Phe Sói)",
    "teamCode": "?",
    "wakeOrder": 96,
    "wakeTime": "Bị cắn thì biến đổi",
    "shortDesc": "Ban đầu theo phe Dân Làng. Nếu bị Ma Sói cắn trúng sẽ không chết mà lập tức biến thành Ma Sói.",
    "fullDesc": "Nhân vật này mang trong mình dòng máu lai bí ẩn. Lúc bắt đầu trò chơi, người này hoàn toàn đứng về phía phe Dân Làng. Tuy nhiên, nếu bị bầy Ma Sói cắn trúng trong đêm, nạn nhân không bị chết mà vết cắn sẽ kích hoạt gen Sói biến người này thành Ma Sói đích thực từ đêm tiếp theo.",
    "gmCall": "Khi Sói cắn trúng Nửa Người Nửa Sói: Quản trò ghi nhận không ai chết sáng hôm đó. Đêm hôm sau gọi người này dậy chung với bầy Sói.",
    "notes": [
      "Trước khi bị cắn: Tiên Tri soi ra người này là Dân Làng.",
      "Sau khi bị cắn: Người này chính thức thành Sói và Tiên Tri soi sẽ ra Sói."
    ],
    "image": "/cards/nua_nguoi_nua_soi.jpg",
    "colors": {
      "bg": "#1f2937",
      "border": "#6b7280",
      "banner": "#4b5563",
      "text": "#d1d5db"
    }
  },
  {
    "id": "soi-trang",
    "name": "Sói Trắng",
    "enName": "White Werewolf",
    "expansion": "Ma Sói Cơ Bản & The Village",
    "team": "Phe Thứ 3 (Độc Lập)",
    "teamCode": "3",
    "wakeOrder": 5.5,
    "wakeTime": "Cứ 2 đêm 1 lần",
    "shortDesc": "Thức dậy chung với Sói thường. Cứ 2 đêm 1 lần, thức dậy riêng để giết chết 1 con Sói khác. Thắng khi là người duy nhất sống sót.",
    "fullDesc": "Sói Trắng là kẻ cô độc đầy dã tâm. Bình thường, Sói Trắng thức dậy chung với bầy Sói và vờ như một đồng minh đáng tin cậy. Tuy nhiên, cứ cách 2 đêm một lần, sau khi bầy Sói đã nhắm mắt, Quản trò sẽ gọi riêng Sói Trắng thức dậy và Sói Trắng có quyền giết chết 1 con Sói khác trong bầy.",
    "gmCall": "Sau lượt Sói thường (đêm chẵn 2, 4, 6...): 'Sói Trắng thức dậy. Bạn có muốn giết một con Sói khác đêm nay không?' -> Sói Trắng chỉ tay -> Quản trò ghi nhận -> 'Sói Trắng nhắm mắt lại.'",
    "notes": [
      "Mục tiêu tối hậu của Sói Trắng là tiêu diệt cả Dân Làng lẫn toàn bộ bầy Sói để trở thành kẻ duy nhất sống sót trong ngôi làng.",
      "Thuộc Phe Thứ Ba độc lập hoàn toàn."
    ],
    "image": "/cards/soi_trang.jpg",
    "colors": {
      "bg": "#581c87",
      "border": "#a855f7",
      "banner": "#9333ea",
      "text": "#d8b4fe"
    }
  },
  {
    "id": "an-trom",
    "name": "Ăn Trộm",
    "enName": "Thief",
    "expansion": "Ma Sói Cơ Bản",
    "team": "Tùy Chọn / Biến Đổi",
    "teamCode": "?",
    "wakeOrder": 0,
    "wakeTime": "Đêm đầu tiên",
    "shortDesc": "Đêm đầu tiên thức dậy xem 2 lá bài thừa ngoài bàn cờ và chọn 1 lá để nhận chức năng đó. Nếu có Sói bắt buộc phải chọn Sói.",
    "fullDesc": "Khi đưa Ăn Trộm vào bàn chơi, Quản trò sẽ thêm vào 2 lá bài chức năng thừa rồi xáo đều và chia cho mọi người (dư ra 2 lá úp ở giữa bàn). Trong đêm đầu tiên, Ăn Trộm được gọi dậy xem 2 lá bài này và được chọn 1 lá làm vai trò mới của mình cho đến hết ván.",
    "gmCall": "Quản trò hô: 'Kẻ Ăn Trộm thức dậy. Hãy xem 2 lá bài ở trung tâm và chọn 1 vai trò.' -> Ăn Trộm đổi bài -> 'Ăn Trộm nhắm mắt lại.'",
    "notes": [
      "Quy tắc bắt buộc: Nếu trong 2 lá bài úp có ít nhất một lá Ma Sói, Ăn Trộm BẮT BUỘC phải chọn lá Ma Sói đó.",
      "Nếu Ăn Trộm không đổi vai, người đó tiếp tục chơi như một Dân làng bình thường."
    ],
    "image": "/cards/an_trom.PNG",
    "colors": {
      "bg": "#1f2937",
      "border": "#6b7280",
      "banner": "#4b5563",
      "text": "#d1d5db"
    }
  },
  {
    "id": "thang-ngoc",
    "name": "Thằng Ngố",
    "enName": "Fool",
    "expansion": "Ma Sói New Moon",
    "team": "Phe Thứ Ba",
    "teamCode": "3",
    "wakeOrder": 95,
    "wakeTime": "Khi bị biểu quyết treo cổ",
    "shortDesc": "Mục tiêu là làm sao để bị dân làng treo cổ vào ban ngày. Nếu bị treo cổ, Thằng Ngố lập tức chiến thắng một mình!",
    "fullDesc": "Thằng Ngố là một nhân vật đặc biệt thuộc Phe Thứ Ba. Mục tiêu tối thượng của Thằng Ngố là hành xử kỳ lạ hoặc khiêu khích để lừa toàn bộ dân làng dồn phiếu treo cổ mình vào ban ngày. Nếu bị dân làng treo cổ, trò chơi lập tức kết thúc và Thằng Ngố một mình giành chiến thắng vinh quang!",
    "gmCall": "Khi Thằng Ngố bị treo cổ: 'Người bị treo cổ là Thằng Ngố! Trò chơi kết thúc, Thằng Ngố một mình giành chiến thắng!'",
    "notes": [
      "Nếu Thằng Ngố bị dân làng biểu quyết treo cổ vào ban ngày, ván đấu kết thúc ngay lập tức với chiến thắng thuộc về Thằng Ngố.",
      "Nếu Thằng Ngố bị Ma Sói cắn trong đêm hoặc bị Phù Thủy đầu độc, Thằng Ngố chết bình thường và không được chiến thắng."
    ],
    "image": "/cards/Nhan_vat_Ma_soi__Thang_ngoc.jpg",
    "colors": {
      "bg": "#3b0764",
      "border": "#a855f7",
      "banner": "#9333ea",
      "text": "#e9d5ff"
    }
  },
  {
    "id": "gia-lang",
    "name": "Già Làng",
    "enName": "Elder",
    "expansion": "Ma Sói New Moon",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 94,
    "wakeTime": "Thụ động khi bị cắn",
    "shortDesc": "Có 2 mạng trước nanh vuốt Sói (phải bị cắn 2 lần mới chết). Nhưng nếu chết vì dân làng, toàn bộ phe Dân mất hết kỹ năng.",
    "fullDesc": "Già Làng là người có uy tín và sức sống dẻo dai nhất phe Dân Làng. Khi bị Ma Sói cắn lần đầu tiên, Già Làng không chết (mất 1 mạng). Phải bị Sói cắn lần thứ 2 thì Già Làng mới chết thật. Tuy nhiên, dân làng phải hết sức bảo bọc người này.",
    "gmCall": "Khi Già Làng bị cắn lần đầu: Quản trò thông báo sáng hôm sau không ai chết. Khi Già Làng chết bởi dân làng: Quản trò thông báo toàn bộ dân làng có chức năng bị phong ấn năng lực.",
    "notes": [
      "Nếu Già Làng bị dân làng treo cổ, bị Thợ Săn bắn chết hoặc bị Phù Thủy dùng bình độc giết, Già Làng chết ngay lập tức.",
      "HẬU QUẢ NGHIÊM TRỌNG: Nếu Già Làng chết bởi tay phe Dân, toàn bộ các vai trò có chức năng đặc biệt của phe Dân (trừ Thợ Săn) sẽ VĨNH VIỄN MẤT HẾT PHÉP THUẬT, trở thành dân thường!"
    ],
    "image": "/cards/la-bai-gia-lang.jpg",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "nguoi-the-than",
    "name": "Người Thế Thân (Kẻ Thế Thân)",
    "enName": "Scapegoat",
    "expansion": "Ma Sói New Moon",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 93,
    "wakeTime": "Khi bỏ phiếu hòa",
    "shortDesc": "Nếu kết quả bỏ phiếu treo cổ của làng bị hòa, Người Thế Thân lập tức bị xử tử thay thế. Khi chết có quyền chỉ định ai được vote ngày mai.",
    "fullDesc": "Người Thế Thân luôn gánh chịu số phận nghiệt ngã. Khi dân làng bỏ phiếu treo cổ mà số phiếu giữa các ứng viên cao nhất bị ngang bằng (hòa phiếu), thay vì không ai chết hay bỏ phiếu lại, Người Thế Thân sẽ lập tức bị đem lên giàn treo thay thế cho tất cả.",
    "gmCall": "Khi hòa phiếu treo cổ: 'Kết quả bỏ phiếu hòa. Người Thế Thân bị đưa lên giàn treo!' -> 'Trước khi chết, Người Thế Thân hãy chỉ định những người được phép bỏ phiếu vào ngày mai.'",
    "notes": [
      "Người Thế Thân phải luôn vận động lập luận để các cuộc biểu quyết không bao giờ rơi vào trạng thái hòa phiếu.",
      "Quyền năng di ngôn: Khi bị xử tử, người này được quyền chỉ định đích danh những người chơi nào ĐƯỢC hoặc KHÔNG ĐƯỢC biểu quyết vào ngày hôm sau."
    ],
    "image": "/cards/Nhan_vat_Ma_soi_Scapegoat.jpg",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "nguoi-thoi-sao",
    "name": "Người Thổi Sáo",
    "enName": "Pied Piper",
    "expansion": "Ma Sói New Moon",
    "team": "Phe Thứ 3 (Độc Lập)",
    "teamCode": "3",
    "wakeOrder": 7,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Mỗi đêm thôi miên 2 người. Những người bị thôi miên nhận diện nhau. Thắng khi toàn bộ người còn sống đều bị thôi miên.",
    "fullDesc": "Người Thổi Sáo là kẻ mang giai điệu mê hoặc bí ẩn. Mỗi đêm, Quản trò gọi Người Thổi Sáo dậy để chọn ra 2 người chơi để thôi miên. Sau đó, Quản trò cho Người Thổi Sáo nhắm mắt lại và gọi toàn bộ những người đã bị thôi miên từ trước đến nay thức dậy nhận diện nhau mà không biết ai là người đã thôi miên họ.",
    "gmCall": "Quản trò hô: 'Người Thổi Sáo thức dậy. Hãy chọn 2 người để thôi miên đêm nay.' -> Chọn 2 người -> 'Người Thổi Sáo nhắm mắt.' -> 'Tất cả người đã bị thôi miên thức dậy nhận diện nhau.' -> 'Nhắm mắt lại.'",
    "notes": [
      "Người Thổi Sáo KHÔNG thể tự thôi miên chính mình.",
      "Điều kiện thắng duy nhất: Người Thổi Sáo chiến thắng ngay lập tức khi TẤT CẢ người chơi còn sống sót đều đã rơi vào trạng thái bị thôi miên!"
    ],
    "image": "/cards/thoisao.jpg",
    "colors": {
      "bg": "#581c87",
      "border": "#a855f7",
      "banner": "#9333ea",
      "text": "#d8b4fe"
    }
  },
  {
    "id": "ke-dot-nha",
    "name": "Kẻ Đốt Nhà (Hỏa Hoạn)",
    "enName": "Pyromaniac",
    "expansion": "Ma Sói The Village",
    "team": "Phe Sói / Phá Hoại",
    "teamCode": "W",
    "wakeOrder": 8,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Chọn phóng hỏa đốt 1 ngôi nhà. Nếu nhà đó là nơi Sói cắn nạn nhân, con Sói đầu tiên bên phải nhà đó sẽ bị thiêu chết.",
    "fullDesc": "Kẻ Đốt Nhà sở hữu các thẻ đánh dấu Hỏa hoạn trong bộ The Village. Mỗi đêm, Kẻ Đốt Nhà có thể lựa chọn một ngôi nhà của người chơi để tẩm dầu phóng hỏa. Người mất nhà sẽ trở thành kẻ vô gia cư. Nếu kẻ đốt nhà phóng hỏa đúng vào ngôi nhà mà bầy Sói đang chọn cắn nạn nhân, ngọn lửa bùng lên sẽ thiêu chết con Sói gần nhất bên phải ngôi nhà đó.",
    "gmCall": "Quản trò hô: 'Kẻ Đốt Nhà thức dậy. Hãy chọn một ngôi nhà để phóng hỏa.' -> Kẻ Đốt Nhà chỉ định ngôi nhà -> Quản trò đặt thẻ Hỏa hoạn.",
    "notes": [
      "Thẻ Hỏa hoạn là dấu hiệu vật lý đặc trưng của bản The Village.",
      "Có thể gây sát thương phản đòn bất ngờ lên phe Ma Sói."
    ],
    "image": "/cards/ma_soi_the_village___hoa_hoan_ke_dot_nha.jpeg",
    "colors": {
      "bg": "#7f1d1d",
      "border": "#ef4444",
      "banner": "#dc2626",
      "text": "#fca5a5"
    }
  },
  {
    "id": "con-qua",
    "name": "Con Quạ (The Village)",
    "enName": "Raven",
    "expansion": "Ma Sói The Village",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 9,
    "wakeTime": "Cuối mỗi đêm",
    "shortDesc": "Mỗi đêm đặt thẻ 'Chỉ định' trước cửa 1 người chơi. Sáng hôm sau người bị chỉ định mặc định nhận thêm 2 phiếu vote treo cổ.",
    "fullDesc": "Vào cuối mỗi đêm, Con Quạ thức dậy và bí mật chỉ điểm 1 người chơi mà mình nghi ngờ nhất. Quản trò sẽ gài thẻ 'Chỉ định' hoặc lông quạ trước cửa nhà người đó. Vào buổi sáng ngày hôm sau, người bị chỉ định sẽ tự động nhận thêm 2 phiếu biểu quyết treo cổ trước khi cả làng bắt đầu bỏ phiếu.",
    "gmCall": "Quản trò hô: 'Con Quạ thức dậy. Hãy chọn người nhận dấu ấn chỉ định đêm nay.' -> Quản trò đặt thẻ Chỉ định trước mặt người bị chọn.",
    "notes": [
      "Rất có lợi để dồn phiếu diệt Sói khi phe Dân làng cần định hướng dư luận.",
      "Cần tránh để Sói biết Con Quạ là ai."
    ],
    "image": "/cards/ma_soi_the_village___con_qua.PNG",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "dan-thuong",
    "name": "Dân Thường (Characters)",
    "enName": "Simple Villager Variant",
    "expansion": "Ma Sói Characters",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 99,
    "wakeTime": "Không thức dậy",
    "shortDesc": "Lá bài Dân làng phiên bản tạo hình nghệ thuật của bộ Characters.",
    "fullDesc": "Dân thường trung kiên của ngôi làng. Ban đêm đi ngủ ngoan ngoãn, ban ngày thức dậy cùng mọi người truy tìm tung tích bầy Sói gian ác.",
    "gmCall": "Không gọi thức dậy vào ban đêm.",
    "notes": [
      "Tham gia thảo luận và vote bình thường."
    ],
    "image": "/cards/Nhan_vat_Ma_soi__Dan_lang.PNG",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "hai-chi-em",
    "name": "Hai Chị Em",
    "enName": "Two Sisters",
    "expansion": "Ma Sói Characters",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 2,
    "wakeTime": "Mỗi đêm (hoặc đêm đầu)",
    "shortDesc": "Hai người chơi giữ thẻ Hai Chị Em thức dậy nhận diện nhau vào ban đêm, cùng phối hợp biểu quyết vào ban ngày.",
    "fullDesc": "Gồm 2 lá bài dành cho 2 người chơi. Trong đêm đầu tiên (hoặc mỗi đêm tùy luật làng), Quản trò cho Hai Chị Em thức dậy nhìn mặt nhau. Họ biết chắc chắn người kia là Dân Làng đồng minh đáng tin cậy 100% để cùng nhau liên minh tranh luận và dồn phiếu.",
    "gmCall": "Quản trò hô: 'Hai Chị Em thức dậy nhận diện nhau.' -> Nhìn mặt nhau -> 'Hai Chị Em nhắm mắt lại.'",
    "notes": [
      "Tạo thành một cặp đồng minh vững chắc không sợ bị phản bội."
    ],
    "image": "/cards/Nhan_vat_Ma_soi__Hai_chi_em.PNG",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "ba-anh-em",
    "name": "Ba Anh Em",
    "enName": "Three Brothers",
    "expansion": "Ma Sói Characters",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 2.1,
    "wakeTime": "Đêm đầu tiên",
    "shortDesc": "Ba người chơi giữ lá Ba Anh Em thức dậy nhận diện nhau vào ban đêm, tạo thành liên minh 3 phiếu tin cậy tuyệt đối.",
    "fullDesc": "Tương tự như Hai Chị Em nhưng gồm 3 lá bài. Ba anh em thức dậy cùng nhau vào đêm đầu tiên để biết mặt nhau. Với 3 phiếu biểu quyết đoàn kết từ phe Dân, họ có thể chi phối mạnh mẽ các lượt treo cổ ban ngày.",
    "gmCall": "Quản trò hô: 'Ba Anh Em thức dậy nhìn mặt nhau.' -> Nhận diện -> 'Ba Anh Em nhắm mắt lại.'",
    "notes": [
      "Tạo ưu thế số đông cho phe Dân Làng ở giai đoạn đầu game."
    ],
    "image": "/cards/Nhan_vat_Ma_soi___Ba_anh_em.PNG",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "thien-su",
    "name": "Thiên Sứ",
    "enName": "Angel",
    "expansion": "Ma Sói Characters",
    "team": "Phe Thứ 3 (Độc Lập)",
    "teamCode": "3",
    "wakeOrder": 92,
    "wakeTime": "Ngày đầu tiên",
    "shortDesc": "Mục tiêu là tự làm cho bản thân bị dân làng treo cổ ngay trong ngày biểu quyết đầu tiên. Nếu làm được, thắng game ngay!",
    "fullDesc": "Thiên Sứ là một nhân vật độc đáo có điều kiện thắng thần tốc. Mục tiêu của Thiên Sứ là dụ dỗ, khiêu khích hoặc diễn xuất sao cho làng biểu quyết treo cổ chính mình ngay trong ngày đầu tiên của ván chơi.",
    "gmCall": "Nếu Thiên Sứ bị treo cổ trong ngày 1: Quản trò tuyên bố Thiên Sứ chiến thắng solo ván đấu!",
    "notes": [
      "Nếu bị treo cổ ngày đầu tiên: THIÊN SỨ THẮNG TRÒ CHƠI NGAY LẬP TỨC.",
      "Nếu ngày đầu tiên không bị treo cổ, Thiên Sứ mất hết điều kiện thắng đặc biệt và trở thành một Dân thường bình thường."
    ],
    "image": "/cards/Nhan_vat_Ma_soi__Thien_su.PNG",
    "colors": {
      "bg": "#581c87",
      "border": "#a855f7",
      "banner": "#9333ea",
      "text": "#d8b4fe"
    }
  },
  {
    "id": "tham-phan-lap-bap",
    "name": "Thẩm Phán Lắp Bắp",
    "enName": "Stuttering Judge",
    "expansion": "Ma Sói Characters",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 91,
    "wakeTime": "Đêm 1 ra ám hiệu",
    "shortDesc": "Trong đêm đầu tiên thống nhất 1 ám hiệu với Quản trò. Ban ngày được kích hoạt ám hiệu 1 lần để mở cuộc vote treo cổ thứ 2.",
    "fullDesc": "Đêm đầu tiên, Thẩm Phán Lắp Bắp thức dậy và làm một ký hiệu bí mật với Quản trò (ví dụ: gãi tai, chớp mắt hai lần, vỗ tay...). Một lần duy nhất trong toàn bộ ván đấu, ngay sau khi một người vừa bị biểu quyết treo cổ xong, Thẩm Phán có thể làm lại dấu hiệu này để Quản trò lập tức tuyên bố mở cuộc thảo luận và biểu quyết treo cổ NGƯỜI THỨ HAI trong cùng ngày.",
    "gmCall": "Đêm 1: 'Thẩm Phán Lắp Bắp thức dậy và làm dấu bí mật với Quản trò.' Ban ngày khi thấy dấu: 'Thẩm phán đã ra phán quyết! Làng tiếp tục tiến hành vòng vote thứ hai!'",
    "notes": [
      "Rất lợi hại khi làng đang nắm chắc tung tích của nhiều con Sói cùng lúc."
    ],
    "image": "/cards/Nhan_vat_Ma_soi___Tham_phan_lap_bap.PNG",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "hiep-si-kiem-gi",
    "name": "Hiệp Sĩ Kiếm Gỉ",
    "enName": "Knight with the Rusty Sword",
    "expansion": "Ma Sói Characters",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 90,
    "wakeTime": "Thụ động khi bị Sói cắn",
    "shortDesc": "Nếu bị Sói cắn chết, thanh kiếm rỉ sét sẽ làm nhiễm trùng con Sói cắn mình. Con Sói đó sẽ chết vào sáng ngày hôm sau nữa.",
    "fullDesc": "Hiệp sĩ mang thanh kiếm rỉ sét độc hại. Khi bị Ma Sói tấn công và cắn chết trong đêm, lưỡi kiếm rỉ sét sẽ đâm bị thương con Sói đầu tiên bên tay trái nạn nhân (hoặc con Sói cắn). Con Sói bị thương này chỉ sống thêm được đúng 1 ngày 1 đêm rồi sẽ chết gục vì uốn ván/nhiễm độc.",
    "gmCall": "Khi Hiệp Sĩ chết bởi Sói: Quản trò bí mật ghi nhận con Sói bên trái bị trúng độc và công bố con Sói đó chết vào sáng ngày hôm sau nữa.",
    "notes": [
      "Giúp đổi mạng 1 lấy 1 với phe Sói mà không cần dùng súng như Thợ Săn."
    ],
    "image": "/cards/Nhan_vat_Ma_soi___Hiep_si_Kiem_gi.PNG",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "cao",
    "name": "Cáo",
    "enName": "Fox",
    "expansion": "Ma Sói Characters",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 4.1,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Mỗi đêm chọn nhóm 3 người chơi ngồi liền kề. Nếu có ít nhất 1 Sói thì Quản trò gật đầu và Cáo giữ năng lực. Nếu không có Sói, Cáo mất phép vĩnh viễn.",
    "fullDesc": "Hằng đêm, Cáo thức dậy và chỉ vào một người chơi (người này cùng với 2 người ngồi sát 2 bên tạo thành nhóm 3 người). Quản trò kiểm tra xem trong nhóm 3 người đó có ít nhất một con Sói hay không. Nếu CÓ SÓI, Quản trò gật đầu, Cáo biết có sói lẩn khuất trong nhóm và GIỮ NGUYÊN NĂNG LỰC cho các đêm sau. Nếu HOÀN TOÀN KHÔNG CÓ SÓI, Quản trò lắc đầu và Cáo MẤT HOÀN TOÀN PHÉP THUẬT từ đêm đó.",
    "gmCall": "Quản trò hô: 'Cáo thức dậy. Hãy chọn một mục tiêu kiểm tra.' -> Cáo chỉ 1 người (tính cả 2 người kế bên) -> Quản trò ra dấu Có/Không Sói -> 'Cáo nhắm mắt lại.'",
    "notes": [
      "Là trinh sát diện rộng cực kỳ đắc lực cho phe Dân Làng."
    ],
    "image": "/cards/Nhan_vat_Ma_soi___Cao.PNG",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "nguoi-thuan-phuc-gau",
    "name": "Người Thuần Phục Gấu",
    "enName": "Bear Tamer",
    "expansion": "Ma Sói Characters",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 89,
    "wakeTime": "Đầu mỗi buổi sáng",
    "shortDesc": "Vào đầu buổi sáng, nếu 1 trong 2 người ngồi sát bên cạnh là Ma Sói, chú gấu sẽ gầm lên (Quản trò gầm 'Gừ...').",
    "fullDesc": "Người Thuần Phục Gấu có một chú gấu linh cảm rất nhạy với mùi của Ma Sói. Vào mỗi buổi sáng khi cả làng thức dậy, nếu một trong hai người chơi ngồi ngay cạnh bên trái hoặc bên phải của Người Thuần Phục Gấu là Ma Sói (hoặc nếu chính bản thân anh ta bị biến thành Sói), Quản trò sẽ phát ra tiếng gầm 'Gừ gừ!' để báo động.",
    "gmCall": "Mỗi sáng: Quản trò kiểm tra 2 người ngồi cạnh Bear Tamer. Nếu có Sói -> Quản trò phát ra âm thanh tiếng Gấu gầm gừ.",
    "notes": [
      "Nếu cả hai người bên cạnh đều là Dân lương thiện, Quản trò không gầm gì cả.",
      "Làng sẽ biết ngay có Sói ngồi gần Người Thuần Phục Gấu."
    ],
    "image": "/cards/Nhan_vat_Ma_soi__Nguoi_thuan_phuc_gau.PNG",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "dien-vien",
    "name": "Diễn Viên",
    "enName": "Actor",
    "expansion": "Ma Sói Characters",
    "team": "Tùy Chọn / Biến Đổi",
    "teamCode": "?",
    "wakeOrder": 0.5,
    "wakeTime": "Trong 3 đêm đầu",
    "shortDesc": "Để 3 lá bài thừa ngoài cuộc. Trong 3 đêm đầu, Diễn Viên có thể chọn tráo thẻ của mình lấy 1 trong 3 lá này. Sau đêm 3 thành Dân thường.",
    "fullDesc": "Khi có Diễn Viên trong ván, Quản trò để 3 lá bài nhân vật thừa nằm úp ở ngoài. Trong 3 đêm đầu tiên, mỗi đêm Diễn Viên có quyền thức dậy xem và chọn tráo đổi lá bài của mình lấy 1 trong 3 lá đó để nhận chức năng của lá mới. Sau đêm thứ 3, nếu không chọn, Diễn Viên sẽ chơi như Dân thường.",
    "gmCall": "Đêm 1, 2, 3: 'Diễn Viên thức dậy. Bạn có muốn đổi vai diễn mới không?' -> Diễn viên chọn hoặc bỏ qua -> 'Nhắm mắt lại.'",
    "notes": [
      "Tạo ra sự biến hóa khôn lường khó đoán trong chiến thuật."
    ],
    "image": "/cards/Nhan_vat_Ma_soi__Dien_vien.PNG",
    "colors": {
      "bg": "#1f2937",
      "border": "#6b7280",
      "banner": "#4b5563",
      "text": "#d1d5db"
    }
  },
  {
    "id": "nguoi-day-to-tan-tuy",
    "name": "Người Đầy Tớ Tận Tụy",
    "enName": "Devoted Servant",
    "expansion": "Ma Sói Characters",
    "team": "Biến Đổi / Thừa Kế",
    "teamCode": "V",
    "wakeOrder": 88,
    "wakeTime": "Khi có người bị treo cổ",
    "shortDesc": "Bất cứ lúc nào khi có 1 người bị làng biểu quyết treo cổ, Người Hầu có thể lật bài đổi thẻ lấy nhân vật của người vừa chết để tiếp tục chơi.",
    "fullDesc": "Người Đầy Tớ Tận Tụy là kẻ luôn trung thành tìm kiếm một vị chủ nhân mới. Bất cứ lúc nào trong ván chơi, ngay khi một người chơi vừa bị biểu quyết treo cổ, Người Đầy Tớ có thể công khai lật lá bài của mình lên và lấy lại lá bài của người vừa chết để đóng vai nhân vật đó cho đến hết ván.",
    "gmCall": "Khi nạn nhân bị treo cổ: Người Đầy Tớ tuyên bố đổi thẻ -> Quản trò thu thẻ Người Đầy Tớ và trao thẻ nạn nhân cho người này.",
    "notes": [
      "Nếu nạn nhân là Sói, Người Đầy Tớ lập tức trở thành Sói!",
      "Nếu nạn nhân là Tiên Tri/Bảo Vệ, Người Đầy Tớ kế thừa năng lực đó."
    ],
    "image": "/cards/Nhan_vat_Ma_soi___Nguoi_day_to_tan_tuy.jpg",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "thanh-vien-giao-phai",
    "name": "Thành Viên Giáo Phái",
    "enName": "Cult Leader",
    "expansion": "Ma Sói Characters",
    "team": "Phe Thứ 3 (Độc Lập)",
    "teamCode": "3",
    "wakeOrder": 87,
    "wakeTime": "Trước ván chia phe",
    "shortDesc": "Quản trò chia cả làng làm 2 phái (theo kính/không kính, nam/nữ...). Hắn thuộc 1 phe và thắng khi toàn bộ phe đối địch bị loại sạch.",
    "fullDesc": "Trước khi ván chơi bắt đầu, Quản trò chia cả làng thành 2 phe phái rõ ràng dựa trên một đặc điểm ngoại hình hiển nhiên (ví dụ: người có đeo kính vs người không đeo kính; nam vs nữ; áo sáng màu vs áo tối màu). Thành viên giáo phái thuộc 1 trong 2 nhóm đó. Hắn không có phép thuật thần bí nào ngoài tài dẫn dắt dư luận loại bỏ toàn bộ người của phe đối địch.",
    "gmCall": "Đầu ván: Quản trò công bố tiêu chí phân chia 2 giáo phái cho cả làng biết.",
    "notes": [
      "Điều kiện thắng: Khi tất cả thành viên của phe đối nghịch đều đã bị tiêu diệt."
    ],
    "image": "/cards/Nhan_vat_Ma_soi___Thanh_vien_giao_phai.jpg",
    "colors": {
      "bg": "#581c87",
      "border": "#a855f7",
      "banner": "#9333ea",
      "text": "#d8b4fe"
    }
  },
  {
    "id": "dua-tre-hoang-da",
    "name": "Đứa Trẻ Hoang Dã",
    "enName": "Wild Child",
    "expansion": "Ma Sói Characters",
    "team": "Biến Đổi (Phe Dân -> Phe Sói)",
    "teamCode": "?",
    "wakeOrder": 1.5,
    "wakeTime": "Đêm 1 chọn thần tượng",
    "shortDesc": "Đêm đầu tiên chọn 1 người chơi làm Thần Tượng. Nếu Thần Tượng chết trong ván chơi, Đứa Trẻ lập tức hóa thành Ma Sói.",
    "fullDesc": "Đứa Trẻ Hoang Dã ban đầu thuộc phe Dân Làng. Trong đêm đầu tiên, em thức dậy và chọn 1 người chơi làm 'Thần Tượng / Người giám hộ' của mình. Nếu trong quá trình chơi, người Thần Tượng này bị chết (vì bất kỳ lý do gì), Đứa Trẻ Hoang Dã sẽ phẫn nộ biến thành Ma Sói và từ đêm tiếp theo sẽ thức dậy cùng bầy Sói.",
    "gmCall": "Đêm 1: 'Đứa Trẻ Hoang Dã thức dậy. Hãy chọn Thần Tượng của bạn.' -> Quản trò ghi nhớ. Khi Thần tượng chết: Quản trò bí mật chạm vai Đứa Trẻ báo hiệu đã hóa Sói.",
    "notes": [
      "Chừng nào Thần Tượng còn sống, Đứa Trẻ vẫn là Dân Làng.",
      "Khi Thần Tượng chết, Đứa Trẻ chính thức trở thành Ma Sói và cùng phe Sói săn mồi."
    ],
    "image": "/cards/Nhan_vat_Ma_soi___Dua_tre_hoang_da.PNG",
    "colors": {
      "bg": "#1f2937",
      "border": "#6b7280",
      "banner": "#4b5563",
      "text": "#d1d5db"
    }
  },
  {
    "id": "cho-soi-soi-lai",
    "name": "Chó Sói / Bán Sói / Sói Lai",
    "enName": "Wolf Hound",
    "expansion": "Ma Sói Characters",
    "team": "Tự Chọn (Dân hoặc Sói)",
    "teamCode": "?",
    "wakeOrder": 0.8,
    "wakeTime": "Đêm đầu tiên",
    "shortDesc": "Vào đêm đầu tiên, được tự ý lựa chọn muốn trở thành Dân Làng lương thiện hay gia nhập phe Ma Sói tàn bạo.",
    "fullDesc": "Chó Sói đứng giữa lằn ranh của thú tính và nhân tính. Đêm đầu tiên, Quản trò gọi Chó Sói dậy và cho phép người chơi này đưa ra quyết định tối thượng: muốn sống cuộc đời một Dân làng lương thiện hay muốn thức tỉnh bản năng Ma Sói. Nếu chọn Sói, người đó sẽ thức dậy cùng bầy Sói ngay từ đêm đó.",
    "gmCall": "Đêm 1: 'Chó Sói thức dậy. Bạn chọn làm Dân hay Sói?' -> Người chơi ra dấu hiệu -> Quản trò ghi nhận.",
    "notes": [
      "Quyết định này là vĩnh viễn và không thể thay đổi trong suốt phần còn lại của ván đấu."
    ],
    "image": "/cards/Nhan_vat_Ma_soi___Cho_soi.jpg",
    "colors": {
      "bg": "#1f2937",
      "border": "#6b7280",
      "banner": "#4b5563",
      "text": "#d1d5db"
    }
  },
  {
    "id": "soi-lon-xau-xa",
    "name": "Sói Lớn Xấu Xa",
    "enName": "Big Bad Wolf",
    "expansion": "Ma Sói Characters",
    "team": "Phe Sói",
    "teamCode": "W",
    "wakeOrder": 5.1,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Thuộc phe Sói. Cho đến khi chưa có bất kỳ con Sói nào (kể cả Sói lai, Sói con) chết, Sói Lớn được thức dậy cắn thêm 1 người nữa mỗi đêm.",
    "fullDesc": "Sói Lớn Xấu Xa là bạo chúa của đàn Sói. Hằng đêm thức dậy cùng bầy Sói và cắn nạn nhân chung. ĐẶC BIỆT: Chừng nào chưa có bất kỳ thành viên nào thuộc họ Sói bị chết (Sói thường, Sói con, Đứa trẻ hoang dã hóa sói, Chó sói), sau khi bầy Sói ngủ, Sói Lớn được Quản trò gọi dậy RIÊNG MỘT LẦN NỮA để tự tay cắn chết thêm 1 dân làng khác!",
    "gmCall": "Sau lượt Sói chung: 'Sói Lớn Xấu Xa thức dậy độc lập. Hãy chọn nạn nhân thứ hai đêm nay.' -> Chỉ định nạn nhân -> 'Nhắm mắt lại.'",
    "notes": [
      "Giúp phe Sói có tốc độ tàn sát gấp đôi ở giai đoạn đầu game.",
      "Khi có ít nhất 1 con Sói phe mình ngã xuống, Sói Lớn mất năng lực cắn thêm này."
    ],
    "image": "/cards/Nhan_vat_Ma_soi___Soi_lon_xau_xa.PNG",
    "colors": {
      "bg": "#7f1d1d",
      "border": "#ef4444",
      "banner": "#dc2626",
      "text": "#fca5a5"
    }
  },
  {
    "id": "soi-quy",
    "aliases": ["nguoi-cha-cua-soi", "soi-nguyen", "cha-cho-soi"],
    "name": "Sói Quỷ (Sói Nguyền / Người Cha Của Sói)",
    "enName": "Cursed Wolf-Father",
    "expansion": "Ma Sói Characters",
    "team": "Phe Sói",
    "teamCode": "W",
    "wakeOrder": 5.2,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Thuộc phe Sói. 1 lần duy nhất trong ván: nguyền nạn nhân vừa bị Sói cắn biến thành Ma Sói (giữ nguyên kỹ năng cũ) thay vì chết.",
    "fullDesc": "Sói Quỷ (Cursed Wolf-Father / Người Cha Của Sói) là thủ lĩnh bóng tối cổ xưa của loài Sói. Thức dậy đi săn cùng bầy Sói mỗi đêm. Một lần duy nhất trong cả ván đấu, ngay sau khi bầy Sói đã cắn 1 người, Sói Quỷ có thể ra dấu nguyền để lây nhiễm biến nạn nhân đó thành một Ma Sói mới vào đêm sau, thay vì để nạn nhân phải chết vào sáng mai. Nạn nhân được giữ nguyên kỹ năng cũ và đổi phe sang chiến thắng cùng bầy Ma Sói.",
    "gmCall": "Khi Sói vừa chọn nạn nhân: 'Sói Quỷ có muốn dùng lời nguyền lây nhiễm nạn nhân này không?' -> Sói Quỷ gật hoặc lắc đầu.",
    "notes": [
      "1 lần duy nhất trong cả ván đấu.",
      "Nạn nhân được nguyền sẽ KHÔNG CHẾT vào sáng hôm sau, giữ kỹ năng cũ và thức dậy cùng bầy Sói từ đêm tiếp theo.",
      "Bảo Vệ không ngăn được lời nguyền của Sói Quỷ và bình cứu Phù Thủy không giải được lời nguyền."
    ],
    "image": "/cards/soi-quy.png",
    "colors": {
      "bg": "#7f1d1d",
      "border": "#ef4444",
      "banner": "#dc2626",
      "text": "#fca5a5"
    }
  },
  {
    "id": "soi-bi-nguyen",
    "name": "Sói Bị Nguyền",
    "enName": "Cursed Werewolf",
    "expansion": "Nhân Vật Đặc Biệt",
    "team": "Phe Sói",
    "teamCode": "W",
    "wakeOrder": 5,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Nạn nhân bị Sói Nguyền lây nhiễm thành Ma Sói. Thuộc phe Sói và chiến thắng cùng bầy Sói.",
    "fullDesc": "Người chơi bị Sói Nguyền (Sói Quỷ) biến đổi thành Ma Sói. Thức dậy và đi săn cùng bầy Sói từ đêm tiếp theo.",
    "gmCall": "Thức dậy chung cùng bầy Ma Sói.",
    "notes": [
      "Thuộc phe Sói vĩnh viễn cho đến hết ván đấu.",
      "Tiên Tri soi ra sẽ thấy biểu tượng Phe Sói.",
      "Kỹ năng của vai trò gốc bị phong ấn hoàn toàn."
    ],
    "image": "/cards/la-bai-ma-soi.jpg",
    "colors": {
      "bg": "#4a044e",
      "border": "#c026d3",
      "banner": "#a21caf",
      "text": "#f5d0fe"
    }
  },
  {
    "id": "ba-dong",
    "name": "Bà Đồng",
    "enName": "Village Soothsayer",
    "expansion": "Ma Sói Characters & New Moon",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 3.5,
    "wakeTime": "5 lần trong ván",
    "shortDesc": "Có tối đa 5 lần gọi hồn trong ván. Quản trò đọc 4 câu hỏi từ lá Gọi Hồn, Bà Đồng chọn 1 câu và chỉ 1 người trả lời vào sáng mai.",
    "fullDesc": "Đầu ván, Quản trò chọn ra 5 lá Gọi Hồn (Spiritualism card) và giữ bí mật. Trong tối đa 5 đêm của ván chơi, Quản trò gọi Bà Đồng dậy và hỏi mụ có muốn sử dụng linh năng không. Nếu có, Quản trò đọc nhỏ 4 câu hỏi từ 1 lá bài Gọi Hồn. Bà Đồng ra dấu chọn 1 câu hỏi và chỉ định 1 người chơi. Sáng hôm sau, người chơi được chỉ định phải trả lời thật lòng câu hỏi đó trước cả làng.",
    "gmCall": "Quản trò hô: 'Bà Đồng thức dậy. Bạn có muốn sử dụng linh cảm đêm nay không?' -> Bà đồng chọn câu hỏi và người trả lời -> 'Bà Đồng nhắm mắt lại.'",
    "notes": [
      "Thay thế sự kiện thường của làng bằng phiên giải đáp tâm linh bí ẩn.",
      "Tối đa chỉ dùng được 5 lần trong một ván chơi."
    ],
    "image": "/cards/nhan_vat_ma_soi.jpg",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "canh-sat-characters",
    "name": "Cảnh Sát",
    "enName": "Sheriff's Deputy / Policeman",
    "expansion": "Ma Sói Characters & New Moon",
    "team": "Chức vị phong thêm",
    "teamCode": "V",
    "isPlayableDeckCard": false,
    "isAppointedTitle": true,
    "wakeOrder": 86,
    "wakeTime": "Mỗi buổi sáng",
    "shortDesc": "Do Cảnh Sát Trưởng bổ nhiệm. Phụ trách bốc và đọc to các lá bài Sự Kiện của làng mỗi buổi sáng trước khi vote.",
    "fullDesc": "Cảnh Sát là chức vụ hỗ trợ đặc biệt được Cảnh Sát Trưởng phong thêm cho 1 người chơi ngoài lá nhân vật sẵn có (Cảnh Sát Trưởng không thể tự phong cho chính mình). Trước ván, Quản trò chuẩn bị một số lá Sự Kiện (Event cards). Mỗi sáng sau khi công bố người chết, Quản trò hỏi Cảnh Sát có thông báo gì không, Cảnh Sát sẽ chọn và đọc lớn một lá Sự Kiện làm luật áp dụng cho ngày hôm đó.",
    "gmCall": "Mỗi sáng: 'Mời Cảnh Sát đọc bản tin Sự Kiện hôm nay.' Cảnh Sát Trưởng có thể bãi chức Cảnh Sát bất cứ lúc nào trước giờ bỏ phiếu.",
    "notes": [
      "Khác với Cảnh Sát Trưởng (trưởng làng 2 phiếu vote), Cảnh Sát chuyên trách điều hành Sự Kiện.",
      "Cảnh Sát Trưởng có thể tước chức và chuyển cho người khác trước giờ biểu quyết."
    ],
    "image": "/cards/Canh_sat.jpg",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "nguyet-nu",
    "name": "Nguyệt Nữ",
    "enName": "Moon Maiden",
    "expansion": "Ma Sói Character Plus",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 0.2,
    "wakeTime": "Đầu mỗi đêm",
    "shortDesc": "Đầu mỗi đêm thức dậy chọn 1 người để phong ấn, người đó sẽ bị vô hiệu hóa toàn bộ kỹ năng trong suốt đêm đó.",
    "fullDesc": "Mỗi đêm, Nguyệt Nữ thức dậy đầu tiên dưới ánh trăng và chỉ định 1 người chơi. Người chơi bị chọn sẽ bị khóa phép thuật và vô hiệu hóa hoàn toàn năng lực trong suốt đêm đó (ví dụ: Tiên Tri bị chọn sẽ không soi được, Phù Thủy không dùng được bình thuốc...).",
    "gmCall": "Quản trò hô: 'Nguyệt Nữ thức dậy. Hãy chọn người bạn muốn phong ấn đêm nay.' -> Nguyệt Nữ chỉ tay -> Quản trò ghi nhận -> 'Nguyệt Nữ nhắm mắt lại.'",
    "notes": [
      "Ngoại lệ: Nguyệt Nữ KHÔNG vô hiệu hóa được chức năng của Bảo Vệ.",
      "Không ảnh hưởng đến các kỹ năng chỉ áp dụng vào ban ngày."
    ],
    "image": "/cards/Nguyet_nu.png",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "thay-thoi-mien",
    "name": "Thầy Thôi Miên",
    "enName": "Hypnotist",
    "expansion": "Ma Sói Character Plus",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 3.2,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Mỗi đêm mê hoặc 1 người. Nếu đêm đó Thầy Thôi Miên bị chết, người bị mê hoặc sẽ chết thay thế! Không chọn 1 người 2 đêm liền.",
    "fullDesc": "Hằng đêm, Thầy Thôi Miên tỉnh dậy và chọn 1 người chơi để giăng bùa mê hoặc. Tác dụng thế mạng: Nếu trong đêm đó Thầy Thôi Miên bị Sói cắn chết, phép thuật sẽ chuyển hướng đòn tấn công khiến người bị mê hoặc phải chết thay cho Thầy Thôi Miên!",
    "gmCall": "Quản trò hô: 'Thầy Thôi Miên thức dậy. Hãy chọn người bạn muốn mê hoặc đêm nay.' -> Thầy chỉ định mục tiêu -> 'Thầy Thôi Miên nhắm mắt lại.'",
    "notes": [
      "Thầy Thôi Miên KHÔNG được phép chọn liên tục cùng 1 người trong 2 đêm liên tiếp.",
      "Là lớp lá chắn sống cực kỳ an toàn để giữ mạng."
    ],
    "image": "/cards/Thay_thoi_mien.png",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "duoc-si",
    "name": "Dược Sĩ",
    "enName": "Apothecary / Pharmacist",
    "expansion": "Ma Sói Character Plus",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 6.5,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Có 2 bình dùng 1 lần: Bình Thuốc Mê (cấm 1 người nói và cấm vote trong ngày) và Bình Hồi Phục (cứu người bị Phù Thủy giết).",
    "fullDesc": "Dược Sĩ sở hữu 2 bình thuốc đặc chế độc nhất vô nhị: Bình Thuốc Mê và Bình Hồi Phục. Mỗi đêm Dược Sĩ thức dậy để quyết định có sử dụng bình nào không. Mỗi bình chỉ được sử dụng duy nhất một lần trong cả ván.",
    "gmCall": "Quản trò hô: 'Dược Sĩ thức dậy. Bạn có muốn dùng Bình Thuốc Mê (câm lặng + cấm vote) hay Bình Hồi Phục (cứu độc Phù Thủy) không?'",
    "notes": [
      "Bình Thuốc Mê: Làm cho 1 người chơi bị cấm nói chuyện và mất hoàn toàn quyền biểu quyết trong 1 ngày.",
      "Bình Hồi Phục: Nếu chọn đúng người bị Phù Thủy hạ độc giết chết trong đêm thì nạn nhân sẽ được giải độc và sống sót bình thường."
    ],
    "image": "/cards/duoc_si.png",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "nguoi-mua-roi",
    "name": "Người Múa Rối",
    "enName": "Puppeteer",
    "expansion": "Ma Sói Character Plus",
    "team": "Phe Dân / Phe Sói (Tùy bản)",
    "teamCode": "V",
    "wakeOrder": 4.9,
    "wakeTime": "1 lần trong ván",
    "shortDesc": "Một lần duy nhất trong cả ván chơi, có quyền ép bầy Sói phải ăn thịt 1 người do mình chỉ định (kể cả ép Sói tự ăn thịt một con Sói khác).",
    "fullDesc": "Người Múa Rối nắm giữ những sợi tơ điều khiển tâm trí ma quái. Một lần duy nhất trong toàn bộ ván chơi, Người Múa Rối có thể can thiệp buộc bầy Ma Sói phải cắn chết một nạn nhân do chính Người Múa Rối chỉ định, thay thế cho sự thống nhất ban đầu của bầy Sói. Người Múa Rối thậm chí có thể ép đàn Sói tự cắn chết một con Sói khác trong bầy!",
    "gmCall": "Trong lượt Sói: Nếu Người Múa Rối kích hoạt quyền năng, Quản trò bắt bầy Sói phải đổi mục tiêu theo lệnh Người Múa Rối.",
    "notes": [
      "Năng lực xoay chuyển cục diện ván cờ cực kỳ kinh hoàng."
    ],
    "image": "/cards/Nguoi_mua_roi.png",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "sat-thu",
    "name": "Sát Thủ (Thích Khách)",
    "enName": "Assassin",
    "expansion": "Ma Sói Character Plus",
    "team": "Phe Độc Lập / Phục Thù",
    "teamCode": "3",
    "wakeOrder": 7.5,
    "wakeTime": "Mỗi 2 đêm khi đủ 4 phiếu",
    "shortDesc": "Mỗi 2 đêm, nếu số phiếu biểu quyết vào Sát Thủ trong các ngày qua đạt mốc 4 phiếu, Sát Thủ thức dậy ám sát 1 người ngay lập tức.",
    "fullDesc": "Sát Thủ là kẻ ẩn mình trong bóng tối tích tụ sự nghi kỵ. Mỗi 2 đêm, Quản trò kiểm tra số phiếu tích lũy mà dân làng đã từng vote vào Sát Thủ. Nếu tổng số phiếu chỉ vào Sát Thủ đạt từ 4 phiếu trở lên, Sát Thủ sẽ được quyền thức dậy chỉ định giết chết 1 người chơi bất kỳ.",
    "gmCall": "Đêm đủ điều kiện: 'Sát Thủ thức dậy. Hãy chỉ định mục tiêu bị ám sát đêm nay.' -> Quản trò ghi nhận.",
    "notes": [
      "Biến sự nghi ngờ của dân làng thành vũ khí giết chóc trả thù."
    ],
    "image": "/cards/Thich_khach.png",
    "colors": {
      "bg": "#581c87",
      "border": "#a855f7",
      "banner": "#9333ea",
      "text": "#d8b4fe"
    }
  },
  {
    "id": "ki-si",
    "name": "Kị Sĩ",
    "enName": "Knight",
    "expansion": "Ma Sói Character Plus",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 85,
    "wakeTime": "Ban ngày trước giờ vote",
    "shortDesc": "1 lần duy nhất vào ban ngày trước khi treo cổ, được lật bài thách đấu 1 người. Nếu là Sói, Sói chết ngay; nếu không phải Sói, Kị Sĩ chết!",
    "fullDesc": "Kị Sĩ mang tinh thần hiệp sĩ quả cảm xả thân vì chính nghĩa. Duy nhất 1 lần vào ban ngày trước khi cả làng tiến hành biểu quyết treo cổ, Kị Sĩ có quyền dõng dạc lật ngửa lá bài của mình lên và chỉ đích danh 1 người chơi để kiểm tra danh tính. Quản trò lập tức tuyên bố người đó có phải là Ma Sói hay không: Nếu ĐÚNG LÀ SÓI -> Con Sói đó lập tức bị chém chết và ngày hôm đó kết thúc ngay không cần vote tiếp. Nếu KHÔNG PHẢI SÓI -> Kị Sĩ chết gục tại chỗ vì phán đoán sai lầm, và làng tiếp tục chơi bình thường.",
    "gmCall": "Khi Kị Sĩ lật bài: Quản trò công bố: 'Người này là Sói/Không phải Sói!' -> Thực hiện xử tử tương ứng.",
    "notes": [
      "Là canh bạc tất tay cực kỳ kịch tính và gay cấn giữa ban ngày."
    ],
    "image": "/cards/Ky_si.png",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "con-qua-plus",
    "name": "Con Quạ (Plus)",
    "enName": "Raven Plus",
    "expansion": "Ma Sói Character Plus",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 9.1,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Hằng đêm đặt lời nguyền lên 1 người. Người bị dính lời nguyền sáng hôm sau tự động bị cộng 2 phiếu vote treo cổ.",
    "fullDesc": "Phiên bản mở rộng của Con Quạ. Hằng đêm thức dậy reo rắc điềm gở lên đầu 1 người chơi. Nạn nhân bị dính lời nguyền sẽ gánh chịu 2 phiếu biểu quyết treo cổ vào sáng hôm sau.",
    "gmCall": "Quản trò hô: 'Con Quạ thức dậy. Hãy đặt lời nguyền lên một người chơi đêm nay.' -> 'Con Quạ nhắm mắt lại.'",
    "notes": [
      "Giúp dồn áp lực biểu quyết lên những kẻ đáng ngờ."
    ],
    "image": "/cards/Con_qua.png",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "nguoi-goi-hon",
    "name": "Người Gọi Hồn",
    "enName": "Spiritualist",
    "expansion": "Ma Sói Character Plus",
    "team": "Phe Dân Làng",
    "teamCode": "V",
    "wakeOrder": 3.8,
    "wakeTime": "Mỗi đêm",
    "shortDesc": "Mỗi đêm Quản trò hỏi linh hồn người vừa chết gần nhất: 'Hãy chỉ vào kẻ mình nghi ngờ nhất' để Người Gọi Hồn nhìn thấy.",
    "fullDesc": "Người Gọi Hồn có khả năng giao tiếp và cầu viện linh hồn của người chết gần nhất trong làng. Mỗi đêm, Quản trò gọi Người Gọi Hồn thức dậy, đồng thời ra lệnh cho linh hồn người vừa chết trước đó: 'Người chết, hãy chỉ tay vào người mà bạn nghi ngờ nhất!' Khi đó hồn ma sẽ chỉ điểm nhưng tuyệt đối không được nói bất cứ lời nào. Người Gọi Hồn sẽ chứng kiến sự chỉ điểm đó để làm manh mối điều tra.",
    "gmCall": "Quản trò hô: 'Người Gọi Hồn thức dậy.' -> 'Người chết gần nhất, hãy mở mắt và chỉ vào kẻ bạn nghi ngờ nhất.' -> Người Gọi Hồn quan sát -> Cả 2 nhắm mắt lại.",
    "notes": [
      "Người chết chỉ được chỉ tay, không được mở miệng hay phát ra âm thanh."
    ],
    "image": "/cards/Nguoi_goi_hon.png",
    "colors": {
      "bg": "#1e3a8a",
      "border": "#3b82f6",
      "banner": "#2563eb",
      "text": "#93c5fd"
    }
  },
  {
    "id": "soi-lua",
    "name": "Sói Lửa (Cáo Lửa)",
    "enName": "Fire Werewolf",
    "expansion": "Ma Sói Character Plus",
    "team": "Phe Sói",
    "teamCode": "W",
    "wakeOrder": 5.8,
    "wakeTime": "Khi có đồng bọn chết",
    "shortDesc": "Khi có ít nhất 1 Sói chết, đêm tiếp theo Sói Lửa được chọn 1 người để tước đoạt vĩnh viễn năng lực của người đó. Khi có 2 Sói chết, dùng thêm 1 lần nữa.",
    "fullDesc": "Sói Lửa mang ngọn lửa hận thù thiêu rụi năng lực đối thủ. Khi bầy Sói có ít nhất 1 con Sói bị tiêu diệt, vào đêm tiếp theo, Sói Lửa được quyền thức dậy chọn 1 người chơi: người bị chọn sẽ bị THIÊU RỤI HOÀN TOÀN NĂNG LỰC VĨNH VIỄN (trở thành một người bình thường không còn phép thuật). Nếu bầy Sói có từ 2 con Sói bị chết trở lên, Sói Lửa được quyền kích hoạt chức năng này thêm một lần nữa.",
    "gmCall": "Đêm sau khi có Sói chết: 'Sói Lửa thức dậy. Hãy chọn người bạn muốn thiêu rụi năng lực vĩnh viễn.' -> Sói Lửa chỉ định -> Quản trò ghi nhận tước phép nạn nhân.",
    "notes": [
      "Cực kỳ nguy hiểm cho các chức năng chủ chốt như Tiên Tri, Bảo Vệ hay Phù Thủy."
    ],
    "image": "/cards/Cao_lua.png",
    "colors": {
      "bg": "#7f1d1d",
      "border": "#ef4444",
      "banner": "#dc2626",
      "text": "#fca5a5"
    }
  },
  {
    "id": "anh-em-soi",
    "name": "Anh Em Sói",
    "enName": "Wolf Brothers",
    "expansion": "Ma Sói Character Plus",
    "team": "Phe Sói",
    "teamCode": "W",
    "wakeOrder": 5.3,
    "wakeTime": "Đêm đầu nhận nhau",
    "shortDesc": "Gồm Sói Anh và Sói Em. Sói Anh dậy đi săn bình thường. Sói Em chưa thức cùng bầy (Tiên Tri/Gấu soi ra Dân). Khi Sói Anh chết, Sói Em nổi giận giết 1 người và chính thức nhập bầy.",
    "fullDesc": "Đêm thứ nhất, Quản trò gọi 2 Anh Em Sói thức dậy nhận biết nhau và phân định rõ ai là Sói Anh, ai là Sói Em. Sói Anh dậy đi săn cùng bầy Sói như bình thường. Sói Em chưa được thức dậy cùng bầy Sói. Đặc biệt: Chừng nào Sói Anh chưa chết, Sói Em sẽ KHÔNG BỊ Tiên Tri, Gấu hay Cáo nhận diện là Ma Sói (soi ra Dân làng)! Khi Sói Anh chết, Sói Em phẫn nộ lập tức giết chết 1 người và từ đêm đó chính thức thức dậy đi săn cùng phe Sói.",
    "gmCall": "Đêm 1: 'Hai Anh Em Sói thức dậy nhận nhau.' Quản trò chỉ rõ Sói Anh và Sói Em. Khi Sói Anh chết: Sói Em giết 1 người và kích hoạt hóa Sói hoàn toàn.",
    "notes": [
      "Là quân bài ngụy trang nội gián hoàn hảo trong lòng dân làng."
    ],
    "image": "/cards/anh_em_soi.png",
    "colors": {
      "bg": "#7f1d1d",
      "border": "#ef4444",
      "banner": "#dc2626",
      "text": "#fca5a5"
    }
  },
  {
    "id": "anh-tu",
    "name": "Ảnh Tử (Bóng Ma)",
    "enName": "Shadow",
    "expansion": "Ma Sói Character Plus",
    "team": "Tùy Thuộc / Kế Thừa",
    "teamCode": "?",
    "wakeOrder": 0.4,
    "wakeTime": "Đêm đầu tiên",
    "shortDesc": "Đêm đầu chọn 1 người làm bản thể. Nếu người đó sống đến cuối, Ảnh Tử thắng theo Dân làng. Nếu người đó chết, Ảnh Tử lấy lá bài đó và kế thừa vai trò.",
    "fullDesc": "Ảnh Tử là chiếc bóng bí ẩn sống ký sinh trên vận mệnh của người khác. Đêm đầu tiên, Ảnh Tử thức dậy và chọn 1 người chơi làm 'chủ thể'. Trong suốt ván chơi, nếu người được chọn vẫn còn sống, Ảnh Tử có điều kiện thắng hệt như phe Dân Làng. Nếu người chủ thể đó bị chết, Ảnh Tử sẽ lập tức lấy lá bài của người đó và biến đổi trở thành chính nhân vật đó tiếp tục cuộc chơi.",
    "gmCall": "Đêm 1: 'Ảnh Tử thức dậy. Hãy chọn người bạn muốn gắn kết chiếc bóng.' -> Ghi nhận chủ thể. Khi chủ thể chết: Trao thẻ chủ thể cho Ảnh Tử.",
    "notes": [
      "Luôn tìm cách bảo vệ người mình đã chọn hoặc toan tính thừa kế những vai quyền lực."
    ],
    "image": "/cards/anh_tu.png",
    "colors": {
      "bg": "#1f2937",
      "border": "#6b7280",
      "banner": "#4b5563",
      "text": "#d1d5db"
    }
  },
  {
    "id": "ke-bao-thu",
    "name": "Kẻ Báo Thù",
    "enName": "Avenger",
    "expansion": "Ma Sói Character Plus",
    "team": "Tự Chọn Phe (Dân hoặc Sói)",
    "teamCode": "?",
    "wakeOrder": 0.6,
    "wakeTime": "Đêm đầu chọn phe",
    "shortDesc": "Đêm đầu bí mật chọn theo Dân hoặc Sói. Khi Kẻ Báo Thù chết, được chọn 1 người: nếu người đó thuộc phe đối lập với phe mình chọn ban đầu, người đó chết ngay lập tức!",
    "fullDesc": "Vào đêm thứ nhất, Kẻ Báo Thù thức dậy và bí mật ra dấu cho Quản trò chọn theo phe Dân Làng HOẶC phe Ma Sói. Vào đêm mà Kẻ Báo Thù bị giết chết, Kẻ Báo Thù được quyền chọn 1 người chơi để trả thù: Nếu người đó thuộc phe ĐỐI LẬP với phe Kẻ Báo Thù đã chọn ban đầu (ví dụ Kẻ Báo Thù chọn Dân mà người bị chỉ là Sói, hoặc Kẻ Báo Thù chọn Sói mà người bị chỉ là Dân) -> người đó sẽ chết ngay lập tức!",
    "gmCall": "Đêm 1: 'Kẻ Báo Thù thức dậy. Hãy chọn phe bạn tôn thờ (Dân hay Sói).' Khi Kẻ Báo Thù chết: 'Hãy chỉ một người để kích hoạt báo thù.' -> Kiểm tra phe đối lập -> Xử tử nếu đúng phe đối nghịch.",
    "notes": [
      "Nếu người bị chọn cùng phe với Kẻ Báo Thù chọn ban đầu thì người đó không bị hề hấn gì.",
      "Không phải phe thứ 3 độc lập mà gắn liền số phận với phe đã chọn."
    ],
    "image": "/cards/Ke_bao_thu.png",
    "colors": {
      "bg": "#1f2937",
      "border": "#6b7280",
      "banner": "#4b5563",
      "text": "#d1d5db"
    }
  }
];

export const PRESETS = [
  {
    "id": "preset-6-8",
    "name": "Cơ Bản (6 - 8 Người)",
    "desc": "Ván chơi tiêu chuẩn nhẹ nhàng, làm quen luật cho nhóm nhỏ",
    "playerCount": 8,
    "roleIds": [
      "soi-thuong",
      "soi-thuong",
      "tien-tri",
      "bao-ve",
      "phu-thuy",
      "dan-lang",
      "dan-lang",
      "dan-lang"
    ]
  },
  {
    "id": "preset-9-11",
    "name": "Mở Rộng Kịch Tính (9 - 11 Người)",
    "desc": "Cân bằng hoàn hảo với Thợ Săn, Cupid và Sói Con",
    "playerCount": 10,
    "roleIds": [
      "soi-thuong",
      "soi-thuong",
      "soi-con",
      "tien-tri",
      "bao-ve",
      "phu-thuy",
      "tho-san",
      "cupid",
      "dan-lang",
      "dan-lang"
    ]
  },
  {
    "id": "preset-12-15",
    "name": "Đại Chiến Ngôi Làng (12 - 15 Người)",
    "desc": "Đầy đủ các phe với Sói Trắng, Người Thổi Sáo và Già Làng",
    "playerCount": 13,
    "roleIds": [
      "soi-thuong",
      "soi-thuong",
      "soi-lon-xau-xa",
      "soi-trang",
      "tien-tri",
      "bao-ve",
      "phu-thuy",
      "tho-san",
      "cupid",
      "gia-lang",
      "thang-ngoc",
      "nguoi-thoi-sao",
      "dan-lang"
    ]
  }
];
