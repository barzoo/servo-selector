# 伺服选型程序重构设计文档

**日期**: 2026-03-01
**主题**: 基于MC20/XC20完整产品数据的选型程序重构
**版本**: 1.0

---

## 1. 设计概述

### 1.1 背景

基于最新的MC20伺服电机和XC20伺服驱动器产品数据，重新构建选型程序的设计。产品数据包含：

- **MC20电机**: 27种型号，功率范围0.2-7.5kW，法兰尺寸60-180mm
- **XC20驱动器**: 6种型号(W0005-W0050)，电流范围1.5-16A
- **完整选配件**: 刹车、编码器类型(A/B型)、键槽、电缆系统

### 1.2 设计目标

1. 支持完整的电机/驱动/电缆配置选项
2. 根据机械参数计算负载惯量，支持用户选择惯量比目标
3. 自动生成完整的产品订货号
4. 保持5步向导流程，在Step 5集中进行系统配置

---

## 2. 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        选型向导 (Wizard)                          │
├─────────┬─────────┬─────────┬─────────┬─────────────────────────┤
│ Step 1  │ Step 2  │ Step 3  │ Step 4  │        Step 5           │
│ 项目信息 │ 机械参数 │ 运动参数 │ 工况条件 │      系统配置            │
└─────────┴─────────┴─────────┴─────────┴─────────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
              ┌─────▼─────┐            ┌──────▼──────┐          ┌──────▼──────┐
              │ 电机选项区 │            │ 驱动器选项区 │          │ 电缆配置区   │
              │           │            │             │          │             │
              │ • 电机列表 │            │ • 通讯协议  │          │ • 动力电缆   │
              │ • 刹车    │            │ • 面板选项  │          │ • 编码器电缆 │
              │ • 编码器  │            │ • 安全功能  │          │ • 通讯电缆   │
              │ • 键槽    │            │             │          │             │
              └───────────┘            └─────────────┘          └─────────────┘
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              │
                                        ┌─────▼─────┐
                                        │  配件区域  │
                                        │           │
                                        │ • EMC滤波 │
                                        │ • 制动电阻 │
                                        └───────────┘
```

---

## 3. 数据模型

### 3.1 选型输入扩展

```typescript
interface SizingInput {
  project: ProjectInfo;
  mechanism: MechanismConfig;
  motion: MotionParams;
  duty: DutyConditions;
  preferences: SystemPreferences;
  // 新增: Step 5 用户选择
  selections: {
    motorId: string;           // 选中的电机ID
    motorOptions: {
      brake: boolean;          // 是否带刹车
      encoderType: 'A' | 'B';  // A型(电池盒式) / B型(机械式)
      keyShaft: boolean;       // 是否带键槽
    };
    driveOptions: {
      communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
      panel: 'WITH_DISPLAY' | 'WITHOUT_DISPLAY';
      safety: 'STO' | 'NONE';
    };
    cables: {
      motorLength: 3 | 5 | 10 | 15 | 20 | 25 | 30;
      encoderLength: 3 | 5 | 10 | 15 | 20 | 25 | 30;
      commLength?: 3 | 5 | 10 | 15 | 20 | 25 | 30;  // 非模拟量时
    };
    accessories: {
      emcFilter: 'NONE' | 'C3';
      brakeResistorOverride?: string;  // 手动覆盖制动电阻型号
    };
  };
}
```

### 3.2 惯量匹配配置

```typescript
interface InertiaMatchingConfig {
  // 用户可选择的惯量比目标
  targetRatio: number;

  // 建议值选项
  recommendedOptions: Array<{
    ratio: number;
    label: string;
    description: string;
    recommendedFor: string[];
  }>;
}

