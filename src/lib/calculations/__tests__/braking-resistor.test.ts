import { describe, it, expect } from 'vitest';
import { BrakingResistorCalculator } from '../braking-resistor';
import type { BrakingResistorInput } from '../braking-resistor';

describe('BrakingResistorCalculator', () => {
  // 基础输入参数
  const baseInput: BrakingResistorInput = {
    totalInertia: 10, // kg·cm²
    maxSpeed: 3000, // rpm
    brakingFrequency: 10, // 次/分钟
    driveInternalPower: 50, // W，驱动器内置电阻持续功率
  };

  describe('内置电阻足够的情况（小惯量低频制动）', () => {
    it('should not require external resistor for small inertia and low frequency', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 1, // 小惯量 1 kg·cm²
        maxSpeed: 1000, // 低速
        brakingFrequency: 1, // 低频 1次/分钟
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.requiresExternalResistor).toBe(false);
      expect(result.energyPerCycle).toBeGreaterThan(0);
      expect(result.brakingPower).toBeGreaterThan(0);
      expect(result.recommendedResistor).toBeUndefined();
    });

    it('should handle very small inertia values', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 0.1,
        maxSpeed: 500,
        brakingFrequency: 5,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.requiresExternalResistor).toBe(false);
      // E = 0.5 * (0.1 * 1e-4) * (500 * 2π/60)² ≈ 0.0137 J
      expect(result.energyPerCycle).toBeCloseTo(0.0137, 2);
    });
  });

  describe('需要外部电阻的情况（大惯量高频制动）', () => {
    it('should require external resistor for large inertia and high frequency', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 100, // 大惯量
        maxSpeed: 6000, // 高速
        brakingFrequency: 60, // 高频 60次/分钟
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.requiresExternalResistor).toBe(true);
      expect(result.recommendedResistor).toBeDefined();
      expect(result.recommendedResistor!.minPower).toBeGreaterThan(0);
      expect(result.recommendedResistor!.resistance).toBeGreaterThan(0);
      expect(result.recommendedResistor!.dutyCycle).toBeGreaterThan(0);
    });

    it('should calculate correct braking energy for typical application', () => {
      // 典型应用：惯量 50 kg·cm²，转速 3000 rpm
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 50,
        maxSpeed: 3000,
        brakingFrequency: 30,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      // 验证能量计算: E = ½ × J × ω²
      // J = 50 kg·cm² = 50 × 10^-4 kg·m² = 0.005 kg·m²
      // ω = 3000 rpm = 3000 × 2π/60 = 314.16 rad/s
      // E = 0.5 × 0.005 × 314.16² ≈ 246.7 J
      expect(result.energyPerCycle).toBeCloseTo(246.7, 0);

      // 验证功率计算: P_avg = (E × N) / 60
      // P_avg = (246.7 × 30) / 60 ≈ 123.4 W
      expect(result.brakingPower).toBeCloseTo(123.4, 0);
    });
  });

  describe('边界条件测试', () => {
    it('should handle zero inertia', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 0,
        maxSpeed: 3000,
        brakingFrequency: 10,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.energyPerCycle).toBe(0);
      expect(result.brakingPower).toBe(0);
      expect(result.requiresExternalResistor).toBe(false);
    });

    it('should handle zero speed', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 10,
        maxSpeed: 0,
        brakingFrequency: 10,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.energyPerCycle).toBe(0);
      expect(result.brakingPower).toBe(0);
      expect(result.requiresExternalResistor).toBe(false);
    });

    it('should handle zero braking frequency', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 100,
        maxSpeed: 6000,
        brakingFrequency: 0,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.brakingPower).toBe(0);
      expect(result.requiresExternalResistor).toBe(false);
    });

    it('should handle extremely high braking frequency', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 10,
        maxSpeed: 3000,
        brakingFrequency: 1000, // 极高频率
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.requiresExternalResistor).toBe(true);
      expect(result.recommendedResistor).toBeDefined();
    });

    it('should handle very high inertia', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 1000, // 极大惯量
        maxSpeed: 3000,
        brakingFrequency: 5,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.energyPerCycle).toBeGreaterThan(0);
      expect(result.requiresExternalResistor).toBe(true);
    });
  });

  describe('推荐电阻参数计算', () => {
    it('should calculate recommended resistor with safety factor', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 100,
        maxSpeed: 3000,
        brakingFrequency: 60,
        safetyFactor: 1.2,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.recommendedResistor).toBeDefined();
      // 验证功率包含安全系数
      const expectedMinPower = result.brakingPower * 1.2;
      expect(result.recommendedResistor!.minPower).toBeCloseTo(expectedMinPower, 0);
    });

    it('should calculate reasonable resistance value', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 50,
        maxSpeed: 3000,
        brakingFrequency: 30,
        dcBusVoltage: 540, // 典型直流母线电压
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.recommendedResistor).toBeDefined();
      expect(result.recommendedResistor!.resistance).toBeGreaterThan(0);
      // 典型制动电阻值范围 10-100 欧姆
      expect(result.recommendedResistor!.resistance).toBeGreaterThanOrEqual(10);
      expect(result.recommendedResistor!.resistance).toBeLessThanOrEqual(200);
    });

    it('should calculate duty cycle correctly', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 50,
        maxSpeed: 3000,
        brakingFrequency: 60,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.recommendedResistor).toBeDefined();
      expect(result.recommendedResistor!.dutyCycle).toBeGreaterThan(0);
      expect(result.recommendedResistor!.dutyCycle).toBeLessThanOrEqual(100);
    });
  });

  describe('警告信息生成', () => {
    it('should include warning when external resistor is required', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 100,
        maxSpeed: 6000,
        brakingFrequency: 60,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('外部制动电阻');
    });

    it('should not include warning when internal resistor is sufficient', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 1,
        maxSpeed: 1000,
        brakingFrequency: 1,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      expect(result.warning).toBeUndefined();
    });
  });

  describe('单位转换验证', () => {
    it('should correctly convert inertia from kg·cm² to kg·m²', () => {
      // 验证惯量单位转换: 1 kg·cm² = 1e-4 kg·m²
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 100, // kg·cm²
        maxSpeed: 3000,
        brakingFrequency: 10,
      };

      const calculator = new BrakingResistorCalculator(input);
      // 通过验证能量计算来间接验证单位转换
      const result = calculator.calculate();

      // J = 100 kg·cm² = 0.01 kg·m²
      // ω = 314.16 rad/s
      // E = 0.5 × 0.01 × 314.16² ≈ 493.5 J
      expect(result.energyPerCycle).toBeCloseTo(493.5, 0);
    });

    it('should correctly convert speed from rpm to rad/s', () => {
      const input: BrakingResistorInput = {
        ...baseInput,
        totalInertia: 10,
        maxSpeed: 3000, // rpm
        brakingFrequency: 10,
      };

      const calculator = new BrakingResistorCalculator(input);
      const result = calculator.calculate();

      // 验证 ω = 3000 × 2π/60 = 314.16 rad/s 被正确使用
      // E = 0.5 × 0.001 × 314.16² ≈ 49.35 J
      expect(result.energyPerCycle).toBeCloseTo(49.35, 1);
    });
  });
});
