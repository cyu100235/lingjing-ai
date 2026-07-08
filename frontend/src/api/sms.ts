import { request } from '@/utils/request'

/** 发送短信参数 */
export interface SendSmsParams {
  /** 场景模板标识 */
  name: string
  /** 手机号码 */
  mobile: string
}

/**
 * 发送短信（无需登录）
 */
export const sendSms = (params: SendSmsParams): Promise<unknown> => {
  return request.get<unknown>('/app/xbSms/api/Sms/send', { params })
}

/**
 * 发送短信（必须登录）
 */
export const sendAuthSms = (params: SendSmsParams): Promise<unknown> => {
  return request.get<unknown>('/app/xbSms/api/Sms/sendAuth', { params })
}
