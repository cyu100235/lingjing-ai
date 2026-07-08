<script setup lang="ts">
import { useAssetStore, type Asset, type AssetType, type AssetSubType } from '@/stores/assets'
import { isAudioAsset, isVideoAsset } from '@/utils/media'
import { type CategoryFilterItem } from '@/config/assetTypes'
import { getAssetTypeList } from '@/api/assetsType'
import { getAssetList, deleteAsset as deleteAssetApi, updateAsset, type AssetItem, type AssetType as ApiAssetType } from '@/api/assets'
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

// ===================== API 类型映射 =====================
const API_TO_FRONTEND_TYPE_MAP: Record<ApiAssetType, AssetType> = {
  '10': 'background',
  '20': 'character',
  '30': 'prop',
  '40': 'voice',
  '50': 'sound_effect',
  '60': 'video',
}

const FRONTEND_TO_API_TYPE_MAP: Record<AssetType, ApiAssetType | undefined> = {
  'background': '10',
  'character': '20',
  'prop': '30',
  'voice': '40',
  'sound_effect': '50',
  'video': '60',
  'expression': undefined,
  'action': undefined,
  'effect': undefined,
}

/** 将 API 返回的资产项转换为前端 Asset 类型 */
function transformAssetItem(item: AssetItem): Asset {
  return {
    id: String(item.id),
    name: item.name,
    type: API_TO_FRONTEND_TYPE_MAP[item.type as ApiAssetType] ?? 'character',
    thumbnail: item.thumb || item.media_url,
    mediaUrl: item.media_url,
    duration: item.duration,
    tags: item.tags ? item.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    createdAt: item.create_at ? item.create_at.split(' ')[0] : '',
  }
}

