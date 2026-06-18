import type { AxiosError } from 'axios'
import type { ApiResponse } from './index'
import type { RequestEventDetail } from './types'
import { requestEventNameMap } from './types'
import { appEventBus } from '@/events'

/**
 * 响应错误拦截器：按状态码广播事件
 */
export function responseErrorInterceptor(error: AxiosError<ApiResponse>) {
  const status = error.response?.status
  const message = error.response?.data?.msg || error.message || '网络异常'
  const responseData = error.response?.data
  const url = error.config?.url

  if (status === 401) {
    appEventBus.emit<RequestEventDetail>(requestEventNameMap['unauthorized'], {
      type: 'unauthorized',
      message,
      status: 401,
      url,
      response: responseData,
    })
    localStorage.removeItem('token')
  } else if (status === 403) {
    appEventBus.emit<RequestEventDetail>(requestEventNameMap['forbidden'], {
      type: 'forbidden',
      message,
      status: 403,
      url,
      response: responseData,
    })
  } else if (status === 301) {
    appEventBus.emit<RequestEventDetail>(requestEventNameMap['redirect-permanent'], {
      type: 'redirect-permanent',
      message,
      status: 301,
      url,
      response: {
        ...(responseData as object),
        location: error.response?.headers?.location,
      },
    })
  } else if (status === 302) {
    appEventBus.emit<RequestEventDetail>(requestEventNameMap['redirect-temporary'], {
      type: 'redirect-temporary',
      message,
      status: 302,
      url,
      response: {
        ...(responseData as object),
        location: error.response?.headers?.location,
      },
    })
  } else {
    appEventBus.emit<RequestEventDetail>(requestEventNameMap['http-error'], {
      type: 'http-error',
      message,
      status,
      url,
      response: responseData,
    })
  }

  return Promise.reject(new Error(message))
}
