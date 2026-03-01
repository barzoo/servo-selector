# 伺服选型程序重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 基于MC20/XC20完整产品数据重构选型程序，支持完整配件配置、惯量匹配、订货号生成

**Architecture:** 保持5步向导流程，在Step 5集中配置电机选项(刹车/编码器/键槽)、驱动器选项(通讯/面板/安全)、电缆长度、配件；新增订货号生成器和惯量匹配逻辑

**Tech Stack:** Next.js 14, TypeScript, TailwindCSS, Zustand, Vitest

---

## 前置准备

### Task 0: 创建独立工作树

**说明:** 使用git worktree创建独立开发环境

```bash
git worktree add ../servo-selector-redesign -b feature/servo-selector-redesign
cd ../servo-selector-redesign
```

---

## 第一阶段: 数据层重构

### Task 1: 更新电机数据文件

**Files:**
- Modify: `src/data/motors.json`
- Test: `src/data/__tests__/motors.test.ts`

**Step 1: 备份原数据文件**

```bash
cp src/data/motors.json src/data/motors.json.bak
```

**Step 2: 编写数据验证测试**

Create: `src/data/__tests__/motors.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import motorsData from '../motors.json';

describe('MC20 Motors Data', () => {
  it('should have valid motor structure', () => {
    expect(motorsData.motors).toBeDefined();
    expect(motorsData.motors.length).toBeGreaterThan(0);
  });

  it('each motor should have required fields', () => {
    const motor = motorsData.motors[0];
    expect(motor.id).toBeDefined();
    expect(motor.baseModel).toBeDefined();
    expect(motor.ratedPower).toBeDefined();
    expect(motor.ratedTorque).toBeDefined();
    expect(motor.peakTorque).toBeDefined();
    expect(motor.rotorInertia).toBeDefined();
    expect(motor.options).toBeDefined();
    expect(motor.options.brake).toBeDefined();
    expect(motor.options.encoders).toBeDefined();
    expect(motor.matchedDrives).toBeDefined();
    expect(motor.cableSpecs).toBeDefined();
  });

  it('should have 27 motor models', () => {
    expect(motorsData.motors.length).toBe(27);
  });
});
```

**Step 3: 运行测试确认失败**

```bash
npm test -- src/data/__tests__/motors.test.ts
```

Expected: FAIL - 数据结构不匹配

**Step 4: 更新电机数据文件**

Modify: `src/data/motors.json`

根据 `docs/data/MC20_电机技术参数.csv` 和 `docs/data/XC20_MC20_产品目录.md` 中的型号命名规则，更新为完整数据结构：

```json
{
  "version": "2025.09",
  "series": "MC20",
  "provenance": {
    "source": "docs/data/MC20_电机技术参数.csv",
    "catalog": "docs/data/XC20_MC20_产品目录.md",
    "generatedAt": "2026-03-01"
  },
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
    // ... 其余26个电机型号
  ]
}
```

**Step 5: 运行测试确认通过**

```bash
npm test -- src/data/__tests__/motors.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add src/data/motors.json src/data/__tests__/motors.test.ts
git commit -m "feat(data): update MC20 motor data with complete options

- Add 27 motor models from CSV
- Include brake, encoder, keyShaft options
- Add cable specification mapping
- Add matched drives for each motor
- Include provenance metadata"
```

---

### Task 2: 更新驱动器数据文件

**Files:**
- Modify: `src/data/drives.json`
- Test: `src/data/__tests__/drives.test.ts`

**Step 1: 编写数据验证测试**

Create: `src/data/__tests__/drives.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import drivesData from '../drives.json';

describe('XC20 Drives Data', () => {
  it('should have valid drive structure', () => {
    expect(drivesData.drives).toBeDefined();
    expect(drivesData.drives.length).toBeGreaterThan(0);
  });

  it('each drive should have required fields', () => {
    const drive = drivesData.drives[0];
    expect(drive.id).toBeDefined();
    expect(drive.baseModel).toBeDefined();
    expect(drive.maxCurrent).toBeDefined();
    expect(drive.ratedCurrent).toBeDefined();
    expect(drive.communicationOptions).toBeDefined();
    expect(drive.panelOptions).toBeDefined();
    expect(drive.safetyOptions).toBeDefined();
    expect(drive.compatibleMotors).toBeDefined();
  });

  it('should have 6 drive models', () => {
    expect(drivesData.drives.length).toBe(6);
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test -- src/data/__tests__/drives.test.ts
```

Expected: FAIL

**Step 3: 更新驱动器数据文件**

Modify: `src/data/drives.json`

根据 `docs/data/XC20_驱动技术参数.csv` 和型号命名规则：

```json
{
  "version": "2025.09",
  "series": "XC20",
  "provenance": {
    "source": "docs/data/XC20_驱动技术参数.csv",
    "catalog": "docs/data/XC20_MC20_产品目录.md",
    "generatedAt": "2026-03-01"
  },
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
        { "type": "ETHERCAT", "hardwareCode": "EC", "firmwareCode": "2", "name": "EtherCAT (SoE)" },
        { "type": "ETHERCAT", "hardwareCode": "EC", "firmwareCode": "3", "name": "EtherCAT (CoE)" },
        { "type": "PROFINET", "hardwareCode": "PN", "firmwareCode": "4", "name": "PROFINET IO" },
        { "type": "ETHERNET_IP", "hardwareCode": "EI", "firmwareCode": "5", "name": "Ethernet/IP" }
      ],
      "panelOptions": [
        { "type": "WITH_DISPLAY", "code": "B", "name": "带显示屏" },
        { "type": "WITHOUT_DISPLAY", "code": "N", "name": "无显示屏" }
      ],
      "safetyOptions": [
        { "type": "STO", "code": "T0", "name": "STO安全关断" },
        { "type": "NONE", "code": "NN", "name": "无" }
      ],
      "compatibleMotors": [
        "MC20-060-3L30-N201",
        "MC20-060-3L30-N401"
      ]
    }
    // ... W0007, W0012, W0023, W0033, W0050
  ]
}
```

**Step 4: 运行测试确认通过**

```bash
npm test -- src/data/__tests__/drives.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/data/drives.json src/data/__tests__/drives.test.ts
git commit -m "feat(data): update XC20 drive data with complete options

- Add 6 drive models from CSV
- Include communication, panel, safety options
- Add compatible motors mapping
- Add braking specifications
- Include provenance metadata"
```

---

### Task 3: 更新类型定义

**Files:**
- Modify: `src/types/index.ts`
- Test: `src/types/__tests__/types.test.ts`

**Step 1: 编写类型测试**

Create: `src/types/__tests__/types.test.ts`

