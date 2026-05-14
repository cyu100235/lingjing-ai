<script setup lang="ts">


withDefaults(defineProps<{
  title?: string
  episodeCount?: number
}>(), {
  title: '未命名作品',
  episodeCount: 0,
})

const emit = defineEmits<{
  back: []
  create: []
}>()
</script>

<template>
  <div class="flex items-center gap-4 mb-6">
    <button class="btn-ghost p-2 rounded-lg" @click="emit('back')">
      <XbIcon name="arrow-left" :size="18" class="text-content-secondary" />
    </button>
    <div>
      <h2 class="text-xl font-semibold text-content">{{ title }}</h2>
      <p class="text-xs text-content-tertiary mt-0.5">连载管理 · 共{{ episodeCount }}集</p>
    </div>
    <div class="flex-1" />
    <XbButton size="sm" @click="emit('create')">
      <template #icon>
        <XbIcon name="plus" :size="14" />
      </template>
      新建分集
    </XbButton>
  </div>
</template>
