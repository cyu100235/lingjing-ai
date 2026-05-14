<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

import type { Scene } from '@/stores/projects'
import { useAssetStore } from '@/stores/assets'
import ScriptInputForm from './components/ScriptInputForm.vue'
import GenerationProgress from './components/GenerationProgress.vue'
import ScenePreview from './components/ScenePreview.vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  close: []
  confirm: [scenes: Omit<Scene, 'id'>[]]
}>()

const assetStore = useAssetStore()
// 表单状态
const scriptContent = ref('')

// 流程状态
const step = ref<'input' | 'generating' | 'preview'>('input')
const progress = ref(0)
const progressText = ref('')
const generatedScenes = ref<Omit<Scene, 'id'>[]>([])

// 定时器
let timer: ReturnType<typeof setInterval> | null = null

// 模拟 AI 解析剧本内容生成分镜
function parseScriptToScenes(content: string): Omit<Scene, 'id'>[] {
  // 按段落分割剧本内容，每个段落生成一个分镜
  const paragraphs = content
    .split(/\n{2,}|\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  // 至少生成 1 个分镜，不限数量
  const sceneParagraphs = paragraphs.length > 0 ? paragraphs : [content.trim()]

  const characterPool = assetStore.assets.filter(a => a.type === 'character').map(a => a.name)
  const expressionPool = assetStore.assets.filter(a => a.type === 'expression').map(a => a.name)
  const propsPool = assetStore.assets.filter(a => a.type === 'prop').map(a => a.name)
  const actionsPool = assetStore.assets.filter(a => a.type === 'action').map(a => a.name)

  return sceneParagraphs.map((paragraph, i) => {
    const charCount = 1 + Math.floor(Math.random() * 3)
    const characters = characterPool
      .sort(() => Math.random() - 0.5)
      .slice(0, charCount)

    const expressions = characters.map(
      () => expressionPool[Math.floor(Math.random() * expressionPool.length)]
    )

    const propCount = Math.floor(Math.random() * 3)
    const props = propsPool
      .sort(() => Math.random() - 0.5)
      .slice(0, propCount)

    const actionCount = Math.floor(Math.random() * 3)
    const actions = actionsPool
      .sort(() => Math.random() - 0.5)
      .slice(0, actionCount)

    return {
      title: `分镜 ${i + 1}`,
      background: '',
      characters,
      expressions,
      actions,
      props,
      effects: [],
      action: '',
      cameraLang: '',
      narration: '',
      dialogue: paragraph,
      duration: 3 + Math.floor(Math.random() * 6),
    }
  })
}

function generateScript() {
  step.value = 'generating'
  progress.value = 0
  generatedScenes.value = []

  const scenes = parseScriptToScenes(scriptContent.value)
  const total = scenes.length
  let current = 0

  timer = setInterval(() => {
    current++
    progress.value = Math.round((current / total) * 100)
    progressText.value = `正在生成第 ${current}/${total} 个分镜...`

    if (current >= total) {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      generatedScenes.value = scenes
      step.value = 'preview'
    }
  }, Math.max(300, 2500 / total))
}

function cancelGeneration() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  step.value = 'input'
  progress.value = 0
}

function regenerate() {
  step.value = 'input'
  generatedScenes.value = []
}

function confirmScenes() {
  emit('confirm', generatedScenes.value)
  resetState()
}

function closeModal() {
  cancelGeneration()
  resetState()
  emit('close')
}

function resetState() {
  scriptContent.value = ''
  step.value = 'input'
  progress.value = 0
  progressText.value = ''
  generatedScenes.value = []
}

watch(() => props.visible, (val) => {
  if (!val) {
    cancelGeneration()
    resetState()
  }
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <XbModal :visible="visible" width="w-[32rem]" @close="closeModal">
    <template #header>
      <h3 class="text-base font-semibold text-content flex items-center gap-2">
        <XbIcon name="book-open" :size="18" class="text-brand" />
        AI 剧本创作
      </h3>
    </template>

    <!-- Step 1: Input Form -->
    <ScriptInputForm v-if="step === 'input'" v-model="scriptContent" />

    <!-- Step 2: Generating -->
    <GenerationProgress v-else-if="step === 'generating'" :progress="progress" :progress-text="progressText" />

    <!-- Step 3: Preview -->
    <ScenePreview v-else-if="step === 'preview'" :scenes="generatedScenes" />

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <template v-if="step === 'input'">
          <XbButton type="secondary" size="sm" @click="closeModal">取消</XbButton>
          <XbButton
            size="sm"
            :disabled="!scriptContent.trim()"
            @click="generateScript"
          >
            <template #icon><XbIcon name="sparkles" :size="14" /></template>
            开始创作
          </XbButton>
        </template>
        <template v-else-if="step === 'generating'">
          <XbButton type="secondary" size="sm" @click="cancelGeneration">取消生成</XbButton>
        </template>
        <template v-else-if="step === 'preview'">
          <XbButton type="secondary" size="sm" @click="regenerate">重新生成</XbButton>
          <XbButton size="sm" @click="confirmScenes">
            <template #icon><XbIcon name="sparkles" :size="14" /></template>
            添加到剧集
          </XbButton>
        </template>
      </div>
    </template>
  </XbModal>
</template>
