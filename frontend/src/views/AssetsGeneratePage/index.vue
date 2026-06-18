<script setup lang="ts">
import { getModelList, type ModelItem, aigcModel, chatModel } from '@/api/model'
import { getModelEnumList, type ModelEnumResponse, type ModelEnumItem } from '@/api/modelEnum'
import { XbMessage } from '@/xbUi'
import { getModelLogList, deleteModelLog, batchDeleteModelLog, type ModelLogItem } from '@/api/modelLog'
import ImagePanel, { type ImageParams } from './components/ImagePanel.vue'
import VideoPanel, { type VideoParams } from './components/VideoPanel.vue'
import ResultPanel from './components/ResultPanel.vue'
import type { ResultItem } from './components/ResultPanel.vue'

// ===================== 枚举选项类型 =====================
export type EnumOption = { value: string; label: string }
export type ImageEnumOptions = {
  resolution: EnumOption[]
  ratio: EnumOption[]
  count: EnumOption[]
}
export type VideoEnumOptions = {
  resolution: EnumOption[]
  ratio: EnumOption[]
  duration: EnumOption[]
  count: EnumOption[]
}

// ===================== 主 Tab =====================
type MainTab = 'image' | 'video'

const mainTab = ref<MainTab>('image')
const MAIN_TABS = [
  { label: '图片生成', value: 'image' as MainTab },
  { label: '视频生成', value: 'video' as MainTab },
]

// ===================== 模型 =====================
const models = ref<ModelItem[]>([])

/** 获取模型列表 */
async function fetchModels() {
  try {
    const list = await getModelList()
    models.value = list
  } catch (e) {
    console.error('获取模型列表失败', e)
  }
}

// ===================== 枚举配置 =====================
const enumData = ref<ModelEnumResponse>({})

/** 枚举名称映射（与服务端 JSON key 对应） */
const ENUM_NAME_MAP = {
  size: 'size',                       // 尺寸/分辨率
  ratio: 'ratio',                     // 比例
  videoDuration: 'video_duration',    // 视频时长
  modality: 'modality',               // 模态类型
  taskLogStatus: 'task_log_status',   // 任务日志状态
} as const

/** 根据枚举分组名查找选项列表 */
function getEnumList(name: string): EnumOption[] {
  const items = enumData.value[name]
  return items?.map((item: ModelEnumItem) => ({ value: item.value, label: item.label })) ?? []
}

/** 获取枚举配置 */
async function fetchEnums() {
  try {
    const data = await getModelEnumList()
    enumData.value = data
  } catch (e) {
    console.error('获取枚举配置失败', e)
  }
}

/** 图片枚举选项（size/ratio 为共享枚举，count 无服务端枚举由兜底值填充） */
const imageEnumOptions = computed<ImageEnumOptions>(() => ({
  resolution: getEnumList(ENUM_NAME_MAP.size),
  ratio: getEnumList(ENUM_NAME_MAP.ratio),
  count: [],
}))

/** 视频枚举选项（size/ratio 为共享枚举，count 无服务端枚举由兜底值填充） */
const videoEnumOptions = computed<VideoEnumOptions>(() => ({
  resolution: getEnumList(ENUM_NAME_MAP.size),
  ratio: getEnumList(ENUM_NAME_MAP.ratio),
  duration: getEnumList(ENUM_NAME_MAP.videoDuration),
  count: [],
}))

// ===================== 图片面板状态 =====================
const imageParams = ref<ImageParams>({
  subTab: 'text2img',
  selectedModel: '',
  prompt: '',
  negPrompt: '',
  showNegPrompt: false,
  resolution: '90',
  aspect: '20',
  count: '1',
})

// ===================== 视频面板状态 =====================
const videoParams = ref<VideoParams>({
  subTab: 'text2video',
  selectedModel: '',
  prompt: '',
  resolution: '80',
  aspect: '20',
  duration: '5',
  count: '1',
})

const videoCreditsOriginal = '45'

// ===================== 优化描述词 =====================
const isOptimizing = ref(false)

