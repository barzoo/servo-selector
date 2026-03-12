/**
 * 项目列表存储管理模块
 *
 * 提供项目列表的 localStorage 存储、加载、迁移和管理功能。
 * 支持多项目数据结构，处理存储配额错误，确保 SSR 安全。
 *
 * @module project-storage
 */

import type { ProjectsStorage, ProjectMeta } from '@/types/project-list';
import type { Project } from '@/types';

/** localStorage 键名：项目列表存储 */
export const STORAGE_KEY = 'servo-selector-projects';

/** localStorage 键名：当前项目数据（兼容旧版本） */
export const CURRENT_PROJECT_KEY = 'servo-selector-project';

/** 存储数据结构版本号 */
export const STORAGE_VERSION = 1;

/**
 * 检查是否在浏览器环境（SSR 安全）
 * @returns 是否在浏览器环境
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * 从 localStorage 加载项目列表存储数据
 *
 * @returns ProjectsStorage 对象，如果不存在则返回 null
 * @example
 * const storage = loadProjectsStorage();
 * if (storage) {
 *   console.log(`已加载 ${storage.projects.length} 个项目`);
 * }
 */
export function loadProjectsStorage(): ProjectsStorage | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data) as ProjectsStorage;

    // 验证数据结构
    if (!parsed || typeof parsed !== 'object') {
      console.warn('[project-storage] 存储数据格式无效');
      return null;
    }

    if (!Array.isArray(parsed.projects)) {
      console.warn('[project-storage] projects 字段必须是数组');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('[project-storage] 加载存储数据失败:', error);
    return null;
  }
}

/**
 * 保存项目列表存储数据到 localStorage
 *
 * @param storage - 要保存的 ProjectsStorage 对象
 * @throws 当存储空间不足时会抛出 QuotaExceededError
 * @example
 * const storage: ProjectsStorage = {
 *   version: 1,
 *   projects: [],
 *   currentProjectId: ''
 * };
 * saveProjectsStorage(storage);
 */
export function saveProjectsStorage(storage: ProjectsStorage): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const data = JSON.stringify(storage);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('[project-storage] 存储空间不足:', error);
      throw new Error(
        '存储空间不足，无法保存项目数据。请删除旧项目或导出备份后重试。'
      );
    }
    console.error('[project-storage] 保存存储数据失败:', error);
    throw error;
  }
}

/**
 * 从 Project 对象提取项目元数据
 *
 * @param project - 完整的 Project 对象
 * @returns ProjectMeta 元数据对象
 * @example
 * const project = getCurrentProject();
 * const meta = extractProjectMeta(project);
 * // { id, name, customer, salesPerson, notes, createdAt, updatedAt }
 */
export function extractProjectMeta(project: Project): ProjectMeta {
  return {
    id: project.id,
    name: project.name || '未命名项目',
    customer: project.customer || '',
    salesPerson: project.salesPerson || '',
    notes: project.notes,
    createdAt: project.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 从旧版本单项目存储迁移到新的多项目结构
 *
 * 检测旧版本存储（servo-selector-project），提取项目数据并创建
 * 初始项目列表。迁移完成后，新的存储结构将包含版本号标记。
 *
 * @returns 迁移后的 ProjectsStorage，如果没有旧数据则返回 null
 * @example
 * const migrated = migrateProjectsStorage();
 * if (migrated) {
 *   console.log('迁移成功，创建了', migrated.projects.length, '个项目');
 * }
 */
export function migrateProjectsStorage(): ProjectsStorage | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    // 检查是否已存在新版本存储
    const existing = loadProjectsStorage();
    if (existing && existing.version >= STORAGE_VERSION) {
      return existing;
    }

    // 读取旧版本存储
    const oldData = localStorage.getItem(CURRENT_PROJECT_KEY);
    if (!oldData) {
      // 没有旧数据，创建空存储
      const emptyStorage: ProjectsStorage = {
        version: STORAGE_VERSION,
        projects: [],
        currentProjectId: '',
      };
      saveProjectsStorage(emptyStorage);
      return emptyStorage;
    }

    const parsed = JSON.parse(oldData);
    const project: Project = parsed.state?.project || parsed.project;

    // 验证旧项目数据
    if (!project || !project.id) {
      console.warn('[project-storage] 旧项目数据格式无效');
      return null;
    }

    // 创建新的多项目存储结构
    const meta = extractProjectMeta(project);
    const newStorage: ProjectsStorage = {
      version: STORAGE_VERSION,
      projects: [meta],
      currentProjectId: project.id,
    };

    // 保存新结构
    saveProjectsStorage(newStorage);

    console.log('[project-storage] 数据迁移成功:', project.id);
    return newStorage;
  } catch (error) {
    console.error('[project-storage] 数据迁移失败:', error);
    // 迁移失败时返回空存储，避免影响正常使用
    const fallbackStorage: ProjectsStorage = {
      version: STORAGE_VERSION,
      projects: [],
      currentProjectId: '',
    };
    return fallbackStorage;
  }
}

