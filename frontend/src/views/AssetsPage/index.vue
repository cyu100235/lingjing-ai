<script setup lang="ts">
import { useAssetStore, type Asset, type AssetType, type AssetSubType } from '@/stores/assets'
import { isAudioAsset, isVideoAsset } from '@/utils/media'
import { type CategoryFilterItem } from '@/config/assetTypes'
import { getAssetTypeList } from '@/api/assetsType'
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

const router = useRouter()
const store = useAssetStore()

const viewMode = ref<'grid' | 'list'>('grid')
const showUploadModal = ref(false)
const selectedAssets = ref<string[]>([])
const batchMode = ref(false)
const previewAsset = ref<Asset | null>(null)
const allTags = ['主角', '配角', '古风', '武侠', '萌宠', '搞笑', '室内', '室外', '自然', '宏伟', '正面', '负面', '夸张', '可爱', '武器', '道具', '生活', '装饰', '节日']
const searchInput = ref(store.searchQuery)

/** 提交搜索关键词到 store */
function handleSearch() {
  store.searchQuery = searchInput.value
}

/** 通过标签搜索，同步更新搜索框和 store */
function handleSearchByTag(tag: string) {
  searchInput.value = tag
  store.searchQuery = tag
}

const typeFilters = shallowRef<CategoryFilterItem[]>([
  { value: 'all', label: '全部', icon: 'grid', count: computed(() => store.assets.length) },
])

/** 从接口获取资产类型列表，构建侧边栏筛选数据（含类型计数和子类型计数） */
async function fetchAssetTypeList() {
  try {
    const res = await getAssetTypeList()
    typeFilters.value = [
      { value: 'all', label: '全部', icon: 'grid', count: computed(() => store.assets.length) },
      ...res.map(item => ({
        value: item.value as AssetType,
        label: item.label,
        icon: item.icon || 'grid',
        count: computed(() => store.assets.filter(a => a.type === item.value).length),
      })),
    ]
  } catch (error) {
    console.error('获取资产类型列表失败', error)
  }
}

/** 选中分类筛选项，更新 store 中的活跃筛选状态并重置分页 */
function handleFilterSelect(type: AssetType | 'all', subType?: AssetSubType | 'all') {
  store.activeFilter = type
  store.activeSubFilter = subType || 'all'
  currentPage.value = 1
}

/** 根据筛选条件过滤后的资产列表 */
const filteredAssets = computed(() => store.getFilteredAssets())

const pageSize = 10
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredAssets.value.length / pageSize))

/** 当前分页的资产切片 */
const paginatedAssets = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredAssets.value.slice(start, start + pageSize)
})

/** 跳转到指定页码 */
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

/** 切换资产的选中状态（批量模式下使用） */
function toggleSelect(id: string) {
  const idx = selectedAssets.value.indexOf(id)
  if (idx !== -1) {
    selectedAssets.value.splice(idx, 1)
  } else {
    selectedAssets.value.push(id)
  }
}

/** 打开批量删除确认弹窗 */
function deleteSelected() {
  batchDeleteConfirmVisible.value = true
}

/** 确认批量删除，逐个删除选中资产并退出批量模式 */
function confirmBatchDelete() {
  selectedAssets.value.forEach(id => store.deleteAsset(id))
  selectedAssets.value = []
  batchMode.value = false
}

const batchDeleteConfirmVisible = ref(false)

/** 处理资产卡片点击：批量模式下切换选中，普通模式下音频/视频打开播放器，其余打开预览 */
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


/** 跳转至 AI 生成资产页面 */
function goToGenerate() {
  router.push({ name: 'assets-generate' })
}

/** 上传确认回调：遍历上传文件逐个添加到 store，无标签时默认标记为「上传」，关闭弹窗 */
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

/** 打开媒体播放器：根据资产类型打开视频或音频播放弹窗 */
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

/** 关闭音频播放弹窗 */
function closeAudioPlayer() {
  audioPlayerVisible.value = false
}

/** 关闭视频播放弹窗 */
function closeVideoPlayer() {
  videoPlayerVisible.value = false
}

onMounted(() => {
  // 获取资产类型列表
  fetchAssetTypeList()
})
</script>

<template>
  <div class="animate-fade-in">
    <AssetsHeader
      @upload="showUploadModal = true"
      @generate="goToGenerate"
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
            <button class="btn-primary text-xs mt-4" @click="goToGenerate">用AI生成素材</button>
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
