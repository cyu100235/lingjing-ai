<script setup lang="ts">

const props = withDefaults(defineProps<{
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  disabled?: boolean
  offset?: number
}>(), {
  content: '',
  placement: 'top',
  delay: 200,
  disabled: false,
  offset: 8,
})

const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const position = ref({ top: 0, left: 0 })
const actualPlacement = ref(props.placement)
let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

const placementClasses: Record<string, string> = {
  top: 'origin-bottom',
  bottom: 'origin-top',
  left: 'origin-right',
  right: 'origin-left',
}

function clearTimers() {
  if (showTimer) { clearTimeout(showTimer); showTimer = null }
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
}

function handleShow() {
  if (props.disabled) return
  clearTimers()
  showTimer = setTimeout(() => {
    visible.value = true
    nextTick(updatePosition)
  }, props.delay)
}

function handleHide() {
  clearTimers()
  hideTimer = setTimeout(() => {
    visible.value = false
  }, 100)
}

function updatePosition() {
  if (!triggerRef.value || !tooltipRef.value) return

  // 优先使用第一个子元素定位，处理子元素为 absolute 定位时 triggerRef 容器尺寸为 0 的情况
  let triggerEl: HTMLElement = triggerRef.value
  if (
    triggerEl.offsetWidth === 0 &&
    triggerEl.offsetHeight === 0 &&
    triggerEl.firstElementChild instanceof HTMLElement
  ) {
    triggerEl = triggerEl.firstElementChild
  }

  const triggerRect = triggerEl.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const gap = props.offset

  // 计算各方向的位置
  const positions: Record<string, { top: number; left: number }> = {
    top: {
      top: triggerRect.top - tooltipRect.height - gap,
      left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
    },
    bottom: {
      top: triggerRect.bottom + gap,
      left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
    },
    left: {
      top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
      left: triggerRect.left - tooltipRect.width - gap,
    },
    right: {
      top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2,
      left: triggerRect.right + gap,
    },
  }

  let placement = props.placement
  const pos = positions[placement]

  // 自动调整溢出方向
  const vw = window.innerWidth
  const vh = window.innerHeight

  if (placement === 'top' && pos.top < 0) placement = 'bottom'
  else if (placement === 'bottom' && pos.top + tooltipRect.height > vh) placement = 'top'
  else if (placement === 'left' && pos.left < 0) placement = 'right'
  else if (placement === 'right' && pos.left + tooltipRect.width > vw) placement = 'left'

  actualPlacement.value = placement
  position.value = positions[placement]
}

function onScroll() {
  if (visible.value) updatePosition()
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', onScroll)
})

onBeforeUnmount(() => {
  clearTimers()
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', onScroll)
})

watch(() => props.disabled, (val) => {
  if (val) {
    clearTimers()
    visible.value = false
  }
})
</script>

<template>
  <div
    class="xb-tooltip inline-block"
    @mouseenter="handleShow"
    @mouseleave="handleHide"
    @focus="handleShow"
    @blur="handleHide"
  >
    <div ref="triggerRef" class="xb-tooltip-trigger">
      <slot />
    </div>

    <Teleport to="body">
      <Transition name="xb-tooltip">
        <div
          v-if="visible && (content || $slots.content)"
          ref="tooltipRef"
          class="xb-tooltip-popper fixed z-[9999] pointer-events-none"
          :class="placementClasses[actualPlacement]"
          :style="{ top: `${position.top}px`, left: `${position.left}px` }"
        >
          <!-- Arrow -->
          <div
            class="xb-tooltip-arrow absolute"
            :class="[
              actualPlacement === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full' :
              actualPlacement === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-full' :
              actualPlacement === 'left' ? 'right-0 top-1/2 translate-x-full -translate-y-1/2' :
              'left-0 top-1/2 -translate-x-full -translate-y-1/2',
            ]"
          >
            <div
              class="w-2 h-2 rotate-45 bg-gray-900 dark:bg-gray-100"
              :class="[
                actualPlacement === 'top' ? '-mt-1' :
                actualPlacement === 'bottom' ? 'mt-1' :
                actualPlacement === 'left' ? '-ml-1' :
                'ml-1',
              ]"
            />
          </div>

          <!-- Content -->
          <div
            class="xb-tooltip-content px-2.5 py-1.5 text-xs font-medium rounded-lg max-w-xs shadow-lg"
            :class="[
              'bg-gray-900 text-gray-100 dark:bg-gray-100 dark:text-gray-900',
            ]"
          >
            <slot name="content">{{ content }}</slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Transition */
.xb-tooltip-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.xb-tooltip-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.xb-tooltip-enter-from,
.xb-tooltip-leave-to {
  opacity: 0;
}
.xb-tooltip-enter-from.top { transform: translateY(4px); }
.xb-tooltip-enter-from.bottom { transform: translateY(-4px); }
.xb-tooltip-enter-from.left { transform: translateX(4px); }
.xb-tooltip-enter-from.right { transform: translateX(-4px); }
.xb-tooltip-leave-to.top { transform: translateY(4px); }
.xb-tooltip-leave-to.bottom { transform: translateY(-4px); }
.xb-tooltip-leave-to.left { transform: translateX(4px); }
.xb-tooltip-leave-to.right { transform: translateX(-4px); }
</style>
