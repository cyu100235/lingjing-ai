<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  worksId: string
  title: string
  episodeTitle: string
}>()

const emit = defineEmits<{
  'show-ai-modal': []
  'show-ai-script-modal': []
  'publish': []
}>()

const router = useRouter()

function goBack() {
  router.push(`/works/${props.worksId}/episodes`)
}
</script>

<template>
  <div class="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-elevated">
    <div class="flex items-center gap-3">
      <button class="btn-ghost p-1.5 rounded" @click="goBack">
        <XbIcon name="arrow-left" :size="18" class="text-content-secondary" />
      </button>
      <h3 class="text-sm font-medium text-content">{{ title }}</h3>
      <XbIcon name="chevron-right" :size="14" class="text-content-tertiary" />
      <span class="text-sm text-content-secondary">{{ episodeTitle }}</span>
    </div>
    <div class="flex items-center gap-2">
      <XbButton size="sm" @click="emit('show-ai-modal')">
        <template #icon><XbIcon name="wand-sparkles" :size="14" /></template>
        AI生成
      </XbButton>
      <XbButton size="sm" @click="emit('show-ai-script-modal')">
        <template #icon><XbIcon name="book-open" :size="14" /></template>
        AI剧本
      </XbButton>
      <XbButton size="sm" @click="emit('publish')">
        <template #icon><XbIcon name="send" :size="14" /></template>
        发布剧集
      </XbButton>
    </div>
  </div>
</template>
