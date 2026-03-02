#!/usr/bin/env tsx
/**
 * Test script for STO selection functionality
 * Verifies that the wizard correctly handles STO safety option
 */

import { SizingEngine } from '../src/lib/calculations/sizing-engine';
import type { SizingInput } from '../src/types';

// Base test input
const baseInput: SizingInput = {
  project: { name: 'STO Test', customer: 'Test', salesPerson: 'Test' },
  mechanism: {
    type: 'BALL_SCREW',
    params: {
      loadMass: 5,
      lead: 10,
      screwDiameter: 20,
      screwLength: 500,
      gearRatio: 1,
      efficiency: 0.9,
      frictionCoeff: 0.05,
      preloadTorque: 0,
    },
  },
  motion: {
    stroke: 100,
    maxVelocity: 500,
    maxAcceleration: 1000,
    profile: 'TRAPEZOIDAL',
    dwellTime: 0.5,
    cycleTime: 2,
  },
  duty: {
    ambientTemp: 40,
    dutyCycle: 80,
    mountingOrientation: 'HORIZONTAL',
    ipRating: 'IP65',
    brake: false,
    keyShaft: 'L',
  },
  preferences: {
    safetyFactor: 1.5,
    maxInertiaRatio: 30,
    targetInertiaRatio: 10,
    communication: 'ETHERCAT',
    safety: 'NONE', // Will be overridden in tests
    cableLength: 3,
    encoderType: 'BOTH',
  },
};

const engine = new SizingEngine();

console.log('=== STO Selection Test ===\n');

// Test 1: Without STO (safety: 'NONE')
console.log('Test 1: Safety = NONE');
const inputWithoutSTO = { ...baseInput };
const resultWithoutSTO = engine.calculate(inputWithoutSTO);

if (resultWithoutSTO.motorRecommendations.length > 0) {
  console.log('  ✓ Got recommendations:', resultWithoutSTO.motorRecommendations.length);

  // Check the systemConfig for each recommendation
  let nnCount = 0;
  resultWithoutSTO.motorRecommendations.forEach((rec, i) => {
    const drive = rec.systemConfig?.drive;
    if (drive) {
      console.log(`  [${i + 1}] Drive:`, drive.model);
      if (drive.model?.includes('NNNN')) {
        nnCount++;
      }
    }
  });

  if (nnCount > 0) {
    console.log(`  ✓ ${nnCount} drives have NNNN (no STO)`);
  }
} else {
  console.log('  ✗ No recommendations');
}

console.log('');

// Test 2: With STO (safety: 'STO')
console.log('Test 2: Safety = STO');
const inputWithSTO: SizingInput = {
  ...baseInput,
  preferences: { ...baseInput.preferences, safety: 'STO' as const },
};
const resultWithSTO = engine.calculate(inputWithSTO);

if (resultWithSTO.motorRecommendations.length > 0) {
  console.log('  ✓ Got recommendations:', resultWithSTO.motorRecommendations.length);

  // Check the systemConfig for each recommendation
  let t0Count = 0;
  resultWithSTO.motorRecommendations.forEach((rec, i) => {
    const drive = rec.systemConfig?.drive;
    if (drive) {
      console.log(`  [${i + 1}] Drive:`, drive.model);
      if (drive.model?.includes('T0')) {
        t0Count++;
      }
    }
  });

  if (t0Count > 0) {
    console.log(`  ✓ ${t0Count} drives have T0 (with STO)`);
  }
} else {
  console.log('  ✗ No recommendations');
}

console.log('');

// Test 3: Verify different drives are selected
console.log('Test 3: Verify different drives for STO vs non-STO');
const firstRecWithoutSTO = resultWithoutSTO.motorRecommendations[0];
const firstRecWithSTO = resultWithSTO.motorRecommendations[0];

if (firstRecWithoutSTO && firstRecWithSTO) {
  const driveWithoutSTO = firstRecWithoutSTO.systemConfig?.drive?.model;
  const driveWithSTO = firstRecWithSTO.systemConfig?.drive?.model;

  if (driveWithoutSTO && driveWithSTO) {
    if (driveWithoutSTO !== driveWithSTO) {
      console.log('  ✓ Different drives selected based on safety option');
      console.log('    Without STO:', driveWithoutSTO);
      console.log('    With STO:', driveWithSTO);
    } else {
      console.log('  ✗ Same drive selected (should be different)');
    }
  } else {
    console.log('  ! Drive info not fully available (systemConfig may be limited)');
    console.log('    Without STO drive:', driveWithoutSTO || 'N/A');
    console.log('    With STO drive:', driveWithSTO || 'N/A');
  }
} else {
  console.log('  ✗ Missing recommendations');
}

console.log('');
console.log('=== Test Complete ===');
