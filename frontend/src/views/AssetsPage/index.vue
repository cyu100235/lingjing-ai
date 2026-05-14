<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAssetStore, type Asset, type AssetType, type AssetSubType } from '@/stores/assets'
import { isAudioAsset, isVideoAsset } from '@/utils/media'
import { getSubTypes, type CategoryFilterItem } from '@/config/assetTypes'
import AiGenerateModal from '@/components/AiGenerateModal/index.vue'
import AssetsHeader from './components/AssetsHeader.vue'
import AssetCategoryFilter from '@/components/AssetCategoryFilter/index.vue'
import AssetToolbar from './components/AssetToolbar.vue'
import AssetGrid from './components/AssetGrid.vue'
import AssetList from './components/AssetList.vue'
import AssetPreviewModal from './components/AssetPreviewModal.vue'
import AssetUploadModal from './components/AssetUploadModal.vue'
import AudioPlayerModal from '@/components/AudioPlayerModal/index.vue'
import type { AudioPlayerInfo } from '@/components/AudioPlayerModal/index.vue'
import VideoPlayerModal from '@/components/VideoPlayerModal/index.vue'
import type { VideoPlayerInfo } from '@/components/VideoPlayerModal/index.vue'

const store = useAssetStore()

const viewMode = ref<'grid' | 'list'>('grid')
const showUploadModal = ref(false)
const showAiModal = ref(false)
const aiType = ref<AssetType>('character')
const selectedAssets = ref<string[]>([])
const batchMode = ref(false)
const previewAsset = ref<Asset | null>(null)
const allTags = ['主角', '配角', '古风', '武侠', '萌宠', '搞笑', '室内', '室外', '自然', '宏伟', '正面', '负面', '夸张', '可爱', '武器', '道具', '生活', '装饰', '节日']
const searchInput = ref(store.searchQuery)

function handleSearch() {
  store.searchQuery = searchInput.value
}

function handleSearchByTag(tag: string) {
  searchInput.value = tag
  store.searchQuery = tag
}

const typeFilters: CategoryFilterItem[] = [
  { value: 'all', label: '全部', icon: 'grid', count: computed(() => store.assets.length) },
  { value: 'background', label: '场景图片', icon: 'image', count: computed(() => store.assets.filter(a => a.type === 'background').length) },
  { value: 'character', label: '人物角色', icon: 'users', count: computed(() => store.assets.filter(a => a.type === 'character').length) },
  { value: 'action', label: '人物动作', icon: 'activity', count: computed(() => store.assets.filter(a => a.type === 'action').length) },
  { value: 'expression', label: '人物表情', icon: 'smile', count: computed(() => store.assets.filter(a => a.type === 'expression').length) },
  { value: 'prop', label: '物品道具', icon: 'package', count: computed(() => store.assets.filter(a => a.type === 'prop').length) },
  { value: 'effect', label: '特效贴图', icon: 'sparkles', count: computed(() => store.assets.filter(a => a.type === 'effect').length) },
  { value: 'voice', label: '人物音色', icon: 'mic', count: computed(() => store.assets.filter(a => a.type === 'voice').length),
    children: getSubTypes('voice'),
    childCounts: Object.fromEntries(getSubTypes('voice').map(s => [s.value, computed(() => store.assets.filter(a => a.subType === s.value).length)])),
  },
  { value: 'sound_effect', label: '其他音效', icon: 'volume-2', count: computed(() => store.assets.filter(a => a.type === 'sound_effect').length),
    children: getSubTypes('sound_effect'),
    childCounts: Object.fromEntries(getSubTypes('sound_effect').map(s => [s.value, computed(() => store.assets.filter(a => a.subType === s.value).length)])),
  },
  { value: 'video', label: '视频素材', icon: 'film', count: computed(() => store.assets.filter(a => a.type === 'video').length),
    children: getSubTypes('video'),
    childCounts: Object.fromEntries(getSubTypes('video').map(s => [s.value, computed(() => store.assets.filter(a => a.subType === s.value).length)])),
  },
]

function handleFilterSelect(type: AssetType | 'all', subType?: AssetSubType | 'all') {
  store.activeFilter = type
  store.activeSubFilter = subType || 'all'
  currentPage.value = 1
}

const filteredAssets = computed(() => store.getFilteredAssets())

const pageSize = 10
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredAssets.value.length / pageSize))

const paginatedAssets = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredAssets.value.slice(start, start + pageSize)
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function toggleSelect(id: string) {
  const idx = selectedAssets.value.indexOf(id)
  if (idx !== -1) {
    selectedAssets.value.splice(idx, 1)
  } else {
    selectedAssets.value.push(id)
  }
}

function deleteSelected() {
  batchDeleteConfirmVisible.value = true
}

function confirmBatchDelete() {
  selectedAssets.value.forEach(id => store.deleteAsset(id))
  selectedAssets.value = []
  batchMode.value = false
}

const batchDeleteConfirmVisible = ref(false)

function handleCardClick(asset: Asset) {
  if (batchMode.value) {
    toggleSelect(asset.id)
  } else {
    if (isAudioAsset(asset.type) || isVideoAsset(asset.type)) {
      openMediaPlayer(asset)
    } else {
      previewAsset.value = asset
    }
  }
}

function toggleBatchMode() {
  batchMode.value = !batchMode.value
  if (!batchMode.value) {
    selectedAssets.value = []
  }
}

