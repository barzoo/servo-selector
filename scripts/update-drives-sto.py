#!/usr/bin/env python3
"""
更新 drives.json，添加 STO 安全功能产品变体
- 修正现有产品 model（T0T0 -> NNNN）
- 添加带 STO 的新产品（T0T0）
"""

import json

# 读取现有数据
with open('src/data/drives.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 获取现有驱动器列表
existing_drives = data['drives']

# 创建新的驱动器列表
new_drives = []

for drive in existing_drives:
    # 修正现有产品：将 model 中的 T0T0 改为 NNNN（第6-7位）
    original_model = drive['model']
    fixed_model = original_model.replace('T0T0', 'NNNN')

    # 修正后的现有产品（无 STO）
    fixed_drive = {
        **drive,
        'model': fixed_model
    }
    new_drives.append(fixed_drive)

    # 创建带 STO 的新产品
    sto_drive = {
        **drive,
        'id': drive['id'] + '-sto',
        'model': original_model,  # 原始 model 已经是 T0T0
        'options': {
            **drive['options'],
            'safety': {'code': 'T0'}
        }
    }
    new_drives.append(sto_drive)

# 更新数据
updated_data = {
    '_metadata': {
        **data['_metadata'],
        'driveCount': len(new_drives),
        'version': '1.1.0',
        'generatedAt': '2026-03-01T12:00:00.000Z'
    },
    'drives': new_drives
}

# 写入文件
with open('src/data/drives.json', 'w', encoding='utf-8') as f:
    json.dump(updated_data, f, ensure_ascii=False, indent=2)

print(f"Total drives: {len(new_drives)}")
print(f"NN products: {len([d for d in new_drives if d['options']['safety']['code'] == 'NN'])}")
print(f"T0 products: {len([d for d in new_drives if d['options']['safety']['code'] == 'T0'])}")
print("\nDone!")