// ===================== 资产列表 API 状态 =====================
const assets = ref<Asset[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const pageSize = 20
const currentPage = ref(1)
const total = ref(0)
const lastPage = ref(1)

/** 获取资产列表 */
async function fetchAssets() {
  loading.value = true
  error.value = null
  try {
    const params: Parameters<typeof getAssetList>[0] = {
      page: currentPage.value,
      limit: pageSize,
    }
    if (store.activeFilter !== 'all') {
      const apiType = FRONTEND_TO_API_TYPE_MAP[store.activeFilter]
      if (apiType) {
        params.type = apiType
      }
    }
    if (store.searchQuery) {
      params.name = store.searchQuery
    }
    const res = await getAssetList(params)
    assets.value = res.data.map(transformAssetItem)
    total.value = res.total
    lastPage.value = res.last_page
  } catch (err: any) {
    error.value = err.message || '获取资产列表失败，请稍后重试'
    assets.value = []
    total.value = 0
    lastPage.value = 1
  } finally {
    loading.value = false
  }
}

/** 提交搜索关键词并重新获取数据 */
function handleSearch() {
  store.searchQuery = searchInput.value
  currentPage.value = 1
  fetchAssets()
}

/** 通过标签搜索，同步更新搜索框和 store */
function handleSearchByTag(tag: string) {
  searchInput.value = tag
  store.searchQuery = tag
  currentPage.value = 1
  fetchAssets()
}

const typeFilters = shallowRef<CategoryFilterItem[]>([
  { value: 'all', label: '全部', icon: 'grid', count: computed(() => total.value) },
])

/** 从接口获取资产类型列表，构建侧边栏筛选数据 */
async function fetchAssetTypeList() {
  try {
    const res = await getAssetTypeList()
    typeFilters.value = [
      { value: 'all', label: '全部', icon: 'grid', count: computed(() => total.value) },
      ...res.map(item => {
        const frontendType = API_TO_FRONTEND_TYPE_MAP[item.value as ApiAssetType]
        return {
          value: (frontendType || item.value) as AssetType,
          label: item.label,
          icon: item.icon || 'grid',
          count: computed(() => assets.value.filter(a => a.type === frontendType).length),
        }
      }),
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
  fetchAssets()
}

/** 根据筛选条件过滤后的资产列表（子类型和标签在前端补充过滤） */
const filteredAssets = computed(() => {
  let filtered = assets.value
  if (store.activeSubFilter !== 'all') {
    filtered = filtered.filter(a => a.subType === store.activeSubFilter)
  }
  if (store.searchQuery) {
    const query = store.searchQuery.toLowerCase()
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(query) ||
      a.tags.some(t => t.toLowerCase().includes(query))
    )
  }
  return filtered
})

const totalPages = computed(() => Math.max(1, lastPage.value))

/** 当前页展示的资产列表（已做前端过滤） */
const paginatedAssets = computed(() => filteredAssets.value)

/** 跳转到指定页码 */
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    fetchAssets()
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

/** 确认批量删除，调用 API 逐个删除并刷新列表 */
async function confirmBatchDelete() {
  try {
    await Promise.allSettled(
      selectedAssets.value.map(id => deleteAssetApi(Number(id)))
    )
    selectedAssets.value = []
    batchMode.value = false
    await fetchAssets()
  } catch (err) {
    console.error('批量删除失败', err)
  }
}

const batchDeleteConfirmVisible = ref(false)

/** 单个删除处理 */
async function handleDeleteAsset(id: string) {
  try {
    await deleteAssetApi(Number(id))
    await fetchAssets()
  } catch (err) {
    console.error('删除资产失败', err)
  }
}

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

/** 上传确认回调：弹窗内部已完成上传和创建资产，关闭弹窗并刷新列表 */
function onUploadConfirm() {
  showUploadModal.value = false
  fetchAssets()
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

/** 重命名弹窗状态 */
const renameModalVisible = ref(false)
const renameAsset = ref<Asset | null>(null)
const renameName = ref('')
const renameLoading = ref(false)

/** 打开重命名弹窗 */
function openRenameModal(asset: Asset) {
  renameAsset.value = asset
  renameName.value = asset.name
  renameModalVisible.value = true
}

/** 确认重命名：调用更新接口修改名称，成功后刷新列表 */
async function confirmRename() {
  if (!renameAsset.value) return
  const trimmed = renameName.value.trim()
  if (!trimmed) return
  renameLoading.value = true
  try {
    await updateAsset({ id: Number(renameAsset.value.id), name: trimmed })
    renameModalVisible.value = false
    await fetchAssets()
  } catch (err) {
    console.error('重命名资产失败', err)
  } finally {
    renameLoading.value = false
  }
}

onMounted(() => {
  fetchAssetTypeList()
  fetchAssets()
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

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <XbIcon name="loader-2" :size="24" class="animate-spin text-brand" />
          <span class="ml-2 text-sm text-content-secondary">加载中...</span>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
          <XbIcon name="alert-circle" :size="32" class="text-danger mb-2" />
          <p class="text-sm text-content-secondary">{{ error }}</p>
          <button class="btn-primary text-xs mt-4" @click="fetchAssets">重新加载</button>
        </div>

        <template v-else>
          <!-- Grid View -->
          <AssetGrid
            v-if="viewMode === 'grid'"
            :assets="paginatedAssets"
            :batch-mode="batchMode"
            :selected-ids="selectedAssets"
            @card-click="handleCardClick"
            @toggle-select="toggleSelect"
            @request-rename="openRenameModal"
            @delete="handleDeleteAsset($event)"
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
            @delete="handleDeleteAsset($event)"
            @play-media="openMediaPlayer"
            @request-rename="openRenameModal"
          />
        </template>

        <XbEmpty
          v-if="!loading && !error && paginatedAssets.length === 0"
          :icon="'package'"
          description="没有找到匹配的素材"
        >
          <template #action>
            <button class="btn-primary text-xs mt-4" @click="goToGenerate">用AI生成素材</button>
          </template>
        </XbEmpty>

        <!-- Pagination -->
        <XbPagination
          v-if="!loading && !error && totalPages > 1"
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

    <!-- Rename Modal -->
    <XbConfirmModal
      v-model:visible="renameModalVisible"
      title="重命名"
      confirm-text="确认"
      :loading="renameLoading"
      :close-on-overlay="false"
      @confirm="confirmRename"
    >
      <XbInput
        v-model="renameName"
        placeholder="请输入资产名称"
        :maxlength="100"
        size="md"
        @keydown.enter="confirmRename"
      />
    </XbConfirmModal>

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