function onAiGenerate(payload: { type: AssetType; subType: AssetSubType | '' | undefined; model: string; style: string; prompt: string; tags: string[] }) {
  const thumbnail = payload.type === 'voice' || payload.type === 'sound_effect'
    ? '/images/audio-cover.svg'
    : payload.type === 'video'
      ? '/images/video-cover.svg'
      : `/images/${payload.type === 'character' ? 'char-panda' : payload.type === 'background' ? 'bg-bamboo' : payload.type === 'expression' ? 'expr-happy' : 'prop-sword'}.jpg`
  store.addAsset({
    name: `AI生成-${payload.prompt.slice(0, 10)}`,
    type: payload.type,
    subType: payload.subType || undefined,
    thumbnail,
    tags: payload.tags,
  })
  showAiModal.value = false
}

function onUploadConfirm(payload: { files: { name: string; preview: string }[]; type: AssetType; subType: AssetSubType | ''; tags: string[] }) {
  payload.files.forEach(file => {
    store.addAsset({
      name: file.name.replace(/\.[^.]+$/, ''),
      type: payload.type,
      subType: payload.subType || undefined,
      thumbnail: file.preview,
      tags: payload.tags.length ? [...payload.tags] : ['上传'],
    })
  })
  showUploadModal.value = false
}

// 音频播放弹窗
const audioPlayerVisible = ref(false)
const audioPlayerInfo = ref<AudioPlayerInfo | null>(null)

// 视频播放弹窗
const videoPlayerVisible = ref(false)
const videoPlayerInfo = ref<VideoPlayerInfo | null>(null)

function openMediaPlayer(asset: Asset) {
  if (!asset.mediaUrl) return
  if (isVideoAsset(asset.type)) {
    videoPlayerInfo.value = {
      name: asset.name,
      thumbnail: asset.thumbnail,
      mediaUrl: asset.mediaUrl,
    }
    videoPlayerVisible.value = true
  } else {
    audioPlayerInfo.value = {
      name: asset.name,
      thumbnail: asset.thumbnail,
      mediaUrl: asset.mediaUrl,
    }
    audioPlayerVisible.value = true
  }
}

function closeAudioPlayer() {
  audioPlayerVisible.value = false
}

function closeVideoPlayer() {
  videoPlayerVisible.value = false
}
</script>

<template>
  <div class="animate-fade-in">
    <AssetsHeader
      @ai-generate="showAiModal = true"
      @upload="showUploadModal = true"
    />

    <div class="flex gap-6">
      <!-- Filter Sidebar -->
      <div class="w-48 shrink-0">
        <AssetCategoryFilter
          :items="typeFilters"
          :active-filter="store.activeFilter"
          :active-sub-filter="store.activeSubFilter"
          :show-counts="true"
          @select="handleFilterSelect"
        />
      </div>

      <!-- Main Content -->
      <div class="flex-1">
        <AssetToolbar
          v-model:search-input="searchInput"
          v-model:batch-mode="batchMode"
          v-model:view-mode="viewMode"
          :selected-count="selectedAssets.length"
          @search="handleSearch"
          @search-by-tag="handleSearchByTag"
          @delete-selected="deleteSelected"
        />

        <!-- Grid View -->
        <AssetGrid
          v-if="viewMode === 'grid'"
          :assets="paginatedAssets"
          :batch-mode="batchMode"
          :selected-ids="selectedAssets"
          @card-click="handleCardClick"
          @toggle-select="toggleSelect"
        />

        <!-- List View -->
        <AssetList
          v-else
          :assets="paginatedAssets"
          :batch-mode="batchMode"
          :selected-ids="selectedAssets"
          @card-click="handleCardClick"
          @toggle-select="toggleSelect"
          @preview="previewAsset = $event"
          @delete="store.deleteAsset($event)"
          @play-media="openMediaPlayer"
        />

        <XbEmpty
          v-if="filteredAssets.length === 0"
          :icon="'package'"
          description="没有找到匹配的素材"
        >
          <template #action>
            <button class="btn-primary text-xs mt-4" @click="showAiModal = true">用AI生成素材</button>
          </template>
        </XbEmpty>

        <!-- Pagination -->
        <XbPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="goToPage"
        />
      </div>
    </div>

    <!-- AI Generation Modal -->
    <AiGenerateModal
      :visible="showAiModal"
      :initial-type="aiType"
      @close="showAiModal = false"
      @generate="onAiGenerate"
    />

    <!-- Asset Preview Modal -->
    <AssetPreviewModal
      :visible="!!previewAsset"
      :asset="previewAsset"
      @close="previewAsset = null"
    />

    <!-- Audio Player Modal -->
    <AudioPlayerModal
      :visible="audioPlayerVisible"
      :media="audioPlayerInfo"
      @close="closeAudioPlayer"
    />

    <!-- Video Player Modal -->
    <VideoPlayerModal
      :visible="videoPlayerVisible"
      :media="videoPlayerInfo"
      @close="closeVideoPlayer"
    />

    <!-- Upload Modal -->
    <AssetUploadModal
      :visible="showUploadModal"
      :all-tags="allTags"
      @close="showUploadModal = false"
      @confirm="onUploadConfirm"
    />

    <!-- Batch Delete Confirm -->
    <XbConfirmModal
      v-model:visible="batchDeleteConfirmVisible"
      title="批量删除确认"
      :message="`确定要删除选中的 ${selectedAssets.length} 个素材吗？此操作不可恢复。`"
      confirm-text="删除"
      confirm-type="danger"
      @confirm="confirmBatchDelete"
    />
  </div>
</template>
