<script setup lang="ts">
import type { MarketListing } from '@/stores/marketplace'
import { useMarketplaceStore } from '@/stores/marketplace'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { getTypeLabel } from '@/config/assetTypes'
import { onImgError } from '@/utils/image'
import { isAudioAsset, isVideoAsset } from '@/utils/media'

const props = defineProps<{
  visible: boolean
  listing: MarketListing | null
  success: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': []
}>()

const store = useMarketplaceStore()
const siteConfigStore = useSiteConfigStore()
</script>

<template>
  <XbModal
    :visible="visible"
    :title="success ? '购买成功' : '确认购买'"
    width="w-[32rem]"
    @update:visible="emit('update:visible', $event)"
  >
    <template v-if="listing && !success">
      <!-- Asset preview -->
      <div class="flex gap-4 mb-4">
        <div class="w-32 h-24 overflow-hidden bg-surface-overlay shrink-0" :class="{ 'rounded-lg': !isAudioAsset(listing.asset.type) && !isVideoAsset(listing.asset.type) }">
          <img :src="listing.asset.thumbnail" :alt="listing.asset.name" class="w-full h-full object-cover" @error="(e: any) => onImgError(e)" />
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-content">{{ listing.asset.name }}</h4>
          <p class="text-[10px] text-content-tertiary mt-1">{{ getTypeLabel(listing.asset.type) }}</p>
          <div class="flex items-center gap-2 mt-2">
            <img :src="listing.sellerAvatar" class="w-5 h-5 rounded-full object-cover" @error="(e: any) => onImgError(e)" />
            <span class="text-xs text-content-secondary">{{ listing.sellerName }}</span>
          </div>
        </div>
      </div>

      <!-- Price info -->
      <div class="p-4 rounded-lg bg-surface-overlay mb-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-content-secondary">商品价格</span>
          <div class="flex items-center gap-1">
            <XbIcon name="coins" :size="16" class="text-amber-400" />
            <span class="text-lg font-bold text-brand">{{ listing.price }}</span>
            <span class="text-xs text-content-tertiary">{{ siteConfigStore.currencyName }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle">
          <span class="text-xs text-content-tertiary">当前余额</span>
          <span class="text-sm" :class="siteConfigStore.currencyBalance >= listing.price ? 'text-content' : 'text-danger'">
            {{ siteConfigStore.currencyBalance }} {{ siteConfigStore.currencyName }}
          </span>
        </div>
        <div class="flex items-center justify-between mt-1">
          <span class="text-xs text-content-tertiary">支付后余额</span>
          <span class="text-sm" :class="siteConfigStore.currencyBalance >= listing.price ? 'text-content' : 'text-danger'">
            {{ siteConfigStore.currencyBalance - listing.price }} {{ siteConfigStore.currencyName }}
          </span>
        </div>
      </div>

      <!-- Copyright notice -->
      <div class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
        <p class="text-[11px] text-amber-600 leading-relaxed">购买该资产仅获得授权使用权，不转让所有权。请在授权范围内使用，禁止二次转售。</p>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-2">
        <button class="btn-secondary text-xs px-4 py-2" @click="emit('update:visible', false)">取消</button>
        <button
          class="btn-primary flex items-center gap-1.5 text-xs px-4 py-2"
          :disabled="siteConfigStore.currencyBalance < listing.price"
          @click="emit('confirm')"
        >
          <XbIcon name="shopping-cart" :size="14" />
          {{ siteConfigStore.currencyBalance < listing.price ? '余额不足' : '确认购买' }}
        </button>
      </div>
    </template>

    <!-- Purchase success -->
    <template v-if="success">
      <div class="flex flex-col items-center py-6">
        <div class="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mb-4">
          <XbIcon name="check" :size="32" class="text-brand" />
        </div>
        <p class="text-sm text-content mb-2">购买成功！</p>
        <p class="text-xs text-content-secondary">资产已添加到您的资产库</p>
      </div>
      <div class="flex justify-end">
        <button class="btn-primary text-xs px-4 py-2" @click="emit('update:visible', false)">完成</button>
      </div>
    </template>
  </XbModal>
</template>
