<script setup lang="ts">
import type { Component } from 'vue'


export interface HelpGuide {
  icon: Component | string
  title: string
  desc: string
  color: string
}

defineProps<{
  guides: HelpGuide[]
}>()
</script>

<template>
  <div class="mb-8">
    <h3 class="text-sm font-medium text-content-secondary mb-3 flex items-center gap-2">
      <XbIcon name="lightbulb" :size="16" class="text-amber-400" />
      快速入门
    </h3>
    <div class="grid grid-cols-4 gap-4">
      <XbCard
        v-for="guide in guides"
        :key="guide.title"
        hoverable
        class="cursor-pointer"
      >
        <component v-if="typeof guide.icon === 'object'" :is="guide.icon" :size="24" :class="guide.color" class="mb-3" />
        <XbIcon v-else :name="guide.icon as string" :size="24" :class="guide.color" class="mb-3" />
        <h4 class="text-sm font-medium text-content mb-1">{{ guide.title }}</h4>
        <p class="text-xs text-content-tertiary">{{ guide.desc }}</p>
      </XbCard>
    </div>
  </div>
</template>