```typescript
import { describe, it, expect, assertType } from 'vitest';
import type { MC20Motor, XC20Drive, SizingInput, MotorRecommendation } from '../index';

describe('Type Definitions', () => {
  it('MC20Motor should have correct structure', () => {
    const motor: MC20Motor = {
      id: 'test',
      baseModel: 'MC20-060-3L30-N201',
      options: {
        brake: { available: true },
        encoders: [{ type: 'A', protocol: '2.5Mbps' }],
        keyShaft: { available: true }
      },
      matchedDrives: ['W0005'],
      cableSpecs: { motorCable: 'MCL22', encoderCableA: 'MCE12', encoderCableB: 'MCE02' }
    } as MC20Motor;
    expect(motor).toBeDefined();
  });

  it('SizingInput should include selections', () => {
    const input: SizingInput = {
      selections: {
        motorId: 'test',
        motorOptions: { brake: true, encoderType: 'A', keyShaft: false },
        driveOptions: { communication: 'ETHERCAT', panel: 'WITH_DISPLAY', safety: 'STO' },
        cables: { motorLength: 3, encoderLength: 3 },
        accessories: { emcFilter: 'NONE' }
      }
    } as SizingInput;
    expect(input.selections).toBeDefined();
  });
});
```

**Step 2: 更新类型定义文件**

Modify: `src/types/index.ts`

添加/更新以下类型：

```typescript
// ============ 选型输入扩展 ============

export interface MotorSelections {
  motorId: string;
  motorOptions: {
    brake: boolean;
    encoderType: 'A' | 'B';
    keyShaft: boolean;
  };
  driveOptions: {
    communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
    panel: 'WITH_DISPLAY' | 'WITHOUT_DISPLAY';
    safety: 'STO' | 'NONE';
  };
  cables: {
    motorLength: 3 | 5 | 10 | 15 | 20 | 25 | 30;
    encoderLength: 3 | 5 | 10 | 15 | 20 | 25 | 30;
    commLength?: 3 | 5 | 10 | 15 | 20 | 25 | 30;
  };
  accessories: {
    emcFilter: 'NONE' | 'C3';
    brakeResistorOverride?: string;
  };
}

export interface SizingInput {
  project: ProjectInfo;
  mechanism: MechanismConfig;
  motion: MotionParams;
  duty: DutyConditions;
  preferences: SystemPreferences;
  selections?: MotorSelections;  // 新增
}

// ============ 电机数据扩展 ============

export interface MC20Motor {
  id: string;
  baseModel: string;
  series: string;
  frameSize: number;
  inertiaType: 'LOW' | 'MEDIUM';
  ratedPower: number;
  ratedSpeed: number;
  ratedTorque: number;
  peakTorque: number;
  maxSpeed: number;
  ratedCurrent: number;
  peakCurrent: number;
  rotorInertia: number;
  rotorInertiaWithBrake: number;
  weight: number;
  weightWithBrake: number;
  dimensions: {
    flange: number;
    length: number;
    lengthWithBrake: number;
    shaftDiameter: number;
    shaftLength: number;
  };
  options: {
    brake: {
      available: boolean;
      torque?: number;
    };
    encoders: Array<{
      type: 'A' | 'B';
      protocol: string;
      description: string;
    }>;
    keyShaft: {
      available: boolean;
    };
  };
  matchedDrives: string[];
  cableSpecs: {
    motorCable: string;
    encoderCableA: string;
    encoderCableB: string;
  };
}

// ============ 驱动器数据扩展 ============

export interface XC20Drive {
  id: string;
  baseModel: string;
  series: string;
  size: string;
  maxCurrent: number;
  ratedCurrent: number;
  overloadCapacity: number;
  pwmFrequencies: number[];
  ratedPwmFrequency: number;
  hasFan: boolean;
  braking: {
    internalResistance: number;
    continuousPower: number;
    peakPower: number;
  };
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  communicationOptions: Array<{
    type: string;
    hardwareCode: string;
    firmwareCode: string;
    name: string;
  }>;
  panelOptions: Array<{
    type: string;
    code: string;
    name: string;
  }>;
  safetyOptions: Array<{
    type: string;
    code: string;
    name: string;
  }>;
  compatibleMotors: string[];
}

// ============ 系统配置结果 ============

export interface SystemConfiguration {
  motor: {
    model: string;
    partNumber: string;
    options: {
      brake: boolean;
      encoderType: 'A' | 'B';
      keyShaft: boolean;
    };
  };
  drive: {
    model: string;
    partNumber: string;
    options: {
      communication: string;
      panel: string;
      safety: string;
    };
  };
  cables: {
    motor: {
      spec: string;
      length: number;
      partNumber: string;
    };
    encoder: {
      spec: string;
      length: number;
      partNumber: string;
    };
    communication?: {
      length: number;
      partNumber: string;
    };
  };
  accessories: {
    emcFilter?: string;
    brakeResistor?: {
      model: string;
      partNumber: string;
    };
  };
}

export interface SizingResult {
  mechanical: MechanicalResult;
  motorRecommendations: MotorRecommendation[];
  failureReason?: SizingFailureReason;
  systemConfiguration?: SystemConfiguration;  // 新增
  metadata: {
    calculationTime: number;
    version: string;
    timestamp: string;
  };
}
```

**Step 3: 运行测试确认通过**

```bash
npm test -- src/types/__tests__/types.test.ts
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/types/index.ts src/types/__tests__/types.test.ts
git commit -m "feat(types): extend type definitions for complete configuration

- Add MotorSelections interface for Step 5 inputs
- Extend MC20Motor with options and cableSpecs
- Extend XC20Drive with communication/panel/safety options
- Add SystemConfiguration for complete BOM output"
```

---

## 第二阶段: 算法层重构

### Task 4: 实现订货号生成器

**Files:**
- Create: `src/lib/calculations/part-number-generator.ts`
- Test: `src/lib/calculations/__tests__/part-number-generator.test.ts`

**Step 1: 编写测试**

Create: `src/lib/calculations/__tests__/part-number-generator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { PartNumberGenerator } from '../part-number-generator';
import type { MC20Motor, XC20Drive } from '@/types';

describe('PartNumberGenerator', () => {
  const generator = new PartNumberGenerator();

  describe('generateMotorPN', () => {
    const baseMotor: MC20Motor = {
      baseModel: 'MC20-080-3L30-N102',
      options: {
        brake: { available: true },
        encoders: [{ type: 'A', protocol: '2.5Mbps', description: '' }],
        keyShaft: { available: true }
      }
    } as MC20Motor;

    it('should generate motor PN with brake and A encoder', () => {
      const pn = generator.generateMotorPN(baseMotor, {
        brake: true,
        encoderType: 'A',
        keyShaft: false
      });
      expect(pn).toBe('MC20-080-3L30-N102-1APL-NNNN');
    });

    it('should generate motor PN without brake and B encoder', () => {
      const pn = generator.generateMotorPN(baseMotor, {
        brake: false,
        encoderType: 'B',
        keyShaft: true
      });
      expect(pn).toBe('MC20-080-3L30-N102-0BPK-NNNN');
    });
  });

  describe('generateCablePN', () => {
    it('should generate motor cable PN', () => {
      const pn = generator.generateCablePN('motor', 'MCL22', 5, true);
      expect(pn).toBe('MCL22-1-05');
    });

    it('should generate encoder cable PN', () => {
      const pn = generator.generateCablePN('encoder', 'MCE12', 10);
      expect(pn).toBe('MCE1210');
    });
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test -- src/lib/calculations/__tests__/part-number-generator.test.ts
```

