// 伺服选型工具类型定义

// ============ 机械类型 ============

export type MechanismType = 'BALL_SCREW' | 'GEARBOX' | 'DIRECT_DRIVE' | 'BELT' | 'RACK_PINION';

export interface BallScrewParams {
  loadMass: number;
  lead: number;
  screwDiameter: number;
  screwLength: number;
  gearRatio: number;
  efficiency: number;
  frictionCoeff: number;
  preloadTorque: number;
}

export interface GearboxParams {
  loadMass: number;
  loadType: 'TABLE' | 'DRUM' | 'OTHER';
  tableDiameter?: number;
  drumDiameter?: number;
  gearRatio: number;
  efficiency: number;
  frictionTorque: number;
  gravityArmLength: number;
}

export interface DirectDriveParams {
  driveType: 'ROTARY' | 'LINEAR';
  loadMass: number;
  tableDiameter?: number;
  stroke?: number;
  efficiency: number;
}

export interface BeltParams {
  loadMass: number;
  pulleyDiameter: number;
  drivenPulleyDiameter: number;
  beltLength: number;
  beltMassPerMeter: number;
  efficiency: number;
  tensionForce: number;
}

export interface RackPinionParams {
  loadMass: number;
  pinionDiameter: number;
  gearRatio: number;
  efficiency: number;
  frictionCoeff: number;
  mountingAngle: number;
}

export type MechanismParams =
  | BallScrewParams
  | GearboxParams
  | DirectDriveParams
  | BeltParams
  | RackPinionParams;

// ============ 选型输入 ============

export interface ProjectInfo {
  name: string;
  customer: string;
  salesPerson: string;
  notes?: string;
}

export interface MechanismConfig {
  type: MechanismType;
  params: MechanismParams;
}

export interface MotionParams {
  stroke: number;
  maxVelocity: number;
  maxAcceleration: number;
  profile: 'TRAPEZOIDAL' | 'S_CURVE';
  dwellTime: number;
  cycleTime: number;
}

export interface DutyConditions {
  ambientTemp: number;
  dutyCycle: number;
  mountingOrientation: 'HORIZONTAL' | 'VERTICAL_UP' | 'VERTICAL_DOWN';
  ipRating: 'IP54' | 'IP65' | 'IP67';
  brake: boolean;
}

export interface SystemPreferences {
  safetyFactor: number;
  maxInertiaRatio: number;
  targetInertiaRatio: number;  // 新增: 目标惯量比
  communication: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP' | 'ANALOG';
  safety: 'STO' | 'NONE';  // STO 安全功能选项
  cableLength: number | 'TERMINAL_ONLY';
}

// 新增: Step 5 用户选择
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

// ============ 产品数据 ============

/**
 * MC20电机完整数据接口
 * 基于产品目录和CSV数据生成
 */
export interface MC20Motor {
  id: string;
  model: string;
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

  torqueConstant: number;
  voltageConstant: number;
  phaseResistance: number | null;
  phaseInductance: number | null;

  options: {
    brake: {
      code: string;
      hasBrake: boolean;
      torque?: number;
    };
    encoder: {
      code: string;
      type: 'BATTERY_MULTI_TURN' | 'MECHANICAL_MULTI_TURN';
      resolution: number;
    };
    keyShaft: {
      code: string;
      hasKey: boolean;
    };
    cooling: {
      code: string;
    };
    protection: {
      code: string;
      level: string;
    };
    connection: {
      code: string;
    };
    temperatureSensor: {
      code: string;
    };
    specialDesign: {
      code: string;
    };
  };

  dimensions: {
    flange: number;
    length: number;
    lengthWithBrake: number;
    shaftDiameter: number;
    shaftLength: number;
  };

  matchedDrives: string[];
  cableSpecs: {
    motorCable: string;
    encoderCable: string;
  };
}

/**
 * XC20驱动器完整数据接口
 * 基于产品目录和CSV数据生成
 */
export interface XC20Drive {
  id: string;
  model: string;
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

  communication: {
    type: 'ETHERCAT' | 'PROFINET' | 'ETHERNET_IP';
    code: string;
    soeSupported?: boolean;
    coeSupported?: boolean;
  };

  options: {
    panel: {
      code: string;
    };
    safety: {
      code: string;
    };
    brakeResistor: {
      code: string;
    };
    firmware: {
      code: string;
    };
  };

  compatibleMotors: string[];
}

export interface BrakeResistor {
  id: string;
  model: string;
  resistance: number;
  continuousPower: number;
  peakPower: number;
  compatibleDrives: string[];
}

export interface CableConfig {
  type: 'MOTOR' | 'ENCODER' | 'COMMUNICATION';
  model: string;
  length: number | 'TERMINAL_ONLY';
  isTerminalOnly: boolean;
}

// ============ 计算结果 ============

export interface TorqueResult {
  accel: number;
  constant: number;
  decel: number;
  peak: number;
  rms: number;
}

export interface SpeedResult {
  max: number;
  rms: number;
}

export interface PowerResult {
  peak: number;
  continuous: number;
}

export interface RegenerationResult {
  energyPerCycle: number;
  brakingPower: number;
  requiresExternalResistor: boolean;
  warning?: string;
  recommendedResistor?: {
    minPower: number;
    resistance: number;
    dutyCycle: number;
  };
}

export interface MechanicalResult {
  loadInertia: number;
  totalInertia: number;
  inertiaRatio: number;
  torques: TorqueResult;
  speeds: SpeedResult;
  powers: PowerResult;
  regeneration: RegenerationResult;
}

// 新增: 电机可用选项
export interface MotorAvailableOptions {
  encoders: Array<'A' | 'B'>;
  hasBrakeOption: boolean;
  hasKeyOption: boolean;
  matchedDrives: string[];
}

export interface MotorRecommendation {
  motor: MC20Motor;
  matchScore: number;
  safetyMargins: {
    torque: number;
    speed: number;
    inertia: number;
  };
  feasibility: 'OK' | 'WARNING' | 'CRITICAL';
  warnings: string[];
  availableOptions?: MotorAvailableOptions;  // 新增
  systemConfig?: CompleteSystemConfig;
}

export interface SizingFailureReason {
  type: 'TORQUE' | 'PEAK_TORQUE' | 'SPEED' | 'ENCODER';
  message: string;
}

export interface CompleteSystemConfig {
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

// 新增: 系统配置结果
export interface SystemConfiguration {
  motor: {
    model: string;
    partNumber: string;
    options: MotorSelections['motorOptions'];
  };
  drive: {
    model: string;
    partNumber: string;
    options: MotorSelections['driveOptions'];
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

// ============ 向导状态 ============

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface WizardState {
  currentStep: WizardStep;
  input: Partial<SizingInput>;
  result?: SizingResult;
  selectedMotor?: MC20Motor;
  isComplete: boolean;
}
