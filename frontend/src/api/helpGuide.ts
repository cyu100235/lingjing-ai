import { request } from '@/utils/request'

/** 快速入门项 */
export interface GuideItem {
  /** ID */
  id: number
  /** 图标名称 */
  icon: string
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 图标颜色 */
  color: string
  /** 链接类型：10=内部文章，20=外部链接 */
  link_type: '10' | '20'
  /** 链接值：内部文章ID或外部链接URL */
  link_value: string | number
  /** 排序 */
  sort: number
  /** 状态：10=禁用，20=启用 */
  status: '10' | '20'
  /** 创建时间 */
  create_at: string
  /** 更新时间 */
  update_at: string
}

/**
 * 获取快速入门列表
 */
export const getGuideList = (): Promise<GuideItem[]> => {
  return request.get<GuideItem[]>('/xbHelp/api/Guide/list')
}
