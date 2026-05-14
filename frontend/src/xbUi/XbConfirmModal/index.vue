<script setup lang="ts">
import XbButton from '../XbButton/index.vue'

const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmType?: 'primary' | 'danger'
  loading?: boolean
  width?: string
}>(), {
  title: '提示',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  confirmType: 'primary',
  loading: false,
  width: 'w-80',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
  cancel: []
}>()

function handleCancel() {
  emit('update:visible', false)
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
  if (!props.loading) {
    emit('update:visible', false)
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="xb-confirm-overlay" @click.self="handleCancel">
      <div class="xb-confirm-content" :class="width">
        <!-- Header -->
        <div v-if="title || $slots.header" class="flex items-start justify-between mb-3">
          <slot name="header">
            <h3 class="text-base font-semibold text-content">{{ title }}</h3>
          </slot>
        </div>

        <!-- Body -->
        <div class="mb-5">
          <slot>
            <p class="text-sm text-content-secondary">{{ message }}</p>
          </slot>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2">
          <XbButton type="secondary" size="sm" @click="handleCancel">
            {{ cancelText }}
          </XbButton>
          <XbButton
            :type="confirmType === 'danger' ? 'danger' : 'primary'"
            size="sm"
            :loading="loading"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </XbButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.xb-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(0 0% 0% / 0.6);
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.xb-confirm-content {
  border-radius: 1rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--surface-elevated));
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
