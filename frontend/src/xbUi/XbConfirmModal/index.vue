<script setup lang="ts">
import XbButton from '../XbButton/index.vue'
import XbModal from '../XbModal/index.vue'
import type { ModalAnimation } from './method'

const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmType?: 'primary' | 'danger'
  loading?: boolean
  width?: string
  showCancel?: boolean
  showConfirm?: boolean
  animation?: ModalAnimation
}>(), {
  title: '提示',
  message: '',
  confirmText: '确认',
  cancelText: '取消',
  confirmType: 'primary',
  loading: false,
  width: 'w-80',
  showCancel: true,
  showConfirm: true,
  animation: undefined,
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

function handleClose() {
  emit('update:visible', false)
  emit('cancel')
}


</script>

<template>
  <XbModal
    :visible="visible"
    :title="title"
    :width="width"
    :show-close="false"
    :close-on-overlay="true"
    :animation="animation"
    :submit-on-enter="showConfirm && !loading"
    @update:visible="$emit('update:visible', $event)"
    @close="handleClose"
    @submit="handleConfirm"
  >
    <!-- Body -->
    <slot>
      <p class="text-sm text-content-secondary">{{ message }}</p>
    </slot>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <XbButton
          v-if="showCancel"
          type="secondary"
          size="sm"
          @click="handleCancel"
        >
          {{ cancelText }}
        </XbButton>
        <XbButton
          v-if="showConfirm"
          :type="confirmType === 'danger' ? 'danger' : 'primary'"
          size="sm"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </XbButton>
      </div>
    </template>
  </XbModal>
</template>
