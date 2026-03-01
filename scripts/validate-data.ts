/**
 * Data Validation Script for MC20/XC20 Product Data
 *
 * Validates the generated JSON files for correctness and consistency.
 *
 * Complexity Analysis:
 * - Time: O(n + m) where n=motor count, m=drive count
 * - Space: O(1) additional space
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Validation Functions
// ============================================================================

function validateMotors(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.motors || !Array.isArray(data.motors)) {
    return { valid: false, errors: ['Missing or invalid motors array'], warnings: [] };
  }

  const motors = data.motors;
  const seenIds = new Set<string>();
  const seenModels = new Set<string>();

  // Check count
  if (motors.length !== 216) {
    warnings.push(`Expected 216 motors, found ${motors.length}`);
  }

  for (const motor of motors) {
    // Required fields
    const requiredFields = [
      'id', 'model', 'baseModel', 'series', 'frameSize', 'inertiaType',
      'ratedPower', 'ratedSpeed', 'ratedTorque', 'peakTorque', 'maxSpeed',
      'ratedCurrent', 'peakCurrent', 'rotorInertia', 'rotorInertiaWithBrake',
      'weight', 'weightWithBrake', 'torqueConstant', 'voltageConstant',
      'options', 'dimensions', 'matchedDrives', 'cableSpecs'
    ];

    for (const field of requiredFields) {
      if (motor[field] === undefined) {
        errors.push(`Motor ${motor.id || 'unknown'}: Missing required field '${field}'`);
      }
    }

    // Check for duplicates
    if (motor.id) {
      if (seenIds.has(motor.id)) {
        errors.push(`Duplicate motor ID: ${motor.id}`);
      }
      seenIds.add(motor.id);
    }

    if (motor.model) {
      if (seenModels.has(motor.model)) {
        errors.push(`Duplicate motor model: ${motor.model}`);
      }
      seenModels.add(motor.model);
    }

    // Validate model format
    if (motor.model) {
      const modelPattern = /^MC20-\d{3}-3[L|M]\d{2}-N\d{3}-[0|1][A|B]P[L|K]NNNN$/;
      if (!modelPattern.test(motor.model)) {
        errors.push(`Invalid model format: ${motor.model}`);
      }
    }

    // Validate series
    if (motor.series !== 'MC20') {
      errors.push(`Motor ${motor.id}: Invalid series '${motor.series}'`);
    }

    // Validate frame sizes
    const validFrameSizes = [60, 80, 100, 130, 180];
    if (!validFrameSizes.includes(motor.frameSize)) {
      errors.push(`Motor ${motor.id}: Invalid frame size ${motor.frameSize}`);
    }

    // Validate inertia type
    if (!['LOW', 'MEDIUM'].includes(motor.inertiaType)) {
      errors.push(`Motor ${motor.id}: Invalid inertia type '${motor.inertiaType}'`);
    }

    // Validate power range (200W to 7500W)
    if (motor.ratedPower < 200 || motor.ratedPower > 7500) {
      warnings.push(`Motor ${motor.id}: Rated power ${motor.ratedPower}W outside typical range`);
    }

    // Validate speed range
    if (motor.ratedSpeed < 1000 || motor.ratedSpeed > 3500) {
      warnings.push(`Motor ${motor.id}: Rated speed ${motor.ratedSpeed}rpm outside typical range`);
    }

    // Validate torque calculations
    if (motor.torqueConstant && motor.ratedCurrent) {
      const calculatedTorque = motor.torqueConstant * motor.ratedCurrent;
      const diff = Math.abs(calculatedTorque - motor.ratedTorque);
      if (diff > 0.1) {
        warnings.push(`Motor ${motor.id}: Torque constant mismatch (calculated: ${calculatedTorque.toFixed(2)}, actual: ${motor.ratedTorque})`);
      }
    }

    // Validate options
    if (motor.options) {
      const opts = motor.options;
      if (!['0', '1'].includes(opts.brake?.code)) {
        errors.push(`Motor ${motor.id}: Invalid brake code '${opts.brake?.code}'`);
      }
      if (!['A', 'B'].includes(opts.encoder?.code)) {
        errors.push(`Motor ${motor.id}: Invalid encoder code '${opts.encoder?.code}'`);
      }
      if (!['L', 'K'].includes(opts.keyShaft?.code)) {
        errors.push(`Motor ${motor.id}: Invalid key shaft code '${opts.keyShaft?.code}'`);
      }
    }

    // Validate matched drives exist
    if (!motor.matchedDrives || motor.matchedDrives.length === 0) {
      warnings.push(`Motor ${motor.id}: No matched drives`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateDrives(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.drives || !Array.isArray(data.drives)) {
    return { valid: false, errors: ['Missing or invalid drives array'], warnings: [] };
  }

  const drives = data.drives;
  const seenIds = new Set<string>();
  const seenModels = new Set<string>();

  // Check count
  if (drives.length !== 18) {
    warnings.push(`Expected 18 drives, found ${drives.length}`);
  }

  for (const drive of drives) {
    // Required fields
    const requiredFields = [
      'id', 'model', 'baseModel', 'series', 'size', 'maxCurrent',
      'ratedCurrent', 'overloadCapacity', 'pwmFrequencies', 'ratedPwmFrequency',
      'hasFan', 'braking', 'dimensions', 'communication', 'options', 'compatibleMotors'
    ];

    for (const field of requiredFields) {
      if (drive[field] === undefined) {
        errors.push(`Drive ${drive.id || 'unknown'}: Missing required field '${field}'`);
      }
    }

    // Check for duplicates
    if (drive.id) {
      if (seenIds.has(drive.id)) {
        errors.push(`Duplicate drive ID: ${drive.id}`);
      }
      seenIds.add(drive.id);
    }

    if (drive.model) {
      if (seenModels.has(drive.model)) {
        errors.push(`Duplicate drive model: ${drive.model}`);
      }
      seenModels.add(drive.model);
    }

    // Validate model format
    if (drive.model) {
      const modelPattern = /^XC20-W\d{4}CRN-01B(ECT0|PNT0|EIT0)T0NNNN-SVSRSN[3|4|5]NNNNN$/;
      if (!modelPattern.test(drive.model)) {
        errors.push(`Invalid drive model format: ${drive.model}`);
      }
    }

    // Validate series
    if (drive.series !== 'XC20') {
      errors.push(`Drive ${drive.id}: Invalid series '${drive.series}'`);
    }

    // Validate size
    const validSizes = ['XD', 'XE', 'XF'];
    if (!validSizes.includes(drive.size)) {
      errors.push(`Drive ${drive.id}: Invalid size '${drive.size}'`);
    }

    // Validate current values
    if (drive.maxCurrent <= 0 || drive.ratedCurrent <= 0) {
      errors.push(`Drive ${drive.id}: Invalid current values`);
    }

    if (drive.maxCurrent < drive.ratedCurrent) {
      errors.push(`Drive ${drive.id}: Max current (${drive.maxCurrent}) less than rated current (${drive.ratedCurrent})`);
    }

    // Validate overload capacity
    if (drive.overloadCapacity < 2.0 || drive.overloadCapacity > 5.0) {
      warnings.push(`Drive ${drive.id}: Overload capacity ${drive.overloadCapacity} outside typical range`);
    }

    // Validate PWM frequencies
    if (drive.pwmFrequencies) {
      const validFrequencies = [4, 8, 12, 16];
      for (const freq of drive.pwmFrequencies) {
        if (!validFrequencies.includes(freq)) {
          errors.push(`Drive ${drive.id}: Invalid PWM frequency ${freq}`);
        }
      }
    }

    // Validate communication type
    const validCommTypes = ['ETHERCAT', 'PROFINET', 'ETHERNET_IP'];
    if (!validCommTypes.includes(drive.communication?.type)) {
      errors.push(`Drive ${drive.id}: Invalid communication type '${drive.communication?.type}'`);
    }

    // Validate compatible motors
    if (!drive.compatibleMotors || drive.compatibleMotors.length === 0) {
      warnings.push(`Drive ${drive.id}: No compatible motors`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateCables(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.motorCables || !data.encoderCables) {
    return { valid: false, errors: ['Missing cable data'], warnings: [] };
  }

  // Validate motor cable specs
  const motorSpecs = data.motorCables.specs;
  if (!motorSpecs || motorSpecs.length !== 3) {
    errors.push(`Expected 3 motor cable specs, found ${motorSpecs?.length || 0}`);
  }

  // Validate encoder cable specs
  const encoderSpecs = data.encoderCables.specs;
  if (!encoderSpecs || encoderSpecs.length !== 2) {
    errors.push(`Expected 2 encoder cable specs, found ${encoderSpecs?.length || 0}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function validateCrossReferences(motorData: any, driveData: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const motors = motorData.motors || [];
  const drives = driveData.drives || [];

  // Build lookup maps
  const driveModelSet = new Set(drives.map((d: any) => d.model));
  const motorBaseSet = new Set(motors.map((m: any) => m.baseModel));

  // Validate motor -> drive references
  for (const motor of motors) {
    if (motor.matchedDrives) {
      for (const driveModel of motor.matchedDrives) {
        // Extract base model from full model for partial matching
        const driveBase = driveModel.split('-01B')[0];
        const matchingDrive = drives.find((d: any) => d.model === driveModel || d.baseModel === driveBase);
        if (!matchingDrive) {
          warnings.push(`Motor ${motor.id} references non-existent drive: ${driveModel}`);
        }
      }
    }
  }

  // Validate drive -> motor references
  for (const drive of drives) {
    if (drive.compatibleMotors) {
      for (const motorBase of drive.compatibleMotors) {
        const matchingMotor = motors.find((m: any) => m.baseModel === motorBase);
        if (!matchingMotor) {
          warnings.push(`Drive ${drive.id} references non-existent motor base: ${motorBase}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log('Validating MC20/XC20 product data...\n');

  const dataDir = 'src/data';
  let hasErrors = false;

  // Load data files
  let motorData, driveData, cableData;

  try {
    motorData = JSON.parse(fs.readFileSync(path.join(dataDir, 'motors.json'), 'utf-8'));
  } catch (e) {
    console.error('Error loading motors.json:', e);
    process.exit(1);
  }

  try {
    driveData = JSON.parse(fs.readFileSync(path.join(dataDir, 'drives.json'), 'utf-8'));
  } catch (e) {
    console.error('Error loading drives.json:', e);
    process.exit(1);
  }

  try {
    cableData = JSON.parse(fs.readFileSync(path.join(dataDir, 'cables.json'), 'utf-8'));
  } catch (e) {
    console.error('Error loading cables.json:', e);
    process.exit(1);
  }

  // Validate motors
  console.log('Validating motors...');
  const motorResult = validateMotors(motorData);
  if (motorResult.errors.length > 0) {
    console.log(`  ✗ ${motorResult.errors.length} errors:`);
    motorResult.errors.forEach(e => console.log(`    - ${e}`));
    hasErrors = true;
  } else {
    console.log('  ✓ Motors valid');
  }
  if (motorResult.warnings.length > 0) {
    console.log(`  ⚠ ${motorResult.warnings.length} warnings:`);
    motorResult.warnings.slice(0, 5).forEach(w => console.log(`    - ${w}`));
    if (motorResult.warnings.length > 5) {
      console.log(`    ... and ${motorResult.warnings.length - 5} more`);
    }
  }

  // Validate drives
  console.log('\nValidating drives...');
  const driveResult = validateDrives(driveData);
  if (driveResult.errors.length > 0) {
    console.log(`  ✗ ${driveResult.errors.length} errors:`);
    driveResult.errors.forEach(e => console.log(`    - ${e}`));
    hasErrors = true;
  } else {
    console.log('  ✓ Drives valid');
  }
  if (driveResult.warnings.length > 0) {
    console.log(`  ⚠ ${driveResult.warnings.length} warnings:`);
    driveResult.warnings.slice(0, 5).forEach(w => console.log(`    - ${w}`));
    if (driveResult.warnings.length > 5) {
      console.log(`    ... and ${driveResult.warnings.length - 5} more`);
    }
  }

  // Validate cables
  console.log('\nValidating cables...');
  const cableResult = validateCables(cableData);
  if (cableResult.errors.length > 0) {
    console.log(`  ✗ ${cableResult.errors.length} errors:`);
    cableResult.errors.forEach(e => console.log(`    - ${e}`));
    hasErrors = true;
  } else {
    console.log('  ✓ Cables valid');
  }

  // Validate cross-references
  console.log('\nValidating cross-references...');
  const crossRefResult = validateCrossReferences(motorData, driveData);
  if (crossRefResult.errors.length > 0) {
    console.log(`  ✗ ${crossRefResult.errors.length} errors:`);
    crossRefResult.errors.forEach(e => console.log(`    - ${e}`));
    hasErrors = true;
  } else {
    console.log('  ✓ Cross-references valid');
  }
  if (crossRefResult.warnings.length > 0) {
    console.log(`  ⚠ ${crossRefResult.warnings.length} warnings:`);
    crossRefResult.warnings.slice(0, 5).forEach(w => console.log(`    - ${w}`));
    if (crossRefResult.warnings.length > 5) {
      console.log(`    ... and ${crossRefResult.warnings.length - 5} more`);
    }
  }

  // Summary
  console.log('\n=== Validation Summary ===');
  if (hasErrors) {
    console.log('✗ Validation FAILED with errors');
    process.exit(1);
  } else {
    console.log('✓ Validation PASSED');
    console.log(`  Motors: ${motorData.motors?.length || 0}`);
    console.log(`  Drives: ${driveData.drives?.length || 0}`);
    process.exit(0);
  }
}

main();
