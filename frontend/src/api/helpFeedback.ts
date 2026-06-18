import { request } from '@/utils/request'

/**
 * 提交反馈
 */
export const createFeedback = (data?: unknown): Promise<unknown> => {
  return request.post<unknown>('/xbHelp/api/Feedback/create', data)
}

/**
 * 获取反馈列表
 */
export const getFeedbackList = (): Promise<unknown> => {
  return request.get<unknown>('/xbHelp/api/Feedback/list')
}
