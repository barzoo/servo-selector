# XC20 + MC20 伺服系统数据清单

**版本**: 1.0
**日期**: 2026-02-27
**产品系列**: Bosch Rexroth XC20 伺服驱动 + MC20 伺服电机

---

## 1. 数据概述

### 1.1 数据文件结构

```
data/
├── motors.json          # MC20 电机系列数据
├── drives.json          # XC20 驱动器系列数据
├── cables.json          # 电缆和配件数据
├── resistors.json       # 制动电阻数据
└── emc-filters.json     # EMC滤波器数据
```

### 1.2 数据来源

| 数据类型 | 来源 | 更新频率 | 责任人 |
|----------|------|----------|--------|
| 电机参数 | Bosch Rexroth 产品目录 | 产品更新时 | 产品部 |
| 驱动器参数 | Bosch Rexroth 技术手册 | 产品更新时 | 产品部 |
| 电缆规格 | 内部BOM系统 | 按需 | 工程部 |
| 价格信息 | ERP系统 | 季度 | 财务部 |

---

## 2. MC20 电机数据规格

### 2.1 数据模型

```typescript
interface MC20Motor {
  // 基本信息
  id: string;                    // 唯一标识符
  model: string;                 // 完整型号
  series: string;                // 系列代码 (MC20)
  frameSize: number;             // 机座号 (40, 60, 80, 100, 130)

  // 电气参数
  ratedPower: number;            // 额定功率 (W)
  ratedTorque: number;           // 额定扭矩 (N·m)
  peakTorque: number;            // 峰值扭矩 (N·m), 通常3倍额定
  ratedSpeed: number;            // 额定转速 (rpm)
  maxSpeed: number;              // 最高转速 (rpm)
  ratedCurrent: number;          // 额定电流 (A)
  peakCurrent: number;           // 峰值电流 (A)
  torqueConstant: number;        // 扭矩常数 (N·m/A)
  voltageConstant: number;       // 电压常数 (V/krpm)
  phaseResistance: number;       // 相电阻 (Ω)
  phaseInductance: number;       // 相电感 (mH)
  electricalTimeConstant: number;// 电气时间常数 (ms)

  // 机械参数
  rotorInertia: number;          // 转子惯量 (kg·cm²)
  staticFrictionTorque: number;  // 静摩擦扭矩 (N·m)
  weight: number;                // 重量 (kg)

  // 编码器选项
  encoderOptions: {
    type: 'SINGLE_TURN' | 'MULTI_TURN';
    resolution: number;          // 分辨率 (bit)
    protocol: 'BISS_C' | 'ENDAT' | 'HIPERFACE';
    modelSuffix: string;         // 型号后缀
  }[];

  // 机械选项
  options: {
    brake: {
      available: boolean;
      torque: number;            // 抱闸扭矩 (N·m)
      voltage: number;           // 抱闸电压 (V)
      power: number;             // 抱闸功率 (W)
      modelSuffix: string;
    };
    keyShaft: {
      available: boolean;
      modelSuffix: string;
    };
    oilSeal: {
      available: boolean;
      modelSuffix: string;
    };
  };

  // 尺寸参数
  dimensions: {
    flange: string;              // 法兰规格 (如 "IEC 80 B14")
    shaftDiameter: number;       // 轴径 (mm)
    shaftLength: number;         // 轴长 (mm)
    overallLength: number;       // 总长 (无抱闸) (mm)
    overallLengthWithBrake: number; // 总长 (有抱闸) (mm)
  };

  // 匹配驱动器
  matchedDrives: string[];       // 兼容的驱动器型号列表

  // 技术文档
  documentation: {
    datasheet: string;           // 规格书链接
    cadModel: string;            // 3D模型链接
    manual: string;              // 使用手册链接
  };
}
```

### 2.2 MC20 系列完整参数表

#### MC20-040 系列 (40mm 机座)

| 型号 | 额定功率 | 额定扭矩 | 峰值扭矩 | 额定转速 | 最高转速 | 转子惯量 | 额定电流 |
|------|----------|----------|----------|----------|----------|----------|----------|
| MC20-004 | 50W | 0.16 N·m | 0.48 N·m | 3000 rpm | 6000 rpm | 0.025 kg·cm² | 0.9 A |
| MC20-008 | 100W | 0.32 N·m | 0.95 N·m | 3000 rpm | 6000 rpm | 0.051 kg·cm² | 1.3 A |
| MC20-010 | 100W | 0.32 N·m | 0.95 N·m | 3000 rpm | 6000 rpm | 0.051 kg·cm² | 1.3 A |

