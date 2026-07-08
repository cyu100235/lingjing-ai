<script setup lang="ts">
import { getAssetTypeList, type AssetTypeItem } from '@/api/assetsType'
import { upload, type UploadResult } from '@/api/upload'
import { createAsset, type AssetType as ApiAssetType, type AssetSource } from '@/api/assets'

const props = defineProps<{
  visible: boolean
  allTags: string[]
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

/** 选中资产类型值（API 类型编码，如 '10'、'20'） */
const selectedType = ref<string>('')
const uploadedFiles = ref<File[]>([])
const uploadSelectedTags = ref<string[]>([])
const assetTypeList = ref<AssetTypeItem[]>([])
const typeListLoading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const errorMsg = ref('')

/** 生成6位大写随机字符串 */
function generateRandomSuffix(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/** 弹窗打开时获取资产类型列表 */
watch(() => props.visible, async (val) => {
  if (val) {
    typeListLoading.value = true
    try {
      assetTypeList.value = await getAssetTypeList()
      // 默认选中第一个
      if (assetTypeList.value.length && !selectedType.value) {
        selectedType.value = assetTypeList.value[0].value
      }
    } catch (err) {
      console.error('获取资产类型列表失败', err)
    } finally {
      typeListLoading.value = false
    }
  }
})

/** 当前选中的资产类型对象 */
const currentTypeItem = computed(() =>
  assetTypeList.value.find(t => t.value === selectedType.value)
)

/** 根据资产类型的 media type 动态计算文件 accept */
const fileAccept = computed(() => {
  const item = currentTypeItem.value
  if (!item) return 'image/*'
  if (item.ext?.length) {
    return item.ext.map(e => `.${e}`).join(',')
  }
  switch (item.type) {
    case 'image': return 'image/*'
    case 'audio': return 'audio/*'
    case 'video': return 'video/*'
    default: return '*/*'
  }
})

/** 文件选择提示文案 */
const fileHint = computed(() => {
  const item = currentTypeItem.value
  if (!item) return '支持 PNG, JPG, SVG 格式'
  if (item.ext?.length) return `支持 ${item.ext.map(e => e.toUpperCase()).join(', ')} 格式`
  switch (item.type) {
    case 'image': return '支持 PNG, JPG, SVG 等图片格式'
    case 'audio': return '支持 MP3, WAV, OGG 等音频格式'
    case 'video': return '支持 MP4, WEBM 等视频格式'
    default: return '选择文件上传'
  }
})

function toggleUploadTag(tag: string) {
  const idx = uploadSelectedTags.value.indexOf(tag)
  if (idx !== -1) {
    uploadSelectedTags.value.splice(idx, 1)
  } else {
    uploadSelectedTags.value.push(tag)
  }
}

/** 已选文件的预览信息 */
const filePreviews = ref<{ name: string; url: string }[]>([])

function handleUploadFiles(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  Array.from(input.files).forEach(file => {
    uploadedFiles.value.push(file)
    // 生成预览 URL
    if (file.type.startsWith('image/')) {
      filePreviews.value.push({ name: file.name, url: URL.createObjectURL(file) })
    } else {
      filePreviews.value.push({ name: file.name, url: '' })
    }
  })
  // 清空 input 以便重复选择同一文件
  input.value = ''
}

function removeFile(index: number) {
  uploadedFiles.value.splice(index, 1)
  const preview = filePreviews.value[index]
  if (preview?.url) URL.revokeObjectURL(preview.url)
  filePreviews.value.splice(index, 1)
}

async function confirmUpload() {
  if (!selectedType.value || !uploadedFiles.value.length) return

  uploading.value = true
  errorMsg.value = ''

  try {
    for (let i = 0; i < uploadedFiles.value.length; i++) {
      const file = uploadedFiles.value[i]
      const fileName = file.name.replace(/\.[^.]+$/, '')

      // 1. 上传文件到服务器
      uploadProgress.value = Math.round((i / uploadedFiles.value.length) * 100)
      const uploadResult: UploadResult = await upload(file, {
        onProgress: (percent) => {
          uploadProgress.value = Math.round(((i + percent / 100) / uploadedFiles.value.length) * 100)
        },
      })

      // 2. 创建资产记录（名称=类型名称-6位随机字符串，thumb=media_url）
      const typeLabel = currentTypeItem.value?.label || '资产'
      await createAsset({
        name: `${typeLabel}-${generateRandomSuffix()}`,
        type: selectedType.value as ApiAssetType,
        source: '20' as AssetSource,
        media_url: uploadResult.url,
        thumb: uploadResult.url,
        tags: uploadSelectedTags.value.length ? uploadSelectedTags.value.join(',') : undefined,
      })
    }

    uploadProgress.value = 100
    emit('confirm')
    resetState()
  } catch (err: any) {
    errorMsg.value = err?.message || '上传失败，请稍后重试'
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

function resetState() {
  uploadedFiles.value = []
  filePreviews.value.forEach(p => { if (p.url) URL.revokeObjectURL(p.url) })
  filePreviews.value = []
  uploadSelectedTags.value = []
  errorMsg.value = ''
}

function handleClose() {
  if (uploading.value) return
  resetState()
  emit('close')
}
</script>

<template>
  <XbModal
    :visible="visible"
    title="上传资产"
    width="w-[60rem]"
    @close="handleClose"
  >
    <!-- 资产类型选择 -->
    <div>
      <label class="text-xs text-content-secondary mb-2 block">资产类型 <span class="text-red-500">*</span></label>
      <div v-if="typeListLoading" class="text-xs text-content-tertiary py-2">加载类型列表...</div>
      <div v-else class="grid grid-cols-3 gap-2">
        <button
          v-for="t in assetTypeList"
          :key="t.value"
          class="flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all duration-200"
          :class="selectedType === t.value ? 'border-brand bg-brand/10 text-brand' : 'border-border text-content-secondary hover:border-brand/30'"
          @click="selectedType = t.value"
        >
          <XbIcon :name="t.icon || 'grid'" :size="16" />
          <span class="text-[10px]">{{ t.label }}</span>
        </button>
      </div>
    </div>
    <div
      class="mt-3 relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center hover:border-brand/40 transition-colors cursor-pointer"
    >
      <XbIcon name="upload" :size="32" class="text-content-tertiary mb-3" />
      <p class="text-sm text-content-secondary">拖拽文件到此处或点击上传</p>
      <p class="text-xs text-content-tertiary mt-1">{{ fileHint }}</p>
      <input
        type="file"
        :accept="fileAccept"
        multiple
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        @change="handleUploadFiles"
      />
    </div>
    <!-- Upload preview -->
    <div v-if="filePreviews.length" class="mt-3 space-y-2 max-h-32 overflow-y-auto">
      <div v-for="(file, i) in filePreviews" :key="i" class="flex items-center gap-2 p-2 rounded-lg bg-surface-overlay">
        <img v-if="file.url" :src="file.url" class="w-8 h-8 rounded object-cover" />
        <XbIcon v-else name="file" :size="16" class="text-content-tertiary" />
        <span class="text-xs text-content-secondary flex-1 truncate">{{ file.name }}</span>
        <button class="text-content-tertiary hover:text-danger" @click="removeFile(i)">
          <XbIcon name="x" :size="12" />
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

    <!-- 上传进度 -->
    <div v-if="uploading" class="mt-3">
      <div class="flex items-center justify-between text-xs text-content-secondary mb-1">
        <span>上传中...</span>
        <span>{{ uploadProgress }}%</span>
      </div>
      <div class="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
        <div
          class="h-full bg-brand rounded-full transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        />
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="mt-3 text-xs text-danger flex items-center gap-1">
      <XbIcon name="alert-circle" :size="12" />
      {{ errorMsg }}
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <XbButton type="secondary" size="sm" :disabled="uploading" @click="handleClose">取消</XbButton>
        <XbButton type="primary" size="sm" :disabled="!uploadedFiles.length || !selectedType || uploading" @click="confirmUpload">
          {{ uploading ? '上传中...' : '确认上传' }}
        </XbButton>
      </div>
    </template>
  </XbModal>
</template>
