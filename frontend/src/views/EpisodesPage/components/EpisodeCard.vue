<script setup lang="ts">

import type { Episode } from '@/stores/projects'

const props = defineProps<{
  episode: Episode
}>()

const emit = defineEmits<{
  click: [id: string]
  edit: [id: string, title: string, cover: string]
  delete: [id: string]
}>()

function getTotalDuration() {
  return props.episode.scenes.reduce((sum, s) => sum + s.duration, 0)
}
</script>

<template>
  <div
    class="card-base overflow-hidden cursor-pointer group relative"
    @click="emit('click', episode.id)"
  >
    <div class="relative aspect-video overflow-hidden bg-surface-overlay">
      <img
        :src="episode.cover"
        :alt="episode.title"
        class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
      />
      <div class="absolute top-2 left-2">
        <span class="badge-brand text-[10px]">{{ episode.scenes.length }}个场景</span>
      </div>
      <div class="absolute inset-0 bg-surface/0 group-hover:bg-surface/20 transition-colors flex items-center justify-center">
        <XbIcon name="play" :size="28" class="text-content opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
    <div class="p-3">
      <h4 class="text-sm font-medium text-content">{{ episode.title }}</h4>
      <div class="flex items-center justify-between mt-2">
        <p class="text-xs text-content-tertiary flex items-center gap-1">
          <XbIcon name="clock" :size="11" />
          {{ getTotalDuration() }}秒
        </p>
        <div class="flex items-center gap-1" @click.stop>
          <button
            class="p-1 rounded hover:bg-surface-overlay transition-colors"
            @click="emit('edit', episode.id, episode.title, episode.cover)"
            title="编辑"
          >
            <XbIcon name="pen-line" :size="14" class="text-content-tertiary hover:text-content" />
          </button>
          <button
            class="p-1 rounded hover:bg-surface-overlay transition-colors"
            @click="emit('delete', episode.id)"
            title="删除"
          >
            <XbIcon name="trash-2" :size="14" class="text-content-tertiary hover:text-danger" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
