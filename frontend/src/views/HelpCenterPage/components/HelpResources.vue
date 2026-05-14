<script setup lang="ts">
import type { Component } from 'vue'


export interface HelpResource {
  icon: Component | string
  title: string
  desc: string
}

defineProps<{
  resources: HelpResource[]
}>()
</script>

<template>
  <div>
    <h3 class="text-sm font-medium text-content-secondary mb-3">帮助资源</h3>
    <div class="space-y-2">
      <div
        v-for="resource in resources"
        :key="resource.title"
        class="card-base p-3 flex items-center gap-3 cursor-pointer hover:bg-surface-overlay transition-colors"
      >
        <component v-if="typeof resource.icon === 'object'" :is="resource.icon" :size="18" class="text-brand shrink-0" />
        <XbIcon v-else :name="resource.icon as string" :size="18" class="text-brand shrink-0" />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-medium text-content">{{ resource.title }}</h4>
          <p class="text-[10px] text-content-tertiary truncate">{{ resource.desc }}</p>
        </div>
        <XbIcon name="chevron-right" :size="14" class="text-content-tertiary shrink-0" />
      </div>
    </div>
  </div>
</template>
