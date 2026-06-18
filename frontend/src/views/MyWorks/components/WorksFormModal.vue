<script setup lang="ts">
import type { AspectRatio } from '@/stores/projects'

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  initialData?: {
    title: string
    cover: string
    aspectRatio: AspectRatio
  }
}>()

const emit = defineEmits<{
  'update:visible': [boolean]
  confirm: [payload: { title: string; cover: string; aspectRatio: AspectRatio }]
}>()

const title = ref('')
const cover = ref('')
const aspectRatio = ref<AspectRatio>('16:9')
const coverAiPrompt = ref('')
const coverGenerating = ref(false)

watch(() => props.visible, (visible) => {
  if (visible) {
    title.value = props.initialData?.title || ''
    cover.value = props.initialData?.cover || ''
    aspectRatio.value = props.initialData?.aspectRatio || '16:9'
    coverAiPrompt.value = ''
    coverGenerating.value = false
  }
})

function handleCoverUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      cover.value = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

function generateCover() {
  if (!coverAiPrompt.value.trim()) return
  coverGenerating.value = true
  setTimeout(() => {
    const covers = ['/images/cover-1.jpg', '/images/cover-2.jpg', '/images/cover-3.jpg', '/images/cover-4.jpg', '/images/cover-5.jpg', '/images/cover-6.jpg']
    cover.value = covers[Math.floor(Math.random() * covers.length)]
    coverGenerating.value = false
    coverAiPrompt.value = ''
  }, 2000)
}

function onConfirm() {
  if (title.value.trim()) {
    emit('confirm', { title: title.value.trim(), cover: cover.value, aspectRatio: aspectRatio.value })
  }
}

function onCancel() {
  emit('update:visible', false)
}

const modalTitle = computed(() => props.mode === 'create' ? '创建作品' : '修改作品')
const confirmText = computed(() => props.mode === 'create' ? '创建' : '保存')
</script>

<template>
  <XbModal
    :visible="visible"
    :title="modalTitle"
    width="w-[28rem]"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-4">
      <!-- Cover -->
      <div>
        <label class="text-xs text-content-secondary mb-2 block">作品封面</label>
        <div class="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-surface-overlay group cursor-pointer">
          <img v-if="cover" :src="cover" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2">
            <XbIcon name="image-plus" :size="28" class="text-content-tertiary" />
            <span class="text-xs text-content-tertiary">点击上传封面</span>
          </div>
          <div
            v-if="mode === 'edit'"
            class="absolute inset-0 bg-surface/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <span class="text-xs text-content font-medium">点击更换封面</span>
          </div>
          <input
            type="file"
            accept="image/*"
            class="absolute inset-0 opacity-0 cursor-pointer"
            @change="handleCoverUpload"
          />
        </div>
        <p class="text-[10px] text-content-tertiary mt-1">推荐尺寸：16:9（如 1280×720）</p>
      </div>

      <!-- AI Generate Cover -->
      <div>
        <label class="text-xs text-content-secondary mb-2 block flex items-center gap-1">
          <XbIcon name="wand-sparkles" :size="12" class="text-brand" />
          AI生成封面
        </label>
        <div class="flex gap-2">
          <XbInput
            v-model="coverAiPrompt"
            size="sm"
            class="flex-1"
            placeholder="描述封面内容，如：古风武侠场景..."
            @keydown.enter="generateCover"
          />
          <XbButton
            size="sm"
            :loading="coverGenerating"
            :disabled="coverGenerating || !coverAiPrompt.trim()"
            @click="generateCover"
          >
            <template #icon>
              <XbIcon v-if="!coverGenerating" name="wand-sparkles" :size="12" />
            </template>
            {{ coverGenerating ? '生成中' : '生成' }}
          </XbButton>
        </div>
      </div>

      <!-- Title -->
      <XbInput
        v-model="title"
        label="作品名称"
        placeholder="输入作品名称..."
        @keydown.enter="onConfirm"
      />

      <!-- Aspect Ratio -->
      <div>
        <label class="text-xs text-content-secondary mb-2 block">画面比例</label>
        <div class="flex gap-3">
          <template v-if="mode === 'create'">
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200"
              :class="aspectRatio === '16:9' ? 'border-brand bg-brand/10 text-brand' : 'border-border text-content-secondary hover:border-content-tertiary'"
              @click="aspectRatio = '16:9'"
            >
              <XbIcon name="monitor" :size="16" />
              <span class="text-xs font-medium">横屏 16:9</span>
            </button>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200"
              :class="aspectRatio === '9:16' ? 'border-brand bg-brand/10 text-brand' : 'border-border text-content-secondary hover:border-content-tertiary'"
              @click="aspectRatio = '9:16'"
            >
              <XbIcon name="smartphone" :size="16" />
              <span class="text-xs font-medium">竖屏 9:16</span>
            </button>
          </template>
          <template v-else>
            <div
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200"
              :class="aspectRatio === '16:9' ? 'border-brand/50 bg-brand/5 text-brand' : 'border-border text-content-tertiary opacity-50'"
            >
              <XbIcon name="monitor" :size="16" />
              <span class="text-xs font-medium">横屏 16:9</span>
            </div>
            <div
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200"
              :class="aspectRatio === '9:16' ? 'border-brand/50 bg-brand/5 text-brand' : 'border-border text-content-tertiary opacity-50'"
            >
              <XbIcon name="smartphone" :size="16" />
              <span class="text-xs font-medium">竖屏 9:16</span>
            </div>
          </template>
        </div>
        <p v-if="mode === 'edit'" class="text-[10px] text-content-tertiary mt-1">画面比例创建后不可修改</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <XbButton type="secondary" @click="onCancel">取消</XbButton>
        <XbButton @click="onConfirm">{{ confirmText }}</XbButton>
      </div>
    </template>
  </XbModal>
</template>
