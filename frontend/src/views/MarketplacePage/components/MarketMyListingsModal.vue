<script setup lang="ts">
import { useMarketplaceStore, type MarketListing } from '@/stores/marketplace'
import { useAssetStore, type Asset } from '@/stores/assets'
import { getTypeLabel } from '@/config/assetTypes'
import { isAudioAsset, isVideoAsset } from '@/utils/media'
import { onImgError } from '@/utils/image'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const store = useMarketplaceStore()
const assetStore = useAssetStore()

const showAddListingPanel = ref(false)
const newListingPrice = ref(50)
const selectedAssetsForListing = ref<Asset[]>([])
const inlineEditId = ref('')
const inlineEditPrice = ref(0)

const availableAssets = computed(() => {
  return assetStore.assets.filter(a => !a.listingId)
})

function startAddListing() {
  showAddListingPanel.value = true
  selectedAssetsForListing.value = []
  newListingPrice.value = 50
}

function toggleAssetForListing(asset: Asset) {
  const idx = selectedAssetsForListing.value.findIndex(a => a.id === asset.id)
  if (idx >= 0) {
    selectedAssetsForListing.value.splice(idx, 1)
  } else {
    selectedAssetsForListing.value.push(asset)
  }
}

function isAssetSelected(assetId: string): boolean {
  return selectedAssetsForListing.value.some(a => a.id === assetId)
}

function confirmAddListing() {
  if (!selectedAssetsForListing.value.length || newListingPrice.value <= 0) return
  if (selectedAssetsForListing.value.length === 1) {
    store.listAsset(selectedAssetsForListing.value[0].id, newListingPrice.value)
  } else {
    store.listAssetsBatch(selectedAssetsForListing.value.map(a => ({ assetId: a.id, price: newListingPrice.value })))
  }
  showAddListingPanel.value = false
  selectedAssetsForListing.value = []
  newListingPrice.value = 50
}

function startInlineEdit(listing: MarketListing) {
  inlineEditId.value = listing.id
  inlineEditPrice.value = listing.price
}

function confirmInlineEdit() {
  if (inlineEditPrice.value > 0) {
    store.updatePrice(inlineEditId.value, inlineEditPrice.value)
  }
  inlineEditId.value = ''
}

function cancelInlineEdit() {
  inlineEditId.value = ''
}
</script>