/** 从模型列表中查找可用的对话模型 */
const chatModelId = computed(() => {
  const textModel = models.value.find(m => m.modality === '10')
  return textModel?.model_id ?? ''
})

/** 构建优化提示词的对话消息 */
function buildOptimizeMessages(prompt: string, mode: 'image' | 'video' | 'negPrompt') {
  const systemPrompts: Record<string, string> = {
    image: '你是一个专业的AI绘图提示词优化助手。请根据用户提供的描述词，优化为更加详细、具体、生动的AI图片生成提示词。保持用户原始意图，增加画面细节、风格、光影等描述。优化后的提示词不超过500字。只返回优化后的提示词文本，不要添加任何解释、格式或引号。',
    video: '你是一个专业的AI视频提示词优化助手。请根据用户提供的描述词，优化为更加详细、具体、生动的AI视频生成提示词。保持用户原始意图，增加画面细节、运动描述、镜头语言等。优化后的提示词不超过500字。只返回优化后的提示词文本，不要添加任何解释、格式或引号。',
    negPrompt: '你是一个专业的AI绘图反向提示词优化助手。请根据用户提供的反向提示词，补充常见的负面描述词（如：低质量、模糊、变形、多余肢体等）。保持用户原始意图，优化后的反向提示词不超过500字，用英文逗号分隔。只返回优化后的反向提示词文本，不要添加任何解释或格式。',
  }
  return [
    { role: 'system', content: systemPrompts[mode] },
    { role: 'user', content: prompt },
  ]
}

/** 处理图片面板优化描述词 */
async function handleImageOptimize(field: 'prompt' | 'negPrompt') {
  const currentText = imageParams.value[field]
  if (!currentText.trim() || isOptimizing.value) return
  if (!chatModelId.value) {
    XbMessage.warning('暂无可用的对话模型，无法优化描述词')
    return
  }
  isOptimizing.value = true
  try {
    const mode = field === 'negPrompt' ? 'negPrompt' : 'image'
    const messages = buildOptimizeMessages(currentText, mode)
    // 先清空，流式逐字填充
    imageParams.value = { ...imageParams.value, [field]: '' }
    await chatModel(
      { model_id: chatModelId.value, messages },
      (chunk) => {
        const current = imageParams.value[field]
        if (current.length >= 500) return
        const appended = current + chunk
        imageParams.value = {
          ...imageParams.value,
          [field]: appended.length > 500 ? appended.slice(0, 500) : appended,
        }
      },
    )
    if (imageParams.value[field].trim()) {
      XbMessage.success('描述词优化成功')
    } else {
      // 流式结果为空则恢复原文
      imageParams.value = { ...imageParams.value, [field]: currentText }
      XbMessage.warning('优化结果为空，请重试')
    }
  } catch (e) {
    console.error('优化描述词失败', e)
    // 失败时恢复原文
    imageParams.value = { ...imageParams.value, [field]: currentText }
    XbMessage.error('优化描述词失败，请稍后重试')
  } finally {
    isOptimizing.value = false
  }
}

/** 处理视频面板优化描述词 */
async function handleVideoOptimize() {
  const currentText = videoParams.value.prompt
  if (!currentText.trim() || isOptimizing.value) return
  if (!chatModelId.value) {
    XbMessage.warning('暂无可用的对话模型，无法优化描述词')
    return
  }
  isOptimizing.value = true
  try {
    const messages = buildOptimizeMessages(currentText, 'video')
    // 先清空，流式逐字填充
    videoParams.value = { ...videoParams.value, prompt: '' }
    await chatModel(
      { model_id: chatModelId.value, messages },
      (chunk) => {
        const current = videoParams.value.prompt
        if (current.length >= 500) return
        const appended = current + chunk
        videoParams.value = {
          ...videoParams.value,
          prompt: appended.length > 500 ? appended.slice(0, 500) : appended,
        }
      },
    )
    if (videoParams.value.prompt.trim()) {
      XbMessage.success('描述词优化成功')
    } else {
      // 流式结果为空则恢复原文
      videoParams.value = { ...videoParams.value, prompt: currentText }
      XbMessage.warning('优化结果为空，请重试')
    }
  } catch (e) {
    console.error('优化描述词失败', e)
    // 失败时恢复原文
    videoParams.value = { ...videoParams.value, prompt: currentText }
    XbMessage.error('优化描述词失败，请稍后重试')
  } finally {
    isOptimizing.value = false
  }
}

