<script setup lang="ts">
import type { Asset } from '@/stores/assets'
import { onImgError } from '@/utils/image'
import { isAudioAsset, isVideoAsset } from '@/utils/media'
import { getTypeLabel } from '@/config/assetTypes'

defineProps<{
  assets: Asset[]
  batchMode: boolean
  selectedIds: string[]
}>()

defineEmits<{
  cardClick: [asset: Asset]
  toggleSelect: [id: string]
}>()
</script>

<template>
  <div class="grid grid-cols-5 gap-3">
    <div
      v-for="asset in assets"
      :key="asset.id"
      class="card-base overflow-hidden cursor-pointer group relative"
      :class="{ 'ring-2 ring-brand': batchMode && selectedIds.includes(asset.id) }"
      @click="$emit('cardClick', asset)"
    >
      <div class="aspect-square overflow-hidden bg-surface-overlay relative">
        <img :src="asset.thumbnail" :alt="asset.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" @error="onImgError" />
        <!-- Hover icon (normal mode) -->
        <div v-if="!batchMode && (isVideoAsset(asset.type) || isAudioAsset(asset.type))" class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <XbIcon name="play" :size="24" class="text-white drop-shadow" fill="white" />
        </div>
      </div>
      <div class="p-2.5">
        <h4 class="text-xs font-medium text-content truncate">{{ asset.name }}</h4>
        <div class="flex items-center justify-between mt-1.5">
          <span class="text-[10px] text-content-tertiary">{{ getTypeLabel(asset.type) }}</span>
          <div class="flex items-center gap-1">
            <span
              v-for="tag in asset.tags.slice(0, 2)"
              :key="tag"
              class="px-1 py-0 rounded text-[9px] bg-surface-overlay text-content-tertiary"
            >{{ tag }}</span>
          </div>
        </div>
      </div>
      <!-- Selection checkbox (batch mode) -->
      <div
        v-if="batchMode"
        class="absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
        :class="selectedIds.includes(asset.id) ? 'bg-brand border-brand' : 'bg-surface/80 border-content-tertiary'"
      >
        <span v-if="selectedIds.includes(asset.id)" class="text-[10px] text-surface font-bold">✓</span>
      </div>
    </div>
  </div>
</template>
