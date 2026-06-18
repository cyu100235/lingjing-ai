<script setup lang="ts">
import type { ModelItem } from '@/api/model'
import type { ImageEnumOptions } from '../index.vue'
import ModelSelect from './ModelSelect.vue'

export type ImageSubTab = 'text2img' | 'img2img'

export type ImageParams = {
  subTab: ImageSubTab
  selectedModel: string
  prompt: string
  negPrompt: string
  showNegPrompt: boolean
  resolution: string
  aspect: string
  count: string
}

const props = defineProps<{
  models: ModelItem[]
  isGenerating: boolean
  isOptimizing: boolean
  params: ImageParams
  enumOptions: ImageEnumOptions
}>()


const emit = defineEmits<{
  'update:params': [value: ImageParams]
  generate: []
  'optimize-prompt': [field: 'prompt' | 'negPrompt']
}>()

// 过滤后的模型列表
const filteredModels = computed(() =>
  props.models.filter(m => m.modality_type === 'image')
)

/** 当前选中模型的积分 */
const credits = computed(() =>
  filteredModels.value.find(m => m.model_id === props.params.selectedModel)?.prices_format ?? '2'
)

// 模型列表变化时自动选中首项
watch(filteredModels, (list) => {
  if (list.length > 0 && !list.find(m => m.model_id === props.params.selectedModel)) {
    emit('update:params', { ...props.params, selectedModel: list[0].model_id })
  }
}, { immediate: true })

const IMAGE_SUB_TABS = [
  { label: '文生图', value: 'text2img' as ImageSubTab },
  { label: '图生图', value: 'img2img' as ImageSubTab },
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
const FALLBACK_COUNTS = [
  { value: '1', label: '1张' },
  { value: '2', label: '2张' },
  { value: '3', label: '3张' },
  { value: '4', label: '4张' },
  { value: '5', label: '5张' },
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
watch(countOptions, (opts) => {
  if (opts.length > 0 && !opts.find(o => o.value === props.params.count)) {
    update('count', opts[0].value)
  }
})

/** 更新单个字段 */
function update<K extends keyof ImageParams>(key: K, value: ImageParams[K]) {
  emit('update:params', { ...props.params, [key]: value })
}
</script>

<template>
  <!-- 子 Tab -->
  <div class="flex gap-1 bg-surface-elevated rounded-lg p-0.5">
    <div v-for="sub in IMAGE_SUB_TABS" :key="sub.value" class="flex-1">
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

  <!-- 提示词输入 -->
  <div class="space-y-1.5">
    <XbTextarea
      :model-value="params.prompt"
      :rows="8"
      :maxlength="5000"
      count-class="text-green-400"
      placeholder="请文字描述您想要生成的内容"
      resize="none"
      @update:model-value="update('prompt', $event)"
    >
      <template #bottom-right>
        <XbButton type="ghost" size="sm" :loading="isOptimizing" :disabled="!params.prompt.trim()" @click="emit('optimize-prompt', 'prompt')">
          <template #icon>
            <XbIcon name="wand-sparkles" :size="12" class="text-green-400" />
          </template>
          <span class="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">优化描述词</span>
        </XbButton>
      </template>
    </XbTextarea>
  </div>

  <!-- 参考图（图生图模式） -->
  <div v-if="params.subTab === 'img2img'" class="rounded-xl border border-border bg-surface-elevated p-4">
    <div class="flex items-center gap-2 mb-3">
      <XbTag type="brand" size="md" round>参考图</XbTag>
      <span class="text-xs text-content-tertiary ml-auto">示意图</span>
    </div>
    <div class="flex gap-3">
      <div class="w-24 h-24 rounded-lg overflow-hidden shrink-0 opacity-40">
        <img src="/images/effect-crystal-lotus.jpg" class="w-full h-full object-cover" />
      </div>
      <div class="flex-1 border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 py-3 cursor-pointer hover:border-brand/50 transition-colors">
        <XbIcon name="plus" :size="20" class="text-content-tertiary" />
        <span class="text-xs text-content-tertiary">从 <span class="text-green-400 cursor-pointer hover:underline">资产</span> 中上传</span>
        <span class="text-xs text-content-tertiary">从 <span class="text-green-400 cursor-pointer hover:underline">角色</span> <span class="text-green-400 cursor-pointer hover:underline">场景</span> <span class="text-green-400 cursor-pointer hover:underline">道具</span> 中获取</span>
        <span class="text-[11px] text-content-tertiary/60">(0/9)</span>
      </div>
    </div>
  </div>

  <!-- 反向提示词 -->
  <XbButton
    type="secondary"
    block
    @click="update('showNegPrompt', !params.showNegPrompt)"
  >
    <template #icon>
      <XbIcon name="plus" :size="14" />
    </template>
    添加反向提示词
  </XbButton>
  <div v-if="params.showNegPrompt" class="space-y-1.5">
    <XbTextarea
      :model-value="params.negPrompt"
      :rows="4"
      :maxlength="5000"
      count-class="text-green-400"
      placeholder="描述不想出现在图中的内容..."
      resize="none"
      @update:model-value="update('negPrompt', $event)"
    >
      <template #bottom-right>
        <XbButton type="ghost" size="sm" :loading="isOptimizing" :disabled="!params.negPrompt.trim()" @click="emit('optimize-prompt', 'negPrompt')">
          <template #icon>
            <XbIcon name="wand-sparkles" :size="12" class="text-green-400" />
          </template>
          <span class="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">优化描述词</span>
        </XbButton>
      </template>
    </XbTextarea>
  </div>

  <!-- 参数行 -->
  <div class="grid grid-cols-3 gap-3">
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
      生成图片
      <XbIcon name="wand-sparkles" :size="14" />
      {{ credits }} 积分
    </span>
  </XbButton>

  <!-- 法律声明 -->
  <p class="text-center text-[11px] text-content-tertiary/60 pb-2">
    内容由AI生成，禁止利用功能从事违法行为
  </p>
</template>