// ===================== 生成结果 / 任务日志 =====================
const results = ref<ResultItem[]>([])
const isGenerating = ref(false)

// 分页状态
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = 20

// 结果筛选状态（由 ResultPanel 控制，提升到此处以驱动 API 查询）
type ResultFilter = 'all' | 'video' | 'image' | 'audio'
const resultFilter = ref<ResultFilter>('all')

/** 将前端筛选值映射为 API modality 参数 */
function filterToModality(filter: ResultFilter): string | undefined {
  switch (filter) {
    case 'image': return '20'
    case 'audio': return '30'
    case 'video': return '40'
    default: return undefined // 'all' 不传 modality
  }
}

/** 将模型日志映射为结果项 */
function mapLogToResult(log: ModelLogItem): ResultItem {
  const modality = String(log.modality || '')
  // 根据 modality 判断类型：20=image, 30=audio, 40=video
  let type: 'image' | 'video' | 'audio'
  switch (modality) {
    case '40': type = 'video'; break
    case '30': type = 'audio'; break
    default: type = 'image'; break
  }
  const thumbnail = log.asset_urls?.[0] || ''
  const mediaUrl = log.asset_urls?.[0] || ''
  const prompt = log.prompt || log.model_id || ''

  // 优先使用 log.status（10=待执行, 20=执行中, 30=已完成, 40=失败）映射
  const logStatus = String(log.status || '')
  let status: string
  switch (logStatus) {
    case '10':
      status = 'pending'
      break
    case '20':
      status = 'running'
      break
    case '30':
      status = 'success'
      break
    case '40':
      status = 'failed'
      break
    default:
      // fallback 到 log.result?.status
      const resultStatus = log.result?.status || ''
      switch (resultStatus) {
        case 'completed':
          status = 'success'
          break
        case 'failed':
        case 'error':
          status = 'failed'
          break
        case 'running':
        case 'in_progress':
          status = 'running'
          break
        case 'pending':
        case 'queued':
          status = 'pending'
          break
        default:
          status = resultStatus || logStatus || ''
      }
  }

  return {
    id: String(log.id),
    type,
    thumbnail,
    mediaUrl,
    prompt,
    status,
    createAt: log.create_at,
    modelName: log.model_id,
  }
}

// ===================== 轮询 =====================
const pollTimer = ref<ReturnType<typeof setInterval> | null>(null)

function startPolling() {
  if (pollTimer.value) return
  pollTimer.value = setInterval(() => {
    fetchModelLogs()
  }, 3000)
}

function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

/** 获取任务日志列表 */
async function fetchModelLogs() {
  try {
    const params: Record<string, unknown> = {
      page: currentPage.value,
      limit: pageSize,
    }
    const modality = filterToModality(resultFilter.value)
    if (modality) params.modality = modality

    const res = await getModelLogList(params)
    if (res?.data) {
      results.value = res.data.map(mapLogToResult)
      currentPage.value = res.current_page
      totalPages.value = res.last_page
      // 若存在待执行或生成中的任务，启动轮询；否则停止
      const hasPending = results.value.some(r => r.status === 'pending' || r.status === 'running')
      if (hasPending) {
        startPolling()
      } else {
        stopPolling()
      }
    }
  } catch (e) {
    console.error('获取任务日志失败', e)
  }
}

/** 触发 AI 生成（图片） */
async function handleImageGenerate() {
  const { prompt, selectedModel } = imageParams.value
  if (!prompt.trim() || !selectedModel) return
  isGenerating.value = true
  try {
    await aigcModel({ model_id: selectedModel, prompt })
    // 生成成功后清空提示词
    imageParams.value = { ...imageParams.value, prompt: '', negPrompt: '' }
    // 生成成功后刷新日志列表
    await fetchModelLogs()
  } catch (e) {
    console.error('生成失败', e)
  } finally {
    isGenerating.value = false
  }
}

