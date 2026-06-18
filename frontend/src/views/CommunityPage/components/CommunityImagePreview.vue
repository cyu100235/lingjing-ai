<script setup lang="ts">
const props = defineProps<{
  src: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="src"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-zoom-out"
        @click="handleClose"
      >
        <img :src="src" class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" />
      </div>
    </Transition>
  </Teleport>
</template>
