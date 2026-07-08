import { request } from '@/utils/request'
import { compressImageFromUrl } from '@/utils/image'

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
  /** 分辨率宽度 */
  width?: number
  /** 分辨率高度 */
  height?: number
  /** 提示词 */
  prompt: string
  /** 生成参数 */
  params: {
    width?: number
    height?: number
    duration_seconds?: number | string
    [key: string]: unknown
  }
  /** 任务队列ID */
  task_queue_id: number
  /** AI任务ID */
  ai_task_id: string
  /** 任务状态：10待执行 20执行中 30已完成 40失败 */
  status: statusType
  /** 任务结果详情 */
  result: ModelLogResultDetail
  /** 生成资源URL（原始地址） */
  asset_url: string
  /** 压缩后的图片 base64（仅图片类型，用于列表展示） */
  asset_url_compressed?: string
  /** 实际消费金额 */
  sale_amount?: number | string
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
 * 对列表中图片类型的 asset_url 进行压缩，结果写入 asset_url_compressed
 * 原始 asset_url 保持不变；压缩失败时回退为原 URL
 */
async function compressListAssetUrls(list: ModelLogItem[]): Promise<void> {
  await Promise.all(
    list.map(async (item) => {
      // 仅处理图片类型（modality '20' 或 result.object 'image'）
      const isImage = item.modality === '20' || item.result?.object === 'image'
      if (!isImage || !item.asset_url) return

      try {
        item.asset_url_compressed = await compressImageFromUrl(item.asset_url, { maxWidth: 800, quality: 0.6 })
      } catch (e) {
        // 压缩失败（跨域/格式不支持等）时回退原 URL
        console.warn('[compressListAssetUrls] 图片压缩失败，回退原 URL:', item.asset_url, e)
        item.asset_url_compressed = item.asset_url
      }
    }),
  )
}

/**
 * 获取模型日志分页列表
 * 图片类型的 asset_url 会自动压缩为 base64 缩略图并写入 asset_url_compressed，原始地址保留不变
 * @param params - 查询参数（page、limit、model_id、modality、status、start_time、end_time）
 */
export const getModelLogList = async (
  params?: ModelLogListParams,
): Promise<ModelLogListResult> => {
  const res = await request.get<ModelLogListResult>(
    '/app/xbAiModelAgent/api/ModelLog/index',
    { params },
  )
  if (res?.data?.length) {
    await compressListAssetUrls(res.data)
  }
  return res
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
  return request.get<unknown>('/app/xbAiModelAgent/api/ModelLog/delete', { params: { id } })
}

/**
 * 批量删除任务日志
 * @param params - 请求参数（ids-任务日志ID集合）
 */
export const batchDeleteModelLog = (params: BatchDeleteModelLogParams): Promise<unknown> => {
  return request.delete<unknown>('/app/xbAiModelAgent/api/ModelLog/batchDelete', { data: params })
}