<template>
  <XbModal
    :visible="visible"
    width="w-[48rem]"
    no-padding
    :close-on-overlay="false"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
        <h3 class="text-base font-semibold text-content flex items-center gap-2">
          <XbIcon name="tag" :size="18" class="text-brand" />
          我的上架
          <span v-if="store.myListings.length" class="px-2 py-0.5 rounded-full bg-brand/15 text-brand text-[11px]">{{ store.myListings.length }} 件在售</span>
        </h3>
    </template>

    <div class="flex flex-col gap-4 h-[40rem] px-6 pb-6">
      <!-- Add Listing Button -->
      <div class="shrink-0">
        <button
          v-if="!showAddListingPanel"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-brand/40 text-brand text-xs hover:bg-brand/5 transition-colors w-full justify-center"
          @click="startAddListing"
        >
          <XbIcon name="plus" :size="14" />
          添加资产挂售
        </button>
      </div>

      <!-- Add Listing Panel -->
      <div v-if="showAddListingPanel" class="shrink-0 p-4 rounded-lg border border-brand/20 bg-brand/5">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-medium text-content">选择要挂售的资产<span class="text-content-tertiary font-normal ml-1.5 text-[10px]">（可多选）</span></h4>
          <button class="btn-ghost p-1 rounded" @click="showAddListingPanel = false">
            <XbIcon name="x" :size="14" class="text-content-secondary" />
          </button>
        </div>

        <!-- Asset selection grid -->
        <div v-if="availableAssets.length" class="grid grid-cols-5 gap-2 max-h-[180px] overflow-y-auto mb-3">
          <div
            v-for="asset in availableAssets"
            :key="asset.id"
            class="cursor-pointer rounded-lg border-2 p-1.5 transition-all relative"
            :class="isAssetSelected(asset.id) ? 'border-brand bg-brand/10' : 'border-border-subtle hover:border-brand/40'"
            @click="toggleAssetForListing(asset)"
          >
            <div class="aspect-square rounded overflow-hidden bg-surface-overlay mb-1">
              <img :src="asset.thumbnail" :alt="asset.name" class="w-full h-full object-cover" @error="(e: any) => onImgError(e)" />
            </div>
            <p class="text-[10px] text-content truncate text-center">{{ asset.name }}</p>
            <!-- Selection indicator -->
            <div
              v-if="isAssetSelected(asset.id)"
              class="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand flex items-center justify-center"
            >
              <XbIcon name="check" :size="10" class="text-white" />
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4">
          <p class="text-xs text-content-tertiary">没有可挂售的资产</p>
        </div>

        <!-- Selected assets summary & price input -->
        <div v-if="selectedAssetsForListing.length" class="space-y-3 pt-3 border-t border-border-subtle">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] text-content-secondary">已选 {{ selectedAssetsForListing.length }} 项：</span>
            <div
              v-for="asset in selectedAssetsForListing"
              :key="asset.id"
              class="flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand/10 text-[10px] text-brand"
            >
              <img :src="asset.thumbnail" class="w-4 h-4 rounded object-cover" @error="(e: any) => onImgError(e)" />
              <span class="truncate max-w-[60px]">{{ asset.name }}</span>
              <button class="hover:text-danger transition-colors" @click.stop="toggleAssetForListing(asset)">
                <XbIcon name="x" :size="10" />
              </button>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="text-[10px] text-content-tertiary mb-1 block">
                {{ selectedAssetsForListing.length > 1 ? '统一售价（金币）' : '售价（金币）' }}
              </label>
              <div class="relative">
                <XbIcon name="coins" :size="12" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400" />
                <input
                  v-model.number="newListingPrice"
                  type="number"
                  min="1"
                  class="input-base pl-7 h-8 text-xs w-full"
                  placeholder="输入售价"
                />
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <button
              class="btn-primary flex items-center gap-1.5 text-xs px-4 py-1.5"
              :disabled="newListingPrice <= 0"
              @click="confirmAddListing"
            >
              <XbIcon name="tag" :size="12" />
              {{ selectedAssetsForListing.length > 1 ? `批量挂售 (${selectedAssetsForListing.length}件)` : '确认挂售' }}
            </button>
          </div>
        </div>
      </div>

      <!-- My Listings List -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <div v-if="store.myListings.length" class="space-y-2">
          <div
            v-for="listing in store.myListings"
            :key="listing.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-elevated transition-colors"
          >
            <img :src="listing.asset.thumbnail" class="w-14 h-14 object-cover shrink-0" :class="isAudioAsset(listing.asset.type) || isVideoAsset(listing.asset.type) ? '' : 'rounded-lg'" @error="(e: any) => onImgError(e)" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-xs font-medium text-content truncate">{{ listing.asset.name }}</p>
                <span class="px-1.5 py-0.5 rounded text-[9px] bg-surface-overlay text-content-tertiary shrink-0">{{ getTypeLabel(listing.asset.type) }}</span>
                <span
                  v-for="tag in listing.asset.tags.slice(0, 2)"
                  :key="tag"
                  class="px-1.5 py-0.5 rounded text-[9px] bg-brand/10 text-brand/70 shrink-0"
                >{{ tag }}</span>
              </div>
              <p v-if="listing.description" class="text-[10px] text-content-tertiary mt-0.5 truncate">{{ listing.description }}</p>
              <div class="flex items-center gap-3 mt-1.5">
                <span class="text-[10px] text-content-tertiary flex items-center gap-0.5">
                  <XbIcon name="eye" :size="10" /> {{ listing.viewCount }}
                </span>
                <span class="text-[10px] text-content-tertiary flex items-center gap-0.5">
                  <XbIcon name="heart" :size="10" /> {{ listing.likeCount }}
                </span>
                <span class="text-[10px] text-content-tertiary">上架于 {{ listing.listedAt }}</span>
              </div>
            </div>

            <!-- Price display / edit -->
            <div class="flex items-center gap-2 shrink-0">
              <div v-if="inlineEditId !== listing.id" class="flex items-center gap-1">
                <XbIcon name="coins" :size="12" class="text-amber-400" />
                <span class="text-sm font-bold text-brand">{{ listing.price }}</span>
                <span class="text-[10px] text-content-tertiary">金币</span>
              </div>
              <div v-else class="flex items-center gap-1">
                <input
                  v-model.number="inlineEditPrice"
                  type="number"
                  min="1"
                  class="input-base h-7 w-20 text-xs text-center"
                  @keyup.enter="confirmInlineEdit"
                  @keyup.escape="cancelInlineEdit"
                />
                <button class="p-1 rounded text-brand hover:bg-brand/10 transition-colors" @click="confirmInlineEdit">
                  <XbIcon name="check" :size="12" />
                </button>
                <button class="p-1 rounded text-content-tertiary hover:bg-surface-overlay transition-colors" @click="cancelInlineEdit">
                  <XbIcon name="x" :size="12" />
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                v-if="inlineEditId !== listing.id"
                class="p-1.5 rounded text-content-tertiary hover:text-brand hover:bg-brand/10 transition-colors"
                title="修改价格"
                @click="startInlineEdit(listing)"
              >
                <XbIcon name="pen-line" :size="14" />
              </button>
              <button
                class="p-1.5 rounded text-content-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
                title="下架"
                @click="store.unlistAsset(listing.id)"
              >
                <XbIcon name="x-circle" :size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <XbEmpty
          v-else
          :icon="'tag'"
          :icon-size="36"
          description="暂无上架商品"
        >
          <template #action>
            <p class="text-xs text-content-tertiary">点击上方按钮添加资产进行挂售</p>
          </template>
        </XbEmpty>
      </div>
    </div>
  </XbModal>
</template>
