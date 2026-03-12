/**
 * 项目列表类型定义
 * 用于管理本地存储中的项目元数据
 */

/**
 * 项目列表元数据（存储在 localStorage）
 * 包含项目的基本信息和标识
 */
export interface ProjectMeta {
  /** 项目唯一标识符 */
  id: string;
  /** 项目名称 */
  name: string;
  /** 客户名称 */
  customer: string;
  /** 销售人员 */
  salesPerson: string;
  /** 备注信息（可选） */
  notes?: string;
  /** 创建时间戳（ISO 8601 格式） */
  createdAt: string;
  /** 最后更新时间戳（ISO 8601 格式） */
  updatedAt: string;
}

/**
 * 项目列表存储结构
 * 用于在 localStorage 中持久化存储项目列表数据
 */
export interface ProjectsStorage {
  /** 存储格式版本号，用于数据迁移 */
  version: number;
  /** 项目元数据数组 */
  projects: ProjectMeta[];
  /** 当前选中项目的 ID */
  currentProjectId: string;
}

/**
 * 项目列表存储管理器接口
 * 定义项目列表存储的基本操作
 */
export interface ProjectListStorage {
  /**
   * 从 localStorage 加载项目列表数据
   * @returns 存储数据对象，如果不存在则返回 null
   */
  load(): ProjectsStorage | null;

  /**
   * 将项目列表数据保存到 localStorage
   * @param storage - 要保存的存储数据对象
   */
  save(storage: ProjectsStorage): void;

  /**
   * 迁移旧版本数据到当前版本
   * @returns 迁移后的存储数据，如果没有数据则返回 null
   */
  migrate(): ProjectsStorage | null;
}
