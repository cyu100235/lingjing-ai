<script setup lang="ts">
import type { Scene } from '@/stores/projects'
import { onImgError } from '@/utils/image'

defineProps<{
  currentScene: Scene | null
}>()

const emit = defineEmits<{
  'open-asset-picker': [type: string, multiple: boolean]
}>()
</script>

<template>
  <div v-if="currentScene" class="space-y-4">
    <!-- Scene Title -->
    <div>
      <label class="text-xs text-content-tertiary mb-1 block">分镜名称</label>
      <input :value="currentScene.title" class="input-base text-xs h-8" />
    </div>

    <!-- Background -->
    <div>
      <label class="text-xs text-content-tertiary mb-1 block">场景图片</label>
      <div class="aspect-video rounded-lg overflow-hidden border border-border">
        <img v-if="currentScene.background" :src="currentScene.background" class="w-full h-full object-cover" @error="onImgError" />
        <div v-else class="w-full h-full bg-surface-overlay flex items-center justify-center">
          <span class="text-[10px] text-content-tertiary">暂无场景图片</span>
        </div>
      </div>
      <span class="text-[10px] text-content-tertiary mt-1 block">推荐尺寸：1920 × 1080px</span>
      <XbButton type="secondary" size="sm" block class="mt-2" @click="emit('open-asset-picker', 'background', false)">
        <template #icon><XbIcon name="image" :size="12" /></template>
        {{ currentScene.background ? '更换图片' : '选择图片' }}
      </XbButton>
    </div>

  </div>

  <XbEmpty v-else icon="layers" :icon-size="32" description="未选中分镜">
    <template #action>
      <p class="text-[10px] mt-1 opacity-60 text-content-tertiary">请在时间轴中点击选择一个分镜</p>
    </template>
  </XbEmpty>
</template>
