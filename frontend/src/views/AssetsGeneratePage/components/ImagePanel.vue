<script setup lang="ts">
import type { ModelItem } from '@/api/model'
import type { AssetItem } from '@/api/assets'
import type { ImageEnumOptions } from '../index.vue'
import ModelSelect from './ModelSelect.vue'
import AssetPickerModal from '@/components/AssetPickerModal/index.vue'
import { onImgError } from '@/utils/image'

export type ImageSubTab = 'text2img' | 'img2img'

export type ImageParams = {
  subTab: ImageSubTab
  selectedModel: string
  prompt: string
  negPrompt: string
  showNegPrompt: boolean
  resolution: string
  aspect: string
  referenceImages: AssetItem[]
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

/** 当前选中模型按分辨率计算后的销售价 */
const credits = computed(() => {
  const model = filteredModels.value.find(m => m.model_id === props.params.selectedModel)
  if (!model) {
    return '-'
  }
  const resolution = props.enumOptions.resolution.find(o => o.value === props.params.resolution)
  const sizeKey = resolution?.width && resolution?.height
    ? `${resolution.width}x${resolution.height}`
    : ''
  const salePrices = model.sale_prices
  let price = 0
  if (sizeKey && salePrices?.resolution_prices?.[sizeKey] !== undefined) {
    price = salePrices.resolution_prices[sizeKey]
  } else if (salePrices?.per_image !== undefined) {
    price = salePrices.per_image
  }
  return price > 0 ? `¥${price.toFixed(4)}` : (model.prices_format || '-')
})

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

/** 分辨率选项 */
const resolutionOptions = computed(() => props.enumOptions.resolution)

/** 比例选项 */
const ratioOptions = computed(() => props.enumOptions.ratio)

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
/** 更新单个字段 */
function update<K extends keyof ImageParams>(key: K, value: ImageParams[K]) {
  emit('update:params', { ...props.params, [key]: value })
}

// ===================== 参考图（图生图） =====================
const MAX_REFERENCE_IMAGES = 9

/** 资产类型筛选选项（仅图片类资产） */
const ASSET_TYPE_OPTIONS = [
  { label: '人物角色', value: 'character' },
  { label: '场景图片', value: 'background' },
  { label: '人物表情', value: 'expression' },
  { label: '物品道具', value: 'prop' },
  { label: '人物动作', value: 'action' },
  { label: '特效贴图', value: 'effect' },
]

const showAssetPicker = ref(false)

function openAssetPicker() {
  showAssetPicker.value = true
}

function handleAssetConfirm(selected: AssetItem[]) {
  update('referenceImages', selected)
}

function removeReferenceImage(id: number) {
  update('referenceImages', props.params.referenceImages.filter(a => a.id !== id))
}

// ===================== 参考图放大预览 =====================
const previewImage = ref<AssetItem | null>(null)

function openPreview(img: AssetItem) {
  previewImage.value = img
}

function closePreview() {
  previewImage.value = null
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
    <div class="flex gap-3 flex-wrap">
      <!-- 已选中的参考图缩略图 -->
      <div
        v-for="img in params.referenceImages"
        :key="img.id"
        class="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 group cursor-pointer"
        @click="openPreview(img)"
      >
        <img
          :src="img.thumb || img.media_url"
          :alt="img.name"
          class="w-full h-full object-cover"
          @error="onImgError"
        />
        <button
          class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop="removeReferenceImage(img.id)"
        >
          <XbIcon name="x" :size="12" class="text-white" />
        </button>
      </div>
      <!-- 添加按钮 -->
      <div
        v-if="params.referenceImages.length < MAX_REFERENCE_IMAGES"
        class="flex-1 min-w-[120px] border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 py-3 cursor-pointer hover:border-brand/50 transition-colors"
        @click="openAssetPicker"
      >
        <XbIcon name="plus" :size="20" class="text-content-tertiary" />
        <span class="text-xs text-content-tertiary">
          从
          <span class="text-green-400">我的资产</span>
          中选择
        </span>
        <span class="text-[11px] text-content-tertiary/60">
          ({{ params.referenceImages.length }}/{{ MAX_REFERENCE_IMAGES }})
        </span>
      </div>
    </div>
  </div>

  <!-- 参考图放大预览 -->
  <Teleport to="body">
    <div
      v-if="previewImage"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
      @click="closePreview"
    >
      <img
        :src="previewImage.media_url"
        :alt="previewImage.name"
        class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        @click.stop
        @error="onImgError"
      />
    </div>
  </Teleport>

  <!-- 资产选择弹窗 -->
  <AssetPickerModal
    v-if="params.subTab === 'img2img'"
    :visible="showAssetPicker"
    :types="ASSET_TYPE_OPTIONS"
    :multiple="true"
    :max-select="MAX_REFERENCE_IMAGES"
    :initial-selected-ids="params.referenceImages.map(a => a.id)"
    width="w-[960px]"
    content-height="min-h-[420px]"
    @close="showAssetPicker = false"
    @confirm="handleAssetConfirm"
  />

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
  <div class="grid grid-cols-2 gap-3">
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
      {{ credits }} 余额
    </span>
  </XbButton>

  <!-- 法律声明 -->
  <p class="text-center text-[11px] text-content-tertiary/60 pb-2">
    内容由AI生成，禁止利用功能从事违法行为
  </p>
</template>
