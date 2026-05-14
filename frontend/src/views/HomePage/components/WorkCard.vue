<script setup lang="ts">

defineProps<{
  cover: string
  title: string
  author: string
  views: string
  likes: string
  rank?: number
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <div class="card-base overflow-hidden cursor-pointer group" @click="$emit('click')">
    <div class="relative aspect-video overflow-hidden">
      <img :src="cover" :alt="title" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div v-if="rank" class="absolute top-2 left-2">
        <span
          class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
          :class="{
            'bg-brand text-surface': rank === 1,
            'bg-content-secondary/80 text-surface': rank === 2,
            'bg-content-tertiary/60 text-surface': rank === 3,
          }"
        >
          {{ rank }}
        </span>
      </div>
      <div class="absolute inset-0 bg-surface/0 group-hover:bg-surface/20 transition-colors flex items-center justify-center">
        <XbIcon name="play" :size="28" class="text-content opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
    <div class="p-3">
      <h4 class="text-sm font-medium text-content truncate">{{ title }}</h4>
      <p class="text-xs text-content-tertiary mt-1">{{ author }}</p>
      <div class="flex items-center gap-3 mt-2 text-xs text-content-secondary">
        <span class="flex items-center gap-1">
          <XbIcon name="eye" :size="12" />
          {{ views }}
        </span>
        <span class="flex items-center gap-1">
          <XbIcon name="heart" :size="12" />
          {{ likes }}
        </span>
      </div>
    </div>
  </div>
</template>