Expected: FAIL - PartNumberGenerator not defined

**Step 3: 实现订货号生成器**

Create: `src/lib/calculations/part-number-generator.ts`

```typescript
import type { MC20Motor, XC20Drive, MotorSelections } from '@/types';

export class PartNumberGenerator {
  /**
   * 生成MC20电机完整订货号
   * 格式: MC20-[法兰]-[电压惯量转速]-[冷却功率]-[刹车编码器连接轴]-[温度防护其他]
   * 示例: MC20-080-3L30-N102-0APL-NNNN
   */
  generateMotorPN(
    motor: MC20Motor,
    options: MotorSelections['motorOptions']
  ): string {
    const brakeCode = options.brake ? '1' : '0';
    const encoderCode = options.encoderType;
    const connectionCode = 'P'; // 航空插头固定
    const shaftCode = options.keyShaft ? 'K' : 'L';

    return `${motor.baseModel}-${brakeCode}${encoderCode}${connectionCode}${shaftCode}-NNNN`;
  }

  /**
   * 生成XC20驱动器完整订货号
   * 格式: XC20-W[电流][IP][制动][预留]-[硬前缀][面板][总线][安全][硬预留]-[固件][固预1][总线][PLC][固预2]
   */
  generateDrivePN(
    drive: XC20Drive,
    options: MotorSelections['driveOptions']
  ): string {
    // 第1段: 功率部分 XC20-W[电流][IP][制动][预留]
    const currentCode = drive.baseModel.replace('XC20-W', '');
    const ipCode = 'C'; // IP20
    const brakeCode = 'R'; // 内置制动电阻
    const reserved1 = 'N';
    const powerSection = `W${currentCode}${ipCode}${brakeCode}${reserved1}`;

    // 第2段: 硬件选项 [硬前缀][面板][总线][安全][硬预留]
    const hwPrefix = '01';
    const panelCode = options.panel === 'WITH_DISPLAY' ? 'B' : 'N';
    const commOption = drive.communicationOptions.find(
      c => c.type === options.communication
    );
    const busCode = commOption?.hardwareCode ?? 'NN';
    const safetyCode = options.safety === 'STO' ? 'T0' : 'NN';
    const hwReserved = 'NNNN';
    const hwSection = `${hwPrefix}${panelCode}${busCode}${safetyCode}${hwReserved}`;

    // 第3段: 固件选项 [固件][固预1][总线][PLC][固预2]
    const firmwareVersion = 'SVSRS';
    const fwReserved1 = 'N';
    const fwBusCode = commOption?.firmwareCode ?? '3';
    const plcCode = 'NNN'; // 无PLC功能
    const fwReserved2 = 'NNN';
    const fwSection = `${firmwareVersion}${fwReserved1}${fwBusCode}${plcCode}${fwReserved2}`;

    return `XC20-${powerSection}-${hwSection}-${fwSection}`;
  }

  /**
   * 生成电缆订货号
   */
  generateCablePN(
    type: 'motor' | 'encoder',
    spec: string,
    length: number,
    hasBrake?: boolean
  ): string {
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

  /**
   * 根据电机功率获取动力电缆规格
   */
  getMotorCableSpec(power: number): string {
    if (power <= 2.0) return 'MCL22'; // 0.2-2kW
    if (power <= 3.0) return 'MCL32'; // 2.5-3kW
    return 'MCL42'; // 3.3-7.5kW
  }

  /**
   * 根据编码器类型获取编码器电缆规格
   */
  getEncoderCableSpec(encoderType: 'A' | 'B'): string {
    return encoderType === 'B' ? 'MCE02' : 'MCE12';
  }
}
```

**Step 4: 运行测试确认通过**

```bash
npm test -- src/lib/calculations/__tests__/part-number-generator.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/calculations/part-number-generator.ts src/lib/calculations/__tests__/part-number-generator.test.ts
git commit -m "feat(calc): add part number generator

- Generate complete MC20 motor part numbers
- Generate complete XC20 drive part numbers
- Generate cable part numbers (MCL/MCE)
- Add cable spec lookup helpers"
```

---

### Task 5: 更新电机筛选器（惯量匹配）

**Files:**
- Modify: `src/lib/calculations/motor-filter.ts`
- Test: `src/lib/calculations/__tests__/motor-filter.test.ts`

**Step 1: 编写测试**

Create: `src/lib/calculations/__tests__/motor-filter.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { MotorFilter } from '../motor-filter';
import type { MechanicalResult, SystemPreferences, MC20Motor } from '@/types';

describe('MotorFilter with Inertia Matching', () => {
  const mockMechanical: MechanicalResult = {
    totalLoadInertia: 10, // kg·cm²
    torques: { rms: 2.0, peak: 5.0 },
    speeds: { max: 3000 }
  } as MechanicalResult;

  const mockPreferences: SystemPreferences = {
    safetyFactor: 1.5,
    targetInertiaRatio: 5
  } as SystemPreferences;

  it('should filter motors by target inertia ratio', () => {
    const filter = new MotorFilter(mockMechanical, mockPreferences);
    const results = filter.filter();

    // 所有推荐电机的惯量比应 <= 5
    results.forEach(rec => {
      const ratio = mockMechanical.totalLoadInertia / rec.motor.rotorInertia;
      expect(ratio).toBeLessThanOrEqual(5);
    });
  });

  it('should calculate inertia match score', () => {
    const filter = new MotorFilter(mockMechanical, {
      ...mockPreferences,
      targetInertiaRatio: 5
    });

    // 惯量接近目标值的电机应该得分更高
    const results = filter.filter();
    if (results.length >= 2) {
      // 第一个应该是惯量比最接近目标值的
      expect(results[0].matchScore).toBeGreaterThanOrEqual(results[1].matchScore);
    }
  });
});
```

**Step 2: 更新电机筛选器**

Modify: `src/lib/calculations/motor-filter.ts`

