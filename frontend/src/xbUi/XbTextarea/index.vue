<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: string
  label?: string
  clearable?: boolean
  maxlength?: number
  rows?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  error: '',
  label: '',
  clearable: false,
  rows: 4,
  resize: 'vertical',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  clear: []
}>()

const isFocused = ref(false)

const textareaClass = computed(() => [
  'xb-textarea w-full px-3 py-2 rounded-lg border text-sm transition-all duration-200',
  props.error
    ? 'border-danger/60 focus:border-danger focus:shadow-[0_0_0_3px_hsl(var(--danger)/0.1)]'
    : 'border-border focus:border-brand/50 focus:shadow-[0_0_0_3px_hsl(var(--brand)/0.1)]',
  props.disabled ? 'opacity-50 cursor-not-allowed bg-surface-overlay/50' : 'bg-surface text-content',
  props.readonly ? 'cursor-default' : '',
])

const resizeClass = computed(() => {
  const map: Record<string, string> = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
  }
  return map[props.resize] || 'resize-y'
})

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  emit('input', e)
}

function handleFocus(e: FocusEvent) {
  isFocused.value = true
  emit('focus', e)
}

function handleBlur(e: FocusEvent) {
  isFocused.value = false
  emit('blur', e)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="xb-textarea-wrapper">
    <!-- Label -->
    <label v-if="label" class="text-xs text-content-secondary mb-1.5 block font-medium">
      {{ label }}
    </label>

    <!-- Textarea Area -->
    <div class="relative">
      <textarea
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :rows="rows"
        :class="[textareaClass, resizeClass]"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Clear Button -->
      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        class="absolute right-3 top-3 text-content-tertiary hover:text-content transition-colors"
        @click="handleClear"
      >
        <XbIcon name="x-circle" :size="14" />
      </button>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="mt-1 text-xs text-danger">{{ error }}</p>

    <!-- Hint Slot -->
    <div v-if="$slots.hint" class="mt-1 text-xs text-content-tertiary">
      <slot name="hint" />
    </div>
  </div>
</template>

<style scoped>
.xb-textarea::placeholder {
  color: hsl(var(--content-tertiary));
}

.xb-textarea:focus {
  outline: none;
}
</style>
