# 伺服选型算法设计文档

**版本**: 1.0
**日期**: 2026-02-27
**适用范围**: XC20 + MC20 伺服系统选型工具

---

## 1. 概述

### 1.1 设计目标

本文档定义伺服选型工具的核心计算引擎架构和算法实现细节，确保选型结果的准确性和可靠性。

### 1.2 算法模块划分

```
┌─────────────────────────────────────────────────────────────┐
│                    选型计算引擎 (SizingEngine)                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  机械计算模块 │  │  电机筛选模块 │  │  配件计算模块 │       │
│  │  Mechanical  │  │  MotorFilter │  │  Accessories │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         ↓                 ↓                 ↓               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  结果组装器 (ResultAssembler)        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 核心数据结构

### 2.1 输入参数结构

```typescript
// 选型输入参数
interface SizingInput {
  // 项目信息
  project: {
    name: string;
    customer: string;
    salesPerson: string;
    notes?: string;
  };

  // 机械参数
  mechanism: {
    type: 'BALL_SCREW' | 'GEARBOX' | 'DIRECT_DRIVE' | 'BELT' | 'RACK_PINION';
    params: MechanismParams;
  };

  // 运动参数
  motion: {
    stroke: number;           // mm 或 °
    maxVelocity: number;      // mm/s 或 rpm
    maxAcceleration: number;  // mm/s² 或 rad/s²
    profile: 'TRAPEZOIDAL' | 'S_CURVE';
    dwellTime: number;        // s
    cycleTime: number;        // s
  };

  // 工况条件
  duty: {
    ambientTemp: number;      // °C
    dutyCycle: number;        // %
    mountingOrientation: 'HORIZONTAL' | 'VERTICAL_UP' | 'VERTICAL_DOWN';
    ipRating: 'IP54' | 'IP65' | 'IP67';
  };

  // 系统配置偏好
  preferences: {
    safetyFactor: number;     // 默认 1.5
    maxInertiaRatio: number;  // 默认 10
    encoderType: 'SINGLE_TURN' | 'MULTI_TURN';
    communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
    emcFilter: 'NONE' | 'C3';
    cableLength: number | 'TERMINAL_ONLY';
  };
}

// 机械类型特定参数
type MechanismParams =
  | BallScrewParams
  | GearboxParams
  | DirectDriveParams
  | BeltParams
  | RackPinionParams;

interface BallScrewParams {
  loadMass: number;           // kg
  lead: number;               // mm
  screwDiameter: number;      // mm
  screwLength: number;        // mm
  gearRatio: number;          // 默认 1
  efficiency: number;         // 默认 0.9
  frictionCoeff: number;      // 默认 0.05
  preloadTorque: number;      // N·m，默认 0
}
```

### 2.2 计算结果结构

```typescript
// 选型计算结果
interface SizingResult {
  // 机械计算结果
  mechanical: MechanicalResult;

  // 推荐电机列表
  motorRecommendations: MotorRecommendation[];

  // 选中的完整系统配置
  selectedSystem?: CompleteSystemConfig;

  // 计算元数据
  metadata: {
    calculationTime: number;  // ms
    version: string;
    timestamp: string;
  };
}

// 机械计算结果
interface MechanicalResult {
  loadInertia: number;        // kg·m²，负载惯量
  totalInertia: number;       // kg·m²，总惯量（含传动机构）
  inertiaRatio: number;       // 惯量比（总惯量/电机惯量）

  // 扭矩计算
  torques: {
    accel: number;            // N·m，加速扭矩
    constant: number;         // N·m，恒速扭矩
    decel: number;            // N·m，减速扭矩（可能为负）
    peak: number;             // N·m，峰值扭矩
    rms: number;              // N·m，RMS等效扭矩
  };

  // 转速计算
  speeds: {
    max: number;              // rpm，最大转速
    rms: number;              // rpm，RMS等效转速
  };

  // 功率计算
  powers: {
    peak: number;             // W，峰值功率
    continuous: number;       // W，连续功率
  };

  // 再生能量
  regeneration: {
    energyPerCycle: number;   // J，每周期再生能量
    brakingPower: number;     // W，制动功率
    requiresExternalResistor: boolean;
  };
}