```typescript
import { MC20Motor, MechanicalResult, MotorRecommendation, SystemPreferences } from '@/types';
import motorsData from '@/data/motors.json';

export class MotorFilter {
  private motors: MC20Motor[];
  private mechanical: MechanicalResult;
  private preferences: SystemPreferences;

  constructor(mechanical: MechanicalResult, preferences: SystemPreferences) {
    this.motors = motorsData.motors as unknown as MC20Motor[];
    this.mechanical = mechanical;
    this.preferences = preferences;
  }

  filter(): MotorRecommendation[] {
    const requiredTorque = this.mechanical.torques.rms * this.preferences.safetyFactor;
    const requiredPeakTorque = this.mechanical.torques.peak * this.preferences.safetyFactor;
    const requiredSpeed = this.mechanical.speeds.max * 1.1;

    // 用户选择的目标惯量比，默认10
    const targetInertiaRatio = this.preferences.targetInertiaRatio || 10;

    const candidates = this.motors.filter((motor) => {
      // 基本条件筛选
      if (motor.ratedTorque < requiredTorque) return false;
      if (motor.peakTorque < requiredPeakTorque) return false;
      if (motor.maxSpeed < requiredSpeed) return false;

      // 惯量匹配筛选 - 使用用户选择的目标比例
      const inertiaRatio = this.mechanical.totalInertia / motor.rotorInertia;
      if (inertiaRatio > targetInertiaRatio) return false;

      return true;
    });

    // 计算匹配分数并排序
    const scored = candidates.map((motor) =>
      this.calculateMatchScore(motor, requiredTorque, requiredSpeed, targetInertiaRatio)
    );

    scored.sort((a, b) => b.matchScore - a.matchScore);

    return this.filterByEconomy(scored);
  }

  private filterByEconomy(
    candidates: MotorRecommendation[]
  ): MotorRecommendation[] {
    const highScoreMotors = candidates.filter((c) => c.matchScore >= 80);

    if (highScoreMotors.length > 0) {
      return highScoreMotors.slice(0, 3);
    }

    return candidates.slice(0, 2).map((c) => ({
      ...c,
      feasibility: 'WARNING' as const,
      warnings: [...c.warnings, '匹配度较低，建议调整工况参数'],
    }));
  }

  private calculateMatchScore(
    motor: MC20Motor,
    requiredTorque: number,
    requiredSpeed: number,
    targetInertiaRatio: number
  ): MotorRecommendation {
    const warnings: string[] = [];

    // 扭矩匹配分数
    const torqueMargin = (motor.ratedTorque - requiredTorque) / requiredTorque;
    let torqueScore: number;
    if (torqueMargin >= 0.5) {
      torqueScore = 100;
    } else if (torqueMargin >= 0.2) {
      torqueScore = 80 + (torqueMargin - 0.2) * 66;
    } else if (torqueMargin >= 0) {
      torqueScore = 60 + torqueMargin * 100;
      warnings.push('扭矩余量较小，建议确认工况');
    } else {
      torqueScore = 0;
    }

    // 转速匹配分数
    const speedMargin = (motor.maxSpeed - requiredSpeed) / requiredSpeed;
    const speedScore = Math.min(100, speedMargin * 200);

    // 惯量匹配分数 - 基于目标惯量比
    const inertiaRatio = this.mechanical.totalInertia / motor.rotorInertia;
    let inertiaScore: number;

    if (inertiaRatio <= targetInertiaRatio) {
      // 在目标范围内，越接近目标值分数越高
      const ratioDeviation = Math.abs(inertiaRatio - targetInertiaRatio * 0.6) / (targetInertiaRatio * 0.6);
      inertiaScore = Math.max(60, 100 - ratioDeviation * 40);
    } else {
      inertiaScore = 0;
      warnings.push(`惯量比 ${inertiaRatio.toFixed(1)}:1 超过目标值`);
    }

    // 效率分数（固定）
    const efficiencyScore = 100;

    // 总分数
    const totalScore =
      torqueScore * 0.4 +
      speedScore * 0.2 +
      inertiaScore * 0.3 +
      efficiencyScore * 0.1;

    // 可行性评估
    let feasibility: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
    if (torqueMargin < 0.1 || inertiaRatio > targetInertiaRatio * 0.8) {
      feasibility = 'CRITICAL';
    } else if (torqueMargin < 0.3 || inertiaRatio > targetInertiaRatio * 0.6) {
      feasibility = 'WARNING';
    }

    return {
      motor,
      matchScore: Math.round(totalScore),
      safetyMargins: {
        torque: Math.round(torqueMargin * 100),
        speed: Math.round(speedMargin * 100),
        inertia: Math.round(inertiaRatio * 10) / 10,
      },
      feasibility,
      warnings,
      availableOptions: {
        encoders: motor.options.encoders.map(e => e.type),
        hasBrakeOption: motor.options.brake.available,
        hasKeyOption: motor.options.keyShaft.available,
        matchedDrives: motor.matchedDrives,
      },
    };
  }
}
```

**Step 3: 运行测试确认通过**

```bash
npm test -- src/lib/calculations/__tests__/motor-filter.test.ts
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/lib/calculations/motor-filter.ts src/lib/calculations/__tests__/motor-filter.test.ts
git commit -m "feat(calc): update motor filter with inertia matching

- Add target inertia ratio filtering
- Calculate inertia match score based on target
- Include available options in recommendation
- Update feasibility calculation"
```

---

### Task 6: 更新选型引擎

**Files:**
- Modify: `src/lib/calculations/sizing-engine.ts`
- Test: `src/lib/calculations/__tests__/sizing-engine.test.ts`

**Step 1: 编写测试**

Create: `src/lib/calculations/__tests__/sizing-engine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { SizingEngine } from '../sizing-engine';
import type { SizingInput } from '@/types';

describe('SizingEngine with System Configuration', () => {
  const engine = new SizingEngine();

  const mockInput: SizingInput = {
    project: { name: 'Test', customer: 'Test', salesPerson: 'Test' },
    mechanism: { type: 'BALL_SCREW', params: {} as any },
    motion: { stroke: 100, maxVelocity: 1000, maxAcceleration: 5000 } as any,
    duty: { ambientTemp: 40, dutyCycle: 80 } as any,
    preferences: { safetyFactor: 1.5, targetInertiaRatio: 5 } as any,
    selections: {
      motorId: 'MC20-080-3L30-N102',
      motorOptions: { brake: true, encoderType: 'A', keyShaft: false },
      driveOptions: { communication: 'ETHERCAT', panel: 'WITH_DISPLAY', safety: 'STO' },
      cables: { motorLength: 5, encoderLength: 5 },
      accessories: { emcFilter: 'NONE' }
    }
  };

  it('should generate system configuration when selections provided', () => {
    const result = engine.calculate(mockInput);

    expect(result.systemConfiguration).toBeDefined();
    expect(result.systemConfiguration?.motor.partNumber).toContain('MC20');
    expect(result.systemConfiguration?.drive.partNumber).toContain('XC20');
    expect(result.systemConfiguration?.cables.motor.partNumber).toContain('MCL');
    expect(result.systemConfiguration?.cables.encoder.partNumber).toContain('MCE');
  });

  it('should include correct cable specs based on motor power', () => {
    const result = engine.calculate(mockInput);

    // 1kW电机应该使用MCL22
    expect(result.systemConfiguration?.cables.motor.spec).toBe('MCL22');
    // A型编码器应该使用MCE12
    expect(result.systemConfiguration?.cables.encoder.spec).toBe('MCE12');
  });
});
```

