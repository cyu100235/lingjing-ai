<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{
  icon?: Component | string
  iconSize?: number
  description: string
}>(), {
  icon: undefined,
  iconSize: 48,
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16">
    <component
      v-if="typeof icon === 'object'"
      :is="icon"
      :size="iconSize"
      class="text-content-tertiary mb-4"
    />
    <XbIcon
      v-else
      :name="(icon as string) || 'inbox'"
      :size="iconSize"
      class="text-content-tertiary mb-4"
    />
    <p class="text-sm text-content-secondary">{{ description }}</p>
    <slot name="action" />
  </div>
</template>
