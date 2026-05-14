<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  label?: string
  disabled?: boolean
  indeterminate?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  modelValue: false,
  label: '',
  disabled: false,
  indeterminate: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const sizeMap: Record<string, { wrap: string; icon: number }> = {
  sm: { wrap: 'w-4 h-4', icon: 10 },
  md: { wrap: 'w-5 h-5', icon: 12 },
  lg: { wrap: 'w-6 h-6', icon: 14 },
}

const currentSize = computed(() => sizeMap[props.size])

const isChecked = computed(() => props.modelValue)

function handleChange(e: Event) {
  if (props.disabled) return
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.checked)
  emit('change', target.checked)
}
</script>

<template>
  <label
    class="xb-checked inline-flex items-center gap-2 select-none"
    :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
  >
    <span
      class="xb-checked__wrap relative inline-flex items-center justify-center rounded-md border-2 transition-all duration-200 shrink-0"
      :class="[
        currentSize.wrap,
        isChecked || indeterminate
          ? 'border-brand bg-brand'
          : 'border-border bg-surface hover:border-content-tertiary/50',
      ]"
    >
      <input
        type="checkbox"
        :checked="isChecked"
        :disabled="disabled"
        class="absolute inset-0 opacity-0 cursor-pointer"
        @change="handleChange"
      />
      <XbIcon
        v-if="indeterminate"
        name="minus"
        :size="currentSize.icon"
        class="text-white transition-all duration-200"
        stroke-width="2.5"
      />
      <XbIcon
        v-else-if="isChecked"
        name="check"
        :size="currentSize.icon"
        class="text-white transition-all duration-200"
        stroke-width="2.5"
      />
    </span>
    <span
      class="text-sm transition-colors duration-200"
      :class="isChecked ? 'text-content' : 'text-content-secondary'"
    >
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped>
.xb-checked__wrap:focus-within {
  box-shadow: 0 0 0 3px hsl(var(--brand) / 0.15);
}
</style>