// 惯量匹配建议选项
const INERTIA_RATIO_OPTIONS = [
  {
    ratio: 3,
    label: '高性能 (3:1)',
    description: '最佳动态响应，适合高精度定位应用',
    recommendedFor: ['半导体', '电子制造', '精密加工']
  },
  {
    ratio: 5,
    label: '平衡型 (5:1)',
    description: '性能与成本的平衡，适合大多数应用',
    recommendedFor: ['包装机械', '机床', '一般自动化']
  },
  {
    ratio: 10,
    label: '经济型 (10:1)',
    description: '最大推荐惯量比，适合成本敏感应用',
    recommendedFor: ['输送线', '简单定位', '低成本方案']
  },
  {
    ratio: 30,
    label: '极限型 (30:1)',
    description: '系统允许的最大惯量比，需评估动态性能',
    recommendedFor: ['大惯量负载', '低速应用']
  }
];
```

---

## 4. 选型逻辑

### 4.1 电机筛选逻辑

```typescript
class MotorFilter {
  filter(mechanical: MechanicalResult, preferences: SystemPreferences): MotorRecommendation[] {
    const requiredTorque = mechanical.torques.rms * preferences.safetyFactor;
    const requiredPeakTorque = mechanical.torques.peak * preferences.safetyFactor;
    const requiredSpeed = mechanical.speeds.max * 1.1;

    // 用户选择的目标惯量比
    const targetInertiaRatio = preferences.targetInertiaRatio || 10;

    const candidates = this.motors.filter((motor) => {
      // 基本条件筛选
      if (motor.ratedTorque < requiredTorque) return false;
      if (motor.peakTorque < requiredPeakTorque) return false;
      if (motor.maxSpeed < requiredSpeed) return false;

      // 惯量匹配筛选 - 使用用户选择的目标比例
      const inertiaRatio = mechanical.totalLoadInertia / motor.rotorInertia;
      if (inertiaRatio > targetInertiaRatio) return false;

      return true;
    });

    // 计算匹配分数时考虑惯量比接近目标值的程度
    return candidates.map(motor => this.calculateMatchScore(motor, mechanical, targetInertiaRatio));
  }
}
```

### 4.2 驱动器匹配逻辑

```typescript
class DriveMatcher {
  match(motor: MC20Motor, preferences: DrivePreferences): XC20Drive[] {
    // 1. 获取电机匹配的驱动器列表
    const compatibleDrives = this.drives.filter(d =>
      motor.matchedDrives.includes(d.baseModel)
    );

    // 2. 筛选支持所选通讯协议的驱动器
    const withComm = compatibleDrives.filter(d =>
      d.communication.type === preferences.communication
    );

    // 3. 筛选满足安全功能要求的
    const withSafety = withComm.filter(d =>
      preferences.safety === 'STO'
        ? d.options.safety.code === 'T0'
        : true
    );

    // 4. 按功率等级排序，返回所有可选驱动器
    return withSafety.sort((a, b) => a.maxCurrent - b.maxCurrent);
  }
}
```

### 4.3 订货号生成器

```typescript
class PartNumberGenerator {
  generateMotorPN(motor: MC20Motor, options: MotorOptions): string {
    const brakeCode = options.brake ? '1' : '0';
    const encoderCode = options.encoderType; // 'A' | 'B'
    const connectionCode = 'P'; // 航空插头固定
    const shaftCode = options.keyShaft ? 'K' : 'L';

    return `${motor.baseModel}-${brakeCode}${encoderCode}${connectionCode}${shaftCode}-NNNN`;
  }

  generateDrivePN(drive: XC20Drive, options: DriveOptions): string {
    // XC20-W[电流][IP][制动][预留]-[面板][总线][安全][预留]-[固件][总线][PLC]
    const currentCode = drive.baseModel.replace('XC20-W', '');
    const ipCode = 'C'; // IP20
    const brakeCode = 'R'; // 内置制动
    const reserved1 = 'N';

    const panelCode = options.panel === 'WITH_DISPLAY' ? 'B' : 'N';
    const busCode = this.getBusHardwareCode(options.communication);
    const safetyCode = options.safety === 'STO' ? 'T0' : 'NN';

    // ... 固件版本和协议代码

    return `XC20-W${currentCode}${ipCode}${brakeCode}${reserved1}-01${panelCode}${busCode}${safetyCode}NNNN-SVSRSN${fwBusCode}${plcCode}NNN`;
  }

