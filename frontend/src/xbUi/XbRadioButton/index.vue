<script setup lang="ts">

const props = withDefaults(defineProps<{
  modelValue?: string | number | boolean
  label?: string
  value?: string | number | boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  modelValue: '',
  label: '',
  value: '',
  disabled: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  change: [value: string | number | boolean]
}>()

const radioGroup = inject<{
  value: { value: string | number | boolean }
  disabled: { value: boolean }
  name: string
  change?: (value: string | number | boolean) => void
} | null>('xbRadioGroup', null)

const isChecked = computed(() => {
  if (radioGroup) {
    return radioGroup.value.value === props.value
  }
  return props.modelValue === props.value
})

const isDisabled = computed(() => {
  return props.disabled || (radioGroup?.disabled.value ?? false)
})

const radioName = computed(() => {
  return radioGroup?.name || ''
})

const sizeMap: Record<string, { wrap: string; dot: string }> = {
  sm: { wrap: 'w-4 h-4', dot: 'w-1.5 h-1.5' },
  md: { wrap: 'w-5 h-5', dot: 'w-2 h-2' },
  lg: { wrap: 'w-6 h-6', dot: 'w-2.5 h-2.5' },
}

const currentSize = computed(() => sizeMap[props.size])

function handleChange() {
  if (isDisabled.value) return
  if (radioGroup?.change) {
    radioGroup.change(props.value)
  } else {
    emit('update:modelValue', props.value)
    emit('change', props.value)
  }
}
</script>

<template>
  <label
    class="xb-radio inline-flex items-center gap-2 cursor-pointer select-none"
    :class="[
      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ]"
  >
    <span
      class="xb-radio__wrap relative inline-flex items-center justify-center rounded-full border-2 transition-all duration-200 shrink-0"
      :class="[
        currentSize.wrap,
        isChecked
          ? 'border-brand bg-brand/10'
          : 'border-border bg-surface hover:border-content-tertiary/50',
      ]"
    >
      <input
        type="radio"
        :name="radioName"
        :value="value"
        :checked="isChecked"
        :disabled="isDisabled"
        class="absolute inset-0 opacity-0 cursor-pointer"
        @change="handleChange"
      />
      <span
        class="xb-radio__dot rounded-full bg-brand transition-all duration-200"
        :class="[
          currentSize.dot,
          isChecked ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
        ]"
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
.xb-radio__wrap:focus-within {
  box-shadow: 0 0 0 3px hsl(var(--brand) / 0.15);
}
</style>
