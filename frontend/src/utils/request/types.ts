// 请求事件名称常量
export const RequestEvents = {
  // 业务错误（status 非 0/200）
  BUSINESS_ERROR: 'request:business-error',
  // HTTP 错误（网络异常、超时等）
  HTTP_ERROR: 'request:http-error',
  // 401 未授权
  UNAUTHORIZED: 'request:unauthorized',
  // 403 权限不足
  FORBIDDEN: 'request:forbidden',
  // 301 永久重定向
  REDIRECT_PERMANENT: 'request:redirect-permanent',
  // 302 临时重定向
  REDIRECT_TEMPORARY: 'request:redirect-temporary',
} as const

// 请求事件负载
export interface RequestEventDetail {
  // 错误类型
  type: 'business-error' | 'http-error' | 'unauthorized' | 'forbidden' | 'redirect-permanent' | 'redirect-temporary'
  // 错误信息
  message: string
  // HTTP 状态码或业务状态码
  status?: number
  // 请求地址
  url?: string
  // 原始响应数据
  response?: unknown
}

// 错误类型 → 事件名称映射
export const requestEventNameMap: Record<RequestEventDetail['type'], (typeof RequestEvents)[keyof typeof RequestEvents]> = {
  'business-error': RequestEvents.BUSINESS_ERROR,
  'http-error': RequestEvents.HTTP_ERROR,
  unauthorized: RequestEvents.UNAUTHORIZED,
  forbidden: RequestEvents.FORBIDDEN,
  'redirect-permanent': RequestEvents.REDIRECT_PERMANENT,
  'redirect-temporary': RequestEvents.REDIRECT_TEMPORARY,
}
