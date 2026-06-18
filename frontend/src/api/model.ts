import { request } from '@/utils/request'

/** 对话消息 */
export interface ChatMessage {
  /** 角色 */
  role: string
  /** 内容 */
  content: string
}

/** AI聊天参数 */
export interface ChatParams {
  /** 模型ID */
  model_id: string
  /** 对话消息列表 */
  messages: ChatMessage[]
  /** 采样温度 0~2 */
  temperature?: number
  /** 核采样参数 0~1 */
  top_p?: number
  /** 生成数量 >=1 */
  n?: number
  /** 最大生成Token数 */
  max_tokens?: number
  /** 最大补全Token数 */
  max_completion_tokens?: number
  /** 停止序列 */
  stop?: string
  /** 存在惩罚 -2~2 */
  presence_penalty?: number
  /** 频率惩罚 -2~2 */
  frequency_penalty?: number
  /** 用户标识 */
  user?: string
  /** 工具列表 */
  tools?: string[]
  /** 工具选择策略 */
  tool_choice?: string
  /** 响应格式 */
  response_format?: Record<string, unknown>
  /** 随机种子 */
  seed?: number
  /** 推理强度 low/medium/high */
  reasoning_effort?: string
}

/** AIGC生成参数 */
export interface AigcParams {
  /** 模型ID */
  model_id: string
  /** 提示词 */
  prompt: string
  /** 生成大小（如 1024x1024） */
  size?: string
  /** 视频时长（秒） */
  seconds?: string
  /** 生成数量 */
  n?: number
  /** 质量 */
  quality?: string
  /** 风格 */
  style?: string
}

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

/** 模型价格项 */
export interface ModelPrice {
  /** 价格标签 */
  label: string
  /** 输入价格 */
  input_price: string
  /** 输出价格 */
  output_price: string
  /** 价格 */
  price: string
  /** 图片尺寸 */
  image_size: string
  /** 视频质量编码 */
  video_quality: string
  /** 计量单位编码 */
  unit: string
  /** 计量单位标签 */
  unit_label: string
  /** 视频质量标签 */
  video_quality_label: string
}

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
  /** 价格列表 */
  prices: ModelPrice[]
  /** 创建时间 */
  create_at: string
  /** 更新时间 */
  update_at: string
  /** 价格HTML文本 */
  prices_text: string
  /** 价格格式化文本 */
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
  return request.get<ModelItem[]>('/xbAiModelAgent/api/Model/index', { params })
}

/**
 * 获取模型分页列表
 */
export const getModelPageList = (params?: ModelListParams): Promise<ModelListResult> => {
  return request.get<ModelListResult>('/xbAiModelAgent/api/Model/getList', { params })
}

/**
 * AI聊天（SSE 流式）
 * @param params 聊天参数
 * @param onChunk 每接收到一段文本时的回调
 * @param signal 可选 AbortSignal，用于取消请求
 */
export const chatModel = (
  params: ChatParams,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
) => {
  return request.ssePost('/xbAiModelAgent/api/Model/chat', params, onChunk, signal)
}

/**
 * AIGC生成
 */
export const aigcModel = (params: AigcParams) => {
  return request.post('/xbAiModelAgent/api/Model/aigc', params)
}