// 电机推荐项
interface MotorRecommendation {
  motor: MC20Motor;
  matchScore: number;         // 0-100，匹配度评分
  safetyMargins: {
    torque: number;           // %，扭矩余量
    speed: number;            // %，转速余量
    inertia: number;          // 惯量比
  };
  feasibility: 'OK' | 'WARNING' | 'CRITICAL';
  warnings: string[];
}

// 完整系统配置
interface CompleteSystemConfig {
  motor: MC20Motor;
  drive: XC20Drive;
  accessories: {
    motorCable: CableConfig;
    encoderCable: CableConfig;
    commCable?: CableConfig;
    brakeResistor?: BrakeResistor;
    emcFilter?: string;
  };
  calculations: {
    requiredTorque: number;
    requiredSpeed: number;
    safetyFactor: number;
  };
}
```

---

## 3. 机械计算模块 (MechanicalCalculator)

### 3.1 类定义

```typescript
class MechanicalCalculator {
  private params: SizingInput;

  constructor(input: SizingInput) {
    this.params = input;
  }

  // 主计算方法
  calculate(): MechanicalResult {
    const inertia = this.calculateInertia();
    const torques = this.calculateTorques();
    const speeds = this.calculateSpeeds();
    const powers = this.calculatePowers(torques, speeds);
    const regeneration = this.calculateRegeneration();

    return {
      loadInertia: inertia.load,
      totalInertia: inertia.total,
      inertiaRatio: 0, // 需在电机确定后计算
      torques,
      speeds,
      powers,
      regeneration,
    };
  }

  // 惯量计算 - 根据机械类型分发
  private calculateInertia(): { load: number; total: number } {
    const { type, params } = this.params.mechanism;

    switch (type) {
      case 'BALL_SCREW':
        return this.calcBallScrewInertia(params as BallScrewParams);
      case 'GEARBOX':
        return this.calcGearboxInertia(params as GearboxParams);
      case 'DIRECT_DRIVE':
        return this.calcDirectDriveInertia(params as DirectDriveParams);
      case 'BELT':
        return this.calcBeltInertia(params as BeltParams);
      case 'RACK_PINION':
        return this.calcRackPinionInertia(params as RackPinionParams);
      default:
        throw new Error(`Unsupported mechanism type: ${type}`);
    }
  }

  // 滚珠丝杠惯量计算
  private calcBallScrewInertia(p: BallScrewParams): { load: number; total: number } {
    // 负载惯量: J = m * (Pb / 2π)²
    const J_load = p.loadMass * Math.pow(p.lead * 1e-3 / (2 * Math.PI * p.gearRatio), 2);

    // 丝杠惯量: J = (π * ρ * L * d⁴) / 32
    const rho = 7850; // kg/m³，钢密度
    const J_screw = (Math.PI * rho * p.screwLength * 1e-3 * Math.pow(p.screwDiameter * 1e-3, 4)) / 32;

    return {
      load: J_load,
      total: J_load + J_screw / Math.pow(p.gearRatio, 2),
    };
  }

  // 扭矩计算
  private calculateTorques() {
    const { type, params } = this.params.mechanism;
    const { motion, duty } = this.params;

    // 计算各段运动时间
    const times = this.calculateMotionTimes();

    // 计算角加速度
    const maxSpeedRad = this.getMaxAngularSpeed();
    const alpha = maxSpeedRad / times.accel;

    // Get inertia
    const inertia = this.calculateInertia();

    // Calculate load torques based on mechanism type
    const T_friction = this.calculateFrictionTorque();
    const T_gravity = this.calculateGravityTorque();

    // Acceleration torque
    const T_accel = inertia.total * alpha / this.getEfficiency() + T_friction + T_gravity;

    // Constant speed torque
    const T_constant = T_friction + T_gravity;

    // Deceleration torque (may be negative)
    const T_decel = -inertia.total * alpha / this.getEfficiency() + T_friction + T_gravity;

    // Peak torque
    const T_peak = Math.max(Math.abs(T_accel), Math.abs(T_constant), Math.abs(T_decel));

    // RMS torque
    const T_rms = Math.sqrt(
      (Math.pow(T_accel, 2) * times.accel +
        Math.pow(T_constant, 2) * times.constant +
        Math.pow(T_decel, 2) * times.decel) /
      (times.accel + times.constant + times.decel + times.dwell)
    );

    return {
      accel: T_accel,
      constant: T_constant,
      decel: T_decel,
      peak: T_peak,
      rms: T_rms,
    };
  }