**Step 2: 更新选型引擎**

Modify: `src/lib/calculations/sizing-engine.ts`

```typescript
import { SizingInput, SizingResult, SizingFailureReason, MC20Motor, XC20Drive, BrakeResistor, SystemPreferences, MechanicalResult } from '@/types';
import { MechanicalCalculator } from './mechanical';
import { MotorFilter } from './motor-filter';
import { PartNumberGenerator } from './part-number-generator';
import motorsData from '@/data/motors.json';
import drivesData from '@/data/drives.json';
import resistorsData from '@/data/resistors.json';

export class SizingEngine {
  private motors: MC20Motor[];
  private drives: XC20Drive[];
  private resistors: BrakeResistor[];
  private pnGenerator: PartNumberGenerator;

  constructor() {
    this.motors = motorsData.motors as unknown as MC20Motor[];
    this.drives = drivesData.drives as unknown as XC20Drive[];
    this.resistors = resistorsData.resistors as BrakeResistor[];
    this.pnGenerator = new PartNumberGenerator();
  }

  calculate(input: SizingInput): SizingResult {
    const startTime = performance.now();

    // 1. 机械计算
    const mechanicalCalc = new MechanicalCalculator(input);
    const mechanical = mechanicalCalc.calculate();

    // 2. 电机筛选
    const motorFilter = new MotorFilter(mechanical, input.preferences);
    const motorRecommendations = motorFilter.filter();

    // 3. 诊断无结果情况
    let failureReason: SizingFailureReason | undefined;
    if (motorRecommendations.length === 0) {
      failureReason = this.diagnoseFailure(mechanical, input.preferences);
    }

    // 4. 为每个推荐电机计算完整系统配置
    const recommendations = motorRecommendations.map((rec) => {
      const drive = this.matchDrive(rec.motor, input.preferences);
      const brakeResistor = this.calculateBrakeResistor(mechanical, drive);

      const inertiaRatio = mechanical.totalInertia / rec.motor.rotorInertia;

      return {
        ...rec,
        safetyMargins: {
          ...rec.safetyMargins,
          inertia: Math.round(inertiaRatio * 10) / 10,
        },
        systemConfig: {
          motor: rec.motor,
          drive,
          accessories: {
            motorCable: {
              type: 'MOTOR' as const,
              model: 'CAB-MOT-04',
              length: input.preferences.cableLength,
              isTerminalOnly: input.preferences.cableLength === 'TERMINAL_ONLY',
            },
            encoderCable: {
              type: 'ENCODER' as const,
              model: 'CAB-ENC-STD',
              length: input.preferences.cableLength,
              isTerminalOnly: input.preferences.cableLength === 'TERMINAL_ONLY',
            },
            commCable:
              input.preferences.communication !== 'ANALOG'
                ? {
                    type: 'COMMUNICATION' as const,
                    model: `CAB-COM-${input.preferences.communication}`,
                    length: input.preferences.cableLength,
                    isTerminalOnly: input.preferences.cableLength === 'TERMINAL_ONLY',
                  }
                : undefined,
            brakeResistor,
            emcFilter: input.preferences.emcFilter === 'C3' ? 'EMC-C3-004' : undefined,
          },
          calculations: {
            requiredTorque: mechanical.torques.rms * input.preferences.safetyFactor,
            requiredSpeed: mechanical.speeds.max,
            safetyFactor: input.preferences.safetyFactor,
          },
        },
      };
    });

    // 5. 如果用户已做选择，生成完整系统配置
    let systemConfiguration = undefined;
    if (input.selections && motorRecommendations.length > 0) {
      const selectedMotor = this.motors.find(m => m.id === input.selections!.motorId)
        || motorRecommendations[0].motor;
      systemConfiguration = this.buildSystemConfiguration(
        selectedMotor,
        input.selections,
        mechanical
      );
    }

    const calculationTime = performance.now() - startTime;

    return {
      mechanical,
      motorRecommendations: recommendations,
      failureReason,
      systemConfiguration,
      metadata: {
        calculationTime,
        version: '2.0.0',
        timestamp: new Date().toISOString(),
      },
    };
  }

  private buildSystemConfiguration(
    motor: MC20Motor,
    selections: NonNullable<SizingInput['selections']>,
    mechanical: MechanicalResult
  ) {
    // 找到匹配的驱动器
    const drive = this.drives.find(d =>
      motor.matchedDrives.some(md => d.baseModel.includes(md))
    ) || this.drives[0];

    // 生成订货号
    const motorPN = this.pnGenerator.generateMotorPN(motor, selections.motorOptions);
    const drivePN = this.pnGenerator.generateDrivePN(drive, selections.driveOptions);

    // 确定电缆规格
    const motorCableSpec = this.pnGenerator.getMotorCableSpec(motor.ratedPower);
    const encoderCableSpec = this.pnGenerator.getEncoderCableSpec(selections.motorOptions.encoderType);

    // 生成电缆订货号
    const motorCablePN = this.pnGenerator.generateCablePN(
      'motor',
      motorCableSpec,
      selections.cables.motorLength,
      selections.motorOptions.brake
    );
    const encoderCablePN = this.pnGenerator.generateCablePN(
      'encoder',
      encoderCableSpec,
      selections.cables.encoderLength
    );

    // 计算制动电阻
    const brakeResistor = this.calculateBrakeResistor(mechanical, drive);

    return {
      motor: {
        model: motor.baseModel,
        partNumber: motorPN,
        options: selections.motorOptions,
      },
      drive: {
        model: drive.baseModel,
        partNumber: drivePN,
        options: selections.driveOptions,
      },
      cables: {
        motor: {
          spec: motorCableSpec,
          length: selections.cables.motorLength,
          partNumber: motorCablePN,
        },
        encoder: {
          spec: encoderCableSpec,
          length: selections.cables.encoderLength,
          partNumber: encoderCablePN,
        },
        ...(selections.driveOptions.communication !== 'ANALOG' && {
          communication: {
            length: selections.cables.commLength || selections.cables.motorLength,
            partNumber: `CAB-COM-${selections.driveOptions.communication}-${selections.cables.commLength || selections.cables.motorLength}`,
          },
        }),
      },
      accessories: {
        ...(selections.accessories.emcFilter !== 'NONE' && {
          emcFilter: `EMC-${selections.accessories.emcFilter}`,
        }),
        ...(brakeResistor && {
          brakeResistor: {
            model: brakeResistor.model,
            partNumber: brakeResistor.model,
          },
        }),
      },
    };
  }

  private diagnoseFailure(
    mechanical: MechanicalResult,
    preferences: SystemPreferences
  ): SizingFailureReason {
    const requiredTorque = mechanical.torques.rms * preferences.safetyFactor;
    const requiredPeakTorque = mechanical.torques.peak * preferences.safetyFactor;
    const requiredSpeed = mechanical.speeds.max * 1.1;

    const maxRatedTorque = Math.max(...this.motors.map((m) => m.ratedTorque));
    const maxPeakTorque = Math.max(...this.motors.map((m) => m.peakTorque));
    const maxSpeed = Math.max(...this.motors.map((m) => m.maxSpeed));

    if (requiredTorque > maxRatedTorque) {
      return { type: 'TORQUE', message: '所需连续扭矩超过所有可用电机范围' };
    }

    if (requiredPeakTorque > maxPeakTorque) {
      return { type: 'PEAK_TORQUE', message: '所需峰值扭矩超过所有可用电机范围' };
    }

    if (requiredSpeed > maxSpeed) {
      return { type: 'SPEED', message: '所需转速超过所有可用电机范围' };
    }

    return { type: 'TORQUE', message: '无满足所有条件的电机，建议调整工况参数' };
  }

  private matchDrive(motor: MC20Motor, preferences: SystemPreferences): XC20Drive {
    const compatibleDrives = this.drives.filter((d) =>
      motor.matchedDrives.some(md => d.baseModel.includes(md))
    );

    const withComm = compatibleDrives.filter((d) =>
      d.communicationOptions.some(c => c.type === preferences.communication)
    );

    return withComm.sort((a, b) => a.maxCurrent - b.maxCurrent)[0] || compatibleDrives[0];
  }

  private calculateBrakeResistor(
    mechanical: MechanicalResult,
    drive: XC20Drive
  ): BrakeResistor | undefined {
    if (mechanical.regeneration.brakingPower <= drive.braking.continuousPower) {
      return undefined;
    }

    const requiredPower = mechanical.regeneration.brakingPower * 1.2;

    return this.resistors
      .filter((r) => r.continuousPower >= requiredPower)
      .sort((a, b) => a.continuousPower - b.continuousPower)[0];
  }
}
```