#### MC20-060 系列 (60mm 机座)

| 型号 | 额定功率 | 额定扭矩 | 峰值扭矩 | 额定转速 | 最高转速 | 转子惯量 | 额定电流 |
|------|----------|----------|----------|----------|----------|----------|----------|
| MC20-020 | 200W | 0.64 N·m | 1.91 N·m | 3000 rpm | 6000 rpm | 0.14 kg·cm² | 2.0 A |
| MC20-040 | 400W | 1.27 N·m | 3.82 N·m | 3000 rpm | 6000 rpm | 0.26 kg·cm² | 3.0 A |
| MC20-060 | 600W | 1.91 N·m | 5.73 N·m | 3000 rpm | 6000 rpm | 0.38 kg·cm² | 4.3 A |

#### MC20-080 系列 (80mm 机座)

| 型号 | 额定功率 | 额定扭矩 | 峰值扭矩 | 额定转速 | 最高转速 | 转子惯量 | 额定电流 |
|------|----------|----------|----------|----------|----------|----------|----------|
| MC20-075 | 750W | 2.39 N·m | 7.16 N·m | 3000 rpm | 5000 rpm | 1.18 kg·cm² | 4.8 A |
| MC20-100 | 1.0kW | 3.18 N·m | 9.55 N·m | 3000 rpm | 5000 rpm | 1.53 kg·cm² | 6.0 A |
| MC20-150 | 1.5kW | 4.78 N·m | 14.3 N·m | 3000 rpm | 5000 rpm | 2.21 kg·cm² | 8.6 A |

#### MC20-100 系列 (100mm 机座)

| 型号 | 额定功率 | 额定扭矩 | 峰值扭矩 | 额定转速 | 最高转速 | 转子惯量 | 额定电流 |
|------|----------|----------|----------|----------|----------|----------|----------|
| MC20-200 | 2.0kW | 6.37 N·m | 19.1 N·m | 3000 rpm | 4500 rpm | 3.45 kg·cm² | 10.5 A |
| MC20-300 | 3.0kW | 9.55 N·m | 28.6 N·m | 3000 rpm | 4500 rpm | 4.89 kg·cm² | 15.2 A |

#### MC20-130 系列 (130mm 机座)

| 型号 | 额定功率 | 额定扭矩 | 峰值扭矩 | 额定转速 | 最高转速 | 转子惯量 | 额定电流 |
|------|----------|----------|----------|----------|----------|----------|----------|
| MC20-500 | 5.0kW | 15.9 N·m | 47.7 N·m | 3000 rpm | 4000 rpm | 12.8 kg·cm² | 24.0 A |
| MC20-700 | 7.0kW | 22.3 N·m | 66.9 N·m | 3000 rpm | 4000 rpm | 17.5 kg·cm² | 32.5 A |

### 2.3 JSON 数据示例

```json
{
  "motors": [
    {
      "id": "mc20-040-001",
      "model": "MC20-040-10-3-0-B0",
      "series": "MC20",
      "frameSize": 40,
      "ratedPower": 100,
      "ratedTorque": 0.32,
      "peakTorque": 0.95,
      "ratedSpeed": 3000,
      "maxSpeed": 6000,
      "ratedCurrent": 1.3,
      "peakCurrent": 3.9,
      "torqueConstant": 0.246,
      "voltageConstant": 15.8,
      "phaseResistance": 5.8,
      "phaseInductance": 12.5,
      "electricalTimeConstant": 2.2,
      "rotorInertia": 0.051,
      "staticFrictionTorque": 0.02,
      "weight": 0.8,
      "encoderOptions": [
        {
          "type": "SINGLE_TURN",
          "resolution": 23,
          "protocol": "BISS_C",
          "modelSuffix": "-S0"
        },
        {
          "type": "MULTI_TURN",
          "resolution": 23,
          "protocol": "BISS_C",
          "modelSuffix": "-M0"
        }
      ],
      "options": {
        "brake": {
          "available": true,
          "torque": 0.32,
          "voltage": 24,
          "power": 7.2,
          "modelSuffix": "-B1"
        },
        "keyShaft": {
          "available": true,
          "modelSuffix": "-K0"
        },
        "oilSeal": {
          "available": true,
          "modelSuffix": "-O0"
        }
      },
      "dimensions": {
        "flange": "IEC 40 B14",
        "shaftDiameter": 8,
        "shaftLength": 25,
        "overallLength": 78,
        "overallLengthWithBrake": 108
      },
      "matchedDrives": ["XC20-004", "XC20-008"],
      "documentation": {
        "datasheet": "/docs/datasheets/MC20-040.pdf",
        "cadModel": "/cad/MC20-040.step",
        "manual": "/docs/manuals/MC20-User-Manual.pdf"
      }
    }
  ]
}
```

