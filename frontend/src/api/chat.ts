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

/**
 * AI聊天（SSE 流式）
 * @param params 聊天参数
 * @param onChunk 每接收到一段文本时的回调
 * @param signal 可选 AbortSignal，用于取消请求
 */
export const chat = (
  params: ChatParams,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
) => {
  return request.ssePost('/app/xbAiModelAgent/api/Chat/chat', params, onChunk, signal)
}
