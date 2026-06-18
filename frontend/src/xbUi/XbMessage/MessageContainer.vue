<script setup lang="ts">
import XbIcon from '../XbIcon/index.vue'

/** 动画类型 */
export type MessageAnimation =
  | 'slide-down'     // 从上往下滑入（默认）
  | 'slide-up'       // 从下往上滑入
  | 'slide-left'     // 从左往右滑入
  | 'slide-right'    // 从右往左滑入
  | 'fade'           // 淡入淡出
  | 'scale'          // 缩放出现
  | 'bounce'         // 弹跳出现
  | 'flip'           // 3D翻转出现
  | 'zoom'           // 放大出现
  | 'swing'          // 摆动出现
  | 'elastic'        // 弹性伸缩出现
  | 'rotate'         // 旋转出现
  | 'blur'           // 模糊聚焦出现
  | 'backdrop'       // 背景光晕出现

/** 消息出现位置 */
export type MessagePosition =
  | 'top-left'    // 左上
  | 'top'         // 顶上（默认）
  | 'top-right'   // 右上
  | 'bottom-left' // 左下
  | 'bottom'      // 底下
  | 'bottom-right'// 右下

/** 单条消息数据 */
export interface MessageItem {
    /** 唯一标识 */
    id: number
    /** 消息类型 */
    type: 'success' | 'warning' | 'error' | 'info'
    /** 消息标题 */
    title: string
    /** 消息内容 */
    message: string
    /** 是否显示关闭按钮 */
    closable: boolean
    /** 是否显示类型图标 */
    showIcon: boolean
    /** 入场动画类型，默认 slide-down */
    animation?: MessageAnimation
    /** 出现位置，默认 top */
    position?: MessagePosition
}

defineProps<{
    messages: MessageItem[]
    onClose: (id: number) => void
}>()

/** 类型配置映射 */
const typeConfig: Record<string, { icon: string; colorClass: string; iconColor: string }> = {
    success: { icon: 'check-circle', colorClass: 'xb-message--success', iconColor: 'xb-message__icon--success' },
    warning: { icon: 'alert-triangle', colorClass: 'xb-message--warning', iconColor: 'xb-message__icon--warning' },
    error: { icon: 'x-circle', colorClass: 'xb-message--error', iconColor: 'xb-message__icon--error' },
    info: { icon: 'info', colorClass: 'xb-message--info', iconColor: 'xb-message__icon--info' },
}

/** 所有可能的位置 */
const allPositions: MessagePosition[] = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right']

/** 获取消息的动画名称 */
function getAnimation(item: MessageItem): MessageAnimation {
    return item.animation || 'slide-down'
}

/** 获取消息的位置 */
function getPosition(item: MessageItem): MessagePosition {
    return item.position || 'top'
}

/** 按位置分组消息 */
function groupByPosition(messages: MessageItem[]): Record<MessagePosition, MessageItem[]> {
    const groups: Record<string, MessageItem[]> = {}
    for (const pos of allPositions) {
        groups[pos] = []
    }
    for (const msg of messages) {
        const pos = getPosition(msg)
        groups[pos].push(msg)
    }
    return groups as Record<MessagePosition, MessageItem[]>
}
</script>

<template>
    <template v-for="pos in allPositions" :key="pos">
        <div v-if="groupByPosition(messages)[pos].length" class="xb-message-container" :class="`xb-message-container--${pos}`">
            <div class="xb-message-list" :class="`xb-message-list--${pos}`">
                <Transition v-for="item in groupByPosition(messages)[pos]" :key="item.id" :name="`xb-msg-${getAnimation(item)}`" appear>
                    <div class="xb-message" :class="typeConfig[item.type]?.colorClass">
                        <XbIcon v-if="item.showIcon" :name="typeConfig[item.type]?.icon || 'info'" :size="18"
                            class="xb-message__icon" :class="typeConfig[item.type]?.iconColor" />
                        <div class="xb-message__content">
                            <div v-if="item.title" class="xb-message__title">
                                {{ item.title }}
                            </div>
                            <div class="xb-message__text">
                                {{ item.message }}
                            </div>
                        </div>
                        <button v-if="item.closable" class="xb-message__close" @click="onClose(item.id)">
                            <XbIcon name="x" :size="14" />
                        </button>
                    </div>
                </Transition>
            </div>
        </div>
    </template>
</template>

<style scoped>
/* ==================== 容器布局 ==================== */
.xb-message-container {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    padding: 20px;
}

/* 顶部位置：居中 */
.xb-message-container--top {
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
}

/* 左上位置 */
.xb-message-container--top-left {
    top: 0;
    left: 0;
    display: flex;
    justify-content: flex-start;
}

/* 右上位置 */
.xb-message-container--top-right {
    top: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
}

