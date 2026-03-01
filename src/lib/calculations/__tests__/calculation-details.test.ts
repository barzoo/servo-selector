import {
  formatInertia,
  formatTorque,
  formatSpeed,
  formatTime,
  formatPower,
  formatEnergy,
} from '../calculation-details';

describe('formatInertia', () => {
  it('应正确格式化小惯量值（小于0.001）使用科学计数法', () => {
    expect(formatInertia(0.000507)).toBe('5.07×10⁻⁴');
  });

  it('应正确格式化大惯量值（大于等于0.001）使用固定小数', () => {
    expect(formatInertia(0.015)).toBe('0.0150');
  });

  it('应正确处理边界值0.001', () => {
    expect(formatInertia(0.001)).toBe('0.0010');
  });

  it('应正确处理0值', () => {
    expect(formatInertia(0)).toBe('0.0000');
  });

  it('应正确处理负数小惯量值', () => {
    expect(formatInertia(-0.000507)).toBe('-5.07×10⁻⁴');
  });
});

describe('formatTorque', () => {
  it('应正确格式化正值扭矩，带+号', () => {
    expect(formatTorque(4.85)).toBe('+4.85');
  });

  it('应正确格式化负值扭矩', () => {
    expect(formatTorque(-3.29)).toBe('-3.29');
  });

  it('应正确处理0值', () => {
    expect(formatTorque(0)).toBe('+0.00');
  });

  it('应正确处理负零', () => {
    expect(formatTorque(-0)).toBe('+0.00');
  });
});

describe('formatSpeed', () => {
  it('应正确格式化转速为整数', () => {
    expect(formatSpeed(3000.7)).toBe('3001');
  });

  it('应正确格式化整数转速', () => {
    expect(formatSpeed(3000)).toBe('3000');
  });

  it('应正确处理0值', () => {
    expect(formatSpeed(0)).toBe('0');
  });

  it('应正确处理负数转速', () => {
    expect(formatSpeed(-1500.3)).toBe('-1500');
  });
});

describe('formatTime', () => {
  it('应正确格式化时间为固定2位小数', () => {
    expect(formatTime(0.1)).toBe('0.10');
  });

  it('应正确格式化整数时间', () => {
    expect(formatTime(1)).toBe('1.00');
  });

  it('应正确处理0值', () => {
    expect(formatTime(0)).toBe('0.00');
  });

  it('应正确处理多位小数', () => {
    expect(formatTime(0.12345)).toBe('0.12');
  });
});

describe('formatPower', () => {
  it('应正确格式化大于等于100的功率为整数', () => {
    expect(formatPower(1520.5)).toBe('1520');
  });

  it('应正确格式化小于100的功率为1位小数', () => {
    expect(formatPower(50.5)).toBe('50.5');
  });

  it('应正确处理边界值100', () => {
    expect(formatPower(100)).toBe('100');
  });

  it('应正确处理0值', () => {
    expect(formatPower(0)).toBe('0.0');
  });

  it('应正确处理99.9', () => {
    expect(formatPower(99.9)).toBe('99.9');
  });
});

describe('formatEnergy', () => {
  it('应正确格式化能量为固定1位小数', () => {
    expect(formatEnergy(25.6)).toBe('25.6');
  });

  it('应正确格式化整数能量', () => {
    expect(formatEnergy(25)).toBe('25.0');
  });

  it('应正确处理0值', () => {
    expect(formatEnergy(0)).toBe('0.0');
  });

  it('应正确处理多位小数', () => {
    expect(formatEnergy(25.67)).toBe('25.7');
  });
});
