<script setup lang="ts">
import type { Episode } from '@/stores/projects'
import EpisodeCard from './EpisodeCard.vue'

const props = defineProps<{
  episodes: Episode[]
}>()

const emit = defineEmits<{
  openEditor: [id: string]
  edit: [id: string, title: string, cover: string]
  delete: [id: string]
}>()
</script>

<template>
  <div v-if="props.episodes.length > 0" class="grid grid-cols-4 gap-4">
    <EpisodeCard
      v-for="episode in props.episodes"
      :key="episode.id"
      :episode="episode"
      @click="emit('openEditor', $event)"
      @edit="(id, title, cover) => emit('edit', id, title, cover)"
      @delete="emit('delete', $event)"
    />
  </div>

  <XbEmpty
    v-else
    :icon="'film'"
    :icon-size="48"
    description="暂无分集，点击上方按钮新建"
  />
</template>
