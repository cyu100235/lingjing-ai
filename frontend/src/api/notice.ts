import { request } from '@/utils/request'

/** 通知类型选项 */
export interface NoticeTypeOption {
  /** 类型显示名称 */
  label: string
  /** 类型值 */
  value: number
  /** 类型颜色 */
  color: string
  /** 类型标识 */
  name_key: string
}

/** 通知列表查询参数 */
export interface NoticeListParams {
  /** 类型标识（可选） */
  type_name?: string
  /** 当前页码 */
  page?: number
  /** 每页数量 */
  limit?: number
}

/** 通知项 */
export interface NoticeItem {
  /** 消息ID */
  id: number | string
  /** 通知标题 */
  title: string
  /** 通知内容 */
  content: string
  /** 类型名称 */
  type_name: string
  /** 类型标识 */
  type_key: string
  /** 模板 ID，对应 NoticeTypeOption.value */
  template_id: number
  /** 是否已读（10=未读，20=已读） */
  is_read: '10' | '20'
  /** 创建时间 */
  create_at: string
}

/** 通知列表响应 */
export interface NoticeListResult {
  /** 总数 */
  total: number
  /** 每页数量 */
  per_page: number
  /** 当前页码 */
  current_page: number
  /** 最后一页 */
  last_page: number
  /** 通知列表 */
  data: NoticeItem[]
  /** 是否还有更多 */
  has_more: boolean
}

/** 未读数量响应 */
export interface UnreadCountResult {
  /** 未读数量 */
  count: number
}

/**
 * 获取通知类型选项
 */
export const getNoticeTypeOptions = (): Promise<NoticeTypeOption[]> => {
  return request.get<NoticeTypeOption[]>('/xbWebMessage/api/Types/options')
}

/**
 * 获取用户通知列表
 */
export const getNoticeList = (params: NoticeListParams): Promise<NoticeListResult> => {
  return request.get<NoticeListResult>('/xbWebMessage/api/Notice/list', { params })
}

/**
 * 标记单条通知为已读
 */
export const markNoticeRead = (notice_id: number | string): Promise<unknown> => {
  return request.put<unknown>('/xbWebMessage/api/Notice/markRead', { notice_id })
}

/**
 * 一键全部已读
 */
export const markAllNoticeRead = (): Promise<unknown> => {
  return request.put<unknown>('/xbWebMessage/api/Notice/markAllRead')
}

/**
 * 获取用户未读通知数量
 */
export const getUnreadCount = (): Promise<UnreadCountResult> => {
  return request.get<UnreadCountResult>('/xbWebMessage/api/Notice/unreadCount')
}
