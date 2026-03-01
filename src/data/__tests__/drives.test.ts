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
    expect(drive.braking).toBeDefined();
    expect(drive.communication).toBeDefined();
    expect(drive.compatibleMotors).toBeDefined();
  });

  it('should have braking specifications', () => {
    drivesData.drives.forEach(drive => {
      expect(drive.braking.internalResistance).toBeDefined();
      expect(drive.braking.continuousPower).toBeDefined();
      expect(drive.braking.peakPower).toBeDefined();
    });
  });

  it('should have communication options', () => {
    drivesData.drives.forEach(drive => {
      expect(drive.communication).toBeDefined();
      expect(drive.communication.type).toMatch(/ETHERCAT|PROFINET|ETHERNET_IP/);
    });
  });

  it('should have compatible motors for each drive', () => {
    drivesData.drives.forEach(drive => {
      expect(drive.compatibleMotors).toBeInstanceOf(Array);
      expect(drive.compatibleMotors.length).toBeGreaterThan(0);
    });
  });

  it('should have different sizes (XD, XE, XF)', () => {
    const sizes = new Set(drivesData.drives.map(d => d.size));
    expect(sizes.size).toBeGreaterThanOrEqual(2);
  });
});