/* 底部位置：居中 */
.xb-message-container--bottom {
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
}

/* 左下位置 */
.xb-message-container--bottom-left {
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: flex-start;
}

/* 右下位置 */
.xb-message-container--bottom-right {
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
}

/* 消息列表 */
.xb-message-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
}

/* 底部位置的消息列表：从下往上排列 */
.xb-message-list--bottom,
.xb-message-list--bottom-left,
.xb-message-list--bottom-right {
    flex-direction: column-reverse;
}

/* 消息项 */
.xb-message {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 16px;
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px solid hsl(var(--border));
    background: hsl(var(--surface-elevated));
    box-shadow: var(--shadow-lg);
    pointer-events: auto;
    min-width: 280px;
    max-width: 480px;
    backdrop-filter: blur(12px);
}

/* 内容区域 */
.xb-message__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

/* 消息标题 */
.xb-message__title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: hsl(var(--content));
    line-height: 1.4;
}

/* 消息文本 */
.xb-message__text {
    font-size: 0.875rem;
    color: hsl(var(--content-secondary));
    line-height: 1.5;
}

/* 只有文本（无标题时）提升为主要样式 */
.xb-message__content:not(:has(.xb-message__title)) > .xb-message__text {
    color: hsl(var(--content));
}

/* 图标基础样式 */
.xb-message__icon {
    flex-shrink: 0;
}

/* 类型图标颜色 */
.xb-message__icon--success {
    color: hsl(var(--brand));
}

.xb-message__icon--warning {
    color: hsl(38 92% 50%);
}

.xb-message__icon--error {
    color: hsl(var(--danger));
}

.xb-message__icon--info {
    color: hsl(217 91% 60%);
}

/* 类型左侧色条 */
.xb-message--success {
    border-left: 3px solid hsl(var(--brand));
}

.xb-message--warning {
    border-left: 3px solid hsl(38 92% 50%);
}

.xb-message--error {
    border-left: 3px solid hsl(var(--danger));
}

.xb-message--info {
    border-left: 3px solid hsl(217 91% 60%);
}

/* 关闭按钮 */
.xb-message__close {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 2px;
    border-radius: 4px;
    color: hsl(var(--content-tertiary));
    cursor: pointer;
    transition: var(--transition-fast);
    background: none;
    border: none;
    outline: none;
}

.xb-message__close:hover {
    color: hsl(var(--content));
    background: hsl(var(--surface-overlay));
}

.xb-message__close:focus-visible {
    color: hsl(var(--content));
    background: hsl(var(--surface-overlay));
    box-shadow: 0 0 0 2px hsl(var(--brand) / 0.4);
}

/* ==================== 1. slide-down（默认：从上往下） ==================== */
.xb-msg-slide-down-enter-active {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.xb-msg-slide-down-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.xb-msg-slide-down-enter-from {
    opacity: 0;
    transform: translateY(-24px) scale(0.96);
}
.xb-msg-slide-down-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
}

/* ==================== 2. slide-up（从下往上） ==================== */
.xb-msg-slide-up-enter-active {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.xb-msg-slide-up-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.xb-msg-slide-up-enter-from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
}
.xb-msg-slide-up-leave-to {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
}

