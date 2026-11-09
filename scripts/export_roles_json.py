#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from scripts.generate_docs import CHARACTERS_DATA
import json

roles = []
for c in CHARACTERS_DATA:
    color_map = {
        'V': {'bg': '#1e3a8a', 'border': '#3b82f6', 'banner': '#2563eb', 'text': '#93c5fd'},
        'W': {'bg': '#7f1d1d', 'border': '#ef4444', 'banner': '#dc2626', 'text': '#fca5a5'},
        '3': {'bg': '#581c87', 'border': '#a855f7', 'banner': '#9333ea', 'text': '#d8b4fe'},
        '?': {'bg': '#1f2937', 'border': '#6b7280', 'banner': '#4b5563', 'text': '#d1d5db'}
    }
    
    if c['id'] in ['seer', 'tien-tri']:
        color_map_item = {'bg': '#3b1c71', 'border': '#7c3aed', 'banner': '#6d28d9', 'text': '#c4b5fd'}
    elif c['id'] in ['phu-thuy']:
        color_map_item = {'bg': '#581c87', 'border': '#c084fc', 'banner': '#a855f7', 'text': '#f3e8ff'}
    elif c['id'] in ['bao-ve']:
        color_map_item = {'bg': '#0f766e', 'border': '#14b8a6', 'banner': '#0d9488', 'text': '#99f6e4'}
    elif c['id'] in ['cupid']:
        color_map_item = {'bg': '#831843', 'border': '#f43f5e', 'banner': '#e11d48', 'text': '#fecdd3'}
    elif c['id'] in ['tho-san']:
        color_map_item = {'bg': '#78350f', 'border': '#f59e0b', 'banner': '#d97706', 'text': '#fde68a'}
    else:
        color_map_item = color_map.get(c['team_code'], color_map['V'])

    role_item = {
        'id': c['id'],
        'name': c['name'],
        'enName': c['en_name'],
        'expansion': c['expansion'],
        'team': c['team'],
        'teamCode': c['team_code'],
        'wakeOrder': c['wake_order'],
        'wakeTime': c['wake_time'],
        'shortDesc': c['short_desc'],
        'fullDesc': c['full_desc'],
        'gmCall': c['gm_call'],
        'notes': c['notes'],
        'image': f'/cards/{c["image_file"]}',
        'colors': color_map_item
    }
    roles.append(role_item)

output_code = f"// Auto-generated roles list from thuthuatchoi.com\nexport const ROLES = {json.dumps(roles, ensure_ascii=False, indent=2)};\n\n"

presets = [
  {
    "id": "preset-6-8",
    "name": "Cơ Bản (6 - 8 Người)",
    "desc": "Ván chơi tiêu chuẩn nhẹ nhàng, làm quen luật cho nhóm nhỏ",
    "playerCount": 8,
    "roleIds": ["soi-thuong", "soi-thuong", "tien-tri", "bao-ve", "phu-thuy", "dan-lang", "dan-lang", "dan-lang"]
  },
  {
    "id": "preset-9-11",
    "name": "Mở Rộng Kịch Tính (9 - 11 Người)",
    "desc": "Cân bằng hoàn hảo với Thợ Săn, Cupid và Sói Con",
    "playerCount": 10,
    "roleIds": ["soi-thuong", "soi-thuong", "soi-con", "tien-tri", "bao-ve", "phu-thuy", "tho-san", "cupid", "dan-lang", "dan-lang"]
  },
  {
    "id": "preset-12-15",
    "name": "Đại Chiến Ngôi Làng (12 - 15 Người)",
    "desc": "Đầy đủ các phe với Sói Trắng, Người Thổi Sáo và Già Làng",
    "playerCount": 13,
    "roleIds": ["soi-thuong", "soi-thuong", "soi-lon-xau-xa", "soi-trang", "tien-tri", "bao-ve", "phu-thuy", "tho-san", "cupid", "gia-lang", "thang-ngoc", "nguoi-thoi-sao", "dan-lang"]
  }
]

output_code += f"export const PRESETS = {json.dumps(presets, ensure_ascii=False, indent=2)};\n"

with open('src/data/roles.js', 'w', encoding='utf-8') as f:
    f.write(output_code)

print(f"Generated src/data/roles.js with {len(roles)} roles.")
