<script setup lang="ts">
import AudioPlayerModal from '@/components/AudioPlayerModal/index.vue'
import type { AudioPlayerInfo } from '@/components/AudioPlayerModal/index.vue'
import VideoPlayerModal from '@/components/VideoPlayerModal/index.vue'
import type { VideoPlayerInfo } from '@/components/VideoPlayerModal/index.vue'
import ModelLogDetailInfo from '@/components/ModelLogDetailInfo/index.vue'
import { getVideoFirstFrame } from '@/utils/media'
import { getAssetTypeList, type AssetTypeItem } from '@/api/assetsType'
import { createAsset, type AssetType } from '@/api/assets'
import { XbMessage } from '@/xbUi'

type MainTab = 'image' | 'video' | 'audio'

export type ResultFilter = 'all' | 'video' | 'image' | 'audio'

export type ResultItem = {
  id: string
  type: MainTab
  thumbnail: string
  /** 压缩后的缩略图（base64 或原 URL），用于列表展示，优先级高于 thumbnail */
  thumbnailCompressed?: string
  mediaUrl: string
  prompt: string
  status?: string
  createAt?: string
  modelName?: string
  /** 分辨率，如 1024x1024 */
  resolution?: string
  /** 实际消费金额格式化文本 */
  saleAmount?: string
}

const props = defineProps<{
  results: ResultItem[]
  currentPage: number
  totalPages: number
  resultFilter: ResultFilter
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:resultFilter': [filter: ResultFilter]
  'delete': [id: string]
  'batch-delete': [ids: string[]]
}>()

// ===================== 资产类型标签 =====================
const TYPE_LABELS: Record<MainTab, string> = {
  image: '图片',
  audio: '音频',
  video: '视频',
}

// ===================== 多选状态 =====================
const isSelectMode = ref(false)
const selectedIds = ref<Set<string>>(new Set())

const allSelected = computed(() =>
  props.results.length > 0 && props.results.every(r => selectedIds.value.has(r.id))
)

function toggleSelectMode() {
  isSelectMode.value = !isSelectMode.value
  if (!isSelectMode.value) selectedIds.value = new Set()
}

function toggleSelect(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(props.results.map(r => r.id))
  }
}

// ===================== 删除确认弹窗 =====================
const confirmVisible = ref(false)
const confirmMessage = ref('')
const pendingDeleteId = ref<string | null>(null)
const pendingBatchIds = ref<string[]>([])

/** 触发单项删除确认 */
function handleDelete(id: string, e: MouseEvent) {
  e.stopPropagation()
  pendingDeleteId.value = id
  pendingBatchIds.value = []
  confirmMessage.value = '确定要删除该条记录吗？'
  confirmVisible.value = true
}

/** 触发批量删除确认 */
function handleBatchDelete() {
  const ids = [...selectedIds.value]
  if (!ids.length) return
  pendingBatchIds.value = ids
  pendingDeleteId.value = null
  confirmMessage.value = `确定要删除选中的 ${ids.length} 条记录吗？`
  confirmVisible.value = true
}

// ===================== 加入资产库弹窗 =====================
const addToAssetsVisible = ref(false)
const assetTypeOptions = ref<AssetTypeItem[]>([])
const assetTypeLoading = ref(false)
const addToAssetsLoading = ref(false)

/** 当前待加入的有效项（成功且有媒体地址） */
const pendingAddItems = ref<ResultItem[]>([])

/**
 * 按媒体类型分组的资产类型选项：
 * image -> type==='image' 的后端类型
 * audio -> type==='audio' 的后端类型
 * video -> type==='video' 的后端类型
 */
const groupedTypeOptions = computed(() => {
  const mediaTypes = [...new Set(pendingAddItems.value.map(r => r.type))]
  return mediaTypes.map(mt => ({
    mediaType: mt,
    label: TYPE_LABELS[mt],
    options: assetTypeOptions.value.filter(o => o.type === mt),
  }))
})

/** 用户为每种媒体类型选择的目标资产类型值，key 为 mediaType */
const selectedAssetType = ref<Record<string, AssetType>>({})

/** 是否所有媒体类型都已选择 */
const allTypeSelected = computed(() =>
  groupedTypeOptions.value.every(g => !!selectedAssetType.value[g.mediaType])
)

