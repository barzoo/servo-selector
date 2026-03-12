import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  loadProjectsStorage,
  saveProjectsStorage,
  migrateProjectsStorage,
  extractProjectMeta,
  updateProjectMeta,
  deleteProjectMeta,
  setCurrentProjectId,
  STORAGE_KEY,
  CURRENT_PROJECT_KEY,
  STORAGE_VERSION,
} from '@/lib/project-storage';
import type { ProjectsStorage, ProjectMeta } from '@/types/project-list';
import type { Project } from '@/types';

describe('project-list-storage', () => {
  beforeEach(() => {
    // 清除 localStorage
    localStorage.clear();
  });

  afterEach(() => {
    // 清理所有 mock
    vi.restoreAllMocks();
  });

  describe('loadProjectsStorage', () => {
    it('should return null when no data exists', () => {
      const result = loadProjectsStorage();
      expect(result).toBeNull();
    });

    it('should load valid storage data', () => {
      const mockData: ProjectsStorage = {
        version: 1,
        projects: [
          {
            id: 'proj_test123',
            name: 'Test Project',
            customer: 'Test Customer',
            salesPerson: 'Test Sales',
            createdAt: '2025-03-12T00:00:00.000Z',
            updatedAt: '2025-03-12T00:00:00.000Z',
          },
        ],
        currentProjectId: 'proj_test123',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));

      const result = loadProjectsStorage();
      expect(result).toEqual(mockData);
    });

    it('should return null for invalid data format', () => {
      // 存储非对象数据
      localStorage.setItem(STORAGE_KEY, JSON.stringify('invalid'));

      const result = loadProjectsStorage();
      expect(result).toBeNull();
    });

    it('should return null when projects is not an array', () => {
      const invalidData = {
        version: 1,
        projects: 'not-an-array',
        currentProjectId: '',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidData));

      const result = loadProjectsStorage();
      expect(result).toBeNull();
    });
  });

  describe('saveProjectsStorage', () => {
    it('should save storage data', () => {
      const data: ProjectsStorage = {
        version: 1,
        projects: [],
        currentProjectId: '',
      };

      saveProjectsStorage(data);

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(data);
    });

    it('should throw on quota exceeded', () => {
      // Mock localStorage.setItem to throw
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const data: ProjectsStorage = {
        version: 1,
        projects: [],
        currentProjectId: '',
      };

      expect(() => saveProjectsStorage(data)).toThrow('存储空间不足');

      setItemSpy.mockRestore();
    });
  });

  describe('extractProjectMeta', () => {
    it('should extract metadata from project', () => {
      const project: Project = {
        id: 'proj_test123',
        name: 'Test Project',
        customer: 'Test Customer',
        salesPerson: 'Test Sales',
        notes: 'Test notes',
        createdAt: '2025-03-12T00:00:00.000Z',
        commonParams: {
          ambientTemp: 25,
          ipRating: 'IP65',
          communication: 'ETHERCAT',
          cableLength: 5,
          safetyFactor: 1.5,
          maxInertiaRatio: 10,
          targetInertiaRatio: 5,
        },
        axes: [],
      };

      const meta = extractProjectMeta(project);

      expect(meta.id).toBe('proj_test123');
      expect(meta.name).toBe('Test Project');
      expect(meta.customer).toBe('Test Customer');
      expect(meta.salesPerson).toBe('Test Sales');
      expect(meta.notes).toBe('Test notes');
      expect(meta.createdAt).toBe('2025-03-12T00:00:00.000Z');
      expect(meta.updatedAt).toBeDefined();
    });

    it('should use default name when project name is empty', () => {
      const project: Project = {
        id: 'proj_test123',
        name: '',
        customer: '',
        salesPerson: '',
        createdAt: '2025-03-12T00:00:00.000Z',
        commonParams: {} as any,
        axes: [],
      };

      const meta = extractProjectMeta(project);
      expect(meta.name).toBe('未命名项目');
    });

    it('should use default values for optional fields', () => {
      const project: Project = {
        id: 'proj_test123',
        name: 'Test',
        customer: '',
        salesPerson: '',
        createdAt: '2025-03-12T00:00:00.000Z',
        commonParams: {} as any,
        axes: [],
      };

      const meta = extractProjectMeta(project);
      expect(meta.customer).toBe('');
      expect(meta.salesPerson).toBe('');
      expect(meta.notes).toBeUndefined();
    });
  });

  describe('migrateProjectsStorage', () => {
    it('should return existing storage if already migrated', () => {
      const existing: ProjectsStorage = {
        version: 1,
        projects: [{ id: 'proj_old', name: 'Old', customer: '', salesPerson: '', createdAt: '', updatedAt: '' }],
        currentProjectId: 'proj_old',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

      const result = migrateProjectsStorage();
      expect(result).toEqual(existing);
    });

    it('should create empty storage when no current project exists', () => {
      const result = migrateProjectsStorage();

      expect(result).toBeDefined();
      expect(result!.version).toBe(STORAGE_VERSION);
      expect(result!.projects).toEqual([]);
      expect(result!.currentProjectId).toBe('');
    });

    it('should migrate old project data to new structure', () => {
      // 模拟旧版本存储数据
      const oldProject: Project = {
        id: 'proj_legacy123',
        name: 'Legacy Project',
        customer: 'Legacy Customer',
        salesPerson: 'Legacy Sales',
        notes: 'Legacy notes',
        createdAt: '2025-01-01T00:00:00.000Z',
        commonParams: {
          ambientTemp: 25,
          ipRating: 'IP65',
          communication: 'ETHERCAT',
          cableLength: 5,
          safetyFactor: 1.5,
          maxInertiaRatio: 10,
          targetInertiaRatio: 5,
        },
        axes: [],
      };
      const oldData = {
        state: {
          project: oldProject,
        },
      };
      localStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(oldData));

      const result = migrateProjectsStorage();

      expect(result).toBeDefined();
      expect(result!.version).toBe(STORAGE_VERSION);
      expect(result!.projects).toHaveLength(1);
      expect(result!.projects[0].id).toBe('proj_legacy123');
      expect(result!.projects[0].name).toBe('Legacy Project');
      expect(result!.currentProjectId).toBe('proj_legacy123');
    });

    it('should return fallback storage on error', () => {
      // 模拟损坏的 JSON 数据
      localStorage.setItem(CURRENT_PROJECT_KEY, 'invalid json');

      const result = migrateProjectsStorage();

      expect(result).toBeDefined();
      expect(result!.version).toBe(STORAGE_VERSION);
      expect(result!.projects).toEqual([]);
    });
  });
});
