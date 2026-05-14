<script setup lang="ts">
const modelValue = defineModel<string>({ required: true })

const options = [
  { id: 'q-cute', label: 'Q版可爱', description: '圆润比例，大眼睛，色彩鲜艳活泼', iconColor: '#f472b6', iconText: 'Q', value: 'q-cute' },
  { id: 'realistic-ancient', label: '写实古风', description: '细腻写实，古典配色，注重细节质感', iconColor: '#a78bfa', iconText: '古', value: 'realistic-ancient' },
  { id: 'ink-wash', label: '水墨风', description: '留白意境，墨色渲染，东方美学', iconColor: '#6b7280', iconText: '墨', value: 'ink-wash' },
  { id: 'comic', label: '漫画风', description: '夸张线条，动感构图，对比强烈', iconColor: '#fb923c', iconText: '漫', value: 'comic' },
]
</script>

<template>
  <XbSelect v-model="modelValue" :options="options" label="资产风格">
    <template #selected="{ option }">
      <template v-if="option">
        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" :style="{ backgroundColor: option.iconColor }">
          {{ option.iconText }}
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-sm font-medium text-content">{{ option.label }}</span>
          <p class="text-[11px] text-content-tertiary mt-0.5">{{ option.description }}</p>
        </div>
      </template>
    </template>
    <template #option="{ option }">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" :style="{ backgroundColor: option.iconColor }">
        {{ option.iconText }}
      </div>
      <div class="flex-1 min-w-0">
        <span class="text-sm font-medium" :class="modelValue === option.value ? 'text-brand' : 'text-content'">{{ option.label }}</span>
        <p class="text-[11px] text-content-tertiary mt-0.5">{{ option.description }}</p>
      </div>
    </template>
  </XbSelect>
</template>