  generateCablePN(type: 'motor' | 'encoder', spec: string, length: number, hasBrake: boolean): string {
    if (type === 'motor') {
      // MCL[规格]-[刹车]-[长度]
      const brakeCode = hasBrake ? '1' : '0';
      const lengthCode = length.toString().padStart(2, '0');
      return `${spec}-${brakeCode}-${lengthCode}`;
    } else {
      // MCE[规格][长度]
      const lengthCode = length.toString().padStart(2, '0');
      return `${spec}${lengthCode}`;
    }
  }
}
```

---

## 5. 数据文件结构

### 5.1 电机数据文件 (motors.json)

```json
{
  "version": "2025.09",
  "series": "MC20",
  "motors": [
    {
      "id": "MC20-060-3L30-N201",
      "baseModel": "MC20-060-3L30-N201",
      "series": "MC20",
      "frameSize": 60,
      "inertiaType": "LOW",
      "ratedPower": 0.2,
      "ratedSpeed": 3000,
      "ratedTorque": 0.64,
      "peakTorque": 2.0,
      "maxSpeed": 6000,
      "ratedCurrent": 0.92,
      "peakCurrent": 3.1,
      "rotorInertia": 0.20,
      "rotorInertiaWithBrake": 0.21,
      "weight": 1.1,
      "weightWithBrake": 1.4,
      "dimensions": {
        "flange": 60,
        "length": 91,
        "lengthWithBrake": 119,
        "shaftDiameter": 14,
        "shaftLength": 30
      },
      "options": {
        "brake": { "available": true, "torque": 1.5 },
        "encoders": [
          { "type": "A", "protocol": "2.5Mbps", "description": "电池盒式多圈" },
          { "type": "B", "protocol": "5Mbps", "description": "机械式多圈" }
        ],
        "keyShaft": { "available": true }
      },
      "matchedDrives": ["W0005"],
      "cableSpecs": {
        "motorCable": "MCL22",
        "encoderCableA": "MCE12",
        "encoderCableB": "MCE02"
      }
    }
  ]
}
```

### 5.2 驱动器数据文件 (drives.json)

```json
{
  "version": "2025.09",
  "series": "XC20",
  "drives": [
    {
      "id": "XC20-W0005",
      "baseModel": "XC20-W0005",
      "series": "XC20",
      "size": "XD",
      "maxCurrent": 5,
      "ratedCurrent": 1.5,
      "overloadCapacity": 3.3,
      "pwmFrequencies": [4, 8, 12, 16],
      "ratedPwmFrequency": 8,
      "hasFan": false,
      "braking": {
        "internalResistance": 500,
        "continuousPower": 14,
        "peakPower": 754
      },
      "dimensions": {
        "width": 50,
        "height": 178,
        "depth": 196
      },
      "communicationOptions": [
        { "type": "ETHERCAT", "hardwareCode": "EC", "firmwareCode": "2" },
        { "type": "ETHERCAT", "hardwareCode": "EC", "firmwareCode": "3" },
        { "type": "PROFINET", "hardwareCode": "PN", "firmwareCode": "4" },
        { "type": "ETHERNET_IP", "hardwareCode": "EI", "firmwareCode": "5" }
      ],
      "panelOptions": [
        { "type": "WITH_DISPLAY", "code": "B" },
        { "type": "WITHOUT_DISPLAY", "code": "N" }
      ],
      "safetyOptions": [
        { "type": "STO", "code": "T0" },
        { "type": "NONE", "code": "NN" }
      ],
      "compatibleMotors": [
        "MC20-060-3L30-N201",
        "MC20-060-3L30-N401"
      ]
    }
  ]
}
```

---

## 6. Step 5 界面设计

### 6.1 界面分区

1. **推荐电机列表** - 按匹配度排序，显示关键参数
2. **电机选项** - 刹车、编码器类型(A/B)、键槽，实时显示订货号
3. **驱动器选项** - 通讯协议、面板、安全功能，实时显示订货号
4. **电缆配置** - 长度选择(3/5/10/15/20/25/30m)，自动匹配规格
5. **配件** - EMC滤波器、制动电阻(自动计算+手动覆盖)
6. **完整配置清单** - 所有组件订货号汇总

### 6.2 交互特点

- **实时更新**: 选项变更时即时更新订货号
- **选项联动**: 编码器类型影响电缆型号(A型→MCE12, B型→MCE02)
- **智能建议**: 垂直轴应用提示带刹车
- **规格自动匹配**: 电机功率自动决定电缆规格(MCL22/32/42)

---

## 7. 结果输出

### 7.1 PDF技术规格书内容

1. **项目信息** - 项目名称、客户、销售人员、日期
2. **BOM清单表** - 序号、类型、型号(完整订货号)、数量、单位
3. **MC20电机技术参数** - 功率、扭矩、转速、惯量、编码器、防护等级等
4. **XC20驱动器技术参数** - 电流、通讯、安全功能、制动能力等
5. **选型计算摘要** (可选) - 负载惯量、惯量比、扭矩余量、转速余量

### 7.2 计算结果数据结构

```typescript
interface SizingResult {
  mechanical: MechanicalResult;
  motorRecommendations: MotorRecommendation[];
  failureReason?: SizingFailureReason;

