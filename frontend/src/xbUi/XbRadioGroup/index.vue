<script setup lang="ts">
import { provide, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | number | boolean
  disabled?: boolean
  name?: string
  direction?: 'horizontal' | 'vertical'
}>(), {
  modelValue: '',
  disabled: false,
  name: '',
  direction: 'horizontal',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  change: [value: string | number | boolean]
}>()

const groupName = computed(() => props.name || `xb-radio-group-${Math.random().toString(36).slice(2, 9)}`)

provide('xbRadioGroup', {
  value: computed(() => props.modelValue),
  disabled: computed(() => props.disabled),
  name: groupName.value,
  change: (value: string | number | boolean) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})
</script>

<template>
  <div
    class="xb-radio-group"
    :class="[
      direction === 'horizontal' ? 'flex flex-wrap items-center gap-4' : 'flex flex-col gap-3',
    ]"
  >
    <slot />
  </div>
</template>