---

## 3. XC20 驱动器数据规格

### 3.1 数据模型

```typescript
interface XC20Drive {
  // 基本信息
  id: string;
  model: string;
  series: string;
  powerRating: number;           // 功率等级 (W)

  // 电气参数
  inputVoltage: {                // 输入电压
    singlePhase?: { min: number; max: number }; // V
    threePhase?: { min: number; max: number };  // V
  };
  ratedOutputCurrent: number;    // 额定输出电流 (A)
  peakOutputCurrent: number;     // 峰值输出电流 (A), 通常3倍额定
  dcBusVoltage: number;          // 直流母线电压 (V)

  // 制动单元
  braking: {
    internalResistor: number;    // 内置制动电阻功率 (W)
    internalResistance: number;  // 内置制动电阻阻值 (Ω)
    maxExternalResistor: number; // 最大外接制动电阻功率 (W)
    minExternalResistance: number; // 最小外接制动电阻阻值 (Ω)
    brakingVoltage: number;      // 制动开启电压 (V)
  };

  // 通讯接口
  communicationInterfaces: {
    type: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
    modelSuffix: string;
    specs?: {
      cycleTime?: number;        // 最小循环周期 (μs)
      topology?: string;         // 拓扑支持
    };
  }[];

  // 编码器支持
  encoderSupport: {
    type: 'SINGLE_TURN' | 'MULTI_TURN';
    protocol: 'BISS_C' | 'ENDAT' | 'HIPERFACE';
    maxResolution: number;       // 最大支持分辨率 (bit)
  }[];

  // 控制性能
  controlPerformance: {
    currentLoopBandwidth: number;  // 电流环带宽 (Hz)
    speedLoopBandwidth: number;    // 速度环带宽 (Hz)
    positionLoopBandwidth: number; // 位置环带宽 (Hz)
  };

  // 保护功能
  protections: string[];         // 过流、过压、欠压、过热等

  // EMC滤波器
  emcFilter: {
    internal: boolean;
    externalOptions: {
      class: 'C3';
      model: string;
    }[];
  };

  // 物理参数
  dimensions: {
    width: number;               // mm
    height: number;              // mm
    depth: number;               // mm
  };
  weight: number;                // kg
  mounting: string;              // 安装方式

  // 环境条件
  ambientConditions: {
    temperature: { min: number; max: number }; // °C
    humidity: { min: number; max: number };    // %RH
    altitude: { max: number };                 // m
  };

  // 兼容电机
  compatibleMotors: string[];    // 兼容的电机型号列表

  // 技术文档
  documentation: {
    datasheet: string;
    manual: string;
    commissioning: string;
  };
}
```

### 3.2 XC20 系列完整参数表

| 型号 | 功率等级 | 额定电流 | 峰值电流 | 内置制动 | 外接制动 | 供电电压 |
|------|----------|----------|----------|----------|----------|----------|
| XC20-004 | 400W | 2.8A | 8.4A | 50W | 200W | 单相/三相 200-240V |
| XC20-008 | 750W | 5.5A | 16.5A | 50W | 400W | 单相/三相 200-240V |
| XC20-015 | 1.5kW | 9.5A | 28.5A | 100W | 800W | 三相 200-240V |
| XC20-030 | 3.0kW | 17A | 51A | 100W | 1500W | 三相 200-240V |
| XC20-050 | 5.0kW | 25A | 75A | 200W | 2500W | 三相 380-480V |
| XC20-075 | 7.5kW | 35A | 105A | 200W | 3500W | 三相 380-480V |

### 3.3 通讯接口配置

| 驱动器型号 | EtherCAT | PROFINET | EtherNet-IP | 模拟量 |
|------------|----------|----------|-------------|--------|
| XC20-004 | ● | ● | ● | ● |
| XC20-008 | ● | ● | ● | ● |
| XC20-015 | ● | ● | ● | - |
| XC20-030 | ● | ● | ● | - |
| XC20-050 | ● | ● | ● | - |
| XC20-075 | ● | ● | ● | - |

