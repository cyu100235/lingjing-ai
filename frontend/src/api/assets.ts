import { request, UploadOptions } from '@/utils/request'

/** 资产项 */
export interface AssetItem {
  /** 资产ID */
  id: number
  /** 资产名称 */
  name: string
  /** 资产类型 */
  type: string
  /** 资产封面 */
  thumb?: string
  /** 资产文件地址 */
  media_url: string
  /** 时长(秒) */
  duration?: number
  /** 标签 */
  tags?: string
  /** 资产来源 */
  source?: string
  /** 用户ID */
  user_id?: number
  /** 创建时间 */
  create_at?: string
}

/** 资产列表查询参数 */
export interface AssetListParams {
  /** 资产类型（可选） */
  type?: string
  /** 资产来源（可选） */
  source?: string
  /** 资产名称（可选） */
  name?: string
  /** 用户ID（可选） */
  user_id?: number
  /** 页码 */
  page?: number
  /** 每页数量 */
  limit?: number
}

/** 资产列表响应 */
export interface AssetListResult {
  /** 总数 */
  total: number
  /** 每页数量 */
  per_page: number
  /** 当前页码 */
  current_page: number
  /** 最后一页 */
  last_page: number
  /** 资产列表 */
  data: AssetItem[]
}

/** 创建资产参数（AI生成） */
export interface CreateAssetParams {
  /** 资产名称 */
  name: string
  /** 资产类型 */
  type: string
  /** 资产文件地址 */
  media_url: string
  /** 资产封面（可选） */
  thumb?: string
  /** 时长(秒)（可选） */
  duration?: number
  /** 标签（可选） */
  tags?: string
}

/** 上传资产参数 */
export interface UploadAssetParams {
  /** 资产名称 */
  name: string
  /** 资产类型 */
  type: string
  /** 资产封面（可选） */
  thumb?: string
  /** 时长(秒)（可选） */
  duration?: number
  /** 标签（可选） */
  tags?: string
}

/** 更新资产参数 */
export interface UpdateAssetParams {
  /** 资产ID */
  id: number
  /** 资产名称（可选） */
  name?: string
  /** 资产类型（可选） */
  type?: string
  /** 资产封面（可选） */
  thumb?: string
  /** 资产文件地址（可选） */
  media_url?: string
  /** 时长(秒)（可选） */
  duration?: number
  /** 标签（可选） */
  tags?: string
}

/**
 * 获取资产列表
 */
export const getAssetList = (params?: AssetListParams): Promise<AssetListResult> => {
  return request.get<AssetListResult>('/xbAiAsset/api/Asset/list', { params })
}

/**
 * 获取资产详情
 */
export const getAssetDetail = (id: number): Promise<AssetItem> => {
  return request.get<AssetItem>('/xbAiAsset/api/Asset/detail', { params: { id } })
}

/**
 * 创建资产（AI生成）
 */
export const createAsset = (params: CreateAssetParams): Promise<AssetItem> => {
  const formData = new FormData()
  formData.append('name', params.name)
  formData.append('type', params.type)
  formData.append('media_url', params.media_url)
  if (params.thumb !== undefined) formData.append('thumb', params.thumb)
  if (params.duration !== undefined) formData.append('duration', String(params.duration))
  if (params.tags !== undefined) formData.append('tags', params.tags)
  return request.post<AssetItem>('/xbAiAsset/api/Asset/create', formData)
}

/**
 * 上传资产
 */
export const uploadAsset = (
  file: File,
  params: UploadAssetParams,
  options?: Pick<UploadOptions, 'onProgress' | 'abortController'>,
): Promise<AssetItem> => {
  return request.upload<AssetItem>('/xbAiAsset/api/Asset/upload', file, {
    fieldName: 'file',
    extraData: {
      name: params.name,
      type: params.type,
      ...(params.thumb !== undefined && { thumb: params.thumb }),
      ...(params.duration !== undefined && { duration: String(params.duration) }),
      ...(params.tags !== undefined && { tags: params.tags }),
    },
    ...options,
  })
}

/**
 * 更新资产
 */
export const updateAsset = (params: UpdateAssetParams): Promise<AssetItem> => {
  return request.put<AssetItem>('/xbAiAsset/api/Asset/update', params)
}

/**
 * 删除资产
 */
export const deleteAsset = (id: number): Promise<unknown> => {
  return request.delete<unknown>('/xbAiAsset/api/Asset/delete', { params: { id } })
}
