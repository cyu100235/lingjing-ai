import axios, { AxiosInstance, AxiosRequestConfig, AxiosProgressEvent } from 'axios'
import { defaultConfig } from './config'
import { requestInterceptor, requestErrorInterceptor } from './requestInterceptors'
import { responseInterceptor } from './responseInterceptors'
import { responseErrorInterceptor } from './errorInterceptors'

// 获取 Token 的函数类型
type GetTokenFn = () => string | null

// 上传配置选项
export interface UploadOptions {
  /** 上传进度回调，percent 范围 0~100 */
  onProgress?: (percent: number, event: AxiosProgressEvent) => void
  /** 额外的表单字段 */
  extraData?: Record<string, string | Blob>
  /** 文件字段名，默认 'file' */
  fieldName?: string
  /** 自定义请求头 */
  headers?: Record<string, string>
  /** 取消控制器，用于中止上传 */
  abortController?: AbortController
}

// 响应数据结构
export interface ApiResponse<T = unknown> {
  status: number
  data: T
  msg: string
}

// HTTP 请求客户端
export class RequestClient {
  private instance: AxiosInstance
  private getToken: GetTokenFn

  constructor(config: AxiosRequestConfig = {}, getToken?: GetTokenFn) {
    this.instance = axios.create({ ...defaultConfig, ...config })
    
    this.getToken = getToken || (() => localStorage.getItem('token'))

    this.setupInterceptors()
  }

  // 配置请求与响应拦截器
  private setupInterceptors() {
    // 请求拦截器：自动附加 Token
    this.instance.interceptors.request.use(
      requestInterceptor(this.getToken),
      requestErrorInterceptor,
    )

    // 响应拦截器：统一错误处理 + 事件广播
    this.instance.interceptors.response.use(
      responseInterceptor,
      responseErrorInterceptor,
    )
  }

  // GET 请求
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get<ApiResponse<T>>(url, config).then((res) => res.data.data)
  }

  // POST 请求
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post<ApiResponse<T>>(url, data, config).then((res) => {
      console.log(res.data)
      return res.data.data
    })
  }

  // PUT 请求
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put<ApiResponse<T>>(url, data, config).then((res) => res.data.data)
  }

  // DELETE 请求
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete<ApiResponse<T>>(url, config).then((res) => res.data.data)
  }

  // 上传文件（支持进度回调）
  upload<T = unknown>(
    url: string,
    file: File | Blob,
    options: UploadOptions = {},
  ): Promise<T> {
    const {
      onProgress,
      extraData,
      fieldName = 'file',
      headers,
      abortController,
    } = options

    const formData = new FormData()
    formData.append(fieldName, file)

    // 附加额外表单字段
    if (extraData) {
      Object.entries(extraData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return this.instance
      .post<ApiResponse<T>>(url, formData, {
        headers: {
          ...headers,
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percent, progressEvent)
          }
        },
        signal: abortController?.signal,
        timeout: 0, // 上传不设超时
      })
      .then((res) => res.data.data)
  }

  /**
   * SSE 流式 POST 请求
   * 使用 XMLHttpRequest 解析服务端推送的事件流，逐块回调
   * 与 axios 共享同一网络层，避免 CORS 问题
   * @param url 请求地址（相对 baseURL）
   * @param data 请求体
   * @param onChunk 每接收到一段文本时的回调
   * @param signal 可选 AbortSignal，用于取消请求
   */
  ssePost(
    url: string,
    data: unknown,
    onChunk: (text: string) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const token = this.getToken()
    const fullUrl = `${defaultConfig.baseURL}${url}`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', fullUrl, true)
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.setRequestHeader('Accept', 'text/event-stream')
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      let lastIndex = 0
      let buffer = ''

      xhr.onprogress = () => {
        const newData = xhr.responseText.substring(lastIndex)
        lastIndex = xhr.responseText.length
        buffer += newData

        // 按换行拆分 SSE 事件
        const parts = buffer.split('\n')
        buffer = parts.pop() || ''

        for (const line of parts) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith(':')) continue
          if (trimmed.startsWith('data:')) {
            const payload = trimmed.slice(5).trim()
            if (payload === '[DONE]') { resolve(); return }
            try {
              const parsed = JSON.parse(payload)
              const text =
                parsed?.choices?.[0]?.delta?.content
                || parsed?.choices?.[0]?.message?.content
                || parsed?.content
                || parsed?.text
                || ''
              if (text) onChunk(text)
            } catch {
              if (payload) onChunk(payload)
            }
          }
        }
      }

      xhr.onload = () => {
        // 处理缓冲区中剩余数据
        if (buffer.trim()) {
          const trimmed = buffer.trim()
          if (trimmed.startsWith('data:')) {
            const payload = trimmed.slice(5).trim()
            if (payload !== '[DONE]') {
              try {
                const parsed = JSON.parse(payload)
                const text =
                  parsed?.choices?.[0]?.delta?.content
                  || parsed?.choices?.[0]?.message?.content
                  || parsed?.content
                  || parsed?.text
                  || ''
                if (text) onChunk(text)
              } catch {
                if (payload) onChunk(payload)
              }
            }
          }
        }
        resolve()
      }

      xhr.onerror = () => reject(new Error(`SSE request failed: ${xhr.status} ${xhr.statusText}`))
      xhr.ontimeout = () => reject(new Error('SSE request timed out'))

      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort()
          reject(new Error('SSE request aborted'))
        })
      }

      xhr.send(JSON.stringify(data))
    })
  }

  // 获取原始 Axios 实例（用于高级场景）
  getAxiosInstance(): AxiosInstance {
    return this.instance
  }
}

// 默认请求客户端实例
export const request = new RequestClient()