### 3.4 JSON 数据示例

```json
{
  "drives": [
    {
      "id": "xc20-004",
      "model": "XC20-004-00-0-0",
      "series": "XC20",
      "powerRating": 400,
      "inputVoltage": {
        "singlePhase": { "min": 200, "max": 240 },
        "threePhase": { "min": 200, "max": 240 }
      },
      "ratedOutputCurrent": 2.8,
      "peakOutputCurrent": 8.4,
      "dcBusVoltage": 565,
      "braking": {
        "internalResistor": 50,
        "internalResistance": 100,
        "maxExternalResistor": 200,
        "minExternalResistance": 15,
        "brakingVoltage": 380
      },
      "communicationInterfaces": [
        {
          "type": "ETHERCAT",
          "modelSuffix": "-EC",
          "specs": { "cycleTime": 62.5, "topology": "line" }
        },
        {
          "type": "PROFINET",
          "modelSuffix": "-PN",
          "specs": { "cycleTime": 250, "topology": "line/star" }
        },
        {
          "type": "ETHERNET_IP",
          "modelSuffix": "-EIP",
          "specs": { "cycleTime": 250, "topology": "line/DLR" }
        },
        {
          "type": "ANALOG",
          "modelSuffix": "-AN"
        }
      ],
      "encoderSupport": [
        { "type": "SINGLE_TURN", "protocol": "BISS_C", "maxResolution": 24 },
        { "type": "MULTI_TURN", "protocol": "BISS_C", "maxResolution": 24 }
      ],
      "controlPerformance": {
        "currentLoopBandwidth": 2000,
        "speedLoopBandwidth": 500,
        "positionLoopBandwidth": 200
      },
      "protections": [
        "Overcurrent",
        "Overvoltage",
        "Undervoltage",
        "Overtemperature",
        "MotorOverload",
        "EncoderFault"
      ],
      "emcFilter": {
        "internal": true,
        "externalOptions": [
          { "class": "C3", "model": "EMC-C3-004" }
        ]
      },
      "dimensions": {
        "width": 60,
        "height": 160,
        "depth": 170
      },
      "weight": 1.2,
      "mounting": "DIN rail or Panel",
      "ambientConditions": {
        "temperature": { "min": 0, "max": 55 },
        "humidity": { "min": 5, "max": 95 },
        "altitude": { "max": 1000 }
      },
      "compatibleMotors": [
        "MC20-004", "MC20-008", "MC20-010",
        "MC20-020", "MC20-040"
      ],
      "documentation": {
        "datasheet": "/docs/datasheets/XC20-004.pdf",
        "manual": "/docs/manuals/XC20-User-Manual.pdf",
        "commissioning": "/docs/guides/XC20-Commissioning.pdf"
      }
    }
  ]
}
```

---

## 4. 电缆数据规格

### 4.1 数据模型

```typescript
interface CableSpec {
  id: string;
  type: 'MOTOR' | 'ENCODER' | 'COMMUNICATION';
  model: string;

  // 适用性
  compatibleMotors: string[];    // 适用的电机型号
  compatibleDrives: string[];    // 适用的驱动器型号

  // 长度选项
  standardLengths: number[];     // 标准长度列表 (m)
  maxCustomLength: number;       // 最大定制长度 (m)
  lengthIncrement: number;       // 长度增量 (m)

  // 端子选项
  terminalOnlyOption: {
    available: boolean;
    terminalKitModel: string;
    instructionsDoc: string;
  };

  // 电气规格
  electrical: {
    conductorSize?: string;      // 导线截面积 (如 "0.75mm²")
    ratedVoltage: number;        // 额定电压 (V)
    ratedCurrent?: number;       // 额定电流 (A)
    shielding: string;           // 屏蔽类型
  };

  // 机械规格
  mechanical: {
    outerDiameter: number;       // 外径 (mm)
    minBendRadius: number;       // 最小弯曲半径 (mm)
    weightPerMeter: number;      // 单位重量 (kg/m)
  };

  // 环境规格
  environmental: {
    temperatureRange: { min: number; max: number }; // °C
    oilResistant: boolean;
    flexRating?: number;         // 弯曲寿命 (次)
  };

  // 连接器
  connectors: {
    motorSide: string;
    driveSide: string;
  };
}
```

