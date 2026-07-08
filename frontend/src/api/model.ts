import { request } from '@/utils/request'

/** 模型列表查询参数 */
export interface ModelListParams {
  /** 当前页码 */
  page?: number
  /** 每页数量 */
  limit?: number
  /** 模型分组编码 */
  group_code?: string
  /** 模型ID */
  model_id?: string
}

/** 上游原始价格配置 */
export interface ModelCostPrices {
  /** 输入价格（元/百万 Tokens） */
  input_price?: number
  /** 输出价格（元/百万 Tokens） */
  output_price?: number
  /** 每张图片价格 */
  per_image?: number
  /** 图片分辨率价格映射 */
  resolution_prices?: Record<string, number>
  /** 每个视频价格 */
  per_video?: number
  /** 每秒视频价格 */
  duration_price?: number
  /** 首秒价格 */
  first_duration_price?: number
  /** 后续每秒价格 */
  subsequent_duration_price?: number
}

/** 销售价配置（成本价 × 全局倍率） */
export type ModelSalePrices = ModelCostPrices

/** 模型项 */
export interface ModelItem {
  /** 模型名称 */
  name: string
  /** 模型标识 */
  model_id: string
  /** 模态编码 */
  modality: '10' | '20' | '30' | '40'
  /** 模型分类（image/audio/video） */
  modality_type: 'image' | 'audio' | 'video'
  /** 状态编码 */
  status: string
  /** 模型图标标识 */
  icon: string
  /** 标签 */
  tags: string
  /** 排序值 */
  sort: number
  /** 模型描述 */
  description: string
  /** 上游原始价格配置 */
  cost_prices: ModelCostPrices
  /** 销售价配置 */
  sale_prices: ModelSalePrices
  /** 全局模型价格倍率 */
  price_rate: number
  /** 创建时间 */
  create_at: string
  /** 更新时间 */
  update_at: string
  /** 价格HTML文本（成本价） */
  prices_text: string
  /** 价格格式化文本（销售价） */
  prices_format: string
  /** 徽章标签（可选） */
  badge?: string
  /** 徽章类型（可选） */
  badge_type?: string
}

/** 模型列表响应 */
export interface ModelListResult {
  /** 总数 */
  total: number
  /** 每页数量 */
  per_page: number
  /** 当前页码 */
  current_page: number
  /** 最后一页 */
  last_page: number
  /** 模型列表 */
  data: ModelItem[]
}

/**
 * 获取全部模型列表
 * @param params - 可选查询参数（group_code、model_id）
 */
export const getModelList = (params?: Pick<ModelListParams, 'group_code' | 'model_id'>): Promise<ModelItem[]> => {
  return request.get<ModelItem[]>('/app/xbAiModelAgent/api/Model/index', { params })
}

/**
 * 获取模型分页列表
 */
export const getModelPageList = (params?: ModelListParams): Promise<ModelListResult> => {
  return request.get<ModelListResult>('/app/xbAiModelAgent/api/Model/getList', { params })
}
