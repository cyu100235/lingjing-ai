<script setup lang="ts">
import { getAssetList, type AssetItem, type AssetListParams, type AssetType } from '@/api/assets'
import { onImgError } from '@/utils/image'


export interface AssetTypeOption {
  label: string
  value: string
}

const props = withDefaults(defineProps<{
  visible: boolean
  /** 类型筛选选项列表，为空则不显示类型筛选 */
  types?: AssetTypeOption[]
  multiple?: boolean
  maxSelect?: number
  /** 已选中资产的ID列表，用于回显 */
  initialSelectedIds?: number[]
  /** 弹窗宽度类名 */
  width?: string
  /** 内容区域最小高度类名 */
  contentHeight?: string
}>(), {
  types: () => [],
  multiple: false,
  maxSelect: 9,
  initialSelectedIds: () => [],
  width: 'w-[640px]',
  contentHeight: 'min-h-[200px]',
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', selected: AssetItem[]): void
}>()

// ===================== 状态 =====================
const searchQuery = ref('')
const activeType = ref<string>('')
/** 跨页保存已选中的资产（id → 完整对象） */
const selectedMap = ref<Map<number, AssetItem>>(new Map())

const assets = ref<AssetItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const pageSize = 12

// ===================== 搜索防抖 =====================
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchAssets()
  }, 350)
})

watch(activeType, () => {
  currentPage.value = 1
  fetchAssets()
})

// ===================== 获取资产列表 =====================
async function fetchAssets() {
  loading.value = true
  try {
    const params: AssetListParams = {
      page: currentPage.value,
      limit: pageSize,
    }
    if (activeType.value) params.type = activeType.value as AssetType
    if (searchQuery.value.trim()) params.name = searchQuery.value.trim()

    const res = await getAssetList(params)
    assets.value = res.data || []
    currentPage.value = res.current_page
    totalPages.value = res.last_page
    total.value = res.total
  } catch (e) {
    console.error('获取资产列表失败', e)
    assets.value = []
  } finally {
    loading.value = false
  }
}

// ===================== 弹窗打开时初始化 =====================
watch(() => props.visible, (val) => {
  if (val) {
    selectedMap.value = new Map()
    searchQuery.value = ''
    activeType.value = ''
    currentPage.value = 1
    fetchAssets()
  }
})

// ===================== 选择逻辑 =====================
function toggleSelect(asset: AssetItem) {
  if (props.multiple) {
    if (selectedMap.value.has(asset.id)) {
      selectedMap.value.delete(asset.id)
    } else {
      if (selectedMap.value.size >= props.maxSelect) return
      selectedMap.value.set(asset.id, asset)
    }
  } else {
    selectedMap.value.clear()
    selectedMap.value.set(asset.id, asset)
  }
  // 触发响应式更新
  selectedMap.value = new Map(selectedMap.value)
}

function isSelected(id: number) {
  return selectedMap.value.has(id)
}

function handleConfirm() {
  const selected = Array.from(selectedMap.value.values())
  emit('confirm', selected)
  handleClose()
}

function handleClose() {
  emit('close')
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchAssets()
}
</script>

<template>
  <XbModal :visible="visible" :width="width" @close="handleClose">
    <template #header>
      <h3 class="text-sm font-medium text-content">选择资产</h3>
    </template>

    <!-- 搜索 + 类型筛选 -->
    <div class="flex gap-2 mb-3">
      <XbInput
        v-model="searchQuery"
        size="sm"
        placeholder="搜索资产名称..."
        class="flex-1"
      >
        <template #prefix><XbIcon name="search" :size="14" /></template>
      </XbInput>
      <XbSelect
        v-if="types.length > 0"
        :model-value="activeType"
        :options="[{ label: '全部类型', value: '' }, ...types]"
        size="sm"
        class="w-32"
        @update:model-value="activeType = $event"
      />
    </div>

    <!-- 资产网格 -->
    <div :class="contentHeight">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <XbIcon name="loader" :size="24" class="animate-spin text-content-tertiary" />
      </div>

      <!-- 资产列表 -->
      <template v-else>
        <div v-if="assets.length" class="grid grid-cols-4 gap-3">
          <div
            v-for="asset in assets"
            :key="asset.id"
            class="group cursor-pointer rounded-lg border-2 p-2 transition-all duration-200"
            :class="isSelected(asset.id) ? 'border-brand bg-brand/10' : 'border-border-subtle hover:border-brand/40 bg-surface-overlay'"
            @click="toggleSelect(asset)"
          >
            <div class="aspect-square rounded-md overflow-hidden bg-surface mb-2 relative">
              <img
                :src="asset.thumb || asset.media_url"
                :alt="asset.name"
                class="w-full h-full object-cover"
                @error="onImgError"
              />
              <!-- 选中标记 -->
              <div
                v-if="isSelected(asset.id)"
                class="absolute top-1 right-1 w-5 h-5 rounded-full bg-brand flex items-center justify-center"
              >
                <XbIcon name="check" :size="12" class="text-white" />
              </div>
            </div>
            <p class="text-[11px] text-center truncate" :class="isSelected(asset.id) ? 'text-brand font-medium' : 'text-content-secondary'">
              {{ asset.name }}
            </p>
          </div>
        </div>
        <XbEmpty v-else description="暂无资产" />
      </template>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && totalPages > 1" class="mt-3">
      <XbPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:current-page="onPageChange"
      />
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <span class="text-[11px] text-content-tertiary">
          已选择 {{ selectedMap.size }} 项<span v-if="multiple"> / 最多 {{ maxSelect }} 项</span>
        </span>
        <div class="flex gap-2">
          <XbButton type="secondary" size="sm" @click="handleClose">取消</XbButton>
          <XbButton size="sm" :disabled="selectedMap.size === 0" @click="handleConfirm">确认</XbButton>
        </div>
      </div>
    </template>
  </XbModal>
</template>
