import { request } from '@/utils/request'

/** 充值金额项 */
export interface RechargeAmountItem {
  // 充值金额（所需支付的金额 = 获得的余额或积分）
  recharge_amount: string
  // 贈送金额（赠送的余额或积分）
  give_amount: string
}

/** 基础配置 */
export interface BaseConfig {
  // 用户中心状态：10关闭，20开启
  user_center_state: string
  // 注册状态：10关闭注册，20开启注册
  register_state: string
  // 主注册类型：10-字母+数字注册，20-手机号注册，30-邮箱注册
  main_register_type: '10' | '20' | '30'
  // 手机验证码登录状态：10关闭，20开启
  mobile_code_login_status: '10' | '20'
  // 邮箱验证码登录状态：10关闭，20开启
  email_code_login_status: '10' | '20'
  // 图形验证码状态：10关闭，20开启
  image_captcha_status: '10' | '20'
  // 默认头像
  default_avatar: string
}

/** 充值配置 */
export interface RechargeConfig {
  // 充值状态：10关闭充值，20允许充值
  recharge_state: '10' | '20'
  // 币种转换状态：10关闭，20开启
  currency_convert_status: '10' | '20'
  // 1元余额 = X积分
  balance_to_integral: string
  // 充值货币类型：10余额，20积分
  recharge_type: '10' | '20'
  // 余额货币名称
  balance_currency_name: string
  // 积分货币名称
  integral_currency_name: string
  // 充值金额列表
  recharge_amount_list: RechargeAmountItem[]
  // 充值说明
  recharge_remarks: string
}

/** 提现配置 */
export interface WithdrawConfig {
  // 提现状态：10关闭提现，20开启提现
  withdraw_state: string
  // 提现手续费
  withdrawal_fee: number
  // 最小提现金额
  min_withdraw: number
  // 最大提现金额
  max_withdraw: number
  // 每日提现限制
  daily_limit: number
  // 提现时间说明
  withdraw_time_remark: string
  // 提现说明
  withdraw_remarks: string
}

/** 用户配置 */
export interface UserConfigType {
  base: BaseConfig
  recharge: RechargeConfig
  withdraw: WithdrawConfig
}
/** 登录方式项 */
export interface LoginListType {
  // 登录方式标识
  name: string
  // 登录方式标题
  title: string
  // 格式化后标题（带HTML）
  title_format: string
  // 登录图标（URL地址）
  logo: string
  // 插件名称
  plugin: string
  // 类名
  class: string
  // 背景颜色
  bg_color: string
}
/** 系统配置 */
export interface SystemConfigType {
  // 网站名称
  web_name: string
  // 网站标题
  web_title: string
  // 网站地址
  web_url: string
  // 网站关键词
  web_keywords: string
  // 网站描述
  web_desc: string
  // 网站logo
  web_logo: string
  // 登录背景
  login_bg: string
  // 登录广告
  login_ad: string
  // 验证码状态：10关闭，20开启
  captcha_state: '10' | '20'
}

/** 备案信息配置 */
export interface WebIcpType {
  // 关于我们名称
  about_name: string
  // 关于我们链接
  about_url: string
  // 版权信息（支持HTML格式，用于显示在页面底部）
  copyright: string
  // ICP备案号
  web_icp: string
  // 公网安备号
  web_police: string
  // 公网安备编码
  web_police_code: string
}

/** 短信模板项 */
export interface SmsTemplateType {
  // 模板标题
  title: string
  // 场景模板标识
  name: string
  // 模板类型：10验证码，20业务通知
  type: '10' | '20'
}

/** 短信场景模板标识 */
export type SmsSceneName = 'register' | 'login' | 'find_password' | 'bind' | 'unbind'

/** 短信模板配置（以模板标识为 key 的字典） */
export type SmsConfigType = Partial<Record<SmsSceneName, SmsTemplateType>>

/** 邮件场景模板标识 */
export type EmailSceneName = 'register' | 'login' | 'find_password' | 'bind' | 'unbind'

/** 邮件模板项 */
export interface EmailTemplateType {
  // 模板标题
  title: string
  // 场景模板标识
  name: EmailSceneName
  // 模板类型：10验证码，20业务通知
  type: '10' | '20'
}

/** 邮件模板配置（以模板标识为 key 的字典） */
export type EmailConfigType = Partial<Record<EmailSceneName, EmailTemplateType>>

/** 站点配置信息 */
export interface SiteConfig {
  // 系统配置
  system: SystemConfigType
  // 备案信息配置
  webIcp: WebIcpType
  // 短信模板列表配置（以模板标识为 key 的字典）
  sms: SmsConfigType
  // 邮件模板列表配置
  email: EmailConfigType
  // 用户配置
  user: UserConfigType
  // 登录方式列表
  login_list: LoginListType[]
}

/**
 * 获取站点配置
 */
export const getSiteConfig = (): Promise<SiteConfig> => {
  return request.get<SiteConfig>('/xbMovieApp/api/Config/index')
}
