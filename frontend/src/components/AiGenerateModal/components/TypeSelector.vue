<script setup lang="ts">
import type { AssetType } from '@/stores/assets'

const modelValue = defineModel<AssetType>({ required: true })

const options = [
  { value: 'background', label: '场景图片', description: '生成各类场景背景图', iconColor: '#3b82f6', iconText: '景' },
  { value: 'character', label: '人物角色', description: '生成完整人物形象', iconColor: '#f97316', iconText: '人' },
  { value: 'action', label: '人物动作', description: '生成角色动作姿态', iconColor: '#10b981', iconText: '动' },
  { value: 'expression', label: '人物表情', description: '生成面部表情变化', iconColor: '#eab308', iconText: '表' },
  { value: 'prop', label: '物品道具', description: '生成各类物件道具', iconColor: '#8b5cf6', iconText: '物' },
  { value: 'effect', label: '特效贴图', description: '生成光效粒子特效', iconColor: '#ec4899', iconText: '效' },
  { value: 'voice', label: '人物音色', description: '生成角色语音音色', iconColor: '#06b6d4', iconText: '音' },
  { value: 'sound_effect', label: '其他音效', description: '生成环境与事件音效', iconColor: '#64748b', iconText: '声' },
  { value: 'video', label: '视频素材', description: '生成短视频片段', iconColor: '#ef4444', iconText: '视' },
]
</script>

<template>
  <XbSelect v-model="modelValue" :options="options" label="生成类型">
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
