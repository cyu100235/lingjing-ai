<script setup lang="ts">
import { ref, provide, reactive, computed } from 'vue'

export interface FormRule {
  required?: boolean
  message: string
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string | Promise<boolean | string>
}

export interface FormFieldState {
  value: any
  error: string
  touched: boolean
}

const props = withDefaults(defineProps<{
  model: Record<string, any>
  rules?: Record<string, FormRule[]>
  labelWidth?: string
  labelPosition?: 'left' | 'top'
  disabled?: boolean
}>(), {
  rules: () => ({}),
  labelWidth: '80px',
  labelPosition: 'top',
  disabled: false,
})

const emit = defineEmits<{
  submit: [model: Record<string, any>]
  validate: [valid: boolean, errors: Record<string, string>]
}>()

const fieldStates = reactive<Record<string, FormFieldState>>({})

// Provide form context for child form items
provide('xbFormContext', {
  registerField(name: string, initialValue: any) {
    fieldStates[name] = {
      value: initialValue,
      error: '',
      touched: false,
    }
  },
  unregisterField(name: string) {
    delete fieldStates[name]
  },
  updateFieldValue(name: string, value: any) {
    if (fieldStates[name]) {
      fieldStates[name].value = value
      fieldStates[name].touched = true
      // Clear error on change
      fieldStates[name].error = ''
    }
    props.model[name] = value
  },
  validateField(name: string): string {
    const rules = props.rules[name]
    if (!rules?.length) return ''
    const value = fieldStates[name]?.value
    for (const rule of rules) {
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return rule.message
      }
      if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
        return rule.message
      }
      if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
        return rule.message
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message
      }
      if (rule.validator) {
        const result = rule.validator(value)
        if (typeof result === 'string') return result
        if (result === false) return rule.message
      }
    }
    return ''
  },
  getFieldError(name: string): string {
    return fieldStates[name]?.error || ''
  },
  isFieldTouched(name: string): boolean {
    return fieldStates[name]?.touched || false
  },
  labelWidth: computed(() => props.labelWidth),
  labelPosition: computed(() => props.labelPosition),
  disabled: computed(() => props.disabled),
})

async function validate(): Promise<boolean> {
  const errors: Record<string, string> = {}
  let valid = true

  for (const name of Object.keys(props.rules)) {
    const rules = props.rules[name]
    const value = props.model[name]
    for (const rule of rules) {
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[name] = rule.message
        valid = false
        break
      }
      if (rule.min !== undefined && typeof value === 'string' && value.length < rule.min) {
        errors[name] = rule.message
        valid = false
        break
      }
      if (rule.max !== undefined && typeof value === 'string' && value.length > rule.max) {
        errors[name] = rule.message
        valid = false
        break
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[name] = rule.message
        valid = false
        break
      }
      if (rule.validator) {
        const result = await rule.validator(value)
        if (typeof result === 'string') {
          errors[name] = result
          valid = false
          break
        }
        if (result === false) {
          errors[name] = rule.message
          valid = false
          break
        }
      }
    }
  }

  // Update field states with errors
  for (const [name, error] of Object.entries(errors)) {
    if (fieldStates[name]) {
      fieldStates[name].error = error
    }
  }

  emit('validate', valid, errors)
  return valid
}

function resetFields() {
  for (const name of Object.keys(fieldStates)) {
    fieldStates[name].error = ''
    fieldStates[name].touched = false
  }
}

function handleSubmit(e?: Event) {
  e?.preventDefault()
  validate().then((valid) => {
    if (valid) {
      emit('submit', { ...props.model })
    }
  })
}

defineExpose({
  validate,
  resetFields,
  handleSubmit,
})
</script>

<template>
  <form class="xb-form" @submit="handleSubmit">
    <slot />
  </form>
</template>