/** 批量加入资产库：打开类型选择弹窗 */
async function handleBatchAddToAssets() {
  const ids = [...selectedIds.value]
  if (!ids.length) return
  const items = props.results.filter(r => ids.includes(r.id))
  const validItems = items.filter(
    r => (r.status === 'success' || r.status === 'completed') && r.mediaUrl
  )
  if (!validItems.length) {
    XbMessage.warning('选中的记录中没有可加入的资产（仅支持已成功生成的记录）')
    return
  }
  pendingAddItems.value = validItems
  selectedAssetType.value = {}
  // 拉取资产类型列表
  assetTypeLoading.value = true
  try {
    assetTypeOptions.value = await getAssetTypeList()
    // 自动预选每种媒体类型的第一个可用选项
    const mediaTypes = [...new Set(validItems.map(r => r.type))]
    mediaTypes.forEach(mt => {
      const first = assetTypeOptions.value.find(o => o.type === mt)
      if (first) selectedAssetType.value[mt] = first.value as AssetType
    })
  } catch {
    XbMessage.error('获取资产类型失败，请稍候重试')
    assetTypeLoading.value = false
    return
  }
  assetTypeLoading.value = false
  addToAssetsVisible.value = true
}

/** 确认加入资产库 */
async function confirmAddToAssets() {
  if (!allTypeSelected.value) return
  addToAssetsLoading.value = true
  let successCount = 0
  let failCount = 0
  await Promise.allSettled(
    pendingAddItems.value.map(async (item) => {
      const assetType = selectedAssetType.value[item.type]
      const assetTypeLabel = assetTypeOptions.value.find(o => o.value === assetType)?.label || item.type
      const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase()
      const assetName = `${assetTypeLabel}-${randomSuffix}`
      try {
        await createAsset({
          name: assetName,
          type: assetType,
          source: '20',
          media_url: item.mediaUrl,
          thumb: item.thumbnail || undefined,
        })
        successCount++
      } catch {
        failCount++
      }
    })
  )
  addToAssetsLoading.value = false
  addToAssetsVisible.value = false
  if (successCount > 0 && failCount === 0) {
    XbMessage.success(`已成功加入 ${successCount} 个资产`)
  } else if (successCount > 0 && failCount > 0) {
    XbMessage.warning(`成功加入 ${successCount} 个，${failCount} 个失败`)
  } else {
    XbMessage.error('加入资产库失败，请稍候重试')
  }
}

/** 确认删除 */
function onConfirmDelete() {
  if (pendingDeleteId.value) {
    emit('delete', pendingDeleteId.value)
  } else if (pendingBatchIds.value.length) {
    emit('batch-delete', pendingBatchIds.value)
    selectedIds.value = new Set()
    isSelectMode.value = false
  }
  pendingDeleteId.value = null
  pendingBatchIds.value = []
}

const RESULT_FILTERS = [
  { label: '全部', value: 'all' as const },
  { label: '视频', value: 'video' as const },
  { label: '图片', value: 'image' as const },
]

// ===================== 视频第一帧封面缓存 =====================
const videoThumbnails = reactive<Record<string, string>>({})

/**
 * 获取展示缩略图：视频类型优先用第一帧，否则用原始 thumbnail
 */
function getThumbnail(item: ResultItem): string {
  if (item.type === 'video') {
    const cached = videoThumbnails[item.id]
    if (cached) return cached
    if (item.thumbnail) return item.thumbnail
  }
  // 图片类型优先使用压缩后的缩略图
  return item.thumbnailCompressed || item.thumbnail
}

// 监听 results 变化，为缺少封面的视频项提取第一帧
watch(
  () => props.results,
  (results) => {
    results
      .filter(r => r.type === 'video' && r.mediaUrl && !videoThumbnails[r.id])
      .forEach(async (r) => {
        try {
          const frame = await getVideoFirstFrame(r.mediaUrl)
          videoThumbnails[r.id] = frame
        } catch {
          // 提取失败时静默忽略，仍使用原始 thumbnail
        }
      })
  },
  { immediate: true, deep: true }
)

// ===================== 预览弹窗状态 =====================
const previewVisible = ref(false)
const previewImageSrc = ref('')
const previewPrompt = ref('')
const previewAudioMedia = ref<AudioPlayerInfo | null>(null)
const previewVideoMedia = ref<VideoPlayerInfo | null>(null)
const previewItem = ref<ResultItem | null>(null)

const previewDetails = computed(() => {
  if (!previewItem.value) return undefined
  return {
    modelName: previewItem.value.modelName,
    status: previewItem.value.status,
    type: previewItem.value.type,
    resolution: previewItem.value.resolution,
    saleAmount: previewItem.value.saleAmount,
  }
})

