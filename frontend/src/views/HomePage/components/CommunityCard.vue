<script setup lang="ts">

defineProps<{
  avatar: string
  author: string
  time: string
  content: string
  likes: number
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <div class="card-base p-4 cursor-pointer" @click="$emit('click')">
    <div class="flex items-center gap-3 mb-3">
      <div class="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
        <span class="text-xs text-brand font-medium">{{ avatar }}</span>
      </div>
      <div>
        <p class="text-sm font-medium text-content">{{ author }}</p>
        <p class="text-xs text-content-tertiary">{{ time }}</p>
      </div>
    </div>
    <p class="text-sm text-content-secondary leading-relaxed">{{ content }}</p>
    <div class="flex items-center gap-1 mt-3 text-xs text-content-tertiary">
      <XbIcon name="heart" :size="12" />
      <span>{{ likes }}</span>
    </div>
  </div>
</template>
