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
}

const props = defineProps<{
  models: ModelItem[]
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

/** 当前选中模型按分辨率/时长计算后的销售价 */
const credits = computed(() => {
  const model = filteredModels.value.find(m => m.model_id === props.params.selectedModel)
  if (!model) {
    return '-'
  }
  const resolution = props.enumOptions.resolution.find(o => o.value === props.params.resolution)
  const duration = parseInt(props.params.duration || '5', 10) || 5
  const salePrices = model.sale_prices

  let price = 0
  // 1. 按分辨率计费
  const sizeKey = resolution?.width && resolution?.height
    ? `${resolution.width}x${resolution.height}`
    : ''
  const qualityKeys = [
    sizeKey,
    resolution?.label?.toLowerCase(),
    resolution?.label?.toUpperCase(),
  ].filter(Boolean) as string[]
  for (const key of qualityKeys) {
    if (salePrices?.resolution_prices?.[key] !== undefined) {
      price = salePrices.resolution_prices[key]
      break
    }
  }

  // 2. 按时长计费
  if (price <= 0 && duration > 0) {
    if (salePrices?.duration_price !== undefined) {
      price = salePrices.duration_price * duration
    } else if (salePrices?.first_duration_price !== undefined) {
      const subsequent = salePrices.subsequent_duration_price ?? 0
      price = salePrices.first_duration_price + subsequent * (duration - 1)
    }
  }

  // 3. 固定每个视频
  if (price <= 0 && salePrices?.per_video !== undefined) {
    price = salePrices.per_video
  }

  return price > 0 ? `¥${price.toFixed(4)}` : (model.prices_format || '-')
})

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

/** 分辨率选项 */
const resolutionOptions = computed(() => props.enumOptions.resolution)

/** 比例选项 */
const ratioOptions = computed(() => props.enumOptions.ratio)

/** 时长选项 */
const durationOptions = computed(() => props.enumOptions.duration)

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
  <div class="grid grid-cols-3 gap-2">
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
      {{ credits }} 余额
    </span>
  </XbButton>

  <!-- 法律声明 -->
  <p class="text-center text-[11px] text-content-tertiary/60 pb-2">
    内容由AI生成，禁止利用功能从事违法行为
  </p>
</template>
