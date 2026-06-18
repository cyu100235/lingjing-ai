import { request } from '@/utils/request'

/** 绑定手机参数 */
export interface BindMobileParams {
  /** 手机号码 */
  mobile: string
  /** 验证码 */
  code: string
}

/** 解绑手机参数 */
export interface UnlockBindMobileParams {
  /** 验证码 */
  code: string
}

/** 绑定邮箱参数 */
export interface BindMailParams {
  /** 邮箱地址 */
  email: string
  /** 验证码 */
  code: string
}

/** 解绑邮箱参数 */
export interface UnlockMailParams {
  /** 验证码 */
  code: string
}

/**
 * 绑定手机
 */
export const bindMobile = (params: BindMobileParams): Promise<unknown> => {
  return request.put<unknown>('/xbUser/api/Bind/bindMobile', params)
}

/**
 * 解绑手机
 */
export const unlockBindMobile = (params: UnlockBindMobileParams): Promise<unknown> => {
  return request.delete<unknown>('/xbUser/api/Bind/unlockBindMobile', { data: params })
}

/**
 * 绑定邮箱
 */
export const bindMail = (params: BindMailParams): Promise<unknown> => {
  return request.put<unknown>('/xbUser/api/Bind/bindMail', params)
}

/**
 * 解绑邮箱
 */
export const unlockMail = (params: UnlockMailParams): Promise<unknown> => {
  return request.delete<unknown>('/xbUser/api/Bind/unlockMail', { data: params })
}
