<script setup lang="ts">
import type { Scene } from '@/stores/projects'

defineProps<{
  currentScene: Scene | null
}>()
</script>

<template>
  <div v-if="currentScene" class="space-y-4">
    <!-- Action -->
    <div>
      <label class="text-xs text-content-tertiary mb-1 block">角色动作</label>
      <input :value="currentScene.action" class="input-base text-xs h-8" placeholder="例如：拔剑、奔跑、坐下" />
    </div>

    <!-- Camera Language -->
    <div>
      <label class="text-xs text-content-tertiary mb-1 block">镜头语言</label>
      <input :value="currentScene.cameraLang" class="input-base text-xs h-8" placeholder="例如：特写、全景、推镜头" />
    </div>

    <!-- Narration -->
    <div>
      <XbTextarea :modelValue="currentScene.narration" label="分镜旁白" rows="3" resize="none" placeholder="输入分镜旁白内容..." />
    </div>

    <!-- Dialogue -->
    <div>
      <XbTextarea :modelValue="currentScene.dialogue" label="分镜描述" rows="5" resize="none" placeholder="例如：在竹林小道上，熊猫侠客与古装少女相遇，两人对视一笑...">
        <template #hint>
          <XbIcon name="message-square" :size="11" class="inline mr-1" />
          分镜描述
        </template>
      </XbTextarea>
      <div class="flex gap-2 mt-2">
        <XbButton type="secondary" size="sm" class="flex-1">
          <template #icon><XbIcon name="sparkles" :size="12" /></template>
          优化描述词
        </XbButton>
        <XbButton size="sm" class="flex-1">
          <template #icon><XbIcon name="clapperboard" :size="12" /></template>
          生成分镜
        </XbButton>
      </div>
    </div>
  </div>

  <XbEmpty v-else icon="scroll-text" :icon-size="32" description="未选中分镜">
    <template #action>
      <p class="text-[10px] mt-1 opacity-60 text-content-tertiary">请在时间轴中点击选择一个分镜</p>
    </template>
  </XbEmpty>
</template>