  // 运动时间计算
  private calculateMotionTimes(): { accel: number; constant: number; decel: number; dwell: number } {
    const { motion } = this.params;
    const v = motion.maxVelocity * 1e-3; // Convert to m/s
    const a = motion.maxAcceleration * 1e-3; // Convert to m/s²
    const s = motion.stroke * 1e-3; // Convert to m

    const t_accel = v / a;
    const s_accel = 0.5 * a * t_accel * t_accel;

    if (2 * s_accel <= s) {
      const s_constant = s - 2 * s_accel;
      const t_constant = s_constant / v;
      return {
        accel: t_accel,
        constant: t_constant,
        decel: t_accel,
        dwell: motion.dwellTime,
      };
    } else {
      const t_peak = Math.sqrt(s / a);
      return {
        accel: t_peak,
        constant: 0,
        decel: t_peak,
        dwell: motion.dwellTime,
      };
    }
  }

  // 再生能量计算
  private calculateRegeneration() {
    const inertia = this.calculateInertia();
    const { maxVelocity, maxAcceleration } = this.params.motion;
    const { type, params } = this.params.mechanism;

    // 最大角速度
    const omega_max = this.getMaxAngularSpeed();

    // 减速段释放的动能
    const E_kinetic = 0.5 * inertia.total * Math.pow(omega_max, 2);

    // 重力做功（垂直轴下降）
    let E_gravity = 0;
    if (this.params.duty.mountingOrientation === 'VERTICAL_DOWN') {
      const mass = this.getLoadMass();
      const stroke = this.params.motion.stroke * 1e-3; // m
      E_gravity = mass * 9.80665 * stroke;
    }

    const E_total = E_kinetic + E_gravity;
    const times = this.calculateMotionTimes();
    const P_brake = times.decel > 0 ? E_total / times.decel : 0;

    return {
      energyPerCycle: E_total,
      brakingPower: P_brake,
      requiresExternalResistor: false,
    };
  }
}
```

### 3.2 算法复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|------|-----------|-----------|------|
| `calculate()` | O(1) | O(1) | 主入口 |
| `calculateInertia()` | O(1) | O(1) | 固定公式计算 |
| `calculateTorques()` | O(1) | O(1) | 固定公式计算 |
| `calculateMotionTimes()` | O(1) | O(1) | 简单数学运算 |

---

## 4. 电机筛选模块 (MotorFilter)

### 4.1 筛选算法

```typescript
class MotorFilter {
  private motors: MC20Motor[];
  private requirements: MotorRequirements;

  constructor(motors: MC20Motor[], mechanical: MechanicalResult, preferences: Preferences) {
    this.motors = motors;
    this.requirements = this.calculateRequirements(mechanical, preferences);
  }

  // 主筛选方法
  filter(): MotorRecommendation[] {
    // 1. 硬性条件筛选
    const candidates = this.motors.filter(m => this.meetsHardRequirements(m));

    // 2. 计算匹配度评分
    const scored = candidates.map(m => this.calculateMatchScore(m));

    // 3. 排序：匹配度降序
    scored.sort((a, b) => b.matchScore - a.matchScore);

    // 4. 返回前N个推荐
    return scored.slice(0, 5);
  }

  // 硬性条件检查
  private meetsHardRequirements(motor: MC20Motor): boolean {
    const req = this.requirements;

    // 1. 额定扭矩 >= 需求扭矩
    if (motor.rated_torque < req.requiredTorque) return false;

    // 2. 峰值扭矩 >= 需求峰值
    if (motor.peak_torque < req.requiredPeakTorque) return false;

    // 3. 最大转速 >= 需求转速
    if (motor.max_speed < req.requiredSpeed) return false;

    // 4. 编码器类型支持检查
    if (!motor.encoder_options.includes(req.encoderType)) return false;

    return true;
  }

