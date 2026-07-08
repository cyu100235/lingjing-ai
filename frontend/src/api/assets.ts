import { request } from '@/utils/request'

// 资产类型：10-场景图片，20-人物角色，30-物品道具，40-人物音色，50-事件音效，60-视频资产
export type AssetType = '10' | '20' | '30' | '40' | '50' | '60'
// 资产来源：10-AI生成，20-自主上传，30-市场购买
export type AssetSource = '10' | '20' | '30'

/** 资产项 */
export interface AssetItem {
  /** 资产ID */
  id: number
  /** 资产名称 */
  name: string
  /** 资产类型 */
  type: AssetType
  /** 资产来源 */
  source: AssetSource
  /** 资产封面 */
  thumb?: string
  /** 资产文件地址 */
  media_url: string
  /** 时长(秒) */
  duration?: number
  /** 标签 */
  tags?: string
  /** 用户ID */
  user_id?: number
  /** 创建时间 */
  create_at?: string
}

/** 资产列表查询参数 */
export interface AssetListParams {
  /** 资产类型（可选） */
  type?: AssetType
  /** 资产来源（可选） */
  source?: AssetSource
  /** 资产名称（可选） */
  name?: string
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

/** 创建资产参数 */
export interface CreateAssetParams {
  /** 资产名称 */
  name: string
  /** 资产类型 */
  type: AssetType
  /** 资产来源 */
  source: AssetSource
  /** 资产文件地址 */
  media_url: string
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
  type?: AssetType
  /** 资产来源（可选） */
  source?: AssetSource
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
  return request.get<AssetListResult>('/app/xbAiAsset/api/Asset/list', { params })
}

/**
 * 获取资产详情
 */
export const getAssetDetail = (id: number): Promise<AssetItem> => {
  return request.get<AssetItem>('/app/xbAiAsset/api/Asset/detail', { params: { id } })
}

/**
 * 创建资产
 * @param params 创建资产参数
 * @returns 资产详情
 * @returns 
 */
export const createAsset = (params: CreateAssetParams): Promise<AssetItem> => {
  return request.post<AssetItem>('/app/xbAiAsset/api/Asset/create', params)
}

/**
 * 更新资产
 */
export const updateAsset = (params: UpdateAssetParams): Promise<AssetItem> => {
  return request.put<AssetItem>('/app/xbAiAsset/api/Asset/update', params)
}

/**
 * 删除资产
 */
export const deleteAsset = (id: number): Promise<unknown> => {
  return request.delete<unknown>('/app/xbAiAsset/api/Asset/delete', { params: { id } })
}
