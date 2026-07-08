// 默认占位图 - 使用内联 SVG data URI，避免额外网络请求
export const DEFAULT_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Cpath d='M80 95h40v10H80z' fill='%23d1d5db'/%3E%3Ccircle cx='100' cy='75' r='15' fill='%23d1d5db'/%3E%3Cpath d='M60 130l25-30 20 20 15-10 20 20H60z' fill='%23d1d5db'/%3E%3C/svg%3E`

/**
 * 图片加载失败时的处理函数，设置为默认占位图
 */
export function onImgError(event: Event) {
  const target = event.target as HTMLImageElement
  if (target.src !== DEFAULT_PLACEHOLDER) {
    target.src = DEFAULT_PLACEHOLDER
  }
}

/** 图片压缩选项 */
export interface CompressImageOptions {
  /** 最大宽度（px），超出时按比例缩放，默认 1920 */
  maxWidth?: number
  /** 最大高度（px），超出时按比例缩放，默认 1920 */
  maxHeight?: number
  /** 压缩质量 0-1，默认 0.8（仅对 image/jpeg / image/webp 生效） */
  quality?: number
  /** 输出 MIME 类型，默认 image/jpeg */
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png'
  /** 跨域设置，默认 anonymous；传空字符串则不设置 */
  crossOrigin?: string
}

/**
 * 通过服务端图片 URL 加载并压缩图片，返回 base64
 *
 * @param url     图片 URL 地址
 * @param options 压缩选项
 * @returns       Promise<string>，resolve 值为 `data:image/...;base64,...` 格式
 */
export function compressImageFromUrl(
  url: string,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    mimeType = 'image/jpeg',
    crossOrigin = 'anonymous',
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    if (crossOrigin) {
      img.crossOrigin = crossOrigin
    }

    img.onload = () => {
      let { naturalWidth: width, naturalHeight: height } = img

      // 未获取到原始尺寸时回退到显示尺寸
      if (!width || !height) {
        width = img.width
        height = img.height
      }

      // 按比例缩放到限定范围内
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.max(1, Math.floor(width * ratio))
        height = Math.max(1, Math.floor(height * ratio))
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法获取 Canvas 2D 上下文'))
        return
      }

      // 转换为 jpeg/webp 时填充白色背景，避免透明区域变黑
      if (mimeType !== 'image/png') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
      }

      ctx.drawImage(img, 0, 0, width, height)

      try {
        const base64 = canvas.toDataURL(mimeType, quality)
        resolve(base64)
      } catch {
        reject(
          new Error(
            '图片压缩失败：canvas 被跨域污染，请确认服务端已配置允许跨域访问的响应头'
          )
        )
      }
    }

    img.onerror = () => {
      reject(new Error(`图片加载失败：${url}`))
    }

    img.src = url
  })
}
