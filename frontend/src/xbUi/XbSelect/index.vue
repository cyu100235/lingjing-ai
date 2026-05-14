<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  [key: string]: any
}

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

const selectedOption = computed(() => props.options.find(o => String(o.value) === String(props.modelValue)))

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
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

function onDocumentClick() {
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div class="xb-select-wrapper">
    <slot name="label">
      <label v-if="label" class="text-xs text-content-secondary mb-1.5 block font-medium">
        {{ label }}
      </label>
    </slot>
    <div class="relative" @click.stop>
      <button
        type="button"
        :disabled="disabled"
        class="w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200"
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

      <Transition name="xb-select-dropdown">
        <div
          v-if="isOpen"
          class="absolute z-50 left-0 right-0 mt-1 rounded-lg border border-border bg-surface-elevated shadow-xl overflow-hidden"
        >
          <div class="max-h-64 overflow-y-auto py-1">
            <button
              v-for="opt in options"
              :key="opt.value"
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
    </div>
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
  transform-origin: top center;
}

.xb-select-dropdown-enter-from,
.xb-select-dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.9) translateY(-4px);
}

.xb-select-dropdown-enter-to,
.xb-select-dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1) translateY(0);
}
</style>