/* ==================== 3. slide-left（从左往右） ==================== */
.xb-msg-slide-left-enter-active {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.xb-msg-slide-left-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.xb-msg-slide-left-enter-from {
    opacity: 0;
    transform: translateX(-32px) scale(0.96);
}
.xb-msg-slide-left-leave-to {
    opacity: 0;
    transform: translateX(-16px) scale(0.96);
}

/* ==================== 4. slide-right（从右往左） ==================== */
.xb-msg-slide-right-enter-active {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.xb-msg-slide-right-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.xb-msg-slide-right-enter-from {
    opacity: 0;
    transform: translateX(32px) scale(0.96);
}
.xb-msg-slide-right-leave-to {
    opacity: 0;
    transform: translateX(16px) scale(0.96);
}

/* ==================== 5. fade（淡入淡出） ==================== */
.xb-msg-fade-enter-active {
    transition: opacity 0.4s ease;
}
.xb-msg-fade-leave-active {
    transition: opacity 0.25s ease;
}
.xb-msg-fade-enter-from {
    opacity: 0;
}
.xb-msg-fade-leave-to {
    opacity: 0;
}

/* ==================== 6. scale（缩放） ==================== */
.xb-msg-scale-enter-active {
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.xb-msg-scale-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}
.xb-msg-scale-enter-from {
    opacity: 0;
    transform: scale(0.5);
}
.xb-msg-scale-leave-to {
    opacity: 0;
    transform: scale(0.8);
}

/* ==================== 7. bounce（弹跳） ==================== */
.xb-msg-bounce-enter-active {
    animation: xb-bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.xb-msg-bounce-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.xb-msg-bounce-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.9);
}

@keyframes xb-bounce-in {
    0% {
        opacity: 0;
        transform: translateY(-30px) scale(0.8);
    }
    50% {
        opacity: 1;
        transform: translateY(6px) scale(1.03);
    }
    70% {
        transform: translateY(-3px) scale(0.98);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* ==================== 8. flip（3D翻转） ==================== */
.xb-msg-flip-enter-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.xb-msg-flip-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.xb-msg-flip-enter-from {
    opacity: 0;
    transform: perspective(400px) rotateX(-90deg);
}
.xb-msg-flip-leave-to {
    opacity: 0;
    transform: perspective(400px) rotateX(30deg);
}

/* ==================== 9. zoom（放大） ==================== */
.xb-msg-zoom-enter-active {
    animation: xb-zoom-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.xb-msg-zoom-leave-active {
    animation: xb-zoom-out 0.25s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes xb-zoom-in {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    60% {
        opacity: 1;
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes xb-zoom-out {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(0.3);
        opacity: 0;
    }
}

/* ==================== 10. swing（摆动） ==================== */
.xb-msg-swing-enter-active {
    animation: xb-swing-in 0.5s ease-out;
}
.xb-msg-swing-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.xb-msg-swing-leave-to {
    opacity: 0;
    transform: translateY(-12px) scale(0.9);
}

@keyframes xb-swing-in {
    0% {
        opacity: 0;
        transform: translateY(-24px) rotateZ(-8deg);
    }
    30% {
        opacity: 1;
        transform: translateY(4px) rotateZ(4deg);
    }
    50% {
        transform: translateY(-2px) rotateZ(-2deg);
    }
    70% {
        transform: translateY(1px) rotateZ(1deg);
    }
    100% {
        opacity: 1;
        transform: translateY(0) rotateZ(0deg);
    }
}

/* ==================== 11. elastic（弹性伸缩） ==================== */
.xb-msg-elastic-enter-active {
    animation: xb-elastic-in 0.6s ease-out;
}
.xb-msg-elastic-leave-active {
    animation: xb-elastic-out 0.3s ease-in;
}

@keyframes xb-elastic-in {
    0% {
        opacity: 0;
        transform: scaleX(0.4) scaleY(1.2);
    }
    30% {
        opacity: 1;
        transform: scaleX(1.08) scaleY(0.92);
    }
    50% {
        transform: scaleX(0.96) scaleY(1.04);
    }
    70% {
        transform: scaleX(1.02) scaleY(0.98);
    }
    100% {
        transform: scaleX(1) scaleY(1);
    }
}

@keyframes xb-elastic-out {
    0% {
        opacity: 1;
        transform: scaleX(1) scaleY(1);
    }
    100% {
        opacity: 0;
        transform: scaleX(0.4) scaleY(1.2);
    }
}

/* ==================== 12. rotate（旋转出现） ==================== */
.xb-msg-rotate-enter-active {
    transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.xb-msg-rotate-leave-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.xb-msg-rotate-enter-from {
    opacity: 0;
    transform: rotate(-180deg) scale(0.5);
}
.xb-msg-rotate-leave-to {
    opacity: 0;
    transform: rotate(90deg) scale(0.5);
}

/* ==================== 13. blur（模糊聚焦） ==================== */
.xb-msg-blur-enter-active {
    transition: all 0.4s ease-out;
}
.xb-msg-blur-leave-active {
    transition: all 0.25s ease-in;
}
.xb-msg-blur-enter-from {
    opacity: 0;
    filter: blur(8px);
    transform: scale(1.05);
}
.xb-msg-blur-leave-to {
    opacity: 0;
    filter: blur(4px);
    transform: scale(0.95);
}

/* ==================== 14. backdrop（背景光晕） ==================== */
.xb-msg-backdrop-enter-active {
    animation: xb-backdrop-in 0.5s ease-out;
}
.xb-msg-backdrop-leave-active {
    animation: xb-backdrop-out 0.3s ease-in;
}

@keyframes xb-backdrop-in {
    0% {
        opacity: 0;
        box-shadow: 0 0 0 0 hsl(var(--brand) / 0);
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        box-shadow: 0 0 20px 6px hsl(var(--brand) / 0.15);
        transform: scale(1.02);
    }
    100% {
        opacity: 1;
        box-shadow: var(--shadow-lg);
        transform: scale(1);
    }
}

@keyframes xb-backdrop-out {
    0% {
        opacity: 1;
        box-shadow: var(--shadow-lg);
        transform: scale(1);
    }
    100% {
        opacity: 0;
        box-shadow: 0 0 0 0 hsl(var(--brand) / 0);
        transform: scale(0.8);
    }
}
</style>