**Step 3: 运行测试确认通过**

```bash
npm test -- src/lib/calculations/__tests__/sizing-engine.test.ts
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/lib/calculations/sizing-engine.ts src/lib/calculations/__tests__/sizing-engine.test.ts
git commit -m "feat(calc): update sizing engine with system configuration

- Add PartNumberGenerator integration
- Build complete system configuration from selections
- Generate part numbers for motor, drive, cables
- Calculate brake resistor based on regeneration"
```

---

## 第三阶段: UI层重构

### Task 7: 创建Step 5系统配置组件

**Files:**
- Create: `src/app/wizard/step5/page.tsx`
- Create: `src/components/wizard/MotorSelectionPanel.tsx`
- Create: `src/components/wizard/DriveConfigurationPanel.tsx`
- Create: `src/components/wizard/CableConfigurationPanel.tsx`
- Create: `src/components/wizard/SystemSummary.tsx`

**Step 1: 创建电机选择面板组件**

Create: `src/components/wizard/MotorSelectionPanel.tsx`

```tsx
'use client';

import { useState } from 'react';
import type { MotorRecommendation, MotorSelections } from '@/types';

interface MotorSelectionPanelProps {
  recommendations: MotorRecommendation[];
  selectedMotorId: string;
  selectedOptions: MotorSelections['motorOptions'];
  onMotorSelect: (motorId: string) => void;
  onOptionsChange: (options: MotorSelections['motorOptions']) => void;
  verticalAxis: boolean;
}

export function MotorSelectionPanel({
  recommendations,
  selectedMotorId,
  selectedOptions,
  onMotorSelect,
  onOptionsChange,
  verticalAxis,
}: MotorSelectionPanelProps) {
  const selectedMotor = recommendations.find(r => r.motor.id === selectedMotorId)?.motor;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">推荐电机</h3>

      {/* 电机列表 */}
      <div className="space-y-2">
        {recommendations.map((rec) => (
          <div
            key={rec.motor.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedMotorId === rec.motor.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onMotorSelect(rec.motor.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{rec.motor.baseModel}</div>
                <div className="text-sm text-gray-500">
                  {rec.motor.ratedPower}kW | {rec.motor.ratedTorque}Nm | {rec.motor.maxSpeed}rpm
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  rec.matchScore >= 80 ? 'text-green-600' :
                  rec.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {rec.matchScore}%
                </div>
                <div className="text-xs text-gray-500">匹配度</div>
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-sm">
              <span>扭矩余量: {rec.safetyMargins.torque}%</span>
              <span>惯量比: {rec.safetyMargins.inertia}:1</span>
            </div>
          </div>
        ))}
      </div>

      {/* 电机选项 */}
      {selectedMotor && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h4 className="font-medium">电机选项 - {selectedMotor.baseModel}</h4>

          {/* 刹车 */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">刹车</span>
              {verticalAxis && (
                <span className="ml-2 text-xs text-amber-600">(垂直轴建议带刹车)</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded ${
                  !selectedOptions.brake ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => onOptionsChange({ ...selectedOptions, brake: false })}
              >
                无
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectedOptions.brake ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => onOptionsChange({ ...selectedOptions, brake: true })}
              >
                有
              </button>
            </div>
          </div>

          {/* 编码器类型 */}
          <div className="flex items-center justify-between">
            <span className="font-medium">编码器类型</span>
            <select
              value={selectedOptions.encoderType}
              onChange={(e) => onOptionsChange({
                ...selectedOptions,
                encoderType: e.target.value as 'A' | 'B'
              })}
              className="px-3 py-1 border rounded"
            >
              {selectedMotor.options.encoders.map((enc) => (
                <option key={enc.type} value={enc.type}>
                  {enc.type}型 - {enc.description} ({enc.protocol})
                </option>
              ))}
            </select>
          </div>

          {/* 键槽 */}
          <div className="flex items-center justify-between">
            <span className="font-medium">电机轴</span>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded ${
                  !selectedOptions.keyShaft ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => onOptionsChange({ ...selectedOptions, keyShaft: false })}
              >
                光轴
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  selectedOptions.keyShaft ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => onOptionsChange({ ...selectedOptions, keyShaft: true })}
              >
                带键槽
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: 创建驱动器配置面板组件**

Create: `src/components/wizard/DriveConfigurationPanel.tsx`

```tsx
'use client';

import type { XC20Drive, MotorSelections } from '@/types';

interface DriveConfigurationPanelProps {
  drive: XC20Drive;
  selectedOptions: MotorSelections['driveOptions'];
  onOptionsChange: (options: MotorSelections['driveOptions']) => void;
}