  // 完整系统配置
  systemConfiguration?: {
    motor: {
      model: string;
      partNumber: string;
      options: MotorOptions;
    };
    drive: {
      model: string;
      partNumber: string;
      options: DriveOptions;
    };
    cables: {
      motor: { spec: string; length: number; partNumber: string; };
      encoder: { spec: string; length: number; partNumber: string; };
      communication?: { length: number; partNumber: string; };
    };
    accessories: {
      emcFilter?: string;
      brakeResistor?: { model: string; partNumber: string; };
    };
  };

  metadata: {
    calculationTime: number;
    version: string;
    timestamp: string;
  };
}
```

---

## 8. 实现要点

### 8.1 需要更新的模块

| 模块 | 更新内容 |
|------|----------|
| `types/index.ts` | 扩展SizingInput、MotorRecommendation、SizingResult类型 |
| `lib/calculations/motor-filter.ts` | 增加惯量比筛选逻辑 |
| `lib/calculations/sizing-engine.ts` | 增加订货号生成、完整配置组装 |
| `lib/calculations/part-number-generator.ts` | 新增订货号生成器 |
| `data/motors.json` | 更新为完整MC20数据 |
| `data/drives.json` | 更新为完整XC20数据 |
| `wizard/step5/` | 重构系统配置界面 |

### 8.2 算法引用

1. **电机选型计算**
   - 参考: "Servo Motor Sizing for Motion Control Applications", Rockwell Automation
   - 惯量匹配原则: JL/Jm ≤ 10:1（高性能），≤ 30:1（一般应用）

2. **惯量计算**
   - 丝杠传动: JL = m × (Pb/2π)² + J_screw
   - 齿轮传动: JL = m × (1/i)² × η

3. **RMS扭矩计算**
   - 参考: IEEE Standard for Motor Selection
   - 公式: Trms = √[(T1²×t1 + T2²×t2 + T3²×t3) / (t1+t2+t3+tdwell)]

---

## 9. 附录

### 9.1 电缆规格匹配表

| 电机功率 | 动力电缆规格 | 编码器A型电缆 | 编码器B型电缆 |
|----------|--------------|---------------|---------------|
| 0.2-2.0 kW | MCL22 | MCE12 | MCE02 |
| 2.5-3.0 kW | MCL32 | MCE12 | MCE02 |
| 3.3-7.5 kW | MCL42 | MCE12 | MCE02 |

### 9.2 电机-驱动器匹配表

详见 `docs/data/XC20_MC20_产品目录.md` 中的选型匹配表。

---

**文档维护记录**

| 版本 | 日期 | 修改内容 |
|------|------|----------|
| 1.0 | 2026-03-01 | 初始版本 |
