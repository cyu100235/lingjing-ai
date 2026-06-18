<script setup lang="ts">
interface Props {
  progress: number
  progressText: string
}

defineProps<Props>()
</script>

<template>
  <div class="py-8 space-y-6">
    <div class="text-center">
      <XbIcon name="sparkles" :size="32" class="text-brand mx-auto mb-3 animate-pulse" />
      <p class="text-sm text-content font-medium">AI 正在解析剧本生成分镜...</p>
    </div>

    <div class="px-4">
      <div class="w-full h-2 rounded-full bg-surface-overlay overflow-hidden">
        <div
          class="h-full rounded-full bg-brand transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <p class="text-xs text-content-tertiary text-center mt-2">{{ progressText }}</p>
    </div>
  </div>
</template>
