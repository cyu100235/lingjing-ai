import { request } from '@/utils/request'

export interface ResourceListResult {
  /** ID */
  id: number
  /** 图标 */
  icon: string
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 链接 */
  link_url: string
  /** 排序 */
  sort: number
  /** 状态 10=禁用，20=启用 */
  status: '10' | '20'
  /** 创建时间 */
  create_at: string
  /** 更新时间 */
  update_at: string
}

/**
 * 获取资源列表
 */
export const getResourceList = (): Promise<ResourceListResult[]> => {
  return request.get<ResourceListResult[]>('/xbHelp/api/Resource/list')
}