// ===================== 图片预览缩放与全屏 =====================
const imagePreviewContainerRef = ref<HTMLDivElement | null>(null)
const imageScale = ref(1)
const imageOffset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const dragMoved = ref(false)
const DRAG_THRESHOLD = 5

/** 鼠标滚轮缩放（仅全屏模式下可用） */
function onImageWheel(e: WheelEvent) {
  e.preventDefault()
  if (document.fullscreenElement !== imagePreviewContainerRef.value) return
  const step = e.deltaY > 0 ? -0.15 : 0.15
  imageScale.value = Math.min(Math.max(imageScale.value + step, 0.5), 5)
}

/** 按下左键开始拖动 */
function onImageMouseDown(e: MouseEvent) {
  e.preventDefault()
  isDragging.value = true
  dragMoved.value = false
  dragStart.value = {
    x: e.clientX - imageOffset.value.x,
    y: e.clientY - imageOffset.value.y,
  }
}

/** 拖动中更新偏移 */
function onImageMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const newX = e.clientX - dragStart.value.x
  const newY = e.clientY - dragStart.value.y
  if (
    Math.abs(newX - imageOffset.value.x) > DRAG_THRESHOLD ||
    Math.abs(newY - imageOffset.value.y) > DRAG_THRESHOLD
  ) {
    dragMoved.value = true
  }
  imageOffset.value = { x: newX, y: newY }
}

/** 释放左键结束拖动 */
function onImageMouseUp() {
  isDragging.value = false
}

/** 点击图片切换全屏（拖动时不触发） */
function toggleImageFullscreen() {
  if (dragMoved.value) {
    dragMoved.value = false
    return
  }
  const el = imagePreviewContainerRef.value
  if (!el) return
  if (document.fullscreenElement === el) {
    document.exitFullscreen()
  } else {
    el.requestFullscreen()
  }
}

