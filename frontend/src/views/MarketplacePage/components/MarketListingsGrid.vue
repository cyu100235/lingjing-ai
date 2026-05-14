<script setup lang="ts">
import type { MarketListing, MarketSortOption } from '@/stores/marketplace'
import MarketListingCard from './MarketListingCard.vue'

defineProps<{
  listings: MarketListing[]
  currentPage: number
  totalPages: number
  searchInput: string
  sortBy: MarketSortOption
  sortOptions: { value: MarketSortOption; label: string }[]
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:searchInput': [value: string]
  'update:sortBy': [value: MarketSortOption]
  'search': []
  'preview': [listing: MarketListing]
  'purchase': [listing: MarketListing]
  'toggle-like': [id: string]
}>()
</script>

<template>
  <div class="flex-1">
    <!-- Search & sort bar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 flex-1 max-w-md">
        <div class="relative flex-1">
          <XbIcon name="search" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
          <input
            :value="searchInput"
            type="text"
            placeholder="搜索商品名称、标签或卖家..."
            class="input-base pl-9 h-8 text-xs"
            @input="emit('update:searchInput', ($event.target as HTMLInputElement).value)"
            @keyup.enter="emit('search')"
          />
        </div>
        <button
          class="px-3 h-8 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors flex items-center gap-1 shrink-0"
          @click="emit('search')"
        >
          <XbIcon name="search" :size="12" />
          搜索
        </button>
      </div>
      <div class="flex items-center gap-2">
        <XbIcon name="arrow-up-down" :size="14" class="text-content-tertiary" />
        <XbSelect
          :modelValue="sortBy"
          :options="sortOptions"
          class="h-8 text-xs"
          @change="emit('update:sortBy', $event as MarketSortOption)"
        />
      </div>
    </div>

    <!-- Listings grid -->
    <div v-if="listings.length" class="grid grid-cols-4 gap-4">
      <MarketListingCard
        v-for="listing in listings"
        :key="listing.id"
        :listing="listing"
        @preview="emit('preview', $event)"
        @purchase="emit('purchase', $event)"
        @toggle-like="emit('toggle-like', $event)"
      />
    </div>

    <!-- Empty state -->
    <XbEmpty
      v-else
      :icon="'package'"
      description="暂无商品"
    />

    <!-- Pagination -->
    <XbPagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:current-page="emit('update:currentPage', $event)"
    />
  </div>
</template>
