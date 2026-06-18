import MessageContainer from './MessageContainer.vue'
import type { MessageItem, MessageAnimation, MessagePosition } from './MessageContainer.vue'


/** 消息配置选项 */
export interface MessageOptions {
  /** 消息类型 */
  type?: 'success' | 'warning' | 'error' | 'info'
  /** 消息标题，默认 温馨提示 */
  title?: string
  /** 消息内容 */
  message: string
  /** 自动关闭延迟(ms)，设为 0 则不自动关闭，默认 3000 */
  duration?: number
  /** 是否显示关闭按钮，默认 true */
  closable?: boolean
  /** 是否显示类型图标，默认 true */
  showIcon?: boolean
  /** 入场动画类型，默认 slide-down */
  animation?: MessageAnimation
  /** 出现位置，默认 top */
  position?: MessagePosition
}

/** 消息实例响应式状态 */
const state = reactive<{
  messages: MessageItem[]
}>({
  messages: [],
})

let app: ReturnType<typeof createApp> | null = null
let mountNode: HTMLElement | null = null
let seed = 0

/** 确保消息容器已挂载到 body */
function ensureContainer() {
  if (app) return

  mountNode = document.createElement('div')
  mountNode.className = 'xb-message-root'
  document.body.appendChild(mountNode)

  app = createApp({
    render() {
      return h(MessageContainer, {
        messages: state.messages,
        onClose: removeMessage,
      })
    },
  })
  app.mount(mountNode)
}

/** 添加一条消息，返回消息 id */
function addMessage(options: MessageOptions | string): number {
  ensureContainer()
  const opts = typeof options === 'string' ? { message: options } : options
  const id = seed++
  const item: MessageItem = {
    id,
    type: opts.type || 'info',
    title: opts.title ?? '温馨提示',
    message: opts.message,
    closable: opts.closable ?? true,
    showIcon: opts.showIcon ?? true,
    animation: opts.animation || 'slide-down',
    position: opts.position || 'top',
  }

  state.messages.push(item)

  const duration = opts.duration ?? 3000
  if (duration > 0) {
    setTimeout(() => removeMessage(id), duration)
  }

  return id
}

/** 根据 id 移除消息 */
function removeMessage(id: number) {
  const idx = state.messages.findIndex(m => m.id === id)
  if (idx !== -1) {
    state.messages.splice(idx, 1)
  }
}

/** 关闭所有消息 */
function closeAll() {
  state.messages.splice(0, state.messages.length)
}

/** XbMessage 编程式调用 API */
export const XbMessage = Object.assign(
  (options: MessageOptions | string) => addMessage(options),
  {
    /** 成功消息 */
    success: (options: string | Omit<MessageOptions, 'type'>) =>
      addMessage(typeof options === 'string' ? { type: 'success', message: options } : { ...options, type: 'success' }),
    /** 警告消息 */
    warning: (options: string | Omit<MessageOptions, 'type'>) =>
      addMessage(typeof options === 'string' ? { type: 'warning', message: options } : { ...options, type: 'warning' }),
    /** 错误消息 */
    error: (options: string | Omit<MessageOptions, 'type'>) =>
      addMessage(typeof options === 'string' ? { type: 'error', message: options } : { ...options, type: 'error' }),
    /** 信息消息 */
    info: (options: string | Omit<MessageOptions, 'type'>) =>
      addMessage(typeof options === 'string' ? { type: 'info', message: options } : { ...options, type: 'info' }),
    /** 关闭指定消息 */
    close: removeMessage,
    /** 关闭所有消息 */
    closeAll,
  }
)
