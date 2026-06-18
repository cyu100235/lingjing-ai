<script setup lang="ts">
import type { Works } from '@/stores/projects'

defineProps<{
  works: Works
}>()

defineEmits<{
  click: []
  edit: [id: string, title: string, cover: string]
  delete: [id: string]
}>()
</script>

<template>
  <div
    class="card-base overflow-hidden cursor-pointer group relative"
    @click="$emit('click')"
  >
    <div class="relative aspect-video overflow-hidden bg-surface-overlay">
      <img :src="works.cover" :alt="works.title" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
      <div class="absolute top-2 right-2">
        <span
          class="badge-brand text-[10px]"
          v-if="works.status === 'published'"
        >已发布</span>
        <span
          class="badge text-[10px] bg-surface-overlay/80 text-content-secondary"
          v-else
        >草稿</span>
      </div>
    </div>
    <div class="p-3">
      <h4 class="text-sm font-medium text-content truncate">{{ works.title }}</h4>
      <div class="flex items-center justify-between mt-2">
        <p class="text-xs text-content-tertiary flex items-center gap-1">
          <XbIcon name="clock" :size="11" />
          最近更新：{{ works.updatedAt }}
        </p>
        <div class="flex items-center gap-1" @click.stop>
          <button
            class="p-1 rounded hover:bg-surface-overlay transition-colors"
            @click="$emit('edit', works.id, works.title, works.cover)"
            title="编辑"
          >
            <XbIcon name="pen-line" :size="14" class="text-content-tertiary hover:text-content" />
          </button>
          <button
            class="p-1 rounded hover:bg-surface-overlay transition-colors"
            @click="$emit('delete', works.id)"
            title="删除"
          >
            <XbIcon name="trash-2" :size="14" class="text-content-tertiary hover:text-danger" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
