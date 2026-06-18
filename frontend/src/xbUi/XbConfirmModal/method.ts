import { createApp, h, nextTick, ref } from 'vue'
import XbConfirmModal from './index.vue'
import XbIcon from '../XbIcon/index.vue'
export type ModalAnimation =
  | 'fade'
  | 'scale'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'
  | 'bounce'
  | 'flip'
  | 'rotate'
  | 'blur'
  | 'elastic'
  | 'wobble'
  | 'tada'
  | 'jello'
  | 'roll-in'
  | 'drop'

/** 确认弹窗配置选项 */
export interface ConfirmModalOptions {
  /** 标题，默认 '提示' */
  title?: string
  /** 消息内容 */
  message?: string
  /** 确认按钮文字，默认 '确认' */
  confirmText?: string
  /** 取消按钮文字，默认 '取消' */
  cancelText?: string
  /** 确认按钮类型 */
  confirmType?: 'primary' | 'danger'
  /** 弹窗宽度 class，默认 'w-80' */
  width?: string
  /** 是否显示取消按钮，默认 true */
  showCancel?: boolean
  /** 是否显示确认按钮，默认 true */
  showConfirm?: boolean
  /** 动画类型 */
  animation?: ModalAnimation
  /** 确认回调，返回 Promise 时自动显示 loading */
  onConfirm?: () => void | Promise<void>
}

/** 命令式确认弹窗的返回句柄 */
export interface ConfirmModalHandler {
  /** 关闭弹窗 */
  close: () => void
}

/**
 * 命令式调用 XbConfirmModal
 *
 * @example
 * // 简单用法
 * const confirmed = await XbConfirm({ message: '确定删除吗？' })
 *
 * // 带异步确认
 * await XbConfirm({
 *   message: '确定提交吗？',
 *   async onConfirm() {
 *     await submitForm()
 *   },
 * })
 */
export function XbConfirm(options: ConfirmModalOptions | string): Promise<boolean> {
  const opts: ConfirmModalOptions = typeof options === 'string' ? { message: options } : options

  return new Promise((resolve) => {
    const visible = ref(false)
    const loading = ref(false)

    let app: ReturnType<typeof createApp> | null = null
    let mountNode: HTMLElement | null = null

    function cleanup() {
      visible.value = false
      // 等待过渡动画结束后卸载
      setTimeout(() => {
        if (app) {
          app.unmount()
          app = null
        }
        if (mountNode) {
          document.body.removeChild(mountNode)
          mountNode = null
        }
      }, 350)
    }

    function handleConfirm() {
      const result = opts.onConfirm?.()
      if (result instanceof Promise) {
        loading.value = true
        result
          .then(() => {
            cleanup()
            resolve(true)
          })
          .catch(() => {
            loading.value = false
          })
      } else {
        cleanup()
        resolve(true)
      }
    }

    function handleCancel() {
      cleanup()
      resolve(false)
    }

    mountNode = document.createElement('div')
    mountNode.className = 'xb-confirm-modal-root'
    document.body.appendChild(mountNode)

    app = createApp({
      render() {
        return h(XbConfirmModal, {
          visible: visible.value,
          title: opts.title,
          message: opts.message,
          confirmText: opts.confirmText,
          cancelText: opts.cancelText,
          confirmType: opts.confirmType,
          loading: loading.value,
          width: opts.width,
          showCancel: opts.showCancel,
          showConfirm: opts.showConfirm,
          animation: opts.animation,
          'onUpdate:visible': (val: boolean) => {
            if (!val) handleCancel()
          },
          onConfirm: handleConfirm,
          onCancel: handleCancel,
        })
      },
    })
    app.component('XbIcon', XbIcon)
    app.mount(mountNode)

    nextTick(() => {
      visible.value = true
    })
  })
}
