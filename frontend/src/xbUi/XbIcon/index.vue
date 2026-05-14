<script setup lang="ts">
import { computed } from 'vue'
import { icons } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  name: string
  size?: number
  strokeWidth?: number
  absoluteStrokeWidth?: boolean
}>(), {
  size: 24,
  strokeWidth: 2,
  absoluteStrokeWidth: false,
})

const iconComponent = computed(() => {
  // 支持 kebab-case 转 PascalCase，如 'arrow-left' -> 'ArrowLeft'
  const pascalName = props.name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  return (icons as Record<string, any>)[pascalName] || null
})
</script>

<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    :size="size"
    :stroke-width="strokeWidth"
    :absolute-stroke-width="absoluteStrokeWidth"
    v-bind="$attrs"
  />
</template>