  // 匹配度评分算法
  private calculateMatchScore(motor: MC20Motor): MotorRecommendation {
    const req = this.requirements;
    const warnings: string[] = [];

    // 1. 扭矩余量评分 (40%权重)
    const torqueMargin = (motor.rated_torque - req.requiredTorque) / req.requiredTorque;
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

    // 2. 转速余量评分 (20%权重)
    const speedMargin = (motor.max_speed - req.requiredSpeed) / req.requiredSpeed;
    const speedScore = Math.min(100, speedMargin * 200);

    // 3. 惯量比评分 (30%权重)
    const inertiaRatio = req.loadInertia / motor.rotor_inertia;
    let inertiaScore: number;
    if (inertiaRatio <= 3) {
      inertiaScore = 100;
    } else if (inertiaRatio <= 10) {
      inertiaScore = 100 - (inertiaRatio - 3) * 5.7;
    } else if (inertiaRatio <= 30) {
      inertiaScore = 60 - (inertiaRatio - 10) * 2;
      warnings.push(`惯量比 ${inertiaRatio.toFixed(1)}:1 偏高，可能影响动态性能`);
    } else {
      inertiaScore = 0;
      warnings.push(`惯量比 ${inertiaRatio.toFixed(1)}:1 过高，建议增加减速比`);
    }

    // 4. 效率评分 (10%权重)
    const efficiencyScore = 100;

    // 综合评分
    const totalScore = torqueScore * 0.4 + speedScore * 0.2 + inertiaScore * 0.3 + efficiencyScore * 0.1;

    // 可行性判断
    let feasibility: 'OK' | 'WARNING' | 'CRITICAL' = 'OK';
    if (torqueMargin < 0.1 || inertiaRatio > 20) feasibility = 'CRITICAL';
    else if (torqueMargin < 0.3 || inertiaRatio > 10) feasibility = 'WARNING';

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
    };
  }
}
```

### 4.2 评分权重说明

| 评估维度 | 权重 | 优秀标准 | 警告阈值 | 危险阈值 |
|----------|------|----------|----------|----------|
| 扭矩余量 | 40% | ≥50% | <30% | <10% |
| 惯量比 | 30% | ≤3:1 | >10:1 | >30:1 |
| 转速余量 | 20% | ≥20% | <10% | <0% |
| 效率 | 10% | 高效区运行 | - | - |

---

## 5. 配件计算模块 (AccessoryCalculator)

### 5.1 驱动器匹配

```typescript
class AccessoryCalculator {
  // 根据电机匹配驱动器
  matchDrive(motor: MC20Motor, preferences: Preferences): XC20Drive {
    // 1. 从电机数据获取匹配的驱动器列表
    const compatibleDrives = this.getCompatibleDrives(motor.matched_drives);

    // 2. 筛选支持所需通讯协议的驱动器
    const withComm = compatibleDrives.filter(d =>
      d.comm_interfaces.includes(preferences.communication)
    );

    // 3. 筛选支持所需编码器的驱动器
    const withEncoder = withComm.filter(d =>
      d.encoder_types.includes(preferences.encoderType)
    );

    // 4. 选择功率等级最小的满足需求的驱动器
    return withEncoder.sort((a, b) => a.power_rating - b.power_rating)[0];
  }

  // 制动电阻计算
  calculateBrakeResistor(
    regeneration: RegenerationResult,
    drive: XC20Drive
  ): BrakeResistor | null {
    // 检查内置制动能力是否足够
    if (regeneration.brakingPower <= drive.internal_brake_resistor) {
      return null;
    }

    // 计算所需制动电阻规格
    const requiredPower = regeneration.brakingPower * 1.2;
    const requiredResistance = drive.dc_bus_voltage / drive.peak_current;

    // 从电阻库中选择合适的型号
    return this.findBrakeResistor(requiredPower, requiredResistance);
  }
}
```

---

## 6. 算法接口

### 6.1 主入口

```typescript
// 选型引擎主类
export class SizingEngine {
  private motorDatabase: MC20Motor[];
  private driveDatabase: XC20Drive[];
  private resistorDatabase: BrakeResistor[];

