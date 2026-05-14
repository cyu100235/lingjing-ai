<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMarketplaceStore, type MarketListing, type MarketSortOption } from '@/stores/marketplace'
import { type AssetType, type AssetSubType } from '@/stores/assets'
import { getSubTypes, type CategoryFilterItem } from '@/config/assetTypes'
import AssetCategoryFilter from '@/components/AssetCategoryFilter/index.vue'
import MarketHeader from './components/MarketHeader.vue'
import MarketPriceFilter from './components/MarketPriceFilter.vue'
import MarketListingsGrid from './components/MarketListingsGrid.vue'
import MarketPurchaseModal from './components/MarketPurchaseModal.vue'
import MarketTransactionModal from './components/MarketTransactionModal.vue'
import MarketPriceEditModal from './components/MarketPriceEditModal.vue'
import MarketPreviewModal from './components/MarketPreviewModal.vue'
import MarketMyListingsModal from './components/MarketMyListingsModal.vue'

const store = useMarketplaceStore()

// Pagination
const pageSize = 12
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(store.filteredListings.length / pageSize))
const paginatedListings = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return store.filteredListings.slice(start, start + pageSize)
})

// Reset page on filter/sort/search change
watch(() => store.activeFilter, () => { currentPage.value = 1; store.activeSubFilter = 'all' })
watch(() => store.searchQuery, () => { currentPage.value = 1 })
watch(() => store.sortBy, () => { currentPage.value = 1 })

// Type filters
const typeFilters: CategoryFilterItem[] = [
  { value: 'all', label: '全部', icon: 'grid' },
  { value: 'background', label: '场景图片', icon: 'image' },
  { value: 'character', label: '人物角色', icon: 'users' },
  { value: 'action', label: '人物动作', icon: 'activity' },
  { value: 'expression', label: '人物表情', icon: 'smile' },
  { value: 'prop', label: '物品道具', icon: 'package' },
  { value: 'effect', label: '特效贴图', icon: 'sparkles' },
  { value: 'voice', label: '人物音色', icon: 'mic', children: getSubTypes('voice') },
  { value: 'sound_effect', label: '其他音效', icon: 'volume-2', children: getSubTypes('sound_effect') },
  { value: 'video', label: '视频素材', icon: 'film', children: getSubTypes('video') },
]

function handleFilterSelect(type: AssetType | 'all', subType?: AssetSubType | 'all') {
  store.activeFilter = type
  store.activeSubFilter = subType || 'all'
  currentPage.value = 1
}

const sortOptions: { value: MarketSortOption; label: string }[] = [
  { value: 'newest', label: '最新上架' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'popular', label: '最受欢迎' },
]

// Search
const searchInput = ref('')
function handleSearch() {
  store.searchQuery = searchInput.value
}

// Purchase modal
const showPurchaseModal = ref(false)
const selectedListing = ref<MarketListing | null>(null)
const purchaseSuccess = ref(false)

function openPurchase(listing: MarketListing) {
  selectedListing.value = listing
  purchaseSuccess.value = false
  showPurchaseModal.value = true
}

function confirmPurchase() {
  if (!selectedListing.value) return
  const success = store.purchaseAsset(selectedListing.value.id)
  if (success) {
    purchaseSuccess.value = true
  }
}

// Transaction modal
const showTransactionModal = ref(false)

// Price edit modal
const showPriceEditModal = ref(false)
const editingPrice = ref(0)
const editingListingId = ref('')

function openPriceEdit(listing: MarketListing) {
  editingListingId.value = listing.id
  editingPrice.value = listing.price
  showPriceEditModal.value = true
}

function confirmPriceEdit() {
  if (editingPrice.value > 0) {
    store.updatePrice(editingListingId.value, editingPrice.value)
  }
  showPriceEditModal.value = false
}

// Preview modal
const previewListing = ref<MarketListing | null>(null)

// My listings modal
const showMyListingsModal = ref(false)
</script>

<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <MarketHeader
      :my-listing-count="store.myListings.length"
      @open-my-listings="showMyListingsModal = true"
      @open-transactions="showTransactionModal = true"
    />

    <!-- Main content -->
    <div class="flex gap-6">
      <!-- Left filter panel -->
      <div class="w-48 shrink-0">
        <AssetCategoryFilter
          :items="typeFilters"
          :active-filter="store.activeFilter"
          :active-sub-filter="store.activeSubFilter"
          :show-counts="false"
          @select="handleFilterSelect"
        />
        <MarketPriceFilter
          :price-min="store.priceMin"
          :price-max="store.priceMax"
          @update:price-min="store.priceMin = $event"
          @update:price-max="store.priceMax = $event"
        />
      </div>

      <!-- Right content area -->
      <MarketListingsGrid
        :listings="paginatedListings"
        :current-page="currentPage"
        :total-pages="totalPages"
        :search-input="searchInput"
        :sort-by="store.sortBy"
        :sort-options="sortOptions"
        @update:current-page="currentPage = $event"
        @update:search-input="searchInput = $event"
        @update:sort-by="store.sortBy = $event"
        @search="handleSearch"
        @preview="previewListing = $event"
        @purchase="openPurchase"
        @toggle-like="store.toggleLike"
      />
    </div>

    <!-- Purchase Modal -->
    <MarketPurchaseModal
      :visible="showPurchaseModal"
      :listing="selectedListing"
      :success="purchaseSuccess"
      @update:visible="showPurchaseModal = $event"
      @confirm="confirmPurchase"
    />

    <!-- Transaction History Modal -->
    <MarketTransactionModal
      :visible="showTransactionModal"
      @update:visible="showTransactionModal = $event"
    />

    <!-- Price Edit Modal -->
    <MarketPriceEditModal
      :visible="showPriceEditModal"
      :price="editingPrice"
      @update:visible="showPriceEditModal = $event"
      @update:price="editingPrice = $event"
      @confirm="confirmPriceEdit"
    />

    <!-- Preview Modal -->
    <MarketPreviewModal
      :visible="!!previewListing"
      :listing="previewListing"
      @update:visible="previewListing = $event ? previewListing : null"
      @purchase="openPurchase"
    />

    <!-- My Listings Modal -->
    <MarketMyListingsModal
      :visible="showMyListingsModal"
      @update:visible="showMyListingsModal = $event"
    />
  </div>
</template>
