import { request } from '@/utils/request'

/** 发送邮件验证码参数 */
export interface SendEmailCodeParams {
  /** 场景模板标识 */
  name: string
  /** 邮箱地址 */
  email: string
}

/**
 * 发送邮箱验证码（无需登录）
 */
export const sendEmailCode = (params: SendEmailCodeParams): Promise<unknown> => {
  return request.post<unknown>('/xbEmail/api/Mail/send', params)
}

/**
 * 发送邮箱验证码（必须登录）
 */
export const sendAuthEmailCode = (params: SendEmailCodeParams): Promise<unknown> => {
  return request.post<unknown>('/xbEmail/api/Mail/sendAuth', params)
}
