#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full crawler and markdown generator for docs/game-rules.md
"""

import os
import re
import html
import urllib.request
import ssl
from html.parser import HTMLParser

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def fetch_html():
    if os.path.exists('raw_page.html'):
        with open('raw_page.html', 'r', encoding='utf-8') as f:
            return f.read()
    url = 'https://thuthuatchoi.com/tong-hop-nhan-vat-trong-ma-soi-co-ban-va-cac-ban-mo-rong.html'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        with open('raw_page.html', 'w', encoding='utf-8') as f:
            f.write(content)
        return content

def download_image(url, target_path):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        return True
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            data = resp.read()
            with open(target_path, 'wb') as f:
                f.write(data)
            return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False

def slugify(s):
    s = s.lower().strip()
    s = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', s)
    s = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', s)
    s = re.sub(r'[ìíịỉĩ]', 'i', s)
    s = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', s)
    s = re.sub(r'[ùúụủũưừứựửữ]', 'u', s)
    s = re.sub(r'[ỳýỵỷỹ]', 'y', s)
    s = re.sub(r'[đ]', 'd', s)
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

class DocExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []
        self.cur_tag = None
        self.cur_text = []

    def handle_starttag(self, tag, attrs):
        self.cur_tag = tag
        attrs_dict = dict(attrs)
        if tag in ["h1", "h2", "h3", "h4", "h5", "p", "li"]:
            self.cur_text = []
        elif tag == "img":
            src = attrs_dict.get("data-srcset") or attrs_dict.get("src", "")
            alt = attrs_dict.get("alt", "")
            if src and "loading-img" not in src:
                self.elements.append({"type": "img", "src": src, "alt": alt})

    def handle_endtag(self, tag):
        if tag in ["h1", "h2", "h3", "h4", "h5", "p", "li"]:
            txt = " ".join("".join(self.cur_text).split())
            txt = html.unescape(txt).strip()
            if txt:
                self.elements.append({"type": tag, "text": txt})
            self.cur_tag = None
            self.cur_text = []

    def handle_data(self, data):
        if self.cur_tag:
            self.cur_text.append(data)

def extract_sections(raw_html):
    part_boundaries = [
        (58278, "Phần 1: Nhân vật trong Ma Sói Cơ Bản", "The Werewolves of Millers Hollow"),
        (75761, "Phần 2: Nhân vật trong Ma Sói New Moon", "New Moon Expansion"),
        (83201, "Phần 3: Nhân vật trong Ma Sói The Village", "The Village Expansion"),
        (88614, "Phần 4: Nhân vật trong Ma Sói Characters", "Characters Expansion"),
        (109311, "Phần 5: Nhân vật Ma Sói Character Plus", "Character Plus Expansion"),
        (126190, "END", "")
    ]
    sections = []
    for i in range(len(part_boundaries) - 1):
        p_start, p_title, p_en = part_boundaries[i]
        p_end, _, _ = part_boundaries[i+1]
        chunk = raw_html[p_start:p_end]
        parser = DocExtractor()
        parser.feed(chunk)
        sections.append({
            "part_no": i + 1,
            "title": p_title,
            "en_title": p_en,
            "elements": parser.elements
        })
    return sections

def process_characters(sections):
    cards_dir = 'docs/images/cards'
    os.makedirs(cards_dir, exist_ok=True)
    all_data = []

    # Known team mapping helpers
    wolf_keywords = ['sói', 'wolf', 'anh em sói', 'sát thủ', 'sói lửa']
    neutral_keywords = ['thổi sáo', 'thành viên giáo phái', 'thiên sứ', 'người thổi sáo', 'sói trắng']

    for sec in sections:
        part_no = sec["part_no"]
        current_faction = "Chưa phân loại"
        current_char = None
        characters = []

        for el in sec["elements"]:
            txt = el.get("text", "")
            # check faction headers in Part 1
            if el["type"] == "h3" and re.match(r'^\d+\.\s*Phe', txt):
                current_faction = txt
                continue

            if el["type"] in ["h3", "h4"]:
                # skip "Xem thêm" or non-character titles
                if any(k in txt.lower() for k in ["xem thêm", "bình luận", "hướng dẫn cách chơi", "gợi ý"]):
                    continue
                
                # Check if this is a character title
                if current_char:
                    characters.append(current_char)

                # Determine team
                name_lower = txt.lower()
                if "phe sói" in current_faction.lower():
                    team = "Phe Sói"
                    team_code = "W"
                elif "phe thứ 3" in current_faction.lower():
                    team = "Phe Thứ 3"
                    team_code = "3"
                elif "phe dân" in current_faction.lower():
                    team = "Phe Dân Làng"
                    team_code = "V"
                else:
                    # Guess based on name
                    if any(w in name_lower for w in ['sói', 'kẻ đốt nhà']):
                        if 'sói trắng' in name_lower:
                            team = "Phe Thứ 3"
                            team_code = "3"
                        elif any(w in name_lower for w in ['nửa người', 'chó sói', 'bán sói', 'đứa trẻ']):
                            team = "Biến Đổi / Đổi Phe"
                            team_code = "?"
                        else:
                            team = "Phe Sói"
                            team_code = "W"
                    elif any(w in name_lower for w in ['thổi sáo', 'thành viên giáo phái', 'thiên sứ']):
                        team = "Phe Thứ 3 / Độc Lập"
                        team_code = "3"
                    elif any(w in name_lower for w in ['kẻ báo thù', 'ảnh tử', 'diễn viên', 'ăn trộm']):
                        team = "Tùy Chọn / Biến Đổi"
                        team_code = "?"
                    else:
                        team = "Phe Dân Làng"
                        team_code = "V"

                current_char = {
                    "part_no": part_no,
                    "part_name": sec["title"],
                    "name": txt,
                    "team": team,
                    "team_code": team_code,
                    "image_url": "",
                    "local_image": "",
                    "paragraphs": [],
                    "notes": []
                }
            elif el["type"] == "img" and current_char:
                src = el["src"]
                filename = os.path.basename(src)
                if not filename or len(filename) < 4:
                    filename = f"{slugify(current_char['name'])}.png"
                local_path = os.path.join(cards_dir, filename)
                download_image(src, local_path)
                current_char["image_url"] = src
                current_char["local_image"] = f"images/cards/{filename}"
            elif el["type"] in ["p", "li"] and current_char:
                if txt.startswith("Lưu ý:") or txt.startswith("-"):
                    current_char["notes"].append(txt)
                elif "xem thêm" not in txt.lower():
                    current_char["paragraphs"].append(txt)

        if current_char:
            characters.append(current_char)

        all_data.append({
            "section": sec,
            "characters": characters
        })

    return all_data

if __name__ == '__main__':
    html_content = fetch_html()
    secs = extract_sections(html_content)
    parsed = process_characters(secs)
    print("Processed parts:")
    for p in parsed:
        print(f"- {p['section']['title']}: {len(p['characters'])} characters")