### 4.2 电缆型号列表

#### 动力电缆 (Motor Cable)

| 型号 | 适用电机 | 导线规格 | 额定电流 | 外径 | 标准长度 |
|------|----------|----------|----------|------|----------|
| CAB-MOT-04 | MC20-004~040 | 4×0.75mm² | 6A | 6.5mm | 3, 5, 10, 15, 20m |
| CAB-MOT-10 | MC20-060~100 | 4×1.5mm² | 12A | 8.0mm | 3, 5, 10, 15, 20m |
| CAB-MOT-16 | MC20-130 | 4×2.5mm² | 20A | 9.5mm | 3, 5, 10, 15, 20m |

#### 编码器电缆 (Encoder Cable)

| 型号 | 适用电机 | 导线规格 | 外径 | 标准长度 |
|------|----------|----------|------|----------|
| CAB-ENC-STD | 全系列 | 6×0.25mm² | 5.0mm | 3, 5, 10, 15, 20m |

#### 通讯电缆 (Communication Cable)

| 型号 | 适用协议 | 导线规格 | 外径 | 标准长度 |
|------|----------|----------|------|----------|
| CAB-COM-EC | EtherCAT | 4×0.25mm² | 5.5mm | 3, 5, 10m |
| CAB-COM-PN | PROFINET | 4×0.34mm² | 6.0mm | 3, 5, 10m |
| CAB-COM-EIP | EtherNet-IP | 4×0.34mm² | 6.0mm | 3, 5, 10m |

### 4.3 JSON 数据示例

```json
{
  "cables": [
    {
      "id": "cab-mot-04",
      "type": "MOTOR",
      "model": "CAB-MOT-04",
      "compatibleMotors": ["MC20-004", "MC20-008", "MC20-010", "MC20-020", "MC20-040"],
      "compatibleDrives": ["XC20-004", "XC20-008"],
      "standardLengths": [3, 5, 10, 15, 20],
      "maxCustomLength": 50,
      "lengthIncrement": 1,
      "terminalOnlyOption": {
        "available": true,
        "terminalKitModel": "TK-MOT-04",
        "instructionsDoc": "/docs/cable-making/Motor-Cable-Assembly.pdf"
      },
      "electrical": {
        "conductorSize": "4×0.75mm²",
        "ratedVoltage": 600,
        "ratedCurrent": 6,
        "shielding": "Braided copper, 85% coverage"
      },
      "mechanical": {
        "outerDiameter": 6.5,
        "minBendRadius": 65,
        "weightPerMeter": 0.08
      },
      "environmental": {
        "temperatureRange": { "min": -40, "max": 80 },
        "oilResistant": true,
        "flexRating": 1000000
      },
      "connectors": {
        "motorSide": "MIL-DTL-5015 10-4S",
        "driveSide": "Phoenix Contact MSTB 2.5/4-ST"
      }
    }
  ]
}
```

---

## 5. 制动电阻数据

### 5.1 数据模型

```typescript
interface BrakeResistor {
  id: string;
  model: string;

  // 电气参数
  resistance: number;            // 阻值 (Ω)
  continuousPower: number;       // 持续功率 (W)
  peakPower: number;             // 峰值功率 (W)
  dutyCycle: number;             // 推荐占空比 (%)

  // 保护
  thermalProtection: boolean;    // 是否内置热保护
  temperatureSwitch?: {
    type: string;
    rating: number;              // 动作温度 (°C)
  };

  // 物理参数
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  weight: number;
  mounting: string;

  // 环境
  cooling: 'NATURAL' | 'FORCED';
  ambientTemperature: { min: number; max: number };

  // 兼容性
  compatibleDrives: string[];
}
```

### 5.2 制动电阻型号列表

| 型号 | 阻值 | 持续功率 | 峰值功率 | 冷却方式 | 兼容驱动器 |
|------|------|----------|----------|----------|------------|
| BR-50-100 | 100Ω | 50W | 500W | 自然冷却 | XC20-004, XC20-008 |
| BR-100-50 | 50Ω | 100W | 1000W | 自然冷却 | XC20-008, XC20-015 |
| BR-200-30 | 30Ω | 200W | 2000W | 自然冷却 | XC20-015, XC20-030 |
| BR-400-15 | 15Ω | 400W | 4000W | 强制风冷 | XC20-030, XC20-050 |
| BR-800-10 | 10Ω | 800W | 8000W | 强制风冷 | XC20-050, XC20-075 |

