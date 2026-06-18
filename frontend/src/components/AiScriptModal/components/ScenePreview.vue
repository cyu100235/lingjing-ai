<script setup lang="ts">
import type { Scene } from '@/stores/projects'
import SceneCard from './SceneCard.vue'

interface Props {
  scenes: Omit<Scene, 'id'>[]
}

defineProps<Props>()

const emit = defineEmits<{
  confirm: []
}>()

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
      <XbIcon name="sparkles" :size="16" class="text-green-500" />
      <span class="text-sm text-green-400">已生成 {{ scenes.length }} 个分镜</span>
    </div>

    <div class="max-h-[45vh] overflow-y-auto space-y-2 pr-1">
      <SceneCard
        v-for="(scene, i) in scenes"
        :key="i"
        :scene="scene"
        :index="i"
      />
    </div>
  </div>
</template>
