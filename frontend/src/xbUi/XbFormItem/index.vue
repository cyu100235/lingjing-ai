<script setup lang="ts">

const props = withDefaults(defineProps<{
  label?: string
  name?: string
  required?: boolean
}>(), {
  label: '',
  name: '',
  required: false,
})

const formContext = inject<any>('xbFormContext', null)

onMounted(() => {
  if (formContext && props.name) {
    formContext.registerField(props.name, '')
  }
})

onBeforeUnmount(() => {
  if (formContext && props.name) {
    formContext.unregisterField(props.name)
  }
})

const fieldError = computed(() => {
  if (!formContext || !props.name) return ''
  return formContext.getFieldError(props.name)
})

const labelPosition = computed(() => {
  return formContext?.labelPosition?.value || 'top'
})

const labelWidth = computed(() => {
  return formContext?.labelWidth?.value || '80px'
})
</script>

<template>
  <div
    class="xb-form-item"
    :class="[
      labelPosition === 'left' ? 'flex items-start gap-3' : '',
      fieldError ? 'xb-form-item--error' : '',
    ]"
  >
    <!-- Label -->
    <label
      v-if="label"
      class="text-xs text-content-secondary font-medium shrink-0"
      :class="[
        labelPosition === 'left' ? 'leading-9' : 'mb-1.5 block',
      ]"
      :style="labelPosition === 'left' ? { width: labelWidth, minWidth: labelWidth } : undefined"
    >
      <span v-if="required" class="text-danger mr-0.5">*</span>
      {{ label }}
    </label>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <slot />
      <!-- Error Message -->
      <p v-if="fieldError" class="mt-1 text-xs text-danger">{{ fieldError }}</p>
    </div>
  </div>
</template>

<style scoped>
.xb-form-item {
  margin-bottom: 1rem;
}

.xb-form-item:last-child {
  margin-bottom: 0;
}
</style>