export function DriveConfigurationPanel({
  drive,
  selectedOptions,
  onOptionsChange,
}: DriveConfigurationPanelProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <h4 className="font-medium">驱动器选项 - {drive.baseModel}</h4>

      {/* 通讯协议 */}
      <div className="flex items-center justify-between">
        <span className="font-medium">通讯协议</span>
        <select
          value={selectedOptions.communication}
          onChange={(e) => onOptionsChange({
            ...selectedOptions,
            communication: e.target.value as MotorSelections['driveOptions']['communication']
          })}
          className="px-3 py-1 border rounded"
        >
          {drive.communicationOptions.map((comm) => (
            <option key={`${comm.type}-${comm.firmwareCode}`} value={comm.type}>
              {comm.name}
            </option>
          ))}
        </select>
      </div>

      {/* 显示面板 */}
      <div className="flex items-center justify-between">
        <span className="font-medium">显示面板</span>
        <div className="flex gap-2">
          {drive.panelOptions.map((panel) => (
            <button
              key={panel.type}
              className={`px-3 py-1 rounded ${
                selectedOptions.panel === panel.type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => onOptionsChange({
                ...selectedOptions,
                panel: panel.type as MotorSelections['driveOptions']['panel']
              })}
            >
              {panel.name}
            </button>
          ))}
        </div>
      </div>

      {/* 安全功能 */}
      <div className="flex items-center justify-between">
        <span className="font-medium">安全功能</span>
        <div className="flex gap-2">
          {drive.safetyOptions.map((safety) => (
            <button
              key={safety.type}
              className={`px-3 py-1 rounded ${
                selectedOptions.safety === safety.type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => onOptionsChange({
                ...selectedOptions,
                safety: safety.type as MotorSelections['driveOptions']['safety']
              })}
            >
              {safety.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: 创建电缆配置面板组件**

Create: `src/components/wizard/CableConfigurationPanel.tsx`

```tsx
'use client';

import type { MotorSelections, MC20Motor } from '@/types';

interface CableConfigurationPanelProps {
  motor: MC20Motor;
  selectedOptions: MotorSelections['motorOptions'];
  cableLengths: MotorSelections['cables'];
  onCablesChange: (cables: MotorSelections['cables']) => void;
  communicationType: string;
}

const LENGTH_OPTIONS = [3, 5, 10, 15, 20, 25, 30];

export function CableConfigurationPanel({
  motor,
  selectedOptions,
  cableLengths,
  onCablesChange,
  communicationType,
}: CableConfigurationPanelProps) {
  const motorCableSpec = motor.cableSpecs.motorCable;
  const encoderCableSpec = selectedOptions.encoderType === 'B'
    ? motor.cableSpecs.encoderCableB
    : motor.cableSpecs.encoderCableA;

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <h4 className="font-medium">电缆配置</h4>

      {/* 动力电缆 */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">动力电缆</span>
          <span className="text-sm text-gray-500">{motorCableSpec}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {LENGTH_OPTIONS.map((len) => (
            <button
              key={len}
              className={`px-3 py-1 rounded text-sm ${
                cableLengths.motorLength === len
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => onCablesChange({ ...cableLengths, motorLength: len })}
            >
              {len}m
            </button>
          ))}
        </div>
      </div>

      {/* 编码器电缆 */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">编码器电缆</span>
          <span className="text-sm text-gray-500">{encoderCableSpec}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {LENGTH_OPTIONS.map((len) => (
            <button
              key={len}
              className={`px-3 py-1 rounded text-sm ${
                cableLengths.encoderLength === len
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => onCablesChange({ ...cableLengths, encoderLength: len })}
            >
              {len}m
            </button>
          ))}
        </div>
      </div>

      {/* 通讯电缆（非模拟量时） */}
      {communicationType !== 'ANALOG' && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">通讯电缆</span>
            <span className="text-sm text-gray-500">{communicationType}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {LENGTH_OPTIONS.map((len) => (
              <button
                key={len}
                className={`px-3 py-1 rounded text-sm ${
                  cableLengths.commLength === len
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                onClick={() => onCablesChange({ ...cableLengths, commLength: len })}
              >
                {len}m
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 4: 创建系统汇总组件**

Create: `src/components/wizard/SystemSummary.tsx`

```tsx
'use client';

import type { SystemConfiguration } from '@/types';

interface SystemSummaryProps {
  config: SystemConfiguration;
}

export function SystemSummary({ config }: SystemSummaryProps) {
  return (
    <div className="p-4 bg-blue-50 rounded-lg space-y-3">
      <h4 className="font-medium text-blue-900">完整配置清单</h4>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>电机:</span>
          <span className="font-mono">{config.motor.partNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>驱动器:</span>
          <span className="font-mono">{config.drive.partNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>动力电缆:</span>
          <span className="font-mono">{config.cables.motor.partNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>编码器电缆:</span>
          <span className="font-mono">{config.cables.encoder.partNumber}</span>
        </div>
        {config.cables.communication && (
          <div className="flex justify-between">
            <span>通讯电缆:</span>
            <span className="font-mono">{config.cables.communication.partNumber}</span>
          </div>
        )}
        {config.accessories.emcFilter && (
          <div className="flex justify-between">
            <span>EMC滤波器:</span>
            <span className="font-mono">{config.accessories.emcFilter}</span>
          </div>
        )}
        {config.accessories.brakeResistor && (
          <div className="flex justify-between">
            <span>制动电阻:</span>
            <span className="font-mono">{config.accessories.brakeResistor.partNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 5: 创建Step 5页面**

Create: `src/app/wizard/step5/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useWizardStore } from '@/stores/wizard-store';
import { SizingEngine } from '@/lib/calculations/sizing-engine';
import { MotorSelectionPanel } from '@/components/wizard/MotorSelectionPanel';
import { DriveConfigurationPanel } from '@/components/wizard/DriveConfigurationPanel';
import { CableConfigurationPanel } from '@/components/wizard/CableConfigurationPanel';
import { SystemSummary } from '@/components/wizard/SystemSummary';
import type { MotorSelections } from '@/types';

export default function Step5Page() {
  const { input, result, setResult, setSelections, goToStep } = useWizardStore();
  const [isCalculating, setIsCalculating] = useState(false);

  const [selections, setLocalSelections] = useState<MotorSelections>(() => {
    const firstMotor = result?.motorRecommendations[0]?.motor;
    return input.selections || {
      motorId: firstMotor?.id || '',
      motorOptions: {
        brake: false,
        encoderType: 'A',
        keyShaft: false,
      },
      driveOptions: {
        communication: 'ETHERCAT',
        panel: 'WITH_DISPLAY',
        safety: 'STO',
      },
      cables: {
        motorLength: 3,
        encoderLength: 3,
      },
      accessories: {
        emcFilter: 'NONE',
      },
    };
  });

  // 当选择变化时重新计算
  useEffect(() => {
    if (!input) return;

    setIsCalculating(true);
    const engine = new SizingEngine();
    const newResult = engine.calculate({
      ...input,
      selections,
    });
    setResult(newResult);
    setSelections(selections);
    setIsCalculating(false);
  }, [selections]);

  const selectedMotor = result?.motorRecommendations.find(
    r => r.motor.id === selections.motorId
  )?.motor;

  const selectedDrive = selectedMotor
    ? result?.motorRecommendations.find(r => r.motor.id === selections.motorId)?.systemConfig?.drive
    : undefined;

  const isVerticalAxis = input?.mechanism?.params &&
    ('mountingOrientation' in input.mechanism.params);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Step 5: 系统配置</h2>

      {isCalculating && (
        <div className="text-center py-4 text-gray-500">
          计算中...
        </div>
      )}

      {result?.motorRecommendations && (
        <MotorSelectionPanel
          recommendations={result.motorRecommendations}
          selectedMotorId={selections.motorId}
          selectedOptions={selections.motorOptions}
          onMotorSelect={(id) => setLocalSelections({ ...selections, motorId: id })}
          onOptionsChange={(opts) => setLocalSelections({ ...selections, motorOptions: opts })}
          verticalAxis={isVerticalAxis}
        />
      )}

      {selectedDrive && (
        <DriveConfigurationPanel
          drive={selectedDrive as any}
          selectedOptions={selections.driveOptions}
          onOptionsChange={(opts) => setLocalSelections({ ...selections, driveOptions: opts })}
        />
      )}

      {selectedMotor && (
        <CableConfigurationPanel
          motor={selectedMotor}
          selectedOptions={selections.motorOptions}
          cableLengths={selections.cables}
          onCablesChange={(cables) => setLocalSelections({ ...selections, cables })}
          communicationType={selections.driveOptions.communication}
        />
      )}

      {result?.systemConfiguration && (
        <SystemSummary config={result.systemConfiguration} />
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={() => goToStep(4)}
          className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          上一步
        </button>
        <button
          onClick={() => goToStep(6)}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          生成规格书
        </button>
      </div>
    </div>
  );
}
```

**Step 6: Commit**

```bash
git add src/components/wizard/MotorSelectionPanel.tsx \
        src/components/wizard/DriveConfigurationPanel.tsx \
        src/components/wizard/CableConfigurationPanel.tsx \
        src/components/wizard/SystemSummary.tsx \
        src/app/wizard/step5/page.tsx
git commit -m "feat(ui): add Step 5 system configuration components

- MotorSelectionPanel with options (brake, encoder, keyShaft)
- DriveConfigurationPanel for communication/panel/safety
- CableConfigurationPanel for length selection
- SystemSummary showing complete part numbers
- Step 5 page integrating all components"
```

---

## 第四阶段: 惯量匹配配置

### Task 8: 在Step 4添加惯量比选择

**Files:**
- Modify: `src/app/wizard/step4/page.tsx`
- Modify: `src/types/index.ts` (添加targetInertiaRatio到preferences)

**Step 1: 更新类型定义**

Modify: `src/types/index.ts`

```typescript
export interface SystemPreferences {
  safetyFactor: number;
  maxInertiaRatio: number;
  targetInertiaRatio: number;  // 新增
  encoderType: 'SINGLE_TURN' | 'MULTI_TURN';
  communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
  emcFilter: 'NONE' | 'C3';
  cableLength: number | 'TERMINAL_ONLY';
}
```

**Step 2: 更新Step 4页面**

Modify: `src/app/wizard/step4/page.tsx` (添加惯量比选择区域)

```tsx
// 在Step 4中添加惯量比选择
const INERTIA_RATIO_OPTIONS = [
  { ratio: 3, label: '高性能 (3:1)', desc: '最佳动态响应，适合高精度定位' },
  { ratio: 5, label: '平衡型 (5:1)', desc: '性能与成本的平衡，适合大多数应用' },
  { ratio: 10, label: '经济型 (10:1)', desc: '最大推荐惯量比，适合成本敏感应用' },
  { ratio: 30, label: '极限型 (30:1)', desc: '系统允许的最大惯量比' },
];

// 在表单中添加
<div className="space-y-4">
  <h3 className="font-medium">惯量匹配目标</h3>
  <div className="grid grid-cols-2 gap-3">
    {INERTIA_RATIO_OPTIONS.map((opt) => (
      <label
        key={opt.ratio}
        className={`p-3 border rounded-lg cursor-pointer ${
          preferences.targetInertiaRatio === opt.ratio
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200'
        }`}
      >
        <input
          type="radio"
          name="inertiaRatio"
          value={opt.ratio}
          checked={preferences.targetInertiaRatio === opt.ratio}
          onChange={(e) => setPreferences({
            ...preferences,
            targetInertiaRatio: Number(e.target.value)
          })}
          className="sr-only"
        />
        <div className="font-medium">{opt.label}</div>
        <div className="text-sm text-gray-500">{opt.desc}</div>
      </label>
    ))}
  </div>
</div>
```

**Step 3: Commit**

```bash
git add src/types/index.ts src/app/wizard/step4/page.tsx
git commit -m "feat(ui): add inertia ratio selection in Step 4

- Add targetInertiaRatio to SystemPreferences
- Add inertia ratio options (3:1, 5:1, 10:1, 30:1)
- Include descriptions for each option"
```

---

## 第五阶段: 集成测试

### Task 9: 运行完整测试套件

**Step 1: 运行所有单元测试**

```bash
npm test
```

Expected: All tests PASS

**Step 2: 运行构建测试**

```bash
npm run build
```

Expected: Build SUCCESS

**Step 3: Commit**

```bash
git commit -m "test: verify all tests pass

- Unit tests for data files
- Algorithm tests for motor filter and sizing engine
- Type definition tests
- Build verification"
```

---

## 实施计划总结

| 阶段 | 任务 | 文件变更 | 预计时间 |
|------|------|----------|----------|
| 数据层 | Task 1-3 | motors.json, drives.json, types | 2小时 |
| 算法层 | Task 4-6 | part-number-generator, motor-filter, sizing-engine | 3小时 |
| UI层 | Task 7 | Step 5 components | 3小时 |
| 配置 | Task 8 | Step 4 inertia ratio | 1小时 |
| 测试 | Task 9 | 完整测试 | 1小时 |

**总计**: 约10小时

---

**计划完成时间**: 2026-03-01

**执行方式选择**:
1. **Subagent-Driven (本会话)** - 每个任务派生子代理，任务间审查
2. **Parallel Session (新会话)** - 在新会话中使用 executing-plans 批量执行

请选择执行方式。
