import { request } from '@/utils/request'

/** FAQ列表查询参数 */
export interface FaqListParams {
  /** 分类ID */
  category_id?: number
}

/** FAQ列表结果 */
export interface FaqListResult {
  /** ID */
  id: number
  /** 分类ID */
  category_id: number
  /** 问题 */
  question: string
  /** 答案 */
  answer: string
  /** 排序 */
  sort: number
  /** 10=禁用，20=启用 */
  status: '10' | '20'
  /** 创建时间 */
  create_at: string
  /** 更新时间 */
  update_at: string
}

/**
 * 获取FAQ列表
 */
export const getFaqList = (params?: FaqListParams): Promise<FaqListResult[]> => {
  return request.get<FaqListResult[]>('/xbHelp/api/Faq/list', { params })
}
