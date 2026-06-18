import { request } from '@/utils/request'

/** 资产类型项 */
export interface AssetTypeItem {
  /** 类型显示名称 */
  label: string
  /** 类型值 */
  value: string
  /** 分类类型 */
  type: 'image' | 'audio' | 'video'
  /** 类型颜色 */
  color?: string
  /** 类型描述 */
  desc?: string
  /** 图标标识 */
  icon?: string
  /** 允许的文件扩展名（仅顶级类型有，子类型无此字段） */
  ext?: string[]
}

/**
 * 获取资产类型列表
 */
export const getAssetTypeList = (): Promise<AssetTypeItem[]> => {
  return request.get<AssetTypeItem[]>('/xbAiAsset/api/AssetType/list')
}
