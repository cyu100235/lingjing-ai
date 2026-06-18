<script lang="ts">
/** 实例唯一ID计数器（模块级，所有实例共享） */
let instanceCounter = 0

/** 自定义事件名，用于多实例互斥关闭 */
const XB_SELECT_OPEN_EVENT = 'xb-select-open'
</script>

<script setup lang="ts">
import type { SelectOption } from './types'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  clearable?: boolean
}>(), {
  modelValue: '',
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  error: '',
  label: '',
  clearable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
  clear: []
}>()

const isOpen = ref(false)
const openUpward = ref(false)
const instanceId = `xb-select-${++instanceCounter}`
const triggerRef = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})
const listRef = ref<HTMLElement>()
const selectedItemRef = ref<HTMLElement>()

const selectedOption = computed(() => props.options.find(o => String(o.value) === String(props.modelValue)))

/** 计算下拉面板定位，使其始终对齐触发按钮；当下方空间不足时向上展开 */
function updateDropdownPosition() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  // 下拉最大高度 256px（max-h-64）+ 4px 间距
  const DROPDOWN_MAX_HEIGHT = 260
  const spaceBelow = window.innerHeight - rect.bottom
  const shouldOpenUpward = spaceBelow < DROPDOWN_MAX_HEIGHT && rect.top >= DROPDOWN_MAX_HEIGHT
  openUpward.value = shouldOpenUpward
  if (shouldOpenUpward) {
    dropdownStyle.value = {
      position: 'fixed',
      left: `${rect.left}px`,
      bottom: `${window.innerHeight - rect.top + 4}px`,
      width: `${rect.width}px`,
      zIndex: '9999',
    }
  } else {
    dropdownStyle.value = {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.bottom + 4}px`,
      width: `${rect.width}px`,
      zIndex: '9999',
    }
  }
}

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    updateDropdownPosition()
    // 通知其他 XbSelect 实例关闭
    document.dispatchEvent(new CustomEvent(XB_SELECT_OPEN_EVENT, { detail: { id: instanceId } }))
    // 下拉渲染完成后，滚动到已选中项
    nextTick(() => {
      if (selectedItemRef.value && listRef.value) {
        const list = listRef.value
        const item = selectedItemRef.value
        const itemTop = item.offsetTop
        const itemHeight = item.offsetHeight
        const listHeight = list.clientHeight
        list.scrollTop = itemTop - (listHeight - itemHeight) / 2
      }
    })
  }
}

function select(value: string | number) {
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
}

function onDocumentClick(e: MouseEvent) {
  // 点击触发按钮时不关闭（由 toggle 处理）
  if (triggerRef.value?.contains(e.target as Node)) return
  isOpen.value = false
}

/** 收到其他实例展开事件时，关闭自身下拉 */
function onOtherSelectOpen(e: Event) {
  const { id } = (e as CustomEvent).detail
  if (id !== instanceId && isOpen.value) {
    isOpen.value = false
  }
}

/** 滚动或窗口变化时更新下拉面板位置 */
function onLayoutChange() {
  if (isOpen.value) updateDropdownPosition()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener(XB_SELECT_OPEN_EVENT, onOtherSelectOpen)
  window.addEventListener('resize', onLayoutChange)
  window.addEventListener('scroll', onLayoutChange, true)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener(XB_SELECT_OPEN_EVENT, onOtherSelectOpen)
  window.removeEventListener('resize', onLayoutChange)
  window.removeEventListener('scroll', onLayoutChange, true)
})
</script>

<template>
  <div class="xb-select-wrapper">
    <slot name="label">
      <label v-if="label" class="text-xs text-content-secondary mb-1.5 block font-medium">
        {{ label }}
      </label>
    </slot>
    <div ref="triggerRef" class="relative" @click.stop>
      <button
        type="button"
        :disabled="disabled"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all duration-200"
        :class="[
          error ? 'border-danger/60' : 'border-border hover:border-brand/40',
          disabled ? 'opacity-50 cursor-not-allowed bg-surface-overlay/50' : 'bg-surface text-content cursor-pointer'
        ]"
        @click="toggle"
      >
        <slot name="selected" :option="selectedOption">
          <template v-if="selectedOption">
            <span class="text-sm font-medium text-content">{{ selectedOption.label }}</span>
          </template>
          <template v-else>
            <span class="text-sm text-content-tertiary">{{ placeholder }}</span>
          </template>
        </slot>
        <XbIcon name="chevron-down" :size="14" class="shrink-0 text-content-tertiary ml-auto transition-transform" :class="isOpen ? 'rotate-180' : ''" />
      </button>

      <button
        v-if="clearable && modelValue !== '' && !disabled"
        class="absolute right-8 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content transition-colors"
        @click.stop="handleClear"
      >
        <XbIcon name="x-circle" :size="14" />
      </button>
    </div>
    <Teleport to="body">
      <Transition name="xb-select-dropdown">
        <div
          v-if="isOpen"
          :style="dropdownStyle"
          :class="openUpward ? 'dropdown-upward' : 'dropdown-downward'"
          class="rounded-lg border border-border bg-surface-elevated shadow-xl overflow-hidden"
          @click.stop
        >
          <div ref="listRef" class="max-h-64 overflow-y-auto py-1">
            <button
              v-for="opt in options"
              :key="opt.value"
              :ref="el => { if (String(opt.value) === String(modelValue)) selectedItemRef = el as HTMLElement }"
              class="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
              :class="modelValue === opt.value ? 'bg-brand/10' : 'hover:bg-surface-overlay'"
              @click="select(opt.value)"
            >
              <slot name="option" :option="opt">
                <span class="text-sm font-medium" :class="modelValue === opt.value ? 'text-brand' : 'text-content'">{{ opt.label }}</span>
              </slot>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
    <p v-if="error" class="mt-1 text-xs text-danger">{{ error }}</p>
    <div v-if="$slots.hint" class="mt-1 text-xs text-content-tertiary">
      <slot name="hint" />
    </div>
  </div>
</template>

<style scoped>
.xb-select-wrapper button:focus {
  outline: none;
}

.xb-select-dropdown-enter-active,
.xb-select-dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

/* 向下展开动画 */
.xb-select-dropdown-enter-active.dropdown-downward,
.xb-select-dropdown-leave-active.dropdown-downward {
  transform-origin: top center;
}

.xb-select-dropdown-enter-from.dropdown-downward,
.xb-select-dropdown-leave-to.dropdown-downward {
  opacity: 0;
  transform: scaleY(0.9) translateY(-4px);
}

/* 向上展开动画 */
.xb-select-dropdown-enter-active.dropdown-upward,
.xb-select-dropdown-leave-active.dropdown-upward {
  transform-origin: bottom center;
}

.xb-select-dropdown-enter-from.dropdown-upward,
.xb-select-dropdown-leave-to.dropdown-upward {
  opacity: 0;
  transform: scaleY(0.9) translateY(4px);
}

.xb-select-dropdown-enter-to,
.xb-select-dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1) translateY(0);
}
</style>