---

## 6. EMC滤波器数据

### 6.1 数据模型

```typescript
interface EMCFilter {
  id: string;
  model: string;
  class: 'C3';                   // EMC等级

  // 电气参数
  ratedVoltage: number;
  ratedCurrent: number;
  leakageCurrent: number;

  // 衰减特性
  attenuation: {
    frequency: number;           // MHz
    attenuation: number;         // dB
  }[];

  // 物理参数
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  weight: number;

  // 兼容性
  compatibleDrives: string[];
}
```

### 6.2 EMC滤波器型号列表

| 型号 | 等级 | 额定电流 | 泄漏电流 | 兼容驱动器 |
|------|------|----------|----------|------------|
| EMC-C3-004 | C3 | 6A | <3.5mA | XC20-004, XC20-008 |
| EMC-C3-015 | C3 | 16A | <3.5mA | XC20-015, XC20-030 |
| EMC-C3-050 | C3 | 32A | <3.5mA | XC20-050, XC20-075 |

---

## 7. 数据维护流程

### 7.1 更新流程

```
1. 产品部提供最新产品数据
   ↓
2. 工程部验证数据准确性
   ↓
3. 更新JSON数据文件
   ↓
4. 运行数据验证脚本
   ↓
5. 提交Git版本控制
   ↓
6. 部署到生产环境
```

### 7.2 数据验证规则

```typescript
// 数据验证脚本
function validateMotorData(motor: MC20Motor): string[] {
  const errors: string[] = [];

  // 基本验证
  if (motor.ratedTorque <= 0) errors.push('额定扭矩必须大于0');
  if (motor.peakTorque < motor.ratedTorque) errors.push('峰值扭矩必须大于额定扭矩');
  if (motor.maxSpeed < motor.ratedSpeed) errors.push('最高转速必须大于额定转速');

  // 关系验证
  const expectedPeakTorque = motor.ratedTorque * 3;
  if (Math.abs(motor.peakTorque - expectedPeakTorque) / expectedPeakTorque > 0.1) {
    errors.push('峰值扭矩与额定扭矩比例异常');
  }

  // 匹配验证
  if (motor.matchedDrives.length === 0) errors.push('未指定匹配驱动器');

  return errors;
}
```

### 7.3 版本管理

| 数据文件 | 当前版本 | 最后更新 | 更新说明 |
|----------|----------|----------|----------|
| motors.json | v1.0.0 | 2026-02-27 | 初始版本，包含全系列MC20电机 |
| drives.json | v1.0.0 | 2026-02-27 | 初始版本，包含全系列XC20驱动器 |
| cables.json | v1.0.0 | 2026-02-27 | 初始版本，包含标准电缆系列 |
| resistors.json | v1.0.0 | 2026-02-27 | 初始版本，包含标准制动电阻 |

---

## 8. 附录

### 8.1 型号命名规则

#### MC20 电机型号格式

```
MC20-AAA-BB-C-D-E

AAA: 功率代码 (004, 008, 010, 020, 040, 060, 075, 100, 150, 200, 300, 500, 700)
 BB: 额定转速 (10=1000rpm, 30=3000rpm)
  C: 电压等级 (2=200V, 4=400V)
  D: 编码器类型 (S=单圈, M=多圈)
  E: 选项 (B0=无抱闸, B1=有抱闸, K0=键槽, O0=油封)

示例: MC20-040-30-2-S0-B1
  - 400W, 3000rpm, 200V级, 单圈编码器, 带抱闸
```

#### XC20 驱动器型号格式

```
XC20-AAA-BB-C-D

AAA: 功率代码 (004, 008, 015, 030, 050, 075)
 BB: 通讯接口 (EC=EtherCAT, PN=PROFINET, EIP=EtherNet-IP, AN=模拟量)
  C: 电压等级 (2=200V, 4=400V)
  D: 选项 (预留)

示例: XC20-008-EC-2
  - 750W, EtherCAT接口, 200V级
```

### 8.2 参考资料

1. **Bosch Rexroth**. "MC20 Servo Motor Catalog"
2. **Bosch Rexroth**. "XC20 Servo Drive Technical Manual"
3. **Bosch Rexroth**. "Accessories and Cables Selection Guide"
4. **IEC 61800-5-2**. "Adjustable speed electrical power drive systems"

---

## 9. 文档维护记录

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2026-02-27 | 初始版本 | - |
