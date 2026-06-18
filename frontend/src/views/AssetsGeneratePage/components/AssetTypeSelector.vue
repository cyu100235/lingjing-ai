<script setup lang="ts">
import type { AssetTypeItem } from '@/api/assetsType'

const props = defineProps<{
  types: AssetTypeItem[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
    <XbTag
      v-for="t in props.types"
      :key="t.value"
      :type="modelValue === t.value ? 'brand' : 'default'"
      size="md"
      round
      class="shrink-0"
      @click="emit('update:modelValue', t.value)"
    >
      <XbIcon v-if="t.icon" :name="t.icon" :size="12" />
      {{ t.label }}
    </XbTag>
  </div>
</template>
