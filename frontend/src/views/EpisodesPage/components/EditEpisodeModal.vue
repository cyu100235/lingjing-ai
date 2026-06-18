<script setup lang="ts">


const props = defineProps<{
  visible: boolean
  episodeId: string | null
  initialTitle: string
  initialCover: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [id: string, data: { title: string; cover: string }]
}>()

const title = ref('')
const cover = ref('')
const aiPrompt = ref('')
const generating = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    title.value = props.initialTitle
    cover.value = props.initialCover
    aiPrompt.value = ''
    generating.value = false
  }
})

function handleClose() {
  emit('update:visible', false)
}

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
  if (!aiPrompt.value.trim()) return
  generating.value = true
  setTimeout(() => {
    const covers = ['/images/cover-1.jpg', '/images/cover-2.jpg', '/images/cover-3.jpg', '/images/cover-4.jpg', '/images/cover-5.jpg']
    cover.value = covers[Math.floor(Math.random() * covers.length)]
    generating.value = false
    aiPrompt.value = ''
  }, 2000)
}

function handleSave() {
  if (props.episodeId && title.value.trim()) {
    emit('save', props.episodeId, { title: title.value.trim(), cover: cover.value })
    handleClose()
  }
}
</script>

<template>
  <XbModal
    :visible="visible"
    title="编辑连载"
    width="w-[28rem]"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="space-y-4">
      <!-- Cover Upload -->
      <div>
        <label class="text-xs text-content-secondary mb-2 block">连载封面</label>
        <div class="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-surface-overlay group cursor-pointer">
          <img v-if="cover" :src="cover" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2">
            <XbIcon name="image-plus" :size="28" class="text-content-tertiary" />
            <span class="text-xs text-content-tertiary">点击上传封面</span>
          </div>
          <div class="absolute inset-0 bg-surface/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
            v-model="aiPrompt"
            class="flex-1"
            size="sm"
            placeholder="描述封面内容，如：古风武侠场景..."
            @keydown.enter="generateCover"
          />
          <XbButton
            size="sm"
            :disabled="generating || !aiPrompt.trim()"
            @click="generateCover"
          >
            <template #icon>
              <span v-if="generating" class="animate-spin text-[10px]">⏳</span>
              <XbIcon v-else name="wand-sparkles" :size="12" />
            </template>
            {{ generating ? '生成中' : '生成' }}
          </XbButton>
        </div>
      </div>

      <!-- Title -->
      <XbInput
        v-model="title"
        label="连载名称"
        placeholder="输入连载名称..."
        @keydown.enter="handleSave"
      />
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <XbButton type="secondary" size="sm" @click="handleClose">取消</XbButton>
        <XbButton size="sm" @click="handleSave">保存</XbButton>
      </div>
    </template>
  </XbModal>
</template>
