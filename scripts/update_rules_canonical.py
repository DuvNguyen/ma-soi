#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to build the canonical game-rules.md based on /home/levi/Downloads/luat-goc-ma-soi.md
and align with project standards, UI specs, local card images, and accurate timing.
"""

import os
import re

DOWNLOADS_RULES_PATH = "/home/levi/Downloads/luat-goc-ma-soi.md"
OUTPUT_RULES_PATH = "/home/levi/Desktop/Projects/werewolf/docs/game-rules.md"

# Image mapping for 44 roles
IMAGE_MAPPING = {
    "01": "la-bai-dan-lang.jpg",
    "02": "la-bai-ma-soi.jpg",
    "03": "nhan_vat_ma_soi.jpg",
    "04": "la-bai-phu-thuy.jpg",
    "05": "la-bai-tho-san.jpg",
    "06": "la-bai-than-tinh-yeu.jpg",
    "07": "an_trom.PNG",
    "08": "huong-dan-choi-ma-soi4.jpg",
    "09": "Canh_sat.jpg",
    "10": "la-bai-bao-ve.jpg",
    "11": "la-bai-gia-lang.jpg",
    "12": "Nhan_vat_Ma_soi_Scapegoat.jpg",
    "13": "Nhan_vat_Ma_soi__Thang_ngoc.jpg",
    "14": "thoisao.jpg",
    "15": "Nhan_vat_Ma_soi__Hai_chi_em.PNG",
    "16": "Nhan_vat_Ma_soi___Ba_anh_em.PNG",
    "17": "Nhan_vat_Ma_soi___Cao.PNG",
    "18": "Nhan_vat_Ma_soi__Nguoi_thuan_phuc_gau.PNG",
    "19": "Nhan_vat_Ma_soi___Tham_phan_lap_bap.PNG",
    "20": "Nhan_vat_Ma_soi___Hiep_si_Kiem_gi.PNG",
    "21": "Nhan_vat_Ma_soi__Dien_vien.PNG",
    "22": "Nhan_vat_Ma_soi___Nguoi_day_to_tan_tuy.jpg",
    "23": "Nhan_vat_Ma_soi___Dua_tre_hoang_da.PNG",
    "24": "Nhan_vat_Ma_soi___Cho_soi.jpg",
    "25": "Nhan_vat_Ma_soi___Soi_lon_xau_xa.PNG",
    "26": "Nhan_vat_Ma_soi___Cha_cho_soi.jpg",
    "27": "soi_trang.jpg",
    "28": "Nhan_vat_Ma_soi__Thien_su.PNG",
    "29": "Nhan_vat_Ma_soi___Thanh_vien_giao_phai.jpg",
    "30": "ma_soi_the_village___con_qua.PNG",
    "31": "Nguoi_goi_hon.png",
    "32": "Truong_lang.PNG",
    "33": "nua_nguoi_nua_soi.jpg",
    "34": "la-bai-ban-soi.jpg",
    "35": "anh_tu.png",
    "36": "anh_em_soi.png",
    "37": "anh_em_soi.png",
    "38": "Cao_lua.png",
    "39": "Thay_thoi_mien.png",
    "40": "Nguyet_nu.png",
    "41": "duoc_si.png",
    "42": "Ky_si.png",
    "43": "Ke_bao_thu.png",
    "44": "Thich_khach.png"
}

# Role team code mapping
ROLE_TEAM_CODES = {
    "01": "V", "02": "W", "03": "V", "04": "V", "05": "V", "06": "V", "07": "?", "08": "V", "09": "V",
    "10": "V", "11": "V", "12": "V", "13": "V", "14": "3",
    "15": "V", "16": "V", "17": "V", "18": "V", "19": "V", "20": "V", "21": "V", "22": "?", "23": "?",
    "24": "?", "25": "W", "26": "W", "27": "3", "28": "3", "29": "3",
    "30": "V", "31": "V", "32": "V",
    "33": "?", "34": "?", "35": "?", "36": "W", "37": "W", "38": "W", "39": "?", "40": "V", "41": "V", "42": "V", "43": "?", "44": "3"
}

ROLE_TEAM_NAMES = {
    "V": "Phe Dân Làng (Villager)",
    "W": "Phe Ma Sói (Werewolf)",
    "3": "Phe Thứ Ba / Độc Lập (Neutral / 3rd Party)",
    "?": "Tùy Biến / Kế Thừa (Variable)"
}

ROLE_EN_NAMES = {
    "01": "Simple Villager",
    "02": "Werewolf",
    "03": "Seer / Fortune Teller",
    "04": "Witch",
    "05": "Hunter",
    "06": "Cupid",
    "07": "Thief",
    "08": "Little Girl",
    "09": "Sheriff",
    "10": "Defender / Savior",
    "11": "Elder",
    "12": "Scapegoat",
    "13": "Village Idiot",
    "14": "Piper",
    "15": "Two Sisters",
    "16": "Three Brothers",
    "17": "Fox",
    "18": "Bear Tamer",
    "19": "Stuttering Judge",
    "20": "Knight with the Rusty Sword",
    "21": "Actor",
    "22": "Devoted Servant",
    "23": "Wild Child / Tarzan",
    "24": "Wolf Hound",
    "25": "Big Bad Wolf",
    "26": "Cursed Wolf-Father",
    "27": "White Werewolf",
    "28": "Angel",
    "29": "Prejudiced Manipulator / Elder",
    "30": "Scandalmonger / Raven",
    "31": "Gypsy",
    "32": "Town Crier",
    "33": "Half-Werewolf",
    "34": "Cursed One",
    "35": "Shadow",
    "36": "Wolf Brother (Elder)",
    "37": "Wolf Brother (Younger)",
    "38": "Fire Wolf",
    "39": "Enchanter / Puppet Master",
    "40": "Moon Maiden",
    "41": "Pharmacist",
    "42": "Knight",
    "43": "Avenger",
    "44": "Assassin"
}

ROLE_EXPANSIONS = {
    "01": "Bộ cơ bản", "02": "Bộ cơ bản", "03": "Bộ cơ bản", "04": "Bộ cơ bản", "05": "Bộ cơ bản",
    "06": "Bộ cơ bản", "07": "Bộ cơ bản", "08": "Bộ cơ bản", "09": "Bộ cơ bản (Chức vụ)",
    "10": "New Moon", "11": "New Moon", "12": "New Moon", "13": "New Moon", "14": "New Moon",
    "15": "Characters", "16": "Characters", "17": "Characters", "18": "Characters", "19": "Characters",
    "20": "Characters", "21": "Characters", "22": "Characters", "23": "Characters", "24": "Characters",
    "25": "Characters", "26": "Characters", "27": "Characters", "28": "Characters", "29": "Characters",
    "30": "The Village", "31": "The Village / New Moon", "32": "The Village",
    "33": "Biến thể Việt hóa", "34": "Biến thể Việt hóa", "35": "Biến thể Việt hóa", "36": "Biến thể Việt hóa",
    "37": "Biến thể Việt hóa", "38": "Biến thể Việt hóa", "39": "Biến thể Việt hóa", "40": "Biến thể Việt hóa",
    "41": "Biến thể Việt hóa", "42": "Biến thể Việt hóa", "43": "Biến thể Việt hóa", "44": "Biến thể Việt hóa"
}

# Wake order rank & display timing
WAKE_DATA = {
    "01": ("99", "Ngủ suốt đêm", "Dân Làng: Ban ngày suy luận, thảo luận và bỏ phiếu."),
    "02": ("5.0", "Mỗi đêm", "Đàn Ma Sói thức dậy cùng nhau, bàn bằng cử chỉ thống nhất chọn 1 nạn nhân cắn chết."),
    "03": ("4.0", "Mỗi đêm (trước Sói)", "Tiên Tri thức dậy chọn 1 người. Quản trò cho xem trọn vẹn lá nhân vật của người đó."),
    "04": ("6.0", "Mỗi đêm (sau Sói)", "Phù Thủy thức dậy. Quản trò báo ai bị Sói cắn. Phù Thủy chọn dùng bình cứu và/hoặc bình độc."),
    "05": ("9.8", "Khi bị loại (Sói cắn/treo/chết theo cặp)", "Thợ Săn lập tức bắn chết 1 người trước khi rời ván."),
    "06": ("1.0", "Đêm đầu tiên duy nhất", "Cupid thức dậy ghép đôi 2 người yêu nhau. Quản trò chạm vai 2 người, sau đó gọi riêng cặp đôi thức nhận mặt."),
    "07": ("0.3", "Đầu đêm 1 duy nhất", "Kẻ Trộm thức dậy xem 2 lá bài úp ngoài cuộc. Bắt buộc đổi bài chỉ khi cả hai lá đều là Sói."),
    "08": ("5.0a", "Trong lúc đàn Sói thức", "Cô Bé Ti Hí có thể hé mắt lén nhìn Sói. Nếu bị Sói phát hiện thì chết thay cho nạn nhân."),
    "09": ("9.2", "Sáng ngày thứ nhất", "Cảnh Sát Trưởng: Bầu cử công khai sáng ngày 1. Phiếu tính x2. Khi chết chỉ định người kế nhiệm."),
    "10": ("3.0", "Mỗi đêm (trước Tiên Tri & Sói)", "Bảo Vệ thức dậy chọn 1 người để bảo vệ khỏi cú cắn của Sói (không chọn trùng 2 đêm liên tiếp)."),
    "11": ("9.9", "Bị động", "Già Làng sống qua cú cắn đầu của Sói. Nếu bị làng treo/Phù Thủy độc/Thợ Săn bắn -> Làng mất hết kỹ năng!"),
    "12": ("9.6", "Khi bỏ phiếu hòa", "Oan Nhân bị treo cổ thay khi hòa phiếu. Trước khi chết, chỉ định những ai được quyền vote vào ngày hôm sau."),
    "13": ("9.7", "Khi bị bỏ phiếu treo", "Kẻ Ngốc lật bài được làng tha bổng, sống tiếp nhưng mất vĩnh viễn quyền bỏ phiếu đến hết ván."),
    "14": ("7.0", "Mỗi đêm (sau Phù Thủy)", "Thổi Sáo thức dậy chọn mê hoặc 2 người. Sau đó tất cả người bị mê hoặc thức dậy nhận mặt nhau."),
    "15": ("1.2", "Đêm đầu tiên duy nhất", "Hai Chị Em thức dậy nhận mặt nhau."),
    "16": ("1.3", "Đêm đầu tiên duy nhất", "Ba Anh Em thức dậy nhận mặt nhau."),
    "17": ("4.5", "Mỗi đêm (trước Sói)", "Cáo chọn nhóm 3 người ngồi liền kề. Nếu có ít nhất 1 Sói -> Giữ kỹ năng. Không có Sói -> Mất kỹ năng vĩnh viễn."),
    "18": ("9.0", "Mỗi buổi sáng", "Thần Gấu: Quản trò kiểm tra 2 người sống ngồi cạnh. Nếu có ít nhất 1 Sói -> Quản trò gầm lớn cho cả làng nghe."),
    "19": ("1.9", "Đêm 1 thống nhất ám hiệu", "Thẩm Phán: 1 lần mỗi ván, ra ám hiệu để mở ngay lượt bỏ phiếu treo thứ 2 mà không cần tranh luận."),
    "20": ("9.1", "Khi bị Sói cắn chết", "Hiệp Sĩ Già: Con Sói sống gần nhất về bên trái bị thương, sống thêm 1 ngày và chết vào đêm kế tiếp."),
    "21": ("2.5", "Mỗi đêm (khi còn lá chọn)", "Kịch Sĩ chọn 1 trong 3 lá có kỹ năng để dùng đến đêm tiếp theo."),
    "22": ("9.5", "Ban ngày (khi có người bị treo)", "Người Hầu: Trước lúc người bị treo lật bài, có thể công khai lá Người Hầu để lấy bài người đó và nhận vai mới."),
    "23": ("1.5", "Đêm đầu tiên duy nhất", "Tarzan bí mật chọn 1 người làm hình mẫu. Khi hình mẫu chết, Tarzan hóa Sói từ đêm sau."),
    "24": ("1.6", "Đêm đầu tiên duy nhất", "Sói Lai bí mật chọn cố định làm Dân thường hoặc Ma Sói cho đến hết ván."),
    "25": ("5.4", "Mỗi đêm (sau lượt cắn chung)", "Sói Trùm: Khi chưa có bất kỳ Sói nào chết, được thức riêng cắn thêm 1 nạn nhân ngoài đàn."),
    "26": ("5.2", "Mỗi đêm (sau lượt Sói cắn)", "Sói Quỷ: 1 lần mỗi ván, nguyền nạn nhân vừa bị Sói cắn biến thành Ma Sói (giữ nguyên kỹ năng cũ)."),
    "27": ("5.6", "Cách 1 đêm (từ Đêm 2)", "Sói Trắng thức dậy riêng sau đàn Sói để chọn giết 1 con Sói khác."),
    "28": ("0.1", "Trước Đêm 1", "Thiên Thần: Làng tranh luận & vote trước Đêm 1. Nếu bị loại ngày 1 hoặc bị cắn đêm 1 -> Thiên Thần thắng ngay."),
    "29": ("0.0", "Trước ván chơi", "Bô Lão: Quản trò chia làng làm 2 nhóm. Bô Lão vận động loại sạch nhóm đối diện để thắng."),
    "30": ("8.0", "Cuối mỗi đêm", "Quạ thức dậy chọn đặt dấu tố cáo (người này nhận sẵn 2 phiếu phạt vào sáng hôm sau)."),
    "31": ("8.5", "Mỗi đêm", "Người Digan chọn dùng lá Gọi Hồn, chọn câu hỏi và chỉ định người đọc vào sáng hôm sau."),
    "32": ("9.2a", "Ban ngày", "Thằng Mõ do Cảnh Sát Trưởng bổ nhiệm, đọc công khai 1 lá sự kiện New Moon."),
    "33": ("9.9a", "Khi bị Sói cắn", "Bán Sói: Khởi đầu phe Dân, khi bị Sói cắn thì sống và hóa thành Ma Sói."),
    "34": ("9.9b", "Đêm sau khi bị Sói cắn", "Kẻ Bị Nguyền: Khởi đầu phe Dân, khi bị Sói cắn sẽ hóa Sói vào đêm hôm sau."),
    "35": ("1.7", "Đêm đầu tiên duy nhất", "Ảnh Tử chọn 1 người làm bản thể. Khi người đó chết thì lấy bài và trở thành nhân vật đó."),
    "36": ("1.4a", "Đêm 1 nhận mặt, mỗi đêm đi săn", "Sói Anh thức cùng đàn mỗi đêm. Khi Sói Anh chết sẽ kích hoạt kỹ năng của Sói Em."),
    "37": ("1.4b", "Đêm 1 nhận mặt, ngủ tiếp", "Sói Em chưa thức cùng đàn. Khi Sói Anh chết, Sói Em được giết 1 người rồi nhập đàn Sói."),
    "38": ("5.8", "Sau khi có Sói chết", "Sói Lửa: Sau khi có Sói bị giết, đêm tiếp theo được chọn 1 người để tước kỹ năng vĩnh viễn."),
    "39": ("4.8", "Mỗi đêm", "Cổ Hoặc Sư thức dậy chọn 1 người thế mạng nếu đêm nay mình chết."),
    "40": ("2.0", "Đầu mỗi đêm", "Nguyệt Nữ thức dậy chọn 1 người để phong ấn kỹ năng ban đêm (không chọn trùng 2 đêm liên tiếp)."),
    "41": ("6.5", "Mỗi đêm", "Dược Sĩ dùng bình Mê Hồn (cấm nói/vote 1 ngày) hoặc Hồi Phục (hồi bình cứu cho Phù Thủy)."),
    "42": ("9.3", "Ban ngày trước bỏ phiếu", "Kỵ Sĩ: Lật bài thách đấu 1 người. Chọn trúng Sói thì Sói chết ngay. Sai thì Kỵ Sĩ chết sáng sau."),
    "43": ("1.8", "Đêm đầu tiên duy nhất", "Kẻ Báo Thù chọn phe Dân hoặc Sói. Khi chết, chỉ 1 người. Người đó chết theo nếu thuộc phe đối địch."),
    "44": ("7.5", "Tối kế tiếp khi đủ 4 phiếu", "Thích Khách: Cứ 2 ngày gom đủ 4 phiếu treo thì được giết 1 người vào tối kế tiếp.")
}

GM_CALLS = {
    "01": "Không có lượt gọi ban đêm.",
    "02": "Quản trò hô: 'Ma Sói thức dậy! Hãy nhận diện đồng bọn và chọn con mồi đêm nay.' -> Bầy Sói bàn bằng cử chỉ và thống nhất chỉ vào 1 người -> 'Ma Sói đi ngủ.'",
    "03": "Quản trò hô: 'Tiên Tri thức dậy! Hãy chọn một người để soi.' -> Tiên Tri chỉ 1 người -> Quản trò bí mật cho Tiên Tri xem trọn vẹn lá nhân vật của người đó -> 'Tiên Tri đi ngủ.'",
    "04": "Quản trò hô: 'Phù Thủy thức dậy!' -> Quản trò ra dấu cho biết ai bị Sói cắn -> 'Phù Thủy có muốn dùng bình cứu không? (Gật/Lắc)' -> 'Phù Thủy có muốn dùng bình độc không? (Nếu có hãy chỉ người)' -> 'Phù Thủy đi ngủ.'",
    "05": "Kích hoạt khi Thợ Săn chết: Quản trò hô: 'Thợ Săn đã bị loại! Trước khi chết, Thợ Săn hãy chọn một người để bắn hạ!' -> Thợ Săn chỉ 1 người -> Người đó bị loại ngay lập tức.",
    "06": "Quản trò hô (Đêm 1): 'Cupid thức dậy! Hãy chọn hai người để ghép đôi tình yêu.' -> Cupid chỉ 2 người -> 'Cupid đi ngủ.' -> Quản trò đi quanh chạm vai 2 người được chọn -> 'Cặp đôi thức dậy nhận mặt nhau!' -> 2 người mở mắt nhìn nhau -> 'Cặp đôi đi ngủ.'",
    "07": "Quản trò hô (Đầu Đêm 1): 'Kẻ Trộm thức dậy! Hãy xem hai lá bài thừa ngoài cuộc.' -> Kẻ Trộm xem 2 lá và chọn đổi hoặc giữ -> 'Kẻ Trộm đi ngủ.'",
    "08": "Không gọi riêng. Trong lúc đàn Sói thức dậy, Cô Bé Ti Hí có thể lén hé mắt nhìn. Nếu Quản trò thấy Sói bắt quả tang Cô Bé, ghi nhận Cô Bé chết thay cho nạn nhân.",
    "09": "Ban ngày sáng ngày 1: Quản trò thông báo: 'Làng hãy tiến hành tranh cử và bỏ phiếu bầu ra Cảnh Sát Trưởng!' -> Người có nhiều phiếu nhất nhận thẻ Cảnh Sát Trưởng.",
    "10": "Quản trò hô: 'Bảo Vệ thức dậy! Hãy chọn một người để bảo vệ đêm nay (không chọn người đêm trước).' -> Bảo Vệ chỉ 1 người -> 'Bảo Vệ đi ngủ.'",
    "11": "Quản trò âm thầm theo dõi số mạng của Già Làng. Nếu Sói cắn lần 1, không công bố Già Làng chết. Nếu Già Làng bị treo/thuốc độc/bắn, thông báo cả làng mất kỹ năng đặc biệt.",
    "12": "Khi kiểm phiếu ban ngày bị hòa: Quản trò hô: 'Phiếu bầu bị hòa! Oan Nhân sẽ bị đưa lên giàn treo cổ thế mạng!' -> 'Oan Nhân trước khi rời ván hãy chỉ định ai được quyền bỏ phiếu vào ngày mai!'",
    "13": "Khi Kẻ Ngốc bị biểu quyết treo cổ: Quản trò hô: 'Người bị chọn là Kẻ Ngốc! Kẻ Ngốc lật bài công khai và được làng tha bổng, nhưng mất vĩnh viễn quyền bỏ phiếu!'",
    "14": "Quản trò hô: 'Người Thổi Sáo thức dậy! Hãy chọn hai người để mê hoặc.' -> Thổi Sáo chỉ 2 người -> 'Thổi Sáo đi ngủ.' -> Quản trò chạm vai 2 người mới -> 'Tất cả những người bị mê hoặc hãy thức dậy nhận mặt nhau!' -> Họ mở mắt nhìn nhau -> 'Những người bị mê hoặc đi ngủ.'",
    "15": "Quản trò hô (Đêm 1): 'Hai Chị Em thức dậy nhận mặt nhau!' -> Hai Chị Em mở mắt nhìn nhau -> 'Hai Chị Em đi ngủ.'",
    "16": "Quản trò hô (Đêm 1): 'Ba Anh Em thức dậy nhận mặt nhau!' -> Ba Anh Em mở mắt nhìn nhau -> 'Ba Anh Em đi ngủ.'",
    "17": "Quản trò hô: 'Cáo thức dậy! Hãy chọn người đứng giữa một nhóm ba người liền kề.' -> Cáo chỉ 1 người -> Quản trò kiểm tra 3 người và ra dấu (Gật đầu nếu có ít nhất 1 Sói, Lắc đầu nếu không có Sói nào) -> 'Cáo đi ngủ.'",
    "18": "Sáng sớm sau khi công bố nạn nhân: Quản trò kiểm tra 2 người sống ngồi cạnh Thần Gấu. Nếu có Sói, Quản trò gầm lớn: 'GRỪZZZZZ!' thông báo cho cả làng.",
    "19": "Đêm 1: Quản trò gọi Thẩm Phán thức dậy để thống nhất một ám hiệu bí mật (gãi cằm, nháy mắt, v.v.). Trong lượt vote ban ngày, nếu Thẩm Phán ra ám hiệu, Quản trò tuyên bố mở vòng vote thứ 2.",
    "20": "Khi Hiệp Sĩ Già bị Sói cắn: Quản trò âm thầm đánh dấu con Sói sống gần nhất bên tay trái Hiệp Sĩ Già bị nhiễm độc và sẽ chết vào đêm sau.",
    "21": "Quản trò hô: 'Kịch Sĩ thức dậy! Hãy chọn một lá bài chức năng cho đêm nay và ngày mai.' -> Kịch Sĩ chọn 1 lá bài trong bộ 3 lá phụ -> 'Kịch Sĩ đi ngủ.'",
    "22": "Ban ngày khi có người bị vote treo: Quản trò hỏi: 'Người Hầu có muốn lật bài cướp vai trước khi nạn nhân lật bài không?' -> Nếu có, Người Hầu lật bài lấy bài người chết và đổi vai.",
    "23": "Quản trò hô (Đêm 1): 'Tarzan thức dậy! Hãy chọn một người làm Thần Tượng / Hình Mẫu của bạn.' -> Tarzan chỉ 1 người -> 'Tarzan đi ngủ.'",
    "24": "Quản trò hô (Đêm 1): 'Sói Lai thức dậy! Bạn muốn chọn làm Dân Làng (ra dấu ngón tay chỉ lên) hay Ma Sói (ra dấu vuốt cào)?' -> Ghi nhận phe cố định -> 'Sói Lai đi ngủ.'",
    "25": "Quản trò hô: 'Sói Trùm thức dậy! Khi chưa có con Sói nào chết, hãy chọn thêm một nạn nhân ngoài đàn để cắn!' -> Sói Trùm chỉ 1 người -> 'Sói Trùm đi ngủ.'",
    "26": "Quản trò hô: 'Sói Quỷ hãy ra dấu nếu muốn dùng lời nguyền biến nạn nhân vừa bị cắn thành Ma Sói!' -> Nếu Sói Quỷ gật đầu -> Quản trò chạm vai báo hiệu cho nạn nhân.",
    "27": "Quản trò hô (Cách 1 đêm, từ đêm 2): 'Sói Trắng thức dậy! Bạn có muốn chọn giết một con Sói nào đêm nay không?' -> Sói Trắng chỉ 1 con Sói -> 'Sói Trắng đi ngủ.'",
    "28": "Ban ngày trước Đêm 1: Quản trò tuyên bố mở phiên tranh luận và bỏ phiếu ngay. Nếu Thiên Thần bị vote treo hoặc bị Sói cắn đêm 1 -> Thiên Thần chiến thắng ván chơi ngay lập tức.",
    "29": "Trước ván chơi: Quản trò công bố cách phân chia làng thành 2 nhóm rõ rệt (nam/nữ, đeo kính/không đeo kính, v.v.). Bô Lão thắng khi nhóm đối diện bị loại sạch.",
    "30": "Quản trò hô: 'Con Quạ thức dậy! Hãy chỉ một người có nhà mà bạn muốn tố cáo.' -> Quạ chỉ 1 người -> 'Con Quạ đi ngủ.' -> Quản trò đặt dấu tố cáo (2 phiếu phạt).",
    "31": "Quản trò hô: 'Người Digan thức dậy! Bạn có muốn dùng lá bài Gọi Hồn đêm nay không?' -> Nếu dùng, Quản trò đọc 4 câu hỏi -> Người Digan chọn 1 câu và chỉ 1 người sáng mai đọc trước làng.",
    "32": "Ban ngày: Thằng Mõ chọn 1 lá sự kiện được Quản trò phát và đọc to trước toàn làng để áp dụng hiệu ứng.",
    "33": "Bán Sói: Khi bị Sói cắn trong đêm, Quản trò không công bố Bán Sói chết vào sáng hôm sau mà âm thầm chuyển phe thành Ma Sói.",
    "34": "Kẻ Bị Nguyền: Khi bị Sói cắn, sống qua ngày và được Quản trò gọi thức dậy cùng bầy Sói từ đêm tiếp theo.",
    "35": "Quản trò hô (Đêm 1): 'Ảnh Tử thức dậy! Hãy chọn một người để làm bản thể gắn kết.' -> Ảnh Tử chỉ 1 người -> 'Ảnh Tử đi ngủ.'",
    "36": "Quản trò hô (Đêm 1): 'Sói Anh và Sói Em thức dậy nhận mặt nhau!' -> 2 người mở mắt -> 'Sói Em đi ngủ, Sói Anh cùng đàn Sói thức dậy đi săn.'",
    "37": "Khi Sói Anh chết, Quản trò gọi riêng Sói Em thức dậy vào ban đêm: 'Sói Em thức dậy! Sói Anh đã chết, hãy chọn một người để trả thù!' -> Sói Em chỉ 1 người cắn chết -> Từ đêm sau thức cùng đàn.",
    "38": "Đêm sau khi có Sói chết: Quản trò hô: 'Sói Lửa thức dậy! Hãy chọn một người để tước bỏ vĩnh viễn kỹ năng!' -> Sói Lửa chỉ 1 người -> 'Sói Lửa đi ngủ.'",
    "39": "Quản trò hô: 'Cổ Hoặc Sư thức dậy! Hãy chọn một người thế mạng trong đêm nay.' -> Cổ Hoặc Sư chỉ 1 người -> 'Cổ Hoặc Sư đi ngủ.'",
    "40": "Quản trò hô (Đầu đêm): 'Nguyệt Nữ thức dậy! Hãy chọn một người để phong ấn kỹ năng đêm nay (không chọn người đêm trước).' -> Nguyệt Nữ chỉ 1 người -> 'Nguyệt Nữ đi ngủ.'",
    "41": "Quản trò hô: 'Dược Sĩ thức dậy! Bạn muốn dùng bình Mê Hồn (cấm nói/vote 1 người) hay bình Hồi Phục (hồi bình cứu cho Phù Thủy)?' -> Dược Sĩ ra dấu -> 'Dược Sĩ đi ngủ.'",
    "42": "Ban ngày trước giờ bỏ phiếu: Kỵ Sĩ đứng dậy lật thẻ bài: 'Ta là Kỵ Sĩ, ta chọn thách đấu người này!' -> Quản trò xác nhận. Nếu là Sói, Sói chết ngay. Nếu là Dân, Kỵ Sĩ chết sáng hôm sau.",
    "43": "Quản trò hô (Đêm 1): 'Kẻ Báo Thù thức dậy! Hãy chọn phe phái bạn muốn phụng sự (Dân Làng hay Ma Sói).' -> Kẻ Báo Thù ra dấu -> 'Kẻ Báo Thù đi ngủ.'",
    "44": "Ban đêm khi Thích Khách tích lũy đủ 4 phiếu vote phạt: Quản trò hô: 'Thích Khách thức dậy! Hãy chỉ định mục tiêu bạn muốn ám sát đêm nay.' -> Thích Khách chỉ 1 người -> 'Thích Khách đi ngủ.'"
}

def parse_source_roles():
    with open(DOWNLOADS_RULES_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    
    pattern = r"###\s+(\d{2})\.\s+([^\n]+)"
    matches = list(re.finditer(pattern, content))
    
    roles = []
    for i, m in enumerate(matches):
        num = m.group(1)
        raw_title = m.group(2).strip()
        start = m.end()
        end = matches[i+1].start() if i+1 < len(matches) else len(content)
        body = content[start:end].strip()
        
        if "## " in body:
            body = body.split("## ")[0].strip()
            
        roles.append({
            "num": num,
            "raw_title": raw_title,
            "body": body
        })
    return roles

def clean_body_bullets(body):
    lines = body.split("\n")
    cleaned_lines = []
    for line in lines:
        line_s = line.strip()
        if not line_s:
            cleaned_lines.append("")
            continue
        cleaned_lines.append(line_s)
    return "\n".join(cleaned_lines)

def build_full_rules():
    roles = parse_source_roles()
    
    output = []
    output.append("# 🐺 TỔNG HỢP TOÀN BỘ LUẬT CHƠI VÀ CẨM NANG 44 NHÂN VẬT MA SÓI (WEREWOLF)")
    output.append("")
    output.append("> **Tài liệu chuẩn dành cho Quản Trò (Game Master) & Đội Ngũ Phát Triển Logic Game**")
    output.append("> *Nguồn đối chiếu chuẩn mực*: Chuẩn hóa theo 44 lá trong bộ bài thực tế, đối chiếu trực tiếp các sách luật chính thức của dòng game quốc tế:")
    output.append("> - *The Werewolves of Miller's Hollow (Bộ cơ bản)*")
    output.append("> - *New Moon (Bản mở rộng Trăng Non)*")
    output.append("> - *Characters (Bản mở rộng Nhân vật)*")
    output.append("> - *The Village (Ngôi làng)*")
    output.append("> - *The Pact (Tuyển tập luật chuẩn Asmodee)*")
    output.append("> - *Characters Plus & Biến thể mở rộng Việt hóa*")
    output.append("> ")
    output.append("> 🎯 **Đặc biệt bổ sung**: Mục `- **Phe và thời điểm.**` rõ ràng cho từng nhân vật, giúp Quản trò và Lập trình viên xác định chính xác ai thức trước, ai thức sau để viết code logic và xử lý thứ tự sự kiện chuẩn xác tuyệt đối.")
    output.append("")
    output.append("---")
    output.append("")
    output.append("## 📑 MỤC LỤC TÀI LIỆU")
    output.append("1. [Quy Trình & Luật Chơi Cơ Bản Cho Quản Trò](#1-quy-trình--luật-chơi-cơ-bản-cho-quản-trò)")
    output.append("2. [Điều Kiện Thắng Của Các Phe (Win Conditions)](#2-điều-kiện-thắng-của-các-phe-win-conditions)")
    output.append("3. [Quy Chuẩn Thiết Kế Thẻ Bài Quản Trò (Card UI Standard)](#3-quy-chuẩn-thiết-kế-thẻ-bài-quản-trò-card-ui-standard)")
    output.append("4. [Bảng Thứ Tự Thức Dậy Ban Đêm & Kích Hoạt Sự Kiện (Wake-up Sequence)](#4-bảng-thứ-tự-thức-dậy-ban-đêm--kích-hoạt-sự-kiện)")
    output.append("   - [4.1. Giai Đoạn A: Đêm Đầu Tiên Duy Nhất (First Night Setup)](#41-giai-đoạn-a-đêm-đầu-tiên-duy-nhất-first-night-setup)")
    output.append("   - [4.2. Giai Đoạn B: Ban Đêm Thường Xuyên (Regular Night Loop)](#42-giai-đoạn-b-ban-đêm-thường-xuyên-regular-night-loop)")
    output.append("   - [4.3. Giai Đoạn C: Ban Ngày & Kỹ Năng Kích Hoạt (Day Phase & Triggers)](#43-giai-đoạn-c-ban-ngày--kỹ-năng-kích-hoạt-sự-kiện)")
    output.append("5. [Danh Sách Chi Tiết 44 Nhân Vật Chuẩn Theo 5 Phần](#5-danh-sách-chi-tiết-44-nhân-vật-chuẩn-theo-5-phần)")
    output.append("   - [Phần 1: Bộ Cơ Bản · 9 Lá & Chức Vụ (01 – 09)](#phần-1-bộ-cơ-bản--9-lá-và-chức-vụ)")
    output.append("   - [Phần 2: New Moon · 5 Vai Mở Rộng (10 – 14)](#phần-2-new-moon--5-vai)")
    output.append("   - [Phần 3: Characters · 15 Vai Mở Rộng (15 – 29)](#phần-3-characters--15-vai)")
    output.append("   - [Phần 4: The Village & Bài Sự Kiện New Moon (30 – 32)](#phần-4-the-village-và-các-vai-dùng-bài-sự-kiện-new-moon--3-lá)")
    output.append("   - [Phần 5: Mười Hai Lá Biến Thể Việt Hóa (33 – 44)](#phần-5-mười-hai-lá-biến-thể-việt-hóa)")
    output.append("6. [Phụ Lục: Các Vai Mở Rộng Cổ Điển Khác](#6-phụ-lục-các-vai-mở-rộng-cổ-điển-khác)")
    output.append("7. [Gợi Ý Thiết Lập Bàn Chơi Cho Quản Trò (Presets)](#7-gợi-ý-thiết-lập-bàn-chơi-cho-quản-trò-presets)")
    output.append("")
    output.append("---")
    output.append("")
    
    # Section 1
    output.append("## 1. QUY TRÌNH & LUẬT CHƠI CƠ BẢN CHO QUẢN TRÒ")
    output.append("")
    output.append("### 1.1. Chuẩn Bị & Phát Thẻ Bài")
    output.append("- **Xác định sĩ số làng**: Thích hợp từ 8 đến 30+ người chơi.")
    output.append("- **Quy tắc thêm thẻ Kẻ Trộm**: Khi có **Kẻ Trộm (#07)** trong ván chơi, Quản trò **bắt buộc thêm 2 lá Dân Làng thường** vào xấp bài chia, xáo đều và phát cho mỗi người 1 lá úp. **Hai lá còn dư được đặt úp giữa bàn** để Kẻ Trộm xem vào đêm đầu tiên.")
    output.append("- **Bảo mật danh tính**: Người chơi nhận bài, xem bí mật trong yên lặng và úp thẻ bài xuống bàn trước mặt.")
    output.append("")
    output.append("### 1.2. Chu Kỳ Trò Chơi (Ban Đêm & Ban Ngày)")
    output.append("Trò chơi luân phiên tuần hoàn qua 2 giai đoạn chính liên tục cho đến khi xuất hiện phe đạt điều kiện chiến thắng:")
    output.append("")
    output.append("#### 🌙 Giai Đoạn Ban Đêm (Night Phase)")
    output.append("1. **Quản trò hô**: *'Trời tối rồi, tất cả mọi người đi ngủ (nhắm mắt lại, cúi đầu xuống)'*.")
    output.append("2. Quản trò gọi lần lượt từng nhân vật theo **Thứ Tự Thức Dậy (Wake-up Sequence)** chuẩn xác.")
    output.append("3. Các nhân vật thức dậy **hoàn toàn im lặng**, chỉ giao tiếp bằng cử chỉ tay, ánh mắt hoặc gật/lắc đầu với Quản trò.")
    output.append("4. **Thứ tự gọi chuẩn quốc tế**:")
    output.append("   - **Đêm đầu tiên**: Gọi các vai thiết lập (Thiên Thần ngày 0 -> Kẻ Trộm -> Cupid -> Cặp đôi nhận mặt -> Hai Chị Em -> Ba Anh Em -> Anh Em Sói nhận mặt -> Tarzan chọn Thần Tượng -> Sói Lai chọn phe -> Ảnh Tử chọn bản thể -> Thẩm Phán ký hiệu).")
    output.append("   - **Mỗi đêm thường xuyên**: `Nguyệt Nữ -> Kịch Sĩ -> Bảo Vệ -> Tiên Tri -> Cáo -> Cổ Hoặc Sư -> Đàn Ma Sói (Cô Bé lén nhìn, Sói Quỷ nguyền, Sói Trùm cắn thêm, Sói Trắng giết sói) -> Phù Thủy -> Dược Sĩ -> Thổi Sáo -> Những người bị mê hoặc nhận mặt -> Quạ -> Người Digan`.")
    output.append("")
    output.append("#### ☀️ Giai Đoạn Ban Ngày (Day Phase)")
    output.append("1. **Quản trò hô**: *'Trời sáng rồi, tất cả mọi người thức dậy!'*.")
    output.append("2. **Xử lý sự kiện đầu ngày**:")
    output.append("   - Công bố nạn nhân ban đêm (nếu có). Người bị loại lật bài (trừ khi có Người Hầu cướp bài) và rời ván.")
    output.append("   - **Thần Gấu (#18)**: Quản trò kiểm tra 2 người sống ngồi cạnh Thần Gấu, nếu có Sói thì Quản trò gầm lớn `GRỪZZZZZ!`.")
    output.append("   - **Hiệp Sĩ Già (#20)**: Nếu bị Sói cắn đêm qua, con Sói sống gần nhất bên trái bị nhiễm độc chết vào đêm tiếp theo.")
    output.append("   - **Bầu Cảnh Sát Trưởng (#09)**: Vào sáng ngày thứ nhất, làng tiến hành tranh cử và bầu ra Cảnh Sát Trưởng công khai.")
    output.append("3. **Tranh luận công khai**: Cả làng có khoảng 3-5 phút để thảo luận, tra hỏi, thanh minh và tìm kiếm kẻ đáng ngờ.")
    output.append("4. **Biểu quyết treo cổ (Voting)**:")
    output.append("   - Quản trò hô 1, 2, 3: Mọi người đồng thời chỉ tay vào người mình muốn treo cổ.")
    output.append("   - **Phiếu Cảnh Sát Trưởng tính gấp đôi (x2 phiếu)** ngay khi kiểm phiếu.")
    output.append("   - **Quy tắc hòa phiếu (Tie-vote)**:")
    output.append("     + **Theo bộ cơ bản**: Nếu số phiếu cao nhất bị bằng nhau giữa 2 hoặc nhiều người -> **KHÔNG AI BỊ LOẠI** trong ngày hôm đó!")
    output.append("     + **Khi có Oan Nhân (#12)**: Oan Nhân bị đưa lên giàn treo cổ thay thế ngay lập tức. Trước khi chết, Oan Nhân chỉ định ai được quyền bỏ phiếu vào ngày hôm sau.")
    output.append("   - **Xử lý đặc biệt khi bị treo**:")
    output.append("     + **Kẻ Ngốc (#13)**: Lật bài, được làng tha bổng và tiếp tục chơi, nhưng **mất vĩnh viễn quyền bỏ phiếu**.")
    output.append("     + **Người Hầu (#22)**: Trước khi người bị vote lật bài, Người Hầu có thể lật bài mình để lấy lá bài của người đó và nhận vai mới.")
    output.append("     + **Thẩm Phán (#19)**: Có thể dùng ám hiệu bí mật yêu cầu Quản trò mở ngay lượt bỏ phiếu treo thứ hai.")
    output.append("")
    output.append("---")
    output.append("")
    
    # Section 2
    output.append("## 2. ĐIỀU KIỆN THẮNG CỦA CÁC PHE (WIN CONDITIONS)")
    output.append("")
    output.append("| Ký Hiệu | Phe Phái (Team) | Màu Nhận Diện | Điều Kiện Chiến Thắng Chi Tiết (Win Conditions) |")
    output.append("|:---:|:---|:---:|:---|")
    output.append("| **[V]** | **Phe Dân Làng** *(Villagers)* | 🔵 Xanh Dương | **Chiến thắng khi TOÀN BỘ Ma Sói trong làng bị tiêu diệt sạch** (kể cả Sói Lai, Sói Con, Con Hoang hóa sói, Sói Quỷ...). |")
    output.append("| **[W]** | **Phe Ma Sói** *(Werewolves)* | 🔴 Đỏ | **Chiến thắng khi số lượng Ma Sói bằng hoặc nhiều hơn số lượng Dân Làng còn sống**, hoặc tiêu diệt toàn bộ dân làng. |")
    output.append("| **[3]** | **Phe Thứ Ba / Độc Lập** *(Neutral / 3rd Party)* | 🟣 Tím Đậm / Vàng | Có điều kiện thắng độc lập:<br>• **Sói Trắng (#27)**: Thắng khi là người sống sót duy nhất.<br>• **Thổi Sáo (#14)**: Thắng ngay khi toàn bộ người còn sống ngoài Thổi Sáo đều đã bị mê hoặc.<br>• **Cặp đôi khác phe (Cupid)**: Thắng khi chỉ còn 2 người họ sống sót cuối cùng.<br>• **Thiên Thần (#28)**: Thắng ngay nếu bị treo cổ ở lượt vote ngày 1 hoặc bị Sói cắn chết ở Đêm 1.<br>• **Bô Lão (#29)**: Thắng ngay khi toàn bộ người thuộc nhóm đối diện bị loại sạch.<br>• **Thích Khách (#44)**: Thắng khi hoàn thành mục tiêu trả thù. |")
    output.append("| **[?]** | **Phe Biến Đổi / Kế Thừa** *(Variable)* | ⚪ Xám / Đa sắc | Ban đầu thuộc Dân hoặc chưa xác định, sau đó đổi phe theo diễn biến game:<br>• **Kẻ Trộm (#07)**: Theo phe của lá bài mới chọn.<br>• **Tarzan (#23)**: Phe Dân, hóa Sói khi Thần Tượng bị loại.<br>• **Sói Lai (#24)**: Tự chọn cố định làm Dân hoặc Sói vào Đêm 1.<br>• **Bán Sói (#33) / Kẻ Bị Nguyền (#34)**: Phe Dân, hóa Sói khi bị Sói cắn.<br>• **Nạn nhân của Sói Quỷ (#26)**: Hóa Sói, giữ kỹ năng cũ và đổi phe sang thắng cùng Sói.<br>• **Ảnh Tử (#35) / Người Hầu (#22)**: Thừa kế vai và phe của người chết. |")
    output.append("")
    output.append("---")
    output.append("")
    
    # Section 3
    output.append("## 3. QUY CHUẨN THIẾT KẾ THẺ BÀI QUẢN TRÒ (CARD UI STANDARD)")
    output.append("> **Thiết kế theo chuẩn Manager Chuyên Nghiệp:** Thẻ bài trực quan, đồng bộ ảnh chuẩn, hiển thị rõ vai trò và mã phe.")
    output.append("")
    output.append("```text")
    output.append("+-----------------------------------------+")
    output.append("|  [TÊN NHÂN VẬT - VIETNAMESE / ENGLISH]  | <- Header vai trò & phân loại")
    output.append("+-----------------------------------------+")
    output.append("|                                         |")
    output.append("|           [HÌNH ẢNH LÁ BÀI]             | <- Ảnh lá bài chuẩn từ thư mục images/cards/")
    output.append("|                                         |")
    output.append("+-----------------------------------------+")
    output.append("|  - Phe và thời điểm: [Dân/Sói/3/Biến đổi] | <- THÔNG TIN TỐI QUAN TRỌNG ĐỂ CODE LOGIC")
    output.append("|  - Chức năng: [Tóm tắt kỹ năng]          |")
    output.append("|                                    [V]  | <- Badge mã phe [V], [W], [3], [?]")
    output.append("+-----------------------------------------+")
    output.append("```")
    output.append("")
    output.append("---")
    output.append("")
    
    # Section 4: Wake-up sequence tables
    output.append("## 4. BẢNG THỨ TỰ THỨC DẬY BAN ĐÊM & KÍCH HOẠT SỰ KIỆN")
    output.append("Để điều hành ván chơi mượt mà và lập trình logic game không bị xung đột, Quản trò tuân thủ nghiêm ngặt 3 bảng thứ tự thời điểm dưới đây:")
    output.append("")
    output.append("### 4.1. Giai Đoạn A: Đêm Đầu Tiên Duy Nhất (First Night Setup)")
    output.append("*Các vai này chỉ được gọi DUY NHẤT một lần vào đêm đầu tiên để thiết lập liên kết ban đầu:*")
    output.append("")
    output.append("| Thứ Tự | Nhân Vật | Mã Phe | Thời Điểm | Hành Động Của Quản Trò & Người Chơi |")
    output.append("|:---:|:---|:---:|:---|:---|")
    output.append("| **0.1** | **Thiên Thần (#28)** | `3` | Ban ngày trước Đêm 1 | Tranh luận và biểu quyết trước đêm 1. Nếu bị loại hoặc bị cắn đêm 1 -> Thắng ngay. |")
    output.append("| **0.3** | **Kẻ Trộm (#07)** | `?` | Đầu đêm 1 duy nhất | Thức dậy xem 2 lá bài thừa ngoài cuộc. Bắt buộc đổi bài khi cả hai lá đều là Sói. |")
    output.append("| **1.0** | **Cupid (#06)** | `V` | Đêm 1 duy nhất | Thức dậy chọn 2 người làm cặp đôi yêu nhau. Quản trò chạm vai 2 người. |")
    output.append("| **1.1** | **Cặp Đôi (Lovers)** | `V/3` | Đêm 1 (sau Cupid) | Hai người được ghép đôi thức dậy nhận diện nhau, giữ kín lá nhân vật. |")
    output.append("| **1.2** | **Hai Chị Em (#15)** | `V` | Đêm 1 duy nhất | Thức dậy cùng nhau để nhận diện đồng đội phe Dân. |")
    output.append("| **1.3** | **Ba Anh Em (#16)** | `V` | Đêm 1 duy nhất | Thức dậy cùng nhau để nhận diện đồng đội phe Dân. |")
    output.append("| **1.4** | **Anh Em Sói (#36, #37)** | `W` | Đêm 1 duy nhất | Sói Anh và Sói Em thức dậy nhận mặt nhau. Sau đó Sói Em ngủ tiếp cho đến khi Sói Anh chết. |")
    output.append("| **1.5** | **Tarzan / Con Hoang (#23)** | `?` | Đêm 1 duy nhất | Thức dậy chọn 1 người làm Thần Tượng. Khi Thần Tượng chết, Tarzan hóa Sói từ đêm sau. |")
    output.append("| **1.6** | **Sói Lai (#24)** | `?` | Đêm 1 duy nhất | Thức dậy chọn cố định làm Dân Làng hoặc Ma Sói cho đến hết ván. |")
    output.append("| **1.7** | **Ảnh Tử (#35)** | `?` | Đêm 1 duy nhất | Thức dậy bí mật chọn 1 người làm bản thể (khi người đó chết sẽ lấy bài thừa kế vai). |")
    output.append("| **1.8** | **Kẻ Báo Thù (#43)** | `?` | Đêm 1 duy nhất | Thức dậy chọn phe Dân hoặc Sói. |")
    output.append("| **1.9** | **Thẩm Phán (#19)** | `V` | Đêm 1 duy nhất | Thức dậy thống nhất một ám hiệu bí mật với Quản trò để kích hoạt vote lần 2. |")
    output.append("")
    output.append("### 4.2. Giai Đoạn B: Ban Đêm Thường Xuyên (Regular Night Loop)")
    output.append("*Trình tự chuẩn mực lặp lại mỗi đêm (bỏ qua các vai vắng mặt hoặc đã chết):*")
    output.append("")
    output.append("| Thứ Tự | Nhân Vật | Mã Phe | Tần Suất | Hành Động Của Quản Trò & Người Chơi |")
    output.append("|:---:|:---|:---:|:---|:---|")
    output.append("| **2.0** | **Nguyệt Nữ (#40)** | `V` | Đầu mỗi đêm | Chọn 1 người để phong ấn kỹ năng ban đêm (không chọn trùng người 2 đêm liên tiếp). |")
    output.append("| **2.5** | **Kịch Sĩ (#21)** | `V` | Mỗi đêm (khi còn bài) | Chọn 1 trong số lá bài phụ để mượn kỹ năng đến đêm tiếp theo. |")
    output.append("| **3.0** | **Bảo Vệ (#10)** | `V` | Mỗi đêm | Chọn 1 người bảo vệ khỏi cú cắn của Sói (không chọn trùng người 2 đêm liên tiếp). |")
    output.append("| **4.0** | **Tiên Tri (#03)** | `V` | Mỗi đêm (trước Sói) | Chọn 1 người. Quản trò cho xem bí mật TOÀN BỘ lá bài của người đó. |")
    output.append("| **4.5** | **Cáo (#17)** | `V` | Mỗi đêm (khi còn quyền) | Chọn nhóm 3 người ngồi liền kề. Nếu có Sói -> Giữ kỹ năng. Không có Sói -> Mất vĩnh viễn. |")
    output.append("| **4.8** | **Cổ Hoặc Sư (#39)** | `?` | Mỗi đêm | Chọn 1 người thế mạng nếu đêm nay mình chết. |")
    output.append("| **5.0** | **Đàn Ma Sói (#02)** | `W` | Mỗi đêm | Cả đàn Sói thức dậy thống nhất cắn 1 người. **Cô Bé Ti Hí (#08)** có thể lén hé mắt nhìn. |")
    output.append("| **5.2** | **Sói Quỷ (#26)** | `W` | Mỗi đêm (sau đàn Sói) | 1 lần mỗi ván: Biến nạn nhân vừa bị Sói cắn thành Ma Sói (nạn nhân giữ kỹ năng cũ). |")
    output.append("| **5.4** | **Sói Trùm (#25)** | `W` | Mỗi đêm (sau đàn Sói) | Khi chưa có con Sói nào chết, thức riêng cắn thêm 1 nạn nhân ngoài đàn. |")
    output.append("| **5.6** | **Sói Trắng (#27)** | `3` | Cách 1 đêm (từ Đêm 2) | Thức dậy riêng sau đàn Sói để chọn giết 1 con Sói khác. Thắng khi là người sống sót duy nhất. |")
    output.append("| **5.8** | **Sói Lửa (#38)** | `W` | Sau khi có Sói chết | Đêm tiếp theo được chọn 1 người để tước kỹ năng vĩnh viễn. |")
    output.append("| **6.0** | **Phù Thủy (#04)** | `V` | Mỗi đêm (sau đàn Sói) | Quản trò báo nạn nhân bị Sói cắn. Phù Thủy chọn dùng bình cứu và/hoặc bình độc (mỗi bình 1 liều). |")
    output.append("| **6.5** | **Dược Sĩ (#41)** | `V` | Mỗi đêm | Dùng bình Mê Hồn (cấm nói/vote 1 ngày) hoặc Hồi Phục (hồi bình cứu cho Phù Thủy). |")
    output.append("| **7.0** | **Thổi Sáo (#14)** | `3` | Mỗi đêm (sau Phù Thủy) | Chọn mê hoặc 2 người. Sau đó tất cả người bị mê hoặc thức dậy nhận mặt nhau rồi ngủ. |")
    output.append("| **8.0** | **Quạ (#30)** | `V` | Cuối mỗi đêm | Chọn đặt dấu tố cáo trước nhà 1 người (người này nhận sẵn 2 phiếu phạt vào sáng hôm sau). |")
    output.append("| **8.5** | **Người Digan (#31)** | `V` | Mỗi đêm | Chọn có dùng lá Gọi Hồn không, chọn câu hỏi và chỉ định người đọc vào sáng hôm sau. |")
    output.append("")
    output.append("### 4.3. Giai Đoạn C: Ban Ngày & Kỹ Năng Kích Hoạt Sự Kiện")
    output.append("*Các kỹ năng kích hoạt theo thời điểm ban ngày hoặc sự kiện đặc thù:*")
    output.append("")
    output.append("| STT | Nhân Vật | Mã Phe | Thời Điểm Kích Hoạt | Cơ Chế Thực Thi |")
    output.append("|:---:|:---|:---:|:---|:---|")
    output.append("| **9.0** | **Thần Gấu (#18)** | `V` | Mỗi buổi sáng sớm | Quản trò kiểm tra 2 người sống ngồi cạnh. Nếu có ít nhất 1 Sói -> Quản trò gầm lớn `GRỪZZZZZ!`. |")
    output.append("| **9.1** | **Hiệp Sĩ Già (#20)** | `V` | Khi bị Sói cắn chết | Con Sói sống gần nhất về bên trái bị nhiễm độc, sống thêm 1 ngày và chết vào đêm tiếp theo. |")
    output.append("| **9.2** | **Cảnh Sát Trưởng (#09)** | `V` | Sáng ngày thứ nhất | Làng bầu cử công khai. Giữ thẻ chức vụ song song thẻ vai. Phiếu tính x2. Chết chỉ định người kế vị. |")
    output.append("| **9.3** | **Kỵ Sĩ (#42)** | `V` | Ban ngày trước khi vote | Lật bài thách đấu 1 người. Trúng Sói -> Sói chết ngay, hết ngày. Sai -> Kỵ Sĩ chết sáng hôm sau. |")
    output.append("| **9.4** | **Thẩm Phán (#19)** | `V` | Trong lúc bỏ phiếu | Dùng ám hiệu bí mật yêu cầu Quản trò mở ngay lượt bỏ phiếu treo thứ 2 không qua tranh luận. |")
    output.append("| **9.5** | **Người Hầu (#22)** | `?` | Khi có người bị treo | Trước khi nạn nhân lật bài, lật bài mình để lấy bài người đó và nhận vai trò mới. |")
    output.append("| **9.6** | **Oan Nhân (#12)** | `V` | Khi phiếu biểu quyết hòa | Bị đưa lên giàn treo thay thế. Trước khi chết chỉ định ai được quyền bỏ phiếu vào ngày hôm sau. |")
    output.append("| **9.7** | **Kẻ Ngốc (#13)** | `V` | Khi bị bỏ phiếu treo | Lật bài công khai, được tha bổng nhưng mất vĩnh viễn quyền bỏ phiếu đến hết ván. |")
    output.append("| **9.8** | **Thợ Săn (#05)** | `V` | Khi chết (cắn/treo/cặp) | Lập tức chỉ tay bắn chết 1 người trước khi rời ván. |")
    output.append("| **9.9** | **Già Làng (#11)** | `V` | Bị động khi bị tấn công | Sống qua cú cắn đầu của Sói. Nếu bị Dân treo / Phù Thủy độc / Thợ Săn bắn -> Làng mất sạch kỹ năng! |")
    output.append("")
    output.append("---")
    output.append("")
    
    # Section 5: Detailed 44 roles
    output.append("## 5. DANH SÁCH CHI TIẾT 44 NHÂN VẬT CHUẨN THEO 5 PHẦN")
    output.append("")
    
    current_part = ""
    for r in roles:
        num = r["num"]
        title = r["raw_title"]
        body = r["body"]
        
        img = IMAGE_MAPPING.get(num, "nhan_vat_ma_soi.jpg")
        team_code = ROLE_TEAM_CODES.get(num, "V")
        team_name = ROLE_TEAM_NAMES.get(team_code, "Phe Dân Làng")
        expansion = ROLE_EXPANSIONS.get(num, "Ma Sói")
        en_name = ROLE_EN_NAMES.get(num, title)
        wake_rank, wake_freq, wake_action = WAKE_DATA.get(num, ("99", "Không thức", ""))
        gm_call = GM_CALLS.get(num, "Quản trò điều hành theo kịch bản chuẩn.")
        
        int_num = int(num)
        if int_num == 1 and current_part != "part1":
            current_part = "part1"
            output.append("### Phần 1: Bộ Cơ Bản · 9 Lá và Chức Vụ")
            output.append("*Nguồn đối chiếu chính thức: The Werewolves of Miller's Hollow (tr. 3–9 và 12–18) & The Pact (tr. 8–12).*")
            output.append("")
        elif int_num == 10 and current_part != "part2":
            current_part = "part2"
            output.append("### Phần 2: New Moon · 5 Vai")
            output.append("*Nguồn đối chiếu chính thức: New Moon (tr. 23–28) & The Pact (tr. 10–15).*")
            output.append("")
        elif int_num == 15 and current_part != "part3":
            current_part = "part3"
            output.append("### Phần 3: Characters · 15 Vai")
            output.append("*Nguồn đối chiếu chính thức: Characters (tr. 4–21 và 28–31) & The Pact (tr. 8 và 11–15).*")
            output.append("")
        elif int_num == 30 and current_part != "part4":
            current_part = "part4"
            output.append("### Phần 4: The Village và các vai dùng bài sự kiện New Moon · 3 Lá")
            output.append("*Nguồn đối chiếu chính thức: The Village & Characters (tr. 26–27) & The Pact (tr. 19 và 23).*")
            output.append("")
        elif int_num == 33 and current_part != "part5":
            current_part = "part5"
            output.append("### Phần 5: Mười Hai Lá Biến Thể Việt Hóa")
            output.append("*Khi chơi thuần luật gốc quốc tế, để riêng 12 lá này. Khi chơi bàn mở rộng Việt hóa (Characters Plus / Luật Boardgame Đà Nẵng), áp dụng luật chi tiết dưới đây:*")
            output.append("")
            
        output.append(f"### {num}. {title}")
        output.append("")
        output.append("| Thuộc Tính | Chi Tiết Nhân Vật |")
        output.append("|:---|:---|")
        output.append(f"| **Tên Tiếng Việt** | **{title.split('—')[0].strip()}** |")
        output.append(f"| **Tên Tiếng Anh** | *{en_name}* |")
        output.append(f"| **Thuộc Bộ Mở Rộng** | {expansion} |")
        output.append(f"| **Phe Phái (Team)** | `{team_code}` **{team_name}** |")
        output.append(f"| **Thứ Tự Thức Dậy** | **#{wake_rank}** ({wake_freq}) |")
        output.append(f"| **Thời Điểm Gọi (Timing)** | **{wake_action}** |")
        output.append("")
        output.append("> **Thẻ bài Quản trò mô phỏng**:")
        output.append("> ```text")
        output.append(f"> +-----------------------------------------+")
        output.append(f"> |  {num}. {title.upper()[:37]:<37} |")
        output.append(f"> +-----------------------------------------+")
        output.append(f"> |  [Hình ảnh: images/cards/{img}]")
        output.append(f"> +-----------------------------------------+")
        summary_line = wake_action[:36]
        output.append(f"> |  {summary_line:<37} |")
        output.append(f"> |                                    [{team_code}]  |")
        output.append(f"> +-----------------------------------------+")
        output.append("> ```")
        output.append("")
        output.append(f"![{title}](images/cards/{img})")
        output.append("")
        output.append("#### 📜 Quy Tắc & Cơ Chế Hoạt Động (Chuẩn Sách Luật):")
        output.append(clean_body_bullets(body))
        output.append("")
        output.append("#### 📢 Lời Gọi Quản Trò (GM Call Script):")
        output.append(f"> *\"{gm_call}\"*")
        output.append("")
        output.append("---")
        output.append("")
        
    # Section 6: Extra Classic Roles (Appendix)
    output.append("## 6. PHỤ LỤC: CÁC VAI MỞ RỘNG CỔ ĐIỂN KHÁC")
    output.append("Dưới đây là một số lá bài có trong các bộ sưu tập mở rộng khác mà Quản trò có thể gặp:")
    output.append("")
    output.append("### 45. Sói Con — Wolf Cub")
    output.append("- **Phe và thời điểm.** Phe Sói. Thức cùng đàn mỗi đêm.")
    output.append("- **Chức năng.** Khi Sói Con bị loại (bị làng treo hoặc trúng độc/bắn), đêm tiếp theo bầy Sói được cắn **hai người** thay vì một.")
    output.append("")
    output.append("### 46. Kẻ Đốt Nhà — Pyromaniac (The Village)")
    output.append("- **Phe và thời điểm.** Phe Dân / Trung lập. Thức mỗi đêm.")
    output.append("- **Chức năng.** Chọn đốt một tòa nhà. Nếu tòa nhà đó là nơi nạn nhân của Sói đang ở, Sói bị khói xua đuổi và nạn nhân sống sót; người chủ nhà trở thành vô gia cư.")
    output.append("")
    output.append("### 47. Người Múa Rối — Puppeteer")
    output.append("- **Phe và thời điểm.** Phe Dân. Dùng một lần trong ván.")
    output.append("- **Chức năng.** Thao túng đàn Sói phải ăn thịt chính người do Người Múa Rối chỉ định.")
    output.append("")
    output.append("---")
    output.append("")
    
    # Section 7: Presets
    output.append("## 7. GỢI Ý THIẾT LẬP BÀN CHƠI CHO QUẢN TRÒ (PRESETS)")
    output.append("")
    output.append("### Bàn Cơ Bản (8 – 10 Người Chơi) — Tân Thủ")
    output.append("- 2 Ma Sói (`#02`)")
    output.append("- 1 Tiên Tri (`#03`)")
    output.append("- 1 Bảo Vệ (`#10`)")
    output.append("- 1 Phù Thủy (`#04`)")
    output.append("- 1 Thợ Săn (`#05`)")
    output.append("- 3–4 Dân Làng (`#01`)")
    output.append("- *Bầu 1 Cảnh Sát Trưởng (`#09`) vào sáng ngày 1*.")
    output.append("")
    output.append("### Bàn Trăng Non Cân Não (11 – 14 Người Chơi)")
    output.append("- 3 Ma Sói (`#02`)")
    output.append("- 1 Tiên Tri (`#03`)")
    output.append("- 1 Bảo Vệ (`#10`)")
    output.append("- 1 Phù Thủy (`#04`)")
    output.append("- 1 Thợ Săn (`#05`)")
    output.append("- 1 Già Làng (`#11`)")
    output.append("- 1 Oan Nhân (`#12`)")
    output.append("- 1 Thổi Sáo (`#14` - Phe thứ 3)")
    output.append("- 3–4 Dân Làng (`#01`)")
    output.append("")
    output.append("### Bàn Đại Chiến Characters (15 – 20+ Người Chơi)")
    output.append("- 1 Sói Quỷ (`#26`), 1 Sói Trùm (`#25`), 1 Sói Trắng (`#27`), 1 Ma Sói thường (`#02`)")
    output.append("- 1 Tiên Tri (`#03`), 1 Cáo (`#17`), 1 Thần Gấu (`#18`)")
    output.append("- 1 Bảo Vệ (`#10`), 1 Phù Thủy (`#04`), 1 Thợ Săn (`#05`), 1 Hiệp Sĩ Già (`#20`)")
    output.append("- 1 Thẩm Phán (`#19`), 1 Người Hầu (`#22`), 1 Tarzan (`#23`)")
    output.append("- 1 Hai Chị Em (`#15` - 2 lá) hoặc Ba Anh Em (`#16` - 3 lá)")
    output.append("- Dân Làng bổ sung.")
    output.append("")
    output.append("---")
    output.append("*Tài liệu được cập nhật và kiểm duyệt toàn diện theo bộ luật gốc quốc tế và danh mục 44 lá bài thực tế.*")
    
    with open(OUTPUT_RULES_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(output))
    
    print(f"Successfully generated {OUTPUT_RULES_PATH} ({len(output)} lines).")

if __name__ == "__main__":
    build_full_rules()
