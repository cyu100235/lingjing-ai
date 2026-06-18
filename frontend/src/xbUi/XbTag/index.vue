<script setup lang="ts">

const props = withDefaults(defineProps<{
  type?: 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
  disabled?: boolean
  round?: boolean
  /** 自定义背景色，CSS颜色值如 '#fbbf24'，设置后覆盖 type 配色 */
  color?: string
  /** 自定义文字色，CSS颜色值如 '#1c1917'，配合 color 使用，默认 white */
  textColor?: string
  /** 是否渐变背景，需配合 color 使用，默认 false */
  gradient?: boolean
}>(), {
  type: 'default',
  size: 'md',
  closable: false,
  disabled: false,
  round: false,
  color: '',
  textColor: '',
  gradient: false,
})

const emit = defineEmits<{
  close: []
  click: [event: MouseEvent]
}>()

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

const typeClasses: Record<string, string> = {
  default: 'bg-surface-overlay text-content-secondary border-border',
  brand: 'bg-brand/10 text-brand border-brand/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

const hasCustomColor = computed(() => !!props.color)

const tagClass = computed(() => [
  'xb-tag inline-flex items-center gap-1 border font-medium transition-all duration-200 active:scale-90',
  sizeClasses[props.size],
  hasCustomColor.value ? '' : typeClasses[props.type],
  hasCustomColor.value ? 'xb-tag-custom' : '',
  hasCustomColor.value && props.gradient ? 'xb-tag-gradient' : '',
  props.round ? 'rounded-full' : 'rounded-md',
  props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  !props.disabled && props.closable ? 'pr-1.5' : '',
])

function handleClose(e: MouseEvent) {
  if (props.disabled) return
  e.stopPropagation()
  emit('close')
}

function handleClick(e: MouseEvent) {
  if (props.disabled) return
  emit('click', e)
}
</script>

<template>
  <span
    :class="tagClass"
    :style="hasCustomColor
      ? { '--xb-tag-color': color, '--xb-tag-text': textColor || 'white' }
      : undefined"
    @click="handleClick"
  >
    <slot />
    <button
      v-if="closable"
      class="inline-flex items-center justify-center rounded-full hover:bg-black/20 transition-colors p-0.5"
      :class="size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'"
      @click="handleClose"
    >
      <XbIcon name="x" :size="size === 'lg' ? 12 : 10" stroke-width="2.5" />
    </button>
  </span>
</template>

<style scoped>
/* 自定义颜色 */
.xb-tag-custom {
  background: var(--xb-tag-color);
  color: var(--xb-tag-text);
  border-color: var(--xb-tag-color);
}

.xb-tag-custom.xb-tag-gradient {
  background: linear-gradient(135deg, var(--xb-tag-color), color-mix(in srgb, var(--xb-tag-color), black 20%));
}
</style>
