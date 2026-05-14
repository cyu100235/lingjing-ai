<script setup lang="ts">

defineProps<{
  image: string
  title: string
  description: string
  primaryAction?: string
  secondaryAction?: string
}>()

defineEmits<{
  primaryClick: []
  secondaryClick: []
}>()
</script>

<template>
  <section class="relative overflow-hidden rounded-2xl h-64">
    <img :src="image" :alt="title" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/60 to-transparent" />
    <div class="absolute inset-0 flex flex-col justify-center px-10">
      <h2 class="text-3xl font-bold text-content mb-2">{{ title }}</h2>
      <p class="text-content-secondary text-base mb-6 max-w-md">{{ description }}</p>
      <div class="flex gap-3">
        <button v-if="primaryAction" class="btn-primary flex items-center gap-2" @click="$emit('primaryClick')">
          <XbIcon name="sparkles" :size="16" />
          {{ primaryAction }}
        </button>
        <button v-if="secondaryAction" class="btn-secondary flex items-center gap-2" @click="$emit('secondaryClick')">
          <XbIcon name="play" :size="16" />
          {{ secondaryAction }}
        </button>
      </div>
    </div>
  </section>
</template>
