<script setup lang="ts">

defineProps<{
  myListingCount: number
}>()

defineEmits<{
  'open-my-listings': []
  'open-transactions': []
}>()
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-xl font-semibold text-content">资产市场</h2>
    <div class="flex items-center gap-3">
      <!-- My Listings button -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-content-secondary hover:border-brand/40 hover:text-content transition-colors"
        @click="$emit('open-my-listings')"
      >
        <XbIcon name="tag" :size="14" />
        我的上架
        <span v-if="myListingCount" class="px-1.5 py-0.5 rounded-full bg-brand/20 text-brand text-[10px]">{{ myListingCount }}</span>
      </button>
      <!-- Transaction history -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-content-secondary hover:border-brand/40 hover:text-content transition-colors"
        @click="$emit('open-transactions')"
      >
        <XbIcon name="receipt" :size="14" />
        交易记录
      </button>
    </div>
  </div>
</template>
