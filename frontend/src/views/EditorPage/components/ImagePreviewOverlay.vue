<script setup lang="ts">
import { onImgError } from '@/utils/image'

defineProps<{
  visible: boolean
  imageUrl: string
  imageName: string
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <XbModal
    :visible="visible"
    :show-close="true"
    close-on-overlay
    no-padding
    width="w-auto"
    @close="emit('close')"
  >
    <div class="relative flex flex-col items-center p-6">
      <img
        :src="imageUrl"
        :alt="imageName"
        class="max-w-[70vw] max-h-[70vh] rounded-lg shadow-2xl object-contain"
        @error="onImgError"
      />
      <p class="mt-3 text-sm text-content font-medium">{{ imageName }}</p>
    </div>
  </XbModal>
</template>
