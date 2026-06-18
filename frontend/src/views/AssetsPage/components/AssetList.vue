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

const emit = defineEmits<{
  cardClick: [asset: Asset]
  toggleSelect: [id: string]
  preview: [asset: Asset]
  delete: [id: string]
  playMedia: [asset: Asset]
}>()

function handleActionClick(asset: Asset) {
  if (isAudioAsset(asset.type) || isVideoAsset(asset.type)) {
    emit('playMedia', asset)
  } else {
    emit('preview', asset)
  }
}

// 删除确认
const deleteConfirmVisible = ref(false)
const pendingDeleteId = ref<string | null>(null)

function requestDelete(id: string) {
  pendingDeleteId.value = id
  deleteConfirmVisible.value = true
}

function confirmDelete() {
  if (pendingDeleteId.value) {
    emit('delete', pendingDeleteId.value)
  }
  deleteConfirmVisible.value = false
  pendingDeleteId.value = null
}
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="asset in assets"
      :key="asset.id"
      class="card-base flex items-center gap-4 p-3 cursor-pointer"
      :class="{ 'ring-2 ring-brand': batchMode && selectedIds.includes(asset.id) }"
      @click="$emit('cardClick', asset)"
    >
      <!-- Batch mode checkbox -->
      <div
        v-if="batchMode"
        class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors"
        :class="selectedIds.includes(asset.id) ? 'bg-brand border-brand' : 'border-content-tertiary'"
      >
        <span v-if="selectedIds.includes(asset.id)" class="text-[10px] text-surface font-bold">✓</span>
      </div>
      <div class="w-12 h-12 overflow-hidden bg-surface-overlay shrink-0 relative group/thumb" :class="{ 'rounded-lg': !isVideoAsset(asset.type) && !isAudioAsset(asset.type) }">
        <img :src="asset.thumbnail" :alt="asset.name" class="w-full h-full object-cover" @error="onImgError" />
        <div
          v-if="isVideoAsset(asset.type) || isAudioAsset(asset.type)"
          class="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/thumb:opacity-100"
        >
          <XbIcon name="play" :size="16" class="text-white drop-shadow" fill="white" />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-content truncate">{{ asset.name }}</h4>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-[10px] text-content-tertiary">{{ getTypeLabel(asset.type) }}</span>
          <span
            v-for="tag in asset.tags"
            :key="tag"
            class="px-1.5 py-0 rounded text-[10px] bg-surface-overlay text-content-tertiary"
          >{{ tag }}</span>
        </div>
      </div>
      <span class="text-xs text-content-tertiary">{{ asset.createdAt }}</span>
      <button v-if="!batchMode" class="btn-ghost p-1.5 rounded" @click.stop="handleActionClick(asset)">
        <XbIcon name="zoom-in" :size="14" class="text-content-tertiary hover:text-brand" />
      </button>
      <button class="btn-ghost p-1.5 rounded" @click.stop="requestDelete(asset.id)">
        <XbIcon name="trash-2" :size="14" class="text-content-tertiary hover:text-danger" />
      </button>
    </div>
  </div>

  <!-- 删除确认弹窗 -->
  <XbConfirmModal
    v-model:visible="deleteConfirmVisible"
    title="删除确认"
    message="确定要删除该素材吗？此操作不可恢复。"
    confirm-text="删除"
    confirm-type="danger"
    @confirm="confirmDelete"
  />
</template>
