import type { MC20Motor, XC20Drive, MotorSelections } from '@/types';

/**
 * 订货号生成器
 * 根据用户选择生成完整的产品订货号
 */
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

    // 根据通讯类型获取硬件代码
    const busCodeMap: Record<string, string> = {
      'ETHERCAT': 'EC',
      'PROFINET': 'PN',
      'ETHERNET_IP': 'EI',
      'ANALOG': 'NN',
    };
    const busCode = busCodeMap[options.communication] || 'NN';

    const safetyCode = options.safety === 'STO' ? 'T0' : 'NN';
    const hwReserved = 'NNNN';
    const hwSection = `${hwPrefix}${panelCode}${busCode}${safetyCode}${hwReserved}`;

    // 第3段: 固件选项 [固件][固预1][总线][PLC][固预2]
    const firmwareVersion = 'SVSRS';
    const fwReserved1 = 'N';

    // 根据通讯类型获取固件代码
    const fwBusCodeMap: Record<string, string> = {
      'ETHERCAT': '3', // CoE
      'PROFINET': '4',
      'ETHERNET_IP': '5',
      'ANALOG': 'N',
    };
    const fwBusCode = fwBusCodeMap[options.communication] || 'N';

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
