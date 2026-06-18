<script setup lang="ts">
import type { ModelItem } from '@/api/model'
import type { VideoEnumOptions } from '../index.vue'
import ModelSelect from './ModelSelect.vue'

export type VideoSubTab = 'ref2video' | 'img2video' | 'text2video'

export type VideoParams = {
  subTab: VideoSubTab
  selectedModel: string
  prompt: string
  resolution: string
  aspect: string
  duration: string
  count: string
}

const props = defineProps<{
  models: ModelItem[]
  creditsOriginal: string
  isGenerating: boolean
  isOptimizing: boolean
  params: VideoParams
  enumOptions: VideoEnumOptions
}>()

const emit = defineEmits<{
  'update:params': [value: VideoParams]
  generate: []
  'optimize-prompt': []
}>()

/** 当前面板（video）过滤后的模型列表 */
const filteredModels = computed(() =>
  props.models.filter(m => m.modality_type === 'video')
)

/** 当前选中模型的积分 */
const credits = computed(() =>
  filteredModels.value.find(m => m.model_id === props.params.selectedModel)?.prices_format ?? '36'
)

// 模型列表变化时自动选中首项
watch(filteredModels, (list) => {
  if (list.length > 0 && !list.find(m => m.model_id === props.params.selectedModel)) {
    emit('update:params', { ...props.params, selectedModel: list[0].model_id })
  }
}, { immediate: true })

const VIDEO_SUB_TABS = [
  { label: '文生视频', value: 'text2video' as VideoSubTab },
  { label: '参考生视频', value: 'ref2video' as VideoSubTab },
  { label: '图生视频', value: 'img2video' as VideoSubTab },
]

// 硬编码兜底值（与服务端枚举 value 格式一致）
const FALLBACK_RESOLUTIONS = [
  { value: '60', label: '480P' },
  { value: '70', label: '540P' },
  { value: '80', label: '720P' },
  { value: '90', label: '1K' },
  { value: '100', label: '2K' },
  { value: '110', label: '4K' },
]
const FALLBACK_ASPECTS = [
  { value: '10', label: '21:9' },
  { value: '20', label: '16:9' },
  { value: '30', label: '3:2' },
  { value: '40', label: '4:3' },
  { value: '50', label: '1:1' },
  { value: '60', label: '3:4' },
  { value: '70', label: '2:3' },
  { value: '80', label: '9:16' },
]
const FALLBACK_DURATIONS = [
  { value: '1', label: '1秒' },
  { value: '2', label: '2秒' },
  { value: '3', label: '3秒' },
  { value: '4', label: '4秒' },
  { value: '5', label: '5秒' },
  { value: '6', label: '6秒' },
  { value: '7', label: '7秒' },
  { value: '8', label: '8秒' },
  { value: '9', label: '9秒' },
  { value: '10', label: '10秒' },
  { value: '11', label: '11秒' },
  { value: '12', label: '12秒' },
  { value: '13', label: '13秒' },
  { value: '14', label: '14秒' },
  { value: '15', label: '15秒' },
]
const FALLBACK_COUNTS = [
  { value: '1', label: '1个' },
  { value: '2', label: '2个' },
  { value: '3', label: '3个' },
  { value: '4', label: '4个' },
  { value: '5', label: '5个' },
]

/** 分辨率选项（枚举优先，兜底硬编码） */
const resolutionOptions = computed(() =>
  props.enumOptions.resolution.length > 0
    ? props.enumOptions.resolution
    : FALLBACK_RESOLUTIONS
)

/** 比例选项（枚举优先，兜底硬编码） */
const ratioOptions = computed(() =>
  props.enumOptions.ratio.length > 0
    ? props.enumOptions.ratio
    : FALLBACK_ASPECTS
)

/** 时长选项（枚举优先，兜底硬编码） */
const durationOptions = computed(() =>
  props.enumOptions.duration.length > 0
    ? props.enumOptions.duration
    : FALLBACK_DURATIONS
)

/** 数量选项（枚举优先，兜底硬编码） */
const countOptions = computed(() =>
  props.enumOptions.count.length > 0
    ? props.enumOptions.count
    : FALLBACK_COUNTS
)

// 枚举加载后，若当前值不在选项中，自动选中首项
watch(resolutionOptions, (opts) => {
  if (opts.length > 0 && !opts.find(o => o.value === props.params.resolution)) {
    update('resolution', opts[0].value)
  }
})
watch(ratioOptions, (opts) => {
  if (opts.length > 0 && !opts.find(o => o.value === props.params.aspect)) {
    update('aspect', opts[0].value)
  }
})
watch(durationOptions, (opts) => {
  if (opts.length > 0 && !opts.find(o => o.value === props.params.duration)) {
    update('duration', opts[0].value)
  }
})
watch(countOptions, (opts) => {
  if (opts.length > 0 && !opts.find(o => o.value === props.params.count)) {
    update('count', opts[0].value)
  }
})

/** 更新单个字段 */
function update<K extends keyof VideoParams>(key: K, value: VideoParams[K]) {
  emit('update:params', { ...props.params, [key]: value })
}
</script>

