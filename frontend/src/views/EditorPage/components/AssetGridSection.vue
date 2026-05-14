<script setup lang="ts">
import type { Asset } from '@/stores/assets'
import { onImgError } from '@/utils/image'

const props = withDefaults(defineProps<{
  label: string
  assets: Asset[]
  draggable?: boolean
  showDuration?: boolean
  addLabel?: string
}>(), {
  draggable: false,
  showDuration: false,
  addLabel: '添加',
})

const emit = defineEmits<{
  'click-asset': [asset: Asset]
  'add-asset': []
  'dragstart-asset': [event: DragEvent, asset: Asset]
  'dragend-asset': []
}>()

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div>
    <label class="text-xs text-content-tertiary mb-1 block">{{ label }}</label>
    <div class="grid grid-cols-4 gap-2">
      <div
        v-for="asset in assets"
        :key="asset.id"
        class="flex flex-col items-center gap-1 p-2 rounded-lg bg-surface-overlay border border-border-subtle cursor-pointer hover:border-brand/40 transition-colors"
        :class="draggable ? 'cursor-grab active:cursor-grabbing hover:border-purple-400/60' : ''"
        :draggable="draggable"
        @dragstart="emit('dragstart-asset', $event, asset)"
        @dragend="emit('dragend-asset')"
        @click="emit('click-asset', asset)"
      >
        <img
          :src="asset.thumbnail"
          :alt="asset.name"
          class="w-10 h-10 rounded-md object-cover shrink-0"
          @error="onImgError"
        />
        <span class="text-[10px] text-content-secondary w-full text-center truncate" :title="asset.name">{{ asset.name }}</span>
        <span v-if="showDuration && asset.duration" class="text-[9px] text-content-tertiary">{{ formatTime(asset.duration) }}</span>
      </div>
      <button class="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 border-dashed border-border hover:border-brand/40 transition-colors" @click="emit('add-asset')">
        <XbIcon name="plus" :size="16" class="text-content-tertiary" />
        <span class="text-[10px] text-content-tertiary">{{ addLabel }}</span>
      </button>
    </div>
  </div>
</template>
