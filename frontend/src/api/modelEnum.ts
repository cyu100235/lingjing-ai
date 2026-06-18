import { request } from '@/utils/request'

/** 枚举项（通用字段 + 各分组扩展字段） */
export interface ModelEnumItem {
  /** 枚举值 */
  value: string
  /** 枚举标签 */
  label: string
  /** 枚举键名 */
  key?: string
  /** 样式HTML */
  style?: string
  /** 宽度（size / ratio 枚举） */
  width?: number
  /** 高度（size / ratio 枚举） */
  height?: number
  /** 比例值（ratio 枚举，如 "16:9"） */
  ratio?: string
  /** 类型标识（modality 枚举，如 "image"） */
  type?: string
  /** 图标类名（modality 枚举） */
  icon?: string
  /** 服务类路径（modality 枚举） */
  service?: string
}

/** 模型枚举全量响应：{ modality: [...], size: [...], ratio: [...], ... } */
export type ModelEnumResponse = Record<string, ModelEnumItem[]>

/** 模型枚举查询参数 */
export interface ModelEnumParams {
  /** 枚举名称（指定时仅返回对应分组） */
  name?: string
}

/**
 * 获取模型枚举列表
 * @param params - 可选查询参数（name-指定枚举名称）
 */
export const getModelEnumList = (params?: ModelEnumParams): Promise<ModelEnumResponse> => {
  return request.get<ModelEnumResponse>('/xbAiModelAgent/api/ModelEnum/index', { params })
}
