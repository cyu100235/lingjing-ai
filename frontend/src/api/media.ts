import { request } from '@/utils/request'

/** 图片生成参数 */
export interface ImageParams {
  /** 模型ID */
  model: string
  /** 提示词 */
  prompt: string
  /** 宽度（默认1024） */
  width?: number
  /** 高度（默认1024） */
  height?: number
  /** 反向提示词 */
  negative_prompt?: string
  /** 参考图片URL列表（支持数组或逗号分隔） */
  reference_image_urls?: string[]
}

/** 音频生成参数 */
export interface AudioParams {
  /** 模型ID */
  model: string
  /** 提示词 */
  prompt: string
  /** 反向提示词 */
  negative_prompt?: string
}

/** 视频生成参数 */
export interface VideoParams {
  /** 模型ID */
  model: string
  /** 提示词 */
  prompt: string
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 反向提示词 */
  negative_prompt?: string
  /** 视频时长（秒） */
  duration_seconds?: string
}

// 创建媒体生成任务
export function generateMedia(params: ImageParams | AudioParams | VideoParams) {
  return request.post('/api/media/generate', params)
}

/**
 * 查询媒体任务状态
 * @param taskId - 任务ID
 */
export const queryMediaTask = (taskId: string) => {
  return request.get('/api/media/query', { params: { task_id: taskId } })
}