/**
 * 更新项目元数据
 *
 * 在存储中查找指定项目并更新其元数据字段。
 * 自动更新 updatedAt 时间戳。
 *
 * @param projectId - 要更新的项目 ID
 * @param updates - 要更新的字段（部分更新）
 * @returns 更新后的 ProjectsStorage，如果项目不存在则返回 null
 * @example
 * updateProjectMeta('proj_abc123', { name: '新项目名', customer: '新客户' });
 */
export function updateProjectMeta(
  projectId: string,
  updates: Partial<Omit<ProjectMeta, 'id' | 'createdAt'>>
): ProjectsStorage | null {
  if (!isBrowser()) {
    return null;
  }

  const storage = loadProjectsStorage();
  if (!storage) {
    return null;
  }

  const projectIndex = storage.projects.findIndex((p) => p.id === projectId);
  if (projectIndex === -1) {
    console.warn(`[project-storage] 项目不存在: ${projectId}`);
    return null;
  }

  // 更新元数据
  storage.projects[projectIndex] = {
    ...storage.projects[projectIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // 保存更新后的存储
  saveProjectsStorage(storage);

  return storage;
}

/**
 * 删除项目元数据
 *
 * 从项目列表中移除指定项目的元数据。
 * 注意：此操作仅删除元数据，完整的项目数据需要单独处理。
 *
 * @param projectId - 要删除的项目 ID
 * @returns 删除后的 ProjectsStorage，如果项目不存在则返回 null
 * @example
 * deleteProjectMeta('proj_abc123');
 */
export function deleteProjectMeta(projectId: string): ProjectsStorage | null {
  if (!isBrowser()) {
    return null;
  }

  const storage = loadProjectsStorage();
  if (!storage) {
    return null;
  }

  const projectIndex = storage.projects.findIndex((p) => p.id === projectId);
  if (projectIndex === -1) {
    console.warn(`[project-storage] 要删除的项目不存在: ${projectId}`);
    return null;
  }

  // 从列表中移除
  storage.projects.splice(projectIndex, 1);

  // 如果删除的是当前项目，清空 currentProjectId
  if (storage.currentProjectId === projectId) {
    storage.currentProjectId = '';
  }

  // 保存更新后的存储
  saveProjectsStorage(storage);

  return storage;
}

/**
 * 设置当前项目 ID
 *
 * 更新存储中的当前选中项目标识符。
 * 如果指定的项目 ID 不存在于项目列表中，仍然会设置，但会记录警告。
 *
 * @param projectId - 要设置为当前项目的 ID
 * @returns 更新后的 ProjectsStorage
 * @example
 * setCurrentProjectId('proj_abc123');
 */
export function setCurrentProjectId(projectId: string): ProjectsStorage | null {
  if (!isBrowser()) {
    return null;
  }

  let storage = loadProjectsStorage();

  // 如果存储不存在，创建新的
  if (!storage) {
    storage = {
      version: STORAGE_VERSION,
      projects: [],
      currentProjectId: projectId,
    };
  } else {
    storage.currentProjectId = projectId;

    // 检查项目是否存在
    const projectExists = storage.projects.some((p) => p.id === projectId);
    if (!projectExists && projectId !== '') {
      console.warn(`[project-storage] 设置的项目 ID 不存在于列表中: ${projectId}`);
    }
  }

  saveProjectsStorage(storage);
  return storage;
}
