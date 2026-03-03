import { describe, it, expect, vi } from 'vitest';
import {
  generateId,
  generateProjectId,
  createInitialAxis,
  createInitialProject,
  migrateLegacyData,
} from '../project-store';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^axis_/);
    expect(id2).toMatch(/^axis_/);
  });

  it('should generate IDs with correct format', () => {
    const id = generateId();
    expect(id).toMatch(/^axis_[a-z0-9]{9}$/);
  });
});

describe('generateProjectId', () => {
  it('should generate unique project IDs', () => {
    const id1 = generateProjectId();
    const id2 = generateProjectId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^proj_/);
    expect(id2).toMatch(/^proj_/);
  });

  it('should generate project IDs with correct format', () => {
    const id = generateProjectId();
    expect(id).toMatch(/^proj_[a-z0-9]{9}$/);
  });
});

describe('createInitialAxis', () => {
  it('should create axis with default name', () => {
    const axis = createInitialAxis();
    expect(axis.name).toBe('轴-1');
    expect(axis.status).toBe('CONFIGURING');
    expect(axis.id).toMatch(/^axis_/);
    expect(axis.createdAt).toBeDefined();
    expect(axis.input).toEqual({});
  });

  it('should create axis with custom name', () => {
    const axis = createInitialAxis('X轴');
    expect(axis.name).toBe('X轴');
  });

  it('should create axis with empty input object', () => {
    const axis = createInitialAxis();
    expect(axis.input).toEqual({});
    expect(axis.result).toBeUndefined();
    expect(axis.completedAt).toBeUndefined();
  });
});

describe('createInitialProject', () => {
  it('should create project with default info', () => {
    const project = createInitialProject();
    expect(project.name).toBe('');
    expect(project.customer).toBe('');
    expect(project.salesPerson).toBe('');
    expect(project.id).toMatch(/^proj_/);
    expect(project.createdAt).toBeDefined();
  });

  it('should create project with provided info', () => {
    const project = createInitialProject({
      name: '测试项目',
      customer: '客户A',
      salesPerson: '销售B',
      notes: '备注',
    });
    expect(project.name).toBe('测试项目');
    expect(project.customer).toBe('客户A');
    expect(project.salesPerson).toBe('销售B');
    expect(project.notes).toBe('备注');
  });

  it('should create project with one initial axis', () => {
    const project = createInitialProject();
    expect(project.axes).toHaveLength(1);
    expect(project.axes[0].name).toBe('轴-1');
    expect(project.axes[0].status).toBe('CONFIGURING');
  });
});

describe('migrateLegacyData', () => {
  it('should return null when no legacy data exists', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const result = migrateLegacyData();
    expect(result).toBeNull();
  });

  it('should remove legacy data after migration', () => {
    const legacyData = {
      state: {
        currentStep: 1,
        input: {},
        isComplete: false,
      },
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(legacyData));

    migrateLegacyData();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('servo-selector-wizard');
  });
});

