<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAssetStore, type Asset, type AssetType } from '@/stores/assets'
import { onImgError } from '@/utils/image'


const props = defineProps<{
  visible: boolean
  type: AssetType
  multiple?: boolean
  initialSelected?: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', selected: Asset[]): void
}>()

const assetStore = useAssetStore()
const searchQuery = ref('')
const selectedIds = ref<Set<string>>(new Set())

// 弹窗打开时，根据 initialSelected 预选已有项
watch(() => props.visible, (val) => {
  if (val) {
    selectedIds.value.clear()
    if (props.initialSelected?.length) {
      const assets = assetStore.assets.filter(
        a => a.type === props.type && props.initialSelected!.includes(a.name)
      )
      assets.forEach(a => selectedIds.value.add(a.id))
    }
  }
})

const typeLabel = computed(() => {
  const map: Record<AssetType, string> = { character: '人物角色', expression: '人物表情', prop: '物品道具', action: '人物动作', effect: '特效贴图', background: '场景图片', voice: '人物音色', sound_effect: '其他音效', video: '视频素材' }
  return map[props.type]
})

const filteredAssets = computed(() => {
  let list = assetStore.assets.filter(a => a.type === props.type)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  return list
})

function toggleSelect(asset: Asset) {
  if (props.multiple) {
    if (selectedIds.value.has(asset.id)) {
      selectedIds.value.delete(asset.id)
    } else {
      selectedIds.value.add(asset.id)
    }
  } else {
    selectedIds.value.clear()
    selectedIds.value.add(asset.id)
  }
}

function isSelected(id: string) {
  return selectedIds.value.has(id)
}

function handleConfirm() {
  const selected = assetStore.assets.filter(a => selectedIds.value.has(a.id))
  emit('confirm', selected)
  handleClose()
}

function handleClose() {
  searchQuery.value = ''
  emit('close')
}
</script>

<template>
  <XbModal :visible="visible" width="w-[560px]" @close="handleClose">
    <template #header>
      <h3 class="text-sm font-medium text-content">选择{{ typeLabel }}</h3>
    </template>

    <!-- Search -->
    <div class="mb-3">
      <XbInput
        v-model="searchQuery"
        size="sm"
        :placeholder="`搜索${typeLabel}...`"
      >
        <template #prefix><XbIcon name="search" :size="14" /></template>
      </XbInput>
    </div>

    <!-- Asset Grid -->
    <div class="max-h-[50vh] overflow-y-auto">
      <div v-if="filteredAssets.length" class="grid grid-cols-4 gap-3">
        <div
          v-for="asset in filteredAssets"
          :key="asset.id"
          class="group cursor-pointer rounded-lg border-2 p-2 transition-all duration-200"
          :class="isSelected(asset.id) ? 'border-brand bg-brand/10' : 'border-border-subtle hover:border-brand/40 bg-surface-overlay'"
          @click="toggleSelect(asset)"
        >
          <div class="aspect-square rounded-md overflow-hidden bg-surface mb-2">
            <img
              :src="asset.thumbnail"
              :alt="asset.name"
              class="w-full h-full object-cover"
              @error="onImgError"
            />
          </div>
          <p class="text-[11px] text-center truncate" :class="isSelected(asset.id) ? 'text-brand font-medium' : 'text-content-secondary'">
            {{ asset.name }}
          </p>
          <div class="flex flex-wrap gap-0.5 justify-center mt-1">
            <span
              v-for="tag in asset.tags.slice(0, 2)"
              :key="tag"
              class="text-[9px] px-1 rounded bg-surface-overlay text-content-tertiary"
            >{{ tag }}</span>
          </div>
        </div>
      </div>
      <XbEmpty v-else :description="`暂无${typeLabel}资产`" />
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <span class="text-[11px] text-content-tertiary">
          已选择 {{ selectedIds.size }} 项
        </span>
        <div class="flex gap-2">
          <XbButton type="secondary" size="sm" @click="handleClose">取消</XbButton>
          <XbButton size="sm" :disabled="selectedIds.size === 0" @click="handleConfirm">确认</XbButton>
        </div>
      </div>
    </template>
  </XbModal>
</template>
