<script setup lang="ts">
import type { Asset, AssetType } from '@/stores/assets'
import type { Scene } from '@/stores/projects'
import type { TabItem } from '@/xbUi/XbTabs/index.vue'
import SceneProperties from './SceneProperties.vue'
import SceneScript from './SceneScript.vue'
import AssetSettings from './AssetSettings.vue'

const props = defineProps<{
  propertyTab: 'scene' | 'script' | 'global'
  currentScene: Scene | null
  assets: Asset[]
}>()

const emit = defineEmits<{
  'update:propertyTab': [value: 'scene' | 'script' | 'global']
  'open-asset-picker': [type: AssetType, multiple?: boolean]
  'open-image-preview': [url: string, name: string]
  'open-media-player': [asset: Asset]
  'video-drag-start': [event: DragEvent, asset: Asset]
  'video-drag-end': []
}>()

const tabs: TabItem[] = [
  { label: '分镜属性', value: 'scene' },
  { label: '分镜脚本', value: 'script' },
  { label: '资产设置', value: 'global' },
]

</script>

<template>
  <div class="w-[30rem] border-l border-border bg-surface-elevated overflow-y-auto min-h-0 flex flex-col">
    <!-- Tabs -->
    <div class="shrink-0 px-4 pt-3">
      <XbTabs
        :model-value="propertyTab"
        :tabs="tabs"
        variant="line"
        size="sm"
        @update:model-value="emit('update:propertyTab', $event as 'scene' | 'script' | 'global')"
      />
    </div>

    <!-- Tab Content -->
    <div class="p-4 overflow-y-auto flex-1 min-h-0">
      <template v-if="propertyTab === 'scene'">
        <SceneProperties
          :current-scene="currentScene"
          @open-asset-picker="(type, multiple) => emit('open-asset-picker', type as AssetType, multiple)"
        />
      </template>
      <template v-else-if="propertyTab === 'script'">
        <SceneScript :current-scene="currentScene" />
      </template>
      <template v-else>
        <AssetSettings
          :assets="assets"
          @open-asset-picker="(type) => emit('open-asset-picker', type)"
          @open-image-preview="(url, name) => emit('open-image-preview', url, name)"
          @open-media-player="emit('open-media-player', $event)"
          @video-drag-start="(e, a) => emit('video-drag-start', e, a)"
          @video-drag-end="emit('video-drag-end')"
        />
      </template>
    </div>
  </div>
</template>
