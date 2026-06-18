<script setup lang="ts">
defineEmits<{
  'upload': []
  'generate': []
}>()
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-xl font-semibold text-content">我的资产</h2>
    <div class="flex items-center gap-2">
      <button class="btn-primary flex items-center gap-2 text-xs" @click="$emit('generate')">
        <XbIcon name="wand-sparkles" :size="14" />
        生成资产
      </button>
      <button class="btn-secondary flex items-center gap-2 text-xs" @click="$emit('upload')">
        <XbIcon name="upload" :size="14" />
        上传资产
      </button>
    </div>
  </div>
</template>
