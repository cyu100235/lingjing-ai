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
