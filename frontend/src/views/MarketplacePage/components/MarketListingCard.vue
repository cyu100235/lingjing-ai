<script setup lang="ts">
import type { MarketListing } from '@/stores/marketplace'
import { getTypeLabel } from '@/config/assetTypes'
import { isAudioAsset, isVideoAsset } from '@/utils/media'
import { onImgError } from '@/utils/image'

defineProps<{
  listing: MarketListing
}>()

const emit = defineEmits<{
  'preview': [listing: MarketListing]
  'purchase': [listing: MarketListing]
  'toggle-like': [id: string]
}>()

function formatViewCount(count: number): string {
  if (count >= 10000) return (count / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return count.toString()
}
</script>

<template>
  <div class="card-base overflow-hidden group relative">
    <!-- Thumbnail -->
    <div class="aspect-[4/3] overflow-hidden bg-black relative cursor-pointer" @click="emit('preview', listing)">
      <img
        :src="listing.asset.thumbnail"
        :alt="listing.asset.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        @error="(e: any) => onImgError(e)"
      />
      <!-- Type badge -->
      <span class="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] bg-black/60 text-white">
        {{ getTypeLabel(listing.asset.type) }}
      </span>
      <!-- Like button -->
      <button
        class="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
        :class="listing.liked ? 'bg-red-500/90 text-white' : 'bg-black/40 text-white/80 hover:bg-black/60'"
        @click.stop="emit('toggle-like', listing.id)"
      >
        <XbIcon name="heart" :size="12" :fill="listing.liked ? 'currentColor' : 'none'" />
      </button>
      <!-- Preview hint for audio/video -->
      <div
        v-if="isAudioAsset(listing.asset.type) || isVideoAsset(listing.asset.type)"
        class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
      >
        <div class="w-10 h-10 rounded-full bg-brand/80 flex items-center justify-center">
          <XbIcon name="play" :size="18" class="text-white ml-0.5" />
        </div>
      </div>

      <!-- Seller & Price overlay -->
      <div class="absolute -bottom-px left-0 right-0 flex items-center justify-between px-2.5 py-1.5 bg-black/60">
        <div class="flex items-center gap-1.5 min-w-0">
          <img :src="listing.sellerAvatar" class="w-5 h-5 rounded-full object-cover shrink-0" @error="(e: any) => onImgError(e)" />
          <span class="text-[10px] text-white/90 truncate">{{ listing.sellerName }}</span>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <XbIcon name="coins" :size="11" class="text-amber-400" />
          <span class="text-xs font-bold text-white">{{ listing.price }}</span>
          <span v-if="listing.originalPrice" class="text-[9px] text-white/60 line-through ml-0.5">{{ listing.originalPrice }}</span>
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="p-3">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-medium text-content truncate flex-1">{{ listing.asset.name }}</h4>
        <span class="flex items-center gap-0.5 text-[10px] text-orange-400 shrink-0 ml-2">
          <XbIcon name="flame" :size="10" />
          {{ formatViewCount(listing.viewCount) }}
        </span>
      </div>
      <div class="flex items-center justify-between mt-1.5">
        <div v-if="listing.asset.tags.length" class="flex items-center gap-1">
          <span
            v-for="tag in listing.asset.tags.slice(0, 2)"
            :key="tag"
            class="px-1 py-0 rounded text-[9px] bg-surface-overlay text-content-tertiary"
          >{{ tag }}</span>
        </div>
        <button
          class="flex items-center gap-1 px-2 py-1 rounded bg-brand text-white text-[10px] font-medium hover:bg-brand/80 transition-colors ml-auto"
          @click.stop="emit('purchase', listing)"
        >
          <XbIcon name="shopping-cart" :size="10" />
          购买
        </button>
      </div>
    </div>
  </div>
</template>
