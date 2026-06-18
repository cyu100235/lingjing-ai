import type { AxiosResponse } from 'axios'
import type { ApiResponse } from './index'
import type { RequestEventDetail } from './types'
import { requestEventNameMap } from './types'
import { appEventBus } from '@/events'

/**
 * 响应拦截器：统一错误处理 + 事件广播
 */
export function responseInterceptor(response: AxiosResponse<ApiResponse>) {
  const { data, config } = response
  if (data?.status !== 0) {
    appEventBus.emit<RequestEventDetail>(requestEventNameMap['business-error'], {
      type: 'business-error',
      message: data.msg || '请求失败',
      status: data.status,
      url: config?.url,
      response: data,
    })
    return Promise.reject(new Error(data.msg || '请求失败'))
  }
  return response
}
