import { request } from '@/utils/request'

/** 登录响应数据 */
export interface LoginResult {
  /** Token类型 */
  token_type: string
  /** 过期时间（秒） */
  expires_in: number
  /** 访问令牌 */
  access_token: string
  /** 刷新令牌 */
  refresh_token: string
}

/** 用户信息 */
export interface UserInfo {
  /** 用户ID */
  id: number | string
  /** 创建时间 */
  create_at: string
  /** 登录账号(字母+数字) */
  username: string
  /** 用户昵称 */
  nickname: string
  /** 手机号码 */
  mobile: string
  /** 电子邮箱 */
  email: string
  /** 用户头像URL */
  avatar: string
  /** 登录IP */
  login_ip: string
  /** 登录时间 */
  login_time: string
  /** 用户余额 */
  balance: number
  /** 冻结余额 */
  freeze_balance: number
  /** 用户积分 */
  integral: number
  /** 会员等级（可选，前端扩展字段） */
  level?: 'free' | 'monthly' | 'annual' | 'lifetime'
  [key: string]: unknown
}

/** 用户注册参数 */
export interface RegisterParams {
  /** 登录账号 */
  username: string
  /** 登录密码 */
  password: string
  /** 用户昵称 */
  nickname: string
  /** 邀请码（可选） */
  icode?: string
  /** 验证码标识key（图像验证码开启时必传） */
  captcha_key?: string
  /** 用户输入的图形验证码（图像验证码开启时必传） */
  captcha_code?: string
  /** 邮箱或短信验证码（字母+数字注册时可不传） */
  code?: string
}

/** 用户登录参数 */
export interface LoginParams {
  /** 登录账号 */
  username: string
  /** 登录密码 */
  password: string
  /** 验证码标识key（图像验证码开启时必传） */
  captcha_key?: string
  /** 用户输入的图形验证码（图像验证码开启时必传） */
  captcha_code?: string
}

/** 修改单字段参数 */
export interface EditProfileFieldParams {
  /** 修改字段 */
  field: string
  /** 修改值 */
  value: string
}

/** 修改资料参数 */
export interface EditProfileParams {
  /** 昵称 */
  nickname: string
  /** 头像URL地址 */
  avatar: string
}

/** 修改密码参数 */
export interface ChangePasswordParams {
  /** 原始密码 */
  origin_password: string
  /** 新的登录密码 */
  password: string
}

/** 找回密码参数 */
export interface ResetPasswordParams {
  /** 手机号或邮箱 */
  username: string
  /** 验证码 */
  code: string
  /** 新的密码 */
  password: string
  /** 验证码标识key（图像验证码开启时必传） */
  captcha_key?: string
  /** 用户输入的图形验证码（图像验证码开启时必传） */
  captcha_code?: string
}

/** 手机验证码登录参数 */
export interface MobileLoginParams {
  /** 手机号码 */
  mobile: string
  /** 验证码 */
  code: string
  /** 验证码标识key（图像验证码开启时必传） */
  captcha_key?: string
  /** 用户输入的图形验证码（图像验证码开启时必传） */
  captcha_code?: string
}

/** 邮箱验证码登录参数 */
export interface EmailLoginParams {
  /** 电子邮箱 */
  email: string
  /** 验证码 */
  code: string
  /** 验证码标识key（图像验证码开启时必传） */
  captcha_key?: string
  /** 用户输入的图形验证码（图像验证码开启时必传） */
  captcha_code?: string
}

/** 退出登录参数 */
export interface LogoutParams {
  /** 客户端类型 */
  client: 'web' | 'mobile'
}

/** 验证码响应数据 */
export interface CaptchaResult {
  /** 验证码标识key */
  captcha_key: string
  /** 验证码图片base64 */
  captcha_image: string
}

/**
 * 用户注册
 */
export const register = (params: RegisterParams): Promise<unknown> => {
  return request.post<unknown>('/xbUser/api/Publics/register', params)
}

/**
 * 用户登录
 */
export const login = (params: LoginParams): Promise<LoginResult> => {
  return request.post<LoginResult>('/xbUser/api/Publics/login', params)
}

/**
 * 获取用户信息
 */
export const getUserInfo = (): Promise<UserInfo> => {
  return request.get<UserInfo>('/xbUser/api/User/info')
}

/**
 * 修改个人资料（单字段）
 */
export const editProfileField = (params: EditProfileFieldParams): Promise<unknown> => {
  return request.put<unknown>('/xbUser/api/User/profile', params)
}

/**
 * 修改资料（昵称/头像）
 */
export const editProfile = (params: EditProfileParams): Promise<unknown> => {
  return request.put<unknown>('/xbUser/api/User/editProfile', params)
}

/**
 * 修改登录密码
 */
export const changePassword = (params: ChangePasswordParams): Promise<unknown> => {
  return request.put<unknown>('/xbUser/api/User/password', params)
}

/**
 * 找回密码（重置密码）
 */
export const resetPassword = (params: ResetPasswordParams): Promise<unknown> => {
  return request.put<unknown>('/xbUser/api/Publics/findPassword', params)
}

/**
 * 获取图像验证码
 */
export const getCaptcha = (): Promise<CaptchaResult> => {
  return request.get<CaptchaResult>('/xbUser/api/Publics/captcha')
}

/**
 * 手机验证码登录
 */
export const mobileLogin = (params: MobileLoginParams): Promise<LoginResult> => {
  return request.post<LoginResult>('/xbUser/api/Publics/mobileLogin', params)
}

/**
 * 邮箱验证码登录
 */
export const emailLogin = (params: EmailLoginParams): Promise<LoginResult> => {
  return request.post<LoginResult>('/xbUser/api/Publics/emailLogin', params)
}

/**
 * 退出登录
 */
export const logout = (params: LogoutParams): Promise<unknown> => {
  return request.delete<unknown>('/xbUser/api/Publics/logout', { data: params })
}