/** 触发 AI 生成（视频） */
async function handleVideoGenerate() {
  const { prompt, selectedModel } = videoParams.value
  if (!prompt.trim() || !selectedModel) return
  isGenerating.value = true
  try {
    await aigcModel({ model_id: selectedModel, prompt })
    // 生成成功后清空提示词
    videoParams.value = { ...videoParams.value, prompt: '' }
    // 生成成功后刷新日志列表
    await fetchModelLogs()
  } catch (e) {
    console.error('生成失败', e)
  } finally {
    isGenerating.value = false
  }
}

/** 结果筛选变更：重置到第1页并刷新 */
function onResultFilterChange(filter: ResultFilter) {
  resultFilter.value = filter
  currentPage.value = 1
  fetchModelLogs()
}

/** 分页变更 */
function onPageChange(page: number) {
  currentPage.value = page
  fetchModelLogs()
}

/** 删除单项 */
async function handleDeleteItem(id: string) {
  try {
    await deleteModelLog(Number(id))
    XbMessage.success('删除成功')
    await fetchModelLogs()
  } catch (e) {
    console.error('删除失败', e)
    XbMessage.error('删除失败，请稍候重试')
  }
}

/** 批量删除 */
async function handleBatchDeleteItems(ids: string[]) {
  try {
    await batchDeleteModelLog({ ids })
    XbMessage.success(`已删除 ${ids.length} 项`)
    await fetchModelLogs()
  } catch (e) {
    console.error('批量删除失败', e)
    XbMessage.error('批量删除失败，请稍候重试')
  }
}

/** 主 Tab 切换 */
function onMainTabChange(val: MainTab) {
  mainTab.value = val
}

onMounted(() => {
  // 获取模型列表
  fetchModels()
  // 获取枚举配置
  fetchEnums()
  // 获取任务日志列表
  fetchModelLogs()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="flex h-[calc(100vh-130px)] gap-0 animate-fade-in overflow-hidden">
    <!-- ===================== 左侧参数面板 ===================== -->
    <div class="w-[560px] shrink-0 flex flex-col border-r border-border bg-surface overflow-y-auto">
      <!-- 主 Tab -->
      <XbTabs
        :model-value="mainTab"
        :tabs="MAIN_TABS"
        variant="line"
        size="sm"
        class="flex-1 flex flex-col pt-3"
        @update:model-value="onMainTabChange"
      >
        <template #image>
          <div class="pr-5 space-y-4 pb-4">
            <!-- 图片生成面板 -->
            <ImagePanel
              v-if="models.length > 0"
              :models="models"
              :is-generating="isGenerating"
              :is-optimizing="isOptimizing"
              :params="imageParams"
              :enum-options="imageEnumOptions"
              @update:params="imageParams = $event"
              @generate="handleImageGenerate"
              @optimize-prompt="handleImageOptimize"
            />
          </div>
        </template>

        <template #video>
          <div class="pr-5 space-y-4 pb-4">
            <!-- 视频生成面板 -->
            <VideoPanel
              v-if="models.length > 0"
              :models="models"
              :credits-original="videoCreditsOriginal"
              :is-generating="isGenerating"
              :is-optimizing="isOptimizing"
              :params="videoParams"
              :enum-options="videoEnumOptions"
              @update:params="videoParams = $event"
              @generate="handleVideoGenerate"
              @optimize-prompt="handleVideoOptimize"
            />
          </div>
        </template>
      </XbTabs>
    </div>

    <!-- ===================== 右侧结果区域 ===================== -->
    <div class="flex-1 flex flex-col bg-surface overflow-hidden">
      <ResultPanel
        :results="results"
        :current-page="currentPage"
        :total-pages="totalPages"
        :result-filter="resultFilter"
        @update:current-page="onPageChange"
        @update:result-filter="onResultFilterChange"
        @delete="handleDeleteItem"
        @batch-delete="handleBatchDeleteItems"
      />
    </div>
  </div>
</template>
