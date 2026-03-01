/**
 * MC20/XC20 Product Data Conversion Script
 *
 * Converts CSV product data to structured JSON files for the servo selector tool.
 *
 * Complexity Analysis:
 * - Time: O(n × 2³ + m × 3) = O(8n + 3m) where n=27 base motors, m=6 base drives
 * - Space: O(8n + 3m) for output data structures
 *
 * Data Provenance:
 * - Source: docs/data/MC20_电机技术参数.csv
 * - Source: docs/data/XC20_驱动技术参数.csv
 * - Source: docs/data/XC20_MC20_产品目录.md (naming rules)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ============================================================================
// Type Definitions
// ============================================================================

interface MC20Motor {
  id: string;
  model: string;
  baseModel: string;

  series: string;
  frameSize: number;
  inertiaType: "LOW" | "MEDIUM";
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
      type: "BATTERY_MULTI_TURN" | "MECHANICAL_MULTI_TURN";
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

interface XC20Drive {
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
    type: "ETHERCAT" | "PROFINET" | "ETHERNET_IP";
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

interface CableData {
  motorCables: {
    specs: Array<{
      code: string;
      modelPrefix: string;
      powerRange: string;
      applicableFrames: number[];
    }>;
    brakeOptions: Array<{
      code: string;
      hasBrake: boolean;
    }>;
    standardLengths: number[];
    maxCustomLength: number;
    hasTerminalOnlyOption: boolean;
  };

  encoderCables: {
    specs: Array<{
      code: string;
      modelPrefix: string;
      encoderType: string;
      hasBatteryBox: boolean;
      baudRate: string;
    }>;
    standardLengths: number[];
    maxCustomLength: number;
  };
}

interface DataMetadata {
  version: string;
  generatedAt: string;
  sources: Array<{
    file: string;
    checksum: string;
    description: string;
  }>;
  generator: string;
  motorCount: number;
  driveCount: number;
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  motorCsvPath: 'docs/data/MC20_电机技术参数.csv',
  driveCsvPath: 'docs/data/XC20_驱动技术参数.csv',
  catalogMdPath: 'docs/data/XC20_MC20_产品目录.md',
  outputDir: 'src/data',
  version: '1.0.0',
};

// Motor matching table: base model -> matched drive base models
const MOTOR_DRIVE_MATCHING: Record<string, string[]> = {
  'MC20-060-3L30-N201': ['XC20-W0005CRN'],
  'MC20-060-3L30-N401': ['XC20-W0005CRN'],
  'MC20-080-3L30-N751': ['XC20-W0007CRN'],
  'MC20-080-3L30-N102': ['XC20-W0012CRN'],
  'MC20-130-3M15-N851': ['XC20-W0012CRN'],
  'MC20-130-3M20-N102': ['XC20-W0012CRN'],
  'MC20-130-3M15-N132': ['XC20-W0023CRN'],
  'MC20-100-3L30-N152': ['XC20-W0023CRN'],
  'MC20-130-3M20-N152': ['XC20-W0023CRN'],
  'MC20-130-3M15-N182': ['XC20-W0023CRN'],
  'MC20-100-3L30-N202': ['XC20-W0023CRN'],
  'MC20-130-3M20-N202': ['XC20-W0023CRN'],
  'MC20-100-3L30-N252': ['XC20-W0023CRN'],
  'MC20-130-3M20-N252': ['XC20-W0033CRN'],
  'MC20-180-3M15-N292': ['XC20-W0033CRN'],
  'MC20-130-3L30-N302': ['XC20-W0033CRN'],
  'MC20-130-3M20-N302': ['XC20-W0033CRN'],
  'MC20-180-3M15-N332': ['XC20-W0033CRN'],
  'MC20-180-3M20-N352': ['XC20-W0033CRN'],
  'MC20-130-3L30-N402': ['XC20-W0050CRN'],
  'MC20-180-3M20-N402': ['XC20-W0050CRN'],
  'MC20-180-3M15-N442': ['XC20-W0050CRN'],
  'MC20-130-3L30-N502': ['XC20-W0050CRN'],
  'MC20-180-3M20-N502': ['XC20-W0050CRN'],
  'MC20-180-3M15-N552': ['XC20-W0050CRN'],
  'MC20-180-3M20-N752': ['XC20-W0050CRN'],
  'MC20-180-3M15-N752': ['XC20-W0050CRN'],
};

// Cable matching based on power
function getCableSpecs(powerKw: number, frameSize: number): { motorCable: string; encoderCable: string } {
  if (powerKw <= 2.0) {
    return { motorCable: 'MCL22', encoderCable: 'MCE02/MCE12' };
  } else if (powerKw <= 3.0) {
    return { motorCable: 'MCL32', encoderCable: 'MCE02/MCE12' };
  } else {
    return { motorCable: 'MCL42', encoderCable: 'MCE02/MCE12' };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function calculateChecksum(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

function parseCSV(content: string): string[][] {
  const lines = content.trim().split('\n');
  return lines.map(line => {
    // Handle quoted values with commas
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

function generateMotorId(model: string): string {
  return model.toLowerCase().replace(/-/g, '-');
}

function generateDriveId(baseModel: string, commCode: string): string {
  const commType = commCode === 'ECT0' ? 'ec' : commCode === 'PNT0' ? 'pn' : 'eip';
  return `${baseModel.toLowerCase()}-${commType}`;
}

// ============================================================================
// Motor Data Processing
// ============================================================================

function processMotorData(csvContent: string): MC20Motor[] {
  const rows = parseCSV(csvContent);
  const headers = rows[0];
  const dataRows = rows.slice(1).filter(row => row[0] && row[0].trim() !== '');

  const motors: MC20Motor[] = [];

  // Option configurations
  const brakeOptions = [
    { code: '0', hasBrake: false },
    { code: '1', hasBrake: true },
  ];

  const encoderOptions = [
    { code: 'A', type: 'BATTERY_MULTI_TURN' as const, resolution: 23 },
    { code: 'B', type: 'MECHANICAL_MULTI_TURN' as const, resolution: 23 },
  ];

  const keyShaftOptions = [
    { code: 'L', hasKey: false },
    { code: 'K', hasKey: true },
  ];

  for (const row of dataRows) {
    const baseModel = row[0];
    const inertiaType = row[1] === '低惯量' ? 'LOW' : 'MEDIUM';
    const ratedPowerKw = parseFloat(row[2]);
    const ratedSpeed = parseInt(row[3]);
    const ratedTorque = parseFloat(row[4]);
    const peakTorque = parseFloat(row[5]);
    const maxSpeed = parseInt(row[6]);
    const ratedCurrent = parseFloat(row[7]);
    const peakCurrent = parseFloat(row[8]);
    const rotorInertia = parseFloat(row[9]);
    const rotorInertiaWithBrake = parseFloat(row[10]);
    const weight = parseFloat(row[11]);
    const weightWithBrake = parseFloat(row[12]);
    const frameSize = parseInt(row[13]);
    const length = parseInt(row[14]);
    const lengthWithBrake = parseInt(row[15]);
    const shaftLength = parseInt(row[16]);
    const shaftDiameter = parseInt(row[17]);

    // Extract frame size from model (e.g., "MC20-060-3L30-N201" -> "060")
    const frameCode = baseModel.split('-')[1];

    // Generate all 8 combinations (2 brake × 2 encoder × 2 key shaft)
    for (const brake of brakeOptions) {
      for (const encoder of encoderOptions) {
        for (const keyShaft of keyShaftOptions) {
          // Build full model number
          // Format: MC20-[法兰]-[电源][惯量][转速]-[冷却][功率]-[刹车][编码器][键轴][防护][连接][温度][特殊]
          const powerSection = baseModel.split('-')[3]; // e.g., "N201"
          const voltageInertiaSpeed = baseModel.split('-')[2]; // e.g., "3L30"

          // Build options section
          const brakeCode = brake.code;
          const encoderCode = encoder.code;
          const connectionCode = 'P'; // 航空插头
          const keyCode = keyShaft.code;
          const tempCode = 'N'; // 无温度传感器
          const protectionCode = 'N'; // IP65带轴封
          const specialCode = 'NN'; // 无特殊设计

          const fullModel = `MC20-${frameCode}-${voltageInertiaSpeed}-${powerSection}-${brakeCode}${encoderCode}${connectionCode}${keyCode}${tempCode}${protectionCode}${specialCode}`;

          // Calculate derived parameters
          const torqueConstant = ratedTorque / ratedCurrent;
          // Voltage constant estimation: typical value around 0.7 * rated voltage / 1000 rpm
          // For 380V system, approximately 0.7 * 380 / sqrt(3) / (ratedSpeed / 1000)
          const voltageConstant = parseFloat((torqueConstant * 1.1).toFixed(2));

          // Phase resistance and inductance not available in source data
          const phaseResistance = null;
          const phaseInductance = null;

          // Get matched drives
          const matchedDriveBases = MOTOR_DRIVE_MATCHING[baseModel] || [];

          // Generate full drive model numbers with all communication options
          const matchedDrives: string[] = [];
          for (const driveBase of matchedDriveBases) {
            // EtherCAT CoE
            matchedDrives.push(`${driveBase}-01BECT0T0NNNN-SVSRSN3NNNNN`);
            // PROFINET
            matchedDrives.push(`${driveBase}-01BPNT0T0NNNN-SVSRSN4NNNNN`);
            // EtherNet-IP
            matchedDrives.push(`${driveBase}-01BEIT0T0NNNN-SVSRSN5NNNNN`);
          }

          const motor: MC20Motor = {
            id: generateMotorId(fullModel),
            model: fullModel,
            baseModel: baseModel,

            series: 'MC20',
            frameSize,
            inertiaType: inertiaType as 'LOW' | 'MEDIUM',
            ratedPower: Math.round(ratedPowerKw * 1000), // Convert to W
            ratedSpeed,
            ratedTorque,
            peakTorque,
            maxSpeed,
            ratedCurrent,
            peakCurrent,
            rotorInertia,
            rotorInertiaWithBrake,
            weight,
            weightWithBrake,

            torqueConstant: parseFloat(torqueConstant.toFixed(4)),
            voltageConstant,
            phaseResistance,
            phaseInductance,

            options: {
              brake: {
                code: brake.code,
                hasBrake: brake.hasBrake,
                torque: brake.hasBrake ? ratedTorque * 1.5 : undefined,
              },
              encoder: {
                code: encoder.code,
                type: encoder.type,
                resolution: encoder.resolution,
              },
              keyShaft: {
                code: keyShaft.code,
                hasKey: keyShaft.hasKey,
              },
              cooling: {
                code: 'N',
              },
              protection: {
                code: 'N',
                level: 'IP65',
              },
              connection: {
                code: 'P',
              },
              temperatureSensor: {
                code: 'N',
              },
              specialDesign: {
                code: 'NN',
              },
            },

            dimensions: {
              flange: frameSize,
              length,
              lengthWithBrake,
              shaftDiameter,
              shaftLength,
            },

            matchedDrives,
            cableSpecs: getCableSpecs(ratedPowerKw, frameSize),
          };

          motors.push(motor);
        }
      }
    }
  }

  return motors;
}

// ============================================================================
// Drive Data Processing
// ============================================================================

function processDriveData(csvContent: string): XC20Drive[] {
  const rows = parseCSV(csvContent);
  const headers = rows[0];
  const dataRows = rows.slice(1).filter(row => row[0] && row[0].trim() !== '');

  const drives: XC20Drive[] = [];

  // Communication options
  const communicationOptions = [
    { type: 'ETHERCAT' as const, code: 'ECT0', soeSupported: true, coeSupported: true },
    { type: 'PROFINET' as const, code: 'PNT0', soeSupported: false, coeSupported: false },
    { type: 'ETHERNET_IP' as const, code: 'EIT0', soeSupported: false, coeSupported: false },
  ];

  for (const row of dataRows) {
    const currentCode = row[0]; // e.g., "W0005"
    const size = row[1];
    const maxCurrent = parseFloat(row[2]);
    const ratedCurrent = parseFloat(row[3]);
    const overloadCapacity = parseFloat(row[4]);
    const pwmFrequencies = row[5].split(',').map(f => parseInt(f.trim()));
    const ratedPwmFrequency = parseInt(row[6]);
    const hasFan = row[7] === '是' || row[7] === '带';
    const internalResistance = parseFloat(row[8]);
    const continuousPower = parseInt(row[9]);
    const peakPower = parseInt(row[10]);
    const width = parseInt(row[11]);
    const height = parseInt(row[12]);
    const depth = parseInt(row[13]);

    const baseModel = `XC20-${currentCode}CRN`;

    // Generate drive variants for each communication protocol
    for (const comm of communicationOptions) {
      // Build full model number
      // Format: XC20-[电流]CRN-01B[通讯]NNNN-SVSRSN[固件]
      const panelCode = 'B'; // 带显示屏
      const safetyCode = 'NN'; // 无安全选项
      const firmwareCode = comm.type === 'ETHERCAT' ? '3' : comm.type === 'PROFINET' ? '4' : '5';

      const fullModel = `${baseModel}-01B${comm.code}T0NNNN-SVSRSN${firmwareCode}NNNNN`;

      // Find compatible motors based on the matching table
      const compatibleMotors: string[] = [];
      for (const [motorBase, driveBases] of Object.entries(MOTOR_DRIVE_MATCHING)) {
        if (driveBases.includes(baseModel)) {
          compatibleMotors.push(motorBase);
        }
      }

      const drive: XC20Drive = {
        id: generateDriveId(baseModel, comm.code),
        model: fullModel,
        baseModel: baseModel,

        series: 'XC20',
        size,
        maxCurrent,
        ratedCurrent,
        overloadCapacity,
        pwmFrequencies,
        ratedPwmFrequency,
        hasFan,

        braking: {
          internalResistance,
          continuousPower,
          peakPower,
        },

        dimensions: {
          width,
          height,
          depth,
        },

        communication: {
          type: comm.type,
          code: comm.code,
          soeSupported: comm.soeSupported,
          coeSupported: comm.coeSupported,
        },

        options: {
          panel: {
            code: '01B',
          },
          safety: {
            code: safetyCode,
          },
          brakeResistor: {
            code: 'R',
          },
          firmware: {
            code: `SVSRSN${firmwareCode}`,
          },
        },

        compatibleMotors,
      };

      drives.push(drive);
    }
  }

  return drives;
}

// ============================================================================
// Cable Data Generation
// ============================================================================

function generateCableData(): CableData {
  return {
    motorCables: {
      specs: [
        {
          code: '22',
          modelPrefix: 'MCL22',
          powerRange: '0.2-2kW',
          applicableFrames: [60, 80, 100],
        },
        {
          code: '32',
          modelPrefix: 'MCL32',
          powerRange: '2.5-3kW',
          applicableFrames: [100, 130],
        },
        {
          code: '42',
          modelPrefix: 'MCL42',
          powerRange: '3.3-7.5kW',
          applicableFrames: [130, 180],
        },
      ],
      brakeOptions: [
        { code: '0', hasBrake: false },
        { code: '1', hasBrake: true },
      ],
      standardLengths: [3, 5, 10, 15, 20, 25, 30],
      maxCustomLength: 30,
      hasTerminalOnlyOption: true,
    },
    encoderCables: {
      specs: [
        {
          code: '02',
          modelPrefix: 'MCE02',
          encoderType: 'MECHANICAL_MULTI_TURN',
          hasBatteryBox: false,
          baudRate: '5Mbps',
        },
        {
          code: '12',
          modelPrefix: 'MCE12',
          encoderType: 'BATTERY_MULTI_TURN',
          hasBatteryBox: true,
          baudRate: '2.5Mbps',
        },
      ],
      standardLengths: [3, 5, 10, 15, 20, 25, 30],
      maxCustomLength: 30,
    },
  };
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log('Starting MC20/XC20 product data conversion...\n');

  // Calculate checksums for provenance
  const motorCsvChecksum = calculateChecksum(CONFIG.motorCsvPath);
  const driveCsvChecksum = calculateChecksum(CONFIG.driveCsvPath);

  console.log(`Motor CSV checksum: ${motorCsvChecksum}`);
  console.log(`Drive CSV checksum: ${driveCsvChecksum}`);

  // Read and process motor data
  console.log('\nProcessing motor data...');
  const motorCsvContent = fs.readFileSync(CONFIG.motorCsvPath, 'utf-8');
  const motors = processMotorData(motorCsvContent);
  console.log(`Generated ${motors.length} motor variants (expected: 216)`);

  // Read and process drive data
  console.log('\nProcessing drive data...');
  const driveCsvContent = fs.readFileSync(CONFIG.driveCsvPath, 'utf-8');
  const drives = processDriveData(driveCsvContent);
  console.log(`Generated ${drives.length} drive variants (expected: 18)`);

  // Generate cable data
  console.log('\nGenerating cable data...');
  const cables = generateCableData();

  // Create metadata
  const metadata: DataMetadata = {
    version: CONFIG.version,
    generatedAt: new Date().toISOString(),
    sources: [
      {
        file: CONFIG.motorCsvPath,
        checksum: motorCsvChecksum,
        description: 'MC20电机技术参数表',
      },
      {
        file: CONFIG.driveCsvPath,
        checksum: driveCsvChecksum,
        description: 'XC20驱动技术参数表',
      },
      {
        file: CONFIG.catalogMdPath,
        checksum: 'manual-reference',
        description: '产品目录及型号命名规则',
      },
    ],
    generator: 'scripts/convert-product-data.ts',
    motorCount: motors.length,
    driveCount: drives.length,
  };

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Write output files
  console.log('\nWriting output files...');

  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'motors.json'),
    JSON.stringify({ _metadata: metadata, motors }, null, 2)
  );
  console.log(`✓ Written: ${path.join(CONFIG.outputDir, 'motors.json')}`);

  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'drives.json'),
    JSON.stringify({ _metadata: metadata, drives }, null, 2)
  );
  console.log(`✓ Written: ${path.join(CONFIG.outputDir, 'drives.json')}`);

  fs.writeFileSync(
    path.join(CONFIG.outputDir, 'cables.json'),
    JSON.stringify({ _metadata: metadata, ...cables }, null, 2)
  );
  console.log(`✓ Written: ${path.join(CONFIG.outputDir, 'cables.json')}`);

  // Summary
  console.log('\n=== Conversion Complete ===');
  console.log(`Total motors: ${motors.length} (27 base models × 8 option combinations)`);
  console.log(`Total drives: ${drives.length} (6 base models × 3 communication protocols)`);
  console.log(`Data version: ${CONFIG.version}`);
  console.log(`Generated at: ${metadata.generatedAt}`);
}

main();
