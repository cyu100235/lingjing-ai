<script setup lang="ts">
import type { Asset } from '@/stores/assets'
import { onImgError } from '@/utils/image'
import { getTypeLabel } from '@/config/assetTypes'

const props = defineProps<{
  asset: Asset | null
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <XbModal
    :visible="visible"
    width="w-[48rem]"
    :close-on-overlay="false"
    @close="emit('close')"
  >
    <template #header>
      <span></span>
    </template>
    <template v-if="asset">
      <img
        :src="asset.thumbnail"
        :alt="asset.name"
        class="w-full max-h-[65vh] object-cover bg-black/5"
        @error="onImgError"
      />
      <div class="flex items-center justify-between py-3 bg-surface-elevated border-t border-border">
        <div>
          <h4 class="text-sm font-medium text-content">{{ asset.name }}</h4>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[10px] text-content-tertiary">{{ getTypeLabel(asset.type) }}</span>
            <span
              v-for="tag in asset.tags"
              :key="tag"
              class="px-1.5 py-0.5 rounded text-[10px] bg-surface-overlay text-content-tertiary"
            >{{ tag }}</span>
          </div>
        </div>
        <span class="text-xs text-content-tertiary">{{ asset.createdAt }}</span>
      </div>
    </template>
  </XbModal>
</template>
