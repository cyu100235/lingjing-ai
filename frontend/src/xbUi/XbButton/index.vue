<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  /** 自定义主色，CSS颜色值如 '#fbbf24'，设置后 type=primary 背景使用该色 */
  color?: string
  /** 是否渐变背景，需配合 color 使用，默认 false */
  gradient?: boolean
}>(), {
  type: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
  color: '',
  gradient: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-2.5 text-base rounded-xl',
}

const typeClasses: Record<string, string> = {
  primary: 'text-white',
  secondary: 'border border-border bg-surface-elevated text-content-secondary hover:border-brand/40 hover:text-content hover:bg-surface-overlay',
  ghost: 'text-content-secondary hover:text-content hover:bg-surface-overlay',
  danger: 'text-white bg-danger hover:opacity-90',
}

const hasCustomColor = computed(() => props.color && props.type === 'primary')

const buttonClass = computed(() => [
  'xb-btn inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer select-none',
  sizeClasses[props.size],
  hasCustomColor.value ? '' : typeClasses[props.type],
  hasCustomColor.value ? 'xb-btn-custom' : '',
  hasCustomColor.value && props.gradient ? 'xb-btn-gradient' : '',
  props.block ? 'w-full' : '',
  (props.loading || props.disabled) ? 'opacity-70 cursor-not-allowed pointer-events-none' : '',
])

function handleClick(e: MouseEvent) {
  if (props.loading || props.disabled) return
  emit('click', e)
}
</script>

<template>
  <button
    :class="buttonClass"
    :disabled="disabled || loading"
    :style="hasCustomColor
      ? { '--xb-btn-color': color }
      : (type === 'primary' ? 'background: var(--gradient-brand); box-shadow: var(--shadow-brand)' : undefined)"
    @click="handleClick"
  >
    <span v-if="loading" class="xb-btn-spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    <slot name="icon" />
    <slot />
  </button>
</template>

<style scoped>
.xb-btn-primary {
  background: var(--gradient-brand);
  box-shadow: var(--shadow-brand);
}

.xb-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px hsl(142 80% 50% / 0.3);
}

/* 自定义颜色 */
.xb-btn-custom {
  background: var(--xb-btn-color);
  color: white;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--xb-btn-color) 25%, transparent);
}

.xb-btn-custom:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--xb-btn-color) 35%, transparent);
}

.xb-btn-custom.xb-btn-gradient {
  background: linear-gradient(135deg, var(--xb-btn-color), color-mix(in srgb, var(--xb-btn-color), black 20%));
}
</style>
