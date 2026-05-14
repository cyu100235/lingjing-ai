<script setup lang="ts">
import { computed } from 'vue'
import type { Asset, AssetType } from '@/stores/assets'
import AssetGridSection from './AssetGridSection.vue'

const props = defineProps<{
  assets: Asset[]
}>()

const emit = defineEmits<{
  'open-asset-picker': [type: AssetType]
  'open-image-preview': [url: string, name: string]
  'open-media-player': [asset: Asset]
  'video-drag-start': [event: DragEvent, asset: Asset]
  'video-drag-end': []
}>()

function getAssetsByType(type: AssetType) {
  return computed(() => props.assets.filter(a => a.type === type))
}

const characters = getAssetsByType('character')
const expressions = getAssetsByType('expression')
const actions = getAssetsByType('action')
const props_ = getAssetsByType('prop')
const effects = getAssetsByType('effect')
const voices = getAssetsByType('voice')
const soundEffects = getAssetsByType('sound_effect')
const videos = getAssetsByType('video')

function onAssetClick(asset: Asset) {
  if (asset.type === 'voice' || asset.type === 'sound_effect' || asset.type === 'video') {
    emit('open-media-player', asset)
  } else {
    emit('open-image-preview', asset.thumbnail, asset.name)
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- 人物角色 -->
    <AssetGridSection
      label="人物角色"
      :assets="characters"
      @click-asset="onAssetClick"
      @add-asset="emit('open-asset-picker', 'character')"
    />

    <!-- 人物表情 -->
    <AssetGridSection
      label="人物表情"
      :assets="expressions"
      @click-asset="onAssetClick"
      @add-asset="emit('open-asset-picker', 'expression')"
    />

    <!-- 人物动作 -->
    <AssetGridSection
      label="人物动作"
      :assets="actions"
      @click-asset="onAssetClick"
      @add-asset="emit('open-asset-picker', 'action')"
    />

    <!-- 物品道具 -->
    <AssetGridSection
      label="物品道具"
      :assets="props_"
      @click-asset="onAssetClick"
      @add-asset="emit('open-asset-picker', 'prop')"
    />

    <!-- 特效贴图 -->
    <AssetGridSection
      label="特效贴图"
      :assets="effects"
      @click-asset="onAssetClick"
      @add-asset="emit('open-asset-picker', 'effect')"
    />

    <!-- 人物音色 -->
    <AssetGridSection
      label="人物音色"
      :assets="voices"
      :show-duration="true"
      @click-asset="onAssetClick"
      @add-asset="emit('open-asset-picker', 'voice')"
    />

    <!-- 事件音效 -->
    <AssetGridSection
      label="事件音效"
      :assets="soundEffects"
      :show-duration="true"
      @click-asset="onAssetClick"
      @add-asset="emit('open-asset-picker', 'sound_effect')"
    />

    <!-- 视频素材 -->
    <AssetGridSection
      label="视频素材（拖拽到时间轴）"
      :assets="videos"
      :show-duration="true"
      :draggable="true"
      @click-asset="onAssetClick"
      @add-asset="emit('open-asset-picker', 'video')"
      @dragstart-asset="(e, a) => emit('video-drag-start', e, a)"
      @dragend-asset="emit('video-drag-end')"
    />
  </div>
</template>
