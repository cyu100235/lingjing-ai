<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AssetType, AssetSubType } from '@/stores/assets'
import { hasSubTypes } from '@/config/assetTypes'
import { getDefaultModel } from '@/config/aiModels'
import TypeSelector from './components/TypeSelector.vue'
import SubTypeSelector from './components/SubTypeSelector.vue'
import ModelSelector from './components/ModelSelector.vue'
import StyleSelector from './components/StyleSelector.vue'
import TagSelector from './components/TagSelector.vue'


const props = withDefaults(defineProps<{
  visible: boolean
  initialType?: AssetType
}>(), {
  initialType: 'character',
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'generate', payload: {
    type: AssetType
    subType: AssetSubType | '' | undefined
    model: string
    style: string
    prompt: string
    tags: string[]
  }): void
}>()

const aiPrompt = ref('')
const aiType = ref<AssetType>(props.initialType)
const aiGenerating = ref(false)
const aiSubType = ref<AssetSubType | ''>('')
const aiSelectedTags = ref<string[]>([])
const aiModel = ref(getDefaultModel(props.initialType))
const aiStyle = ref('q-cute')

watch(aiType, () => {
  aiSubType.value = ''
})

watch(() => props.visible, (val) => {
  if (val) {
    aiType.value = props.initialType
  }
})

function handleClose() {
  resetForm()
  emit('close')
}

function resetForm() {
  aiPrompt.value = ''
  aiSubType.value = ''
  aiSelectedTags.value = []
  aiStyle.value = 'q-cute'
  aiGenerating.value = false
}

function generateWithAI() {
  if (!aiPrompt.value.trim()) return
  if (hasSubTypes(aiType.value) && !aiSubType.value) return
  if (!aiModel.value) return
  aiGenerating.value = true
  setTimeout(() => {
    emit('generate', {
      type: aiType.value,
      subType: aiSubType.value || undefined,
      model: aiModel.value,
      style: aiStyle.value,
      prompt: aiPrompt.value,
      tags: aiSelectedTags.value.length ? [...aiSelectedTags.value] : ['AI生成'],
    })
    resetForm()
  }, 2000)
}
</script>

<template>
  <XbModal :visible="visible" width="w-[60rem]" @close="handleClose">
    <template #header>
      <h3 class="text-base font-semibold text-content flex items-center gap-2">
        <XbIcon name="wand-sparkles" :size="18" class="text-brand" />
        AI智能生成
      </h3>
    </template>

      <div class="space-y-4 flex-1 overflow-y-auto pr-1">
        <TypeSelector v-model="aiType" />

        <SubTypeSelector v-model="aiSubType" :type="aiType" />

        <ModelSelector v-model="aiModel" :type="aiType" />

        <StyleSelector v-model="aiStyle" />

        <div>
          <XbTextarea
            v-model="aiPrompt"
            label="描述内容"
            rows="5"
            resize="none"
            placeholder="详细描述你想生成的内容，例如：一个穿着蓝色汉服的可爱熊猫角色，手持折扇，表情得意..."
          />
        </div>

        <TagSelector v-model="aiSelectedTags" />
      </div>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="flex justify-end gap-2">
          <XbButton type="secondary" size="sm" @click="handleClose">取消</XbButton>
          <XbButton
            size="sm"
            :disabled="aiGenerating || !aiPrompt.trim() || !aiModel || (hasSubTypes(aiType) && !aiSubType)"
            :loading="aiGenerating"
            @click="generateWithAI"
          >
            <template #icon><XbIcon v-if="!aiGenerating" name="wand-sparkles" :size="14" /></template>
            {{ aiGenerating ? '生成中...' : '开始生成' }}
          </XbButton>
        </div>
      </template>
  </XbModal>
</template>
