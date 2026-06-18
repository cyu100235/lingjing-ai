<script setup lang="ts">
import AudioPlayerModal from '@/components/AudioPlayerModal/index.vue'
import type { AudioPlayerInfo } from '@/components/AudioPlayerModal/index.vue'
import VideoPlayerModal from '@/components/VideoPlayerModal/index.vue'
import type { VideoPlayerInfo } from '@/components/VideoPlayerModal/index.vue'
import { getVideoFirstFrame } from '@/utils/media'

type MainTab = 'image' | 'video' | 'audio'

export type ResultFilter = 'all' | 'video' | 'image' | 'audio'

export type ResultItem = {
  id: string
  type: MainTab
  thumbnail: string
  mediaUrl: string
  prompt: string
  status?: string
  createAt?: string
  modelName?: string
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
  { label: '音频', value: 'audio' as const },
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
  return item.thumbnail
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

function openPreview(item: ResultItem) {
  // 只有成功状态才可预览
  if (item.status !== 'success' && item.status !== 'completed') return
  previewPrompt.value = item.prompt || ''
  if (item.type === 'image') {
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
    <div v-else class="w-full px-5 py-2 grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));">
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
      <div class="flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-black">
        <img :src="previewImageSrc" class="max-w-full max-h-full object-contain" />
      </div>
      <div v-if="previewPrompt" class="w-[25rem] shrink-0 border-l border-border bg-surface-elevated flex flex-col">
        <div class="px-4 py-3 border-b border-border flex-shrink-0">
          <h4 class="text-sm font-medium text-content">提示词</h4>
        </div>
        <div class="flex-1 overflow-y-auto px-4 py-3">
          <p class="text-xs text-content-secondary leading-relaxed whitespace-pre-wrap break-words">{{ previewPrompt.replace(/\\n/g, '\n') }}</p>
        </div>
      </div>
    </div>
  </XbModal>

  <!-- 音频预览弹窗 -->
  <AudioPlayerModal
    :visible="previewVisible && !!previewAudioMedia"
    :media="previewAudioMedia"
    :prompt="previewPrompt"
    @close="closePreview"
  />

  <!-- 视频预览弹窗 -->
  <VideoPlayerModal
    :visible="previewVisible && !!previewVideoMedia"
    :media="previewVideoMedia"
    :prompt="previewPrompt"
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
</template>