  constructor(data: {
    motors: MC20Motor[];
    drives: XC20Drive[];
    resistors: BrakeResistor[];
  }) {
    this.motorDatabase = data.motors;
    this.driveDatabase = data.drives;
    this.resistorDatabase = data.resistors;
  }

  // 执行选型计算
  calculate(input: SizingInput): SizingResult {
    const startTime = performance.now();

    // 1. 机械计算
    const mechanicalCalc = new MechanicalCalculator(input);
    const mechanical = mechanicalCalc.calculate();

    // 2. 电机筛选
    const motorFilter = new MotorFilter(
      this.motorDatabase,
      mechanical,
      input.preferences
    );
    const motorRecommendations = motorFilter.filter();

    // 3. 为每个推荐电机计算完整系统配置
    const recommendations = motorRecommendations.map(rec => {
      const accessoryCalc = new AccessoryCalculator();
      const drive = accessoryCalc.matchDrive(rec.motor, input.preferences);
      const brakeResistor = accessoryCalc.calculateBrakeResistor(
        mechanical.regeneration,
        drive
      );

      // 更新惯量比
      const inertiaRatio = mechanical.totalInertia / rec.motor.rotor_inertia;

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
            brakeResistor,
            emcFilter: input.preferences.emcFilter,
          },
        },
      };
    });

    const calculationTime = performance.now() - startTime;

    return {
      mechanical,
      motorRecommendations: recommendations,
      metadata: {
        calculationTime,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
```

---

## 7. 单元测试策略

### 7.1 测试用例设计

```typescript
// 测试文件: sizing-engine.test.ts

describe('SizingEngine', () => {
  let engine: SizingEngine;

  beforeEach(() => {
    engine = new SizingEngine({
      motors: mockMotors,
      drives: mockDrives,
      resistors: mockResistors,
    });
  });

  describe('滚珠丝杠选型', () => {
    it('应正确计算CNC机床典型工况', () => {
      const input = createBallScrewInput({
        loadMass: 200,
        lead: 10,
        maxVelocity: 30000,
        maxAcceleration: 5000,
      });

      const result = engine.calculate(input);

      expect(result.mechanical.torques.peak).toBeGreaterThan(0);
      expect(result.mechanical.torques.rms).toBeLessThan(result.mechanical.torques.peak);
      expect(result.motorRecommendations.length).toBeGreaterThan(0);
    });

    it('应正确处理垂直轴重力', () => {
      const input = createBallScrewInput({
        loadMass: 100,
        mountingOrientation: 'VERTICAL_UP',
      });

      const result = engine.calculate(input);
      expect(result.torques.constant).toBeGreaterThan(0);
    });
  });
});
```

### 7.2 边界条件测试

| 测试场景 | 输入 | 期望结果 |
|----------|------|----------|
| 极小负载 | m=0.1kg | 正常计算，推荐小电机 |
| 极大负载 | m=10000kg | 可能无匹配电机，返回警告 |
| 零加速度 | a=0 | 抛出错误或返回警告 |
| 极高速度 | v=1000m/s | 可能无匹配电机 |
| 三角形速度曲线 | 短行程高加速度 | 正确计算无恒速段 |
| 再生制动 | 大惯量快速减速 | 计算再生能量，推荐制动电阻 |

---

## 8. 性能优化

### 8.1 计算优化

```typescript
// 使用记忆化避免重复计算
class MechanicalCalculator {
  private cache = new Map<string, any>();

  private memoize<T>(key: string, fn: () => T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const result = fn();
    this.cache.set(key, result);
    return result;
  }
}
```

---

## 9. 参考资料

1. **Bosch Rexroth**. "Drive and Control Technology: Sizing and Application Manual"
2. **Rockwell Automation**. "Motion System Sizing and Selection Guide"
3. **Yaskawa**. "Sigma-7 Servo System Sizing Manual"
4. **IEEE Std 3004.8-2016**. "Recommended Practice for Motor Protection in Industrial and Commercial Power Systems"

---

## 10. 文档维护记录

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-02-27 | 初始版本 | - |
