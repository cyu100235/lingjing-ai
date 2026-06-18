import { request } from '@/utils/request'

// 任务对象类型：image-图片 video-视频
export type objectType = 'image' | 'video'
// 模态类型：20图片，30音频，40视频
export type modalityType = '20' | '30' | '40'
// 任务状态：10待执行 20执行中 30已完成 40失败
export type statusType = '10' | '20' | '30' | '40'

/** 模型日志列表查询参数 */
export interface ModelLogListParams {
  /** 当前页码 */
  page?: number
  /** 每页数量 */
  limit?: number
  /** 第三方模型ID */
  model_id?: string
  /** 模态类型 */
  modality?: modalityType
  /** 任务状态 */
  status?: statusType
  /** 开始时间 */
  start_time?: string
  /** 结束时间 */
  end_time?: string
}

/** 模型日志 result 字段 */
export interface ModelLogResultDetail {
  /** 任务ID */
  id: string
  /** 尺寸 */
  size?: string
  /** 模型 */
  model: string
  /** 对象类型：image-图片 video-视频 */
  object: objectType
  /** 任务状态 */
  status: string
  /** 进度 */
  progress: number
  /** 创建时间戳 */
  created_at: number
  /** 完成时间戳 */
  completed_at?: number
}

/** 模型日志项 */
export interface ModelLogItem {
  /** 日志ID */
  id: number | string
  /** 用户ID */
  uid: number
  /** 模型ID */
  model_id: string
  /** 模态类型：20图片，30音频，40视频 */
  modality: modalityType
  /** 端点 */
  endpoint: string
  /** 提示词 */
  prompt: string
  /** 生成参数 */
  params: Record<string, unknown>
  /** 任务队列ID */
  task_queue_id: number
  /** AI任务ID */
  ai_task_id: string
  /** 任务状态：10待执行 20执行中 30已完成 40失败 */
  status: statusType
  /** 任务结果详情 */
  result: ModelLogResultDetail
  /** 生成资源URL列表 */
  asset_urls: string[]
  /** 错误信息 */
  error_msg: string | null
  /** 创建时间 */
  create_at: string
  /** 更新时间 */
  update_at: string
  /** 完成时间 */
  finish_at: string | null
}

/** 模型日志列表响应 */
export interface ModelLogListResult {
  /** 总数 */
  total: number
  /** 每页数量 */
  per_page: number
  /** 当前页码 */
  current_page: number
  /** 最后一页 */
  last_page: number
  /** 模型日志列表 */
  data: ModelLogItem[]
}

/**
 * 获取模型日志分页列表
 * @param params - 查询参数（page、limit、model_id、modality、status、start_time、end_time）
 */
export const getModelLogList = (params?: ModelLogListParams): Promise<ModelLogListResult> => {
  return request.get<ModelLogListResult>('/xbAiModelAgent/api/ModelLog/index', { params })
}

/** 批量删除任务日志请求参数 */
export interface BatchDeleteModelLogParams {
  /** 任务日志ID集合 */
  ids: string[]
}

/**
 * 删除任务日志
 * @param id - 任务日志ID
 */
export const deleteModelLog = (id: number): Promise<unknown> => {
  return request.get<unknown>('/xbAiModelAgent/api/ModelLog/delete', { params: { id } })
}

/**
 * 批量删除任务日志
 * @param params - 请求参数（ids-任务日志ID集合）
 */
export const batchDeleteModelLog = (params: BatchDeleteModelLogParams): Promise<unknown> => {
  return request.delete<unknown>('/xbAiModelAgent/api/ModelLog/batchDelete', { data: params })
}
