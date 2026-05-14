<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AssetType, AssetSubType } from '@/stores/assets'
import { hasSubTypes, getSubTypes } from '@/config/assetTypes'

const props = defineProps<{
  visible: boolean
  allTags: string[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [payload: {
    files: { name: string; preview: string }[]
    type: AssetType
    subType: AssetSubType | ''
    tags: string[]
  }]
}>()

const uploadType = ref<AssetType>('character')
const uploadSubType = ref<AssetSubType | ''>('')
const uploadedFiles = ref<{ name: string; preview: string }[]>([])
const uploadSelectedTags = ref<string[]>([])

watch(uploadType, () => { uploadSubType.value = '' })

function toggleUploadTag(tag: string) {
  const idx = uploadSelectedTags.value.indexOf(tag)
  if (idx !== -1) {
    uploadSelectedTags.value.splice(idx, 1)
  } else {
    uploadSelectedTags.value.push(tag)
  }
}

function handleUploadFiles(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    Array.from(input.files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedFiles.value.push({
          name: file.name,
          preview: e.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    })
  }
}

function confirmUpload() {
  emit('confirm', {
    files: [...uploadedFiles.value],
    type: uploadType.value,
    subType: uploadSubType.value,
    tags: uploadSelectedTags.value,
  })
  uploadedFiles.value = []
  uploadSelectedTags.value = []
  uploadType.value = 'character'
  uploadSubType.value = ''
}

function handleClose() {
  uploadedFiles.value = []
  emit('close')
}
</script>

<template>
  <XbModal
    :visible="visible"
    title="上传素材"
    width="w-[60rem]"
    @close="handleClose"
  >
    <div
      class="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center hover:border-brand/40 transition-colors cursor-pointer"
    >
      <XbIcon name="upload" :size="32" class="text-content-tertiary mb-3" />
      <p class="text-sm text-content-secondary">拖拽文件到此处或点击上传</p>
      <p class="text-xs text-content-tertiary mt-1">支持 PNG, JPG, SVG 格式</p>
      <input
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        multiple
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        @change="handleUploadFiles"
      />
    </div>
    <!-- Upload preview -->
    <div v-if="uploadedFiles.length" class="mt-3 space-y-2 max-h-32 overflow-y-auto">
      <div v-for="(file, i) in uploadedFiles" :key="i" class="flex items-center gap-2 p-2 rounded-lg bg-surface-overlay">
        <img :src="file.preview" class="w-8 h-8 rounded object-cover" />
        <span class="text-xs text-content-secondary flex-1 truncate">{{ file.name }}</span>
        <button class="text-content-tertiary hover:text-danger" @click="uploadedFiles.splice(i, 1)">
          <XbIcon name="x" :size="12" />
        </button>
      </div>
    </div>
    <!-- Tags selection -->
    <div class="mt-3">
      <label class="text-xs text-content-secondary mb-2 block">素材类型 <span class="text-red-500">*</span></label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="t in [
            { value: 'background', label: '场景图片', icon: 'image' },
            { value: 'character', label: '人物角色', icon: 'users' },
            { value: 'action', label: '人物动作', icon: 'activity' },
            { value: 'expression', label: '人物表情', icon: 'smile' },
            { value: 'prop', label: '物品道具', icon: 'package' },
            { value: 'effect', label: '特效贴图', icon: 'sparkles' },
            { value: 'voice', label: '人物音色', icon: 'mic' },
            { value: 'sound_effect', label: '其他音效', icon: 'volume-2' },
            { value: 'video', label: '视频素材', icon: 'film' },
          ]"
          :key="t.value"
          class="flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all duration-200"
          :class="uploadType === t.value ? 'border-brand bg-brand/10 text-brand' : 'border-border text-content-secondary hover:border-brand/30'"
          @click="uploadType = t.value as AssetType"
        >
          <XbIcon :name="t.icon" :size="16" />
          <span class="text-[10px]">{{ t.label }}</span>
        </button>
      </div>
    </div>
    <div v-if="hasSubTypes(uploadType)" class="mt-3">
      <label class="text-xs text-content-secondary mb-2 block">子分类 <span class="text-red-500">*</span></label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="sub in getSubTypes(uploadType)"
          :key="sub.value"
          class="flex items-center justify-center p-2.5 rounded-lg border text-xs transition-all duration-200"
          :class="uploadSubType === sub.value ? 'border-brand bg-brand/10 text-brand' : 'border-border text-content-secondary hover:border-brand/30'"
          @click="uploadSubType = sub.value"
        >
          {{ sub.label }}
        </button>
      </div>
    </div>
    <div class="mt-3">
      <label class="text-xs text-content-secondary mb-2 block">选择标签（可多选）</label>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="tag in allTags"
          :key="tag"
          class="px-2.5 py-1 rounded-full text-xs border transition-colors"
          :class="uploadSelectedTags.includes(tag) ? 'border-brand bg-brand/15 text-brand' : 'border-border text-content-tertiary hover:border-brand/40 hover:text-content-secondary'"
          @click="toggleUploadTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <XbButton type="secondary" size="sm" @click="handleClose">取消</XbButton>
        <XbButton type="primary" size="sm" :disabled="!uploadedFiles.length || (hasSubTypes(uploadType) && !uploadSubType)" @click="confirmUpload">确认上传</XbButton>
      </div>
    </template>
  </XbModal>
</template>