/** 退出全屏时重置缩放与偏移 */
function onFullscreenChange() {
  if (document.fullscreenElement !== imagePreviewContainerRef.value) {
    imageScale.value = 1
    imageOffset.value = { x: 0, y: 0 }
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('mousemove', onImageMouseMove)
  document.addEventListener('mouseup', onImageMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('mousemove', onImageMouseMove)
  document.removeEventListener('mouseup', onImageMouseUp)
})

function openPreview(item: ResultItem) {
  // 只有成功状态才可预览
  if (item.status !== 'success' && item.status !== 'completed') return
  previewItem.value = item
  previewPrompt.value = item.prompt || ''
  if (item.type === 'image') {
    imageScale.value = 1
    imageOffset.value = { x: 0, y: 0 }
    previewImageSrc.value = item.mediaUrl || item.thumbnail
    previewVisible.value = true
  } else if (item.type === 'audio') {
    previewAudioMedia.value = {
      name: item.prompt || '音频',
      thumbnail: item.thumbnail,
      mediaUrl: item.mediaUrl,
    }
    previewVisible.value = true
  } else if (item.type === 'video') {
    previewVideoMedia.value = {
      name: item.prompt || '视频',
      thumbnail: item.thumbnail,
      mediaUrl: item.mediaUrl,
    }
    previewVisible.value = true
  }
}

function closePreview() {
  previewVisible.value = false
  previewImageSrc.value = ''
  previewPrompt.value = ''
  previewAudioMedia.value = null
  previewVideoMedia.value = null
  previewItem.value = null
  imageScale.value = 1
  imageOffset.value = { x: 0, y: 0 }
  if (document.fullscreenElement === imagePreviewContainerRef.value) {
    document.exitFullscreen()
  }
}

function statusClass(status?: string) {
  switch (status) {
    case 'success': return 'bg-green-500/10 text-green-500'
    case 'failed': return 'bg-red-500/10 text-red-500'
    case 'running': return 'bg-blue-500/10 text-blue-500'
    case 'pending': return 'bg-amber-500/10 text-amber-500'
    default: return 'bg-surface-overlay text-content-tertiary'
  }
}

function statusText(status?: string) {
  switch (status) {
    case 'success': return '成功'
    case 'failed': return '失败'
    case 'running': return '生成中'
    case 'pending': return '待执行'
    default: return status || '未知'
  }
}
</script>

<template>
  <!-- 顶部筛选栏 -->
  <div class="flex items-center justify-between gap-2 px-5 py-3 shrink-0">
    <div class="flex gap-1">
      <XbButton
        v-for="f in RESULT_FILTERS"
        :key="f.value"
        :type="props.resultFilter === f.value ? 'primary' : 'secondary'"
        size="sm"
        @click="emit('update:resultFilter', f.value)"
      >
        {{ f.label }}
      </XbButton>
    </div>
    <!-- 多选操作区 -->
    <div class="flex items-center gap-2">
      <template v-if="isSelectMode">
        <span class="text-xs text-content-secondary">
          已选 {{ selectedIds.size }} 项
        </span>
        <XbButton size="sm" type="secondary" @click="toggleSelectAll">
          {{ allSelected ? '取消全选' : '全选' }}
        </XbButton>
        <XbButton
          size="sm"
          type="primary"
          :disabled="selectedIds.size === 0"
          @click="handleBatchAddToAssets"
        >
          加入我的资产
        </XbButton>
        <XbButton
          size="sm"
          type="danger"
          :disabled="selectedIds.size === 0"
          @click="handleBatchDelete"
        >
          删除选中
        </XbButton>
        <XbButton size="sm" type="secondary" @click="toggleSelectMode">
          取消
        </XbButton>
      </template>
      <XbButton v-else size="sm" type="secondary" @click="toggleSelectMode">
        批量操作
      </XbButton>
    </div>
  </div>

  <!-- 结果内容区 -->
  <div class="flex-1 flex flex-col overflow-y-auto">
    <!-- 空状态 -->
    <div v-if="results.length === 0" class="flex-1 flex items-center justify-center">
      <XbEmpty
        icon="sparkles"
        :icon-size="48"
        description="生成的资产将展示在这里"
      />
    </div>

    <!-- 生成结果网格 -->
    <div v-else class="w-full px-5 py-2 grid gap-4" style="grid-template-columns: repeat(5, 1fr);">
      <div
        v-for="item in results"
        :key="item.id"
        class="group aspect-[4/3] rounded bg-surface-elevated border border-border overflow-hidden flex flex-col relative cursor-pointer transition-colors"
        :class="isSelectMode && selectedIds.has(item.id) ? 'border-brand ring-1 ring-brand' : 'hover:border-brand/40'"
        @click="isSelectMode ? toggleSelect(item.id) : openPreview(item)"
      >
        <!-- 缩略图区域 -->
        <div class="flex-1 flex items-center justify-center overflow-hidden relative">
          <img v-if="getThumbnail(item)" :src="getThumbnail(item)" class="w-full h-full object-cover" />
          <XbIcon v-else name="image" :size="32" class="text-content-tertiary/40" />

          <!-- 多选勾选框 -->
          <div
            v-if="isSelectMode"
            class="absolute top-1.5 left-1.5 w-5 h-5 rounded border-2 flex items-center justify-center pointer-events-none"
            :class="selectedIds.has(item.id) ? 'bg-brand border-brand' : 'bg-black/40 border-white/70'"
          >
            <XbIcon v-if="selectedIds.has(item.id)" name="check" :size="12" class="text-white" />
          </div>

          <!-- 单项删除按钮 -->
          <button
            v-if="!isSelectMode"
            class="absolute top-1.5 right-1.5 w-6 h-6 rounded bg-black/50 hover:bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            @click="handleDelete(item.id, $event)"
          >
            <XbIcon name="x" :size="12" />
          </button>
        </div>

        <!-- 底部信息栏 -->
        <div class="px-3 py-2 bg-surface border-t border-border">
          <p class="text-xs text-content-secondary truncate" :title="item.prompt">
            {{ item.prompt || '无提示词' }}
          </p>
          <div class="flex items-center justify-between mt-1.5">
            <!-- 左侧：模型名称 -->
            <span class="text-[10px] text-content-tertiary truncate max-w-[60%]" :title="item.modelName">
              {{ item.modelName || '—' }}
            </span>
            <!-- 右侧：资产类型 + 状态 -->
            <div class="flex items-center gap-1 shrink-0">
              <span
                v-if="item.status"
                class="text-[10px] px-1.5 py-0.5 rounded-md font-medium inline-flex items-center gap-1"
                :class="statusClass(item.status)"
              >
                <XbIcon
                  v-if="item.status === 'running'"
                  name="loader-2"
                  :size="10"
                  class="animate-spin"
                />
                {{ statusText(item.status) }}
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-overlay text-content-tertiary font-medium">
                {{ TYPE_LABELS[item.type] }}
              </span>
            </div>
          </div>
          <!-- 分辨率与实际消费 -->
          <div class="flex items-center justify-between mt-1.5">
            <span class="text-[10px] text-content-tertiary" :title="item.resolution">
              {{ item.resolution || '—' }}
            </span>
            <span class="text-[10px] px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-500 font-medium">
              {{ item.saleAmount || '—' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="shrink-0 py-3">
      <XbPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:current-page="emit('update:currentPage', $event)"
      />
    </div>
  </div>

  <!-- 图片预览弹窗 -->
  <XbModal
    :visible="previewVisible && !!previewImageSrc"
    width="w-[70rem]"
    no-padding
    :show-close="true"
    @close="closePreview"
  >
    <div class="flex h-[70vh]">
      <div
        ref="imagePreviewContainerRef"
        class="flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-black"
        @wheel.prevent="onImageWheel"
      >
        <img
          :src="previewImageSrc"
          class="max-w-full max-h-full object-contain select-none"
          :class="isDragging ? 'cursor-grabbing transition-none' : 'cursor-grab transition-transform duration-200'"
          :style="{ transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageScale})` }"
          draggable="false"
          @mousedown.prevent="onImageMouseDown"
          @click.stop="toggleImageFullscreen"
        />
      </div>
      <div v-if="previewPrompt || previewItem" class="w-[25rem] shrink-0 border-l border-border bg-surface-elevated flex flex-col">
        <ModelLogDetailInfo
          v-if="previewItem"
          :model-name="previewItem.modelName"
          :status="previewItem.status"
          :type="previewItem.type"
          :resolution="previewItem.resolution"
          :sale-amount="previewItem.saleAmount"
        />
        <div v-if="previewPrompt" class="flex-1 overflow-y-auto px-4 py-3">
          <h4 class="text-sm font-medium text-content mb-2">提示词</h4>
          <p class="text-xs text-content-secondary leading-relaxed whitespace-pre-wrap break-words">
            {{ previewPrompt.replace(/\\n/g, '\n') }}
          </p>
        </div>
      </div>
    </div>
  </XbModal>

  <!-- 音频预览弹窗 -->
  <AudioPlayerModal
    :visible="previewVisible && !!previewAudioMedia"
    :media="previewAudioMedia"
    :prompt="previewPrompt"
    :details="previewDetails"
    @close="closePreview"
  />

  <!-- 视频预览弹窗 -->
  <VideoPlayerModal
    :visible="previewVisible && !!previewVideoMedia"
    :media="previewVideoMedia"
    :prompt="previewPrompt"
    :details="previewDetails"
    :show-like="false"
    @close="closePreview"
  />

  <!-- 删除确认弹窗 -->
  <XbConfirmModal
    v-model:visible="confirmVisible"
    title="删除确认"
    :message="confirmMessage"
    confirm-text="确认删除"
    confirm-type="danger"
    @confirm="onConfirmDelete"
  />

  <!-- 加入资产库 - 类型选择弹窗 -->
  <XbModal
    :visible="addToAssetsVisible"
    title="选择资产类型"
    width="w-[30rem]"
    @close="addToAssetsVisible = false"
  >
    <div class="space-y-5">
      <p class="text-xs text-content-secondary">
        共
        <span class="font-medium text-content">
          {{ pendingAddItems.length }}
        </span>
        条记录将加入资产库，请为每种媒体类型选择目标分类。
      </p>

      <div
        v-for="group in groupedTypeOptions"
        :key="group.mediaType"
        class="space-y-2"
      >
        <label class="text-xs font-medium text-content-secondary">
          {{ group.label }} 类型
          <span class="text-red-400">*</span>
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="opt in group.options"
            :key="opt.value"
            class="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all duration-150"
            :class="selectedAssetType[group.mediaType] === opt.value
              ? 'border-brand bg-brand/10 text-brand'
              : 'border-border text-content-secondary hover:border-brand/30'"
            @click="selectedAssetType[group.mediaType] = opt.value as AssetType"
          >
            <XbIcon :name="opt.icon || 'layers'" :size="14" />
            <span class="truncate">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <XbButton type="secondary" size="sm" @click="addToAssetsVisible = false">
          取消
        </XbButton>
        <XbButton
          type="primary"
          size="sm"
          :disabled="!allTypeSelected"
          :loading="addToAssetsLoading"
          @click="confirmAddToAssets"
        >
          确认加入
        </XbButton>
      </div>
    </template>
  </XbModal>
</template>