<template>
  <!-- 子 Tab -->
  <div class="flex gap-1 bg-surface-elevated rounded-lg p-0.5">
    <div v-for="sub in VIDEO_SUB_TABS" :key="sub.value" class="flex-1">
      <XbButton
        :type="params.subTab === sub.value ? 'primary' : 'ghost'"
        size="sm"
        block
        @click="update('subTab', sub.value)"
      >
        {{ sub.label }}
      </XbButton>
    </div>
  </div>

  <!-- 模型选择 -->
  <ModelSelect
    :model-value="params.selectedModel"
    :models="filteredModels"
    @update:model-value="update('selectedModel', $event)"
  />

  <!-- 参考主体（参考生视频 / 图生视频） -->
  <div v-if="params.subTab === 'ref2video' || params.subTab === 'img2video'" class="rounded-xl border border-border bg-surface-elevated p-4">
    <div class="flex items-center gap-2 mb-3">
      <XbTag type="brand" size="md" round>
        {{ params.subTab === 'ref2video' ? '参考主体' : '参考图片' }}
      </XbTag>
      <span class="text-xs text-content-tertiary ml-auto">示意图</span>
    </div>
    <div class="flex gap-3">
      <div class="w-24 h-24 rounded-lg overflow-hidden shrink-0 opacity-40">
        <img :src="params.subTab === 'ref2video' ? '/images/char-girl.jpg' : '/images/bg-inn.jpg'" class="w-full h-full object-cover" />
      </div>
      <div class="flex-1 border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 py-3 cursor-pointer hover:border-brand/50 transition-colors">
        <XbIcon name="plus" :size="20" class="text-content-tertiary" />
        <span v-if="params.subTab === 'ref2video'" class="text-xs text-content-tertiary">
          从 <span class="text-green-400">角色</span> <span class="text-green-400">场景</span> <span class="text-green-400">道具</span> 中获取
        </span>
        <span v-else class="text-xs text-content-tertiary">
          从 <span class="text-green-400">资产</span> 中上传
        </span>
        <span class="text-[11px] text-content-tertiary/60">(0/9)</span>
      </div>
    </div>
  </div>

  <!-- 参考图片可选（参考生视频） -->
  <div v-if="params.subTab === 'ref2video'" class="rounded-xl border border-border bg-surface-elevated p-4">
    <div class="flex items-center gap-2 mb-3">
      <XbTag type="default" size="md" round>参考图片(可选)</XbTag>
      <span class="text-xs text-content-tertiary ml-auto">示意图</span>
    </div>
    <div class="flex gap-3">
      <div class="w-24 h-24 rounded-lg overflow-hidden shrink-0 opacity-40">
        <img src="/images/bg-bamboo.jpg" class="w-full h-full object-cover" />
      </div>
      <div class="flex-1 border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 py-3 cursor-pointer hover:border-brand/50 transition-colors">
        <XbIcon name="plus" :size="20" class="text-content-tertiary" />
        <span class="text-xs text-content-tertiary">从 <span class="text-green-400">资产</span> 中上传</span>
        <span class="text-[11px] text-content-tertiary/60">(0/9)</span>
      </div>
    </div>
  </div>

  <!-- 提示词输入 -->
  <div class="space-y-1.5">
    <XbTextarea
      :model-value="params.prompt"
      :rows="4"
      :maxlength="5000"
      count-class="text-green-400"
      :placeholder="params.subTab === 'ref2video'
        ? '请结合图片描述您想要生成的内容，输入 @ 后出现下拉选择，可选择场景、角色、图片。'
        : '请文字描述您想要生成的视频内容...'"
      resize="none"
      @update:model-value="update('prompt', $event)"
    >
      <template #bottom-right>
        <XbButton type="ghost" size="sm" :loading="isOptimizing" :disabled="!params.prompt.trim()" @click="emit('optimize-prompt')">
          <template #icon>
            <XbIcon name="wand-sparkles" :size="12" class="text-green-400" />
          </template>
          <span class="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">优化描述词</span>
        </XbButton>
      </template>
    </XbTextarea>
  </div>

  <!-- 视频参数行 -->
  <div class="grid grid-cols-4 gap-2">
    <div class="flex flex-col gap-1">
      <label class="text-xs text-content-tertiary">分辨率</label>
      <XbSelect
        :model-value="params.resolution"
        :options="resolutionOptions"
        size="sm"
        @update:model-value="update('resolution', $event)"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-xs text-content-tertiary">比例</label>
      <XbSelect
        :model-value="params.aspect"
        :options="ratioOptions"
        size="sm"
        @update:model-value="update('aspect', $event)"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-xs text-content-tertiary">时长</label>
      <XbSelect
        :model-value="params.duration"
        :options="durationOptions"
        size="sm"
        @update:model-value="update('duration', $event)"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label class="text-xs text-content-tertiary">数量</label>
      <XbSelect
        :model-value="params.count"
        :options="countOptions"
        size="sm"
        @update:model-value="update('count', $event)"
      />
    </div>
  </div>

  <!-- 生成按钮 -->
  <XbButton
    type="primary"
    block
    :loading="isGenerating"
    :disabled="!params.prompt.trim() || !params.selectedModel"
    @click="emit('generate')"
  >
    <span v-if="isGenerating">生成中...</span>
    <span v-else class="flex items-center gap-2">
      生成视频
      <XbIcon name="wand-sparkles" :size="14" />
      {{ credits }} 积分
      <span class="text-white/50 line-through text-xs">{{ creditsOriginal }}积分</span>
    </span>
  </XbButton>

  <!-- 法律声明 -->
  <p class="text-center text-[11px] text-content-tertiary/60 pb-2">
    内容由AI生成，禁止利用功能从事违法行为
  </p>
</template>
