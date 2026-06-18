<script setup lang="ts">

const props = withDefaults(defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  error?: string
  label?: string
  clearable?: boolean
  maxlength?: number
  tabindex?: number
  size?: 'sm' | 'md' | 'lg'
  showPasswordToggle?: boolean
}>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  error: '',
  label: '',
  clearable: false,
  size: 'md',
  showPasswordToggle: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  clear: []
  keydown: [event: KeyboardEvent]
}>()

const isFocused = ref(false)
const passwordVisible = ref(false)

const isPasswordType = computed(() => props.type === 'password')
const actualType = computed(() => {
  if (isPasswordType.value) {
    return passwordVisible.value ? 'text' : 'password'
  }
  return props.type
})

function togglePasswordVisibility() {
  passwordVisible.value = !passwordVisible.value
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
}

const inputClass = computed(() => [
  'xb-input w-full rounded-lg border transition-all duration-200',
  sizeClasses[props.size],
  props.error
    ? 'border-danger/60 focus:border-danger focus:shadow-[0_0_0_3px_hsl(var(--danger)/0.1)]'
    : 'border-border focus:border-brand/50 focus:shadow-[0_0_0_3px_hsl(var(--brand)/0.1)]',
  props.disabled ? 'opacity-50 cursor-not-allowed bg-surface-overlay/50' : 'bg-surface text-content',
  props.readonly ? 'cursor-default' : '',
])

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
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
  <div class="xb-input-wrapper">
    <!-- Label -->
    <label v-if="label" class="text-xs text-content-secondary mb-1.5 block font-medium">
      {{ label }}
    </label>

    <!-- Input Area -->
    <div class="relative">
      <!-- Prefix Icon Slot -->
      <div v-if="$slots.prefix" class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
        <slot name="prefix" />
      </div>

      <input
        :value="modelValue"
        :type="actualType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :tabindex="tabindex"
        :class="[inputClass, $slots.prefix ? 'pl-9' : '', ($slots.suffix || clearable || (isPasswordType && showPasswordToggle)) ? 'pr-9' : '']"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="(e) => emit('keydown', e)"
      />

      <!-- Password Toggle Button -->
      <button
        v-if="isPasswordType && showPasswordToggle"
        type="button"
        tabindex="-1"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content transition-colors"
        @click="togglePasswordVisibility"
      >
        <XbIcon v-if="passwordVisible" name="eye" :size="16" />
        <XbIcon v-else name="eye-off" :size="16" />
      </button>

      <!-- Clear Button -->
      <button
        v-else-if="clearable && modelValue && !disabled && !readonly"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content transition-colors"
        @click="handleClear"
      >
        <XbIcon name="x-circle" :size="14" />
      </button>

      <!-- Suffix Slot -->
      <div v-else-if="$slots.suffix" class="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary">
        <slot name="suffix" />
      </div>
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
.xb-input::placeholder {
  color: hsl(var(--content-tertiary));
}

.xb-input:focus {
  outline: none;
}

.xb-input::-webkit-inner-spin-button,
.xb-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.xb-input[type="number"] {
  -moz-appearance: textfield;
  appearance: none;
}
</style>
