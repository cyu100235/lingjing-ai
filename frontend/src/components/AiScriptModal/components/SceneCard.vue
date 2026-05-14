<script setup lang="ts">
import type { Scene } from '@/stores/projects'

interface Props {
  scene: Omit<Scene, 'id'>
  index: number
}

defineProps<Props>()
</script>

<template>
  <div class="p-3 rounded-lg border border-border bg-surface-overlay">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-medium text-content">{{ scene.title }}</span>
      <span class="text-[10px] text-content-tertiary flex items-center gap-1">
        <XbIcon name="clock" :size="10" />
        {{ scene.duration }}s
      </span>
    </div>

    <!-- 描述词 -->
    <div class="flex items-start gap-1 mb-1.5">
      <XbIcon name="image" :size="10" class="text-brand shrink-0 mt-0.5" />
      <span class="text-[10px] text-content-secondary leading-relaxed">{{ scene.dialogue }}</span>
    </div>

    <!-- 角色 -->
    <div class="flex items-center gap-1 mb-1.5">
      <XbIcon name="users" :size="10" class="text-brand shrink-0" />
      <span class="text-[10px] text-content-secondary">{{ scene.characters.join(', ') }}</span>
    </div>

    <!-- 表情 -->
    <div class="flex items-center gap-1 mb-1.5">
      <XbIcon name="smile" :size="10" class="text-amber-400 shrink-0" />
      <span class="text-[10px] text-content-secondary">{{ scene.expressions.join(', ') }}</span>
    </div>

    <!-- 道具 -->
    <div v-if="scene.props.length > 0" class="flex items-center gap-1">
      <XbIcon name="package" :size="10" class="text-content-tertiary shrink-0" />
      <span class="text-[10px] text-content-secondary">{{ scene.props.join(', ') }}</span>
    </div>

    <!-- 动作 -->
    <div v-if="scene.actions.length > 0" class="flex items-center gap-1">
      <XbIcon name="activity" :size="10" class="text-cyan-400 shrink-0" />
      <span class="text-[10px] text-content-secondary">{{ scene.actions.join(', ') }}</span>
    </div>
  </div>
</template>
