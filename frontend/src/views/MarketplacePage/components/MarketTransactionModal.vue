<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMarketplaceStore, type Transaction } from '@/stores/marketplace'
import { onImgError } from '@/utils/image'
import type { TabItem } from '@/xbUi/XbTabs/index.vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const store = useMarketplaceStore()

const txTab = ref<string>('all')
const txTabs: TabItem[] = [
  { label: '全部', value: 'all' },
  { label: '买入', value: 'buy' },
  { label: '卖出', value: 'sell' },
]

const filteredTransactions = computed<Transaction[]>(() => {
  if (txTab.value === 'buy') return store.buyTransactions
  if (txTab.value === 'sell') return store.sellTransactions
  return store.transactions
})
</script>

<template>
  <XbModal
    :visible="visible"
    width="w-[36rem]"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <h3 class="text-base font-semibold text-content flex items-center gap-2">
        <XbIcon name="receipt" :size="18" class="text-brand" />
        交易记录
      </h3>
    </template>

    <!-- Stats cards -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="p-3 rounded-lg bg-surface-overlay text-center">
        <p class="text-lg font-bold text-brand">{{ store.wallet.totalEarnings }}</p>
        <p class="text-[10px] text-content-tertiary mt-0.5">总收入 (金币)</p>
      </div>
      <div class="p-3 rounded-lg bg-surface-overlay text-center">
        <p class="text-lg font-bold text-amber-400">{{ store.wallet.totalSpent }}</p>
        <p class="text-[10px] text-content-tertiary mt-0.5">总支出 (金币)</p>
      </div>
      <div class="p-3 rounded-lg bg-surface-overlay text-center">
        <p class="text-lg font-bold text-content">{{ store.transactions.length }}</p>
        <p class="text-[10px] text-content-tertiary mt-0.5">交易笔数</p>
      </div>
    </div>

    <!-- Tabs -->
    <XbTabs v-model="txTab" :tabs="txTabs" variant="card" size="sm" />

    <!-- Transaction list -->
    <div class="space-y-2 max-h-[400px] overflow-y-auto mt-0">
      <div
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-elevated transition-colors"
      >
        <img :src="tx.assetThumbnail" class="w-10 h-10 rounded-lg object-cover" @error="(e: any) => onImgError(e)" />
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-content truncate">{{ tx.assetName }}</p>
          <p class="text-[10px] text-content-tertiary mt-0.5">
            {{ tx.type === 'buy' ? '从' : '售予' }} {{ tx.type === 'buy' ? tx.sellerName : tx.buyerName }}
          </p>
        </div>
        <div class="text-right">
          <div class="flex items-center gap-1" :class="tx.type === 'sell' ? 'text-brand' : 'text-amber-400'">
            <XbIcon v-if="tx.type === 'buy'" name="arrow-down-left" :size="12" />
            <XbIcon v-else name="arrow-up-right" :size="12" />
            <span class="text-sm font-medium">{{ tx.type === 'sell' ? '+' : '-' }}{{ tx.price }}</span>
          </div>
          <p class="text-[10px] text-content-tertiary mt-0.5">{{ tx.createdAt }}</p>
        </div>
      </div>
    </div>

    <div v-if="!filteredTransactions.length" class="flex flex-col items-center py-8">
      <XbIcon name="receipt" :size="32" class="text-content-tertiary mb-2" />
      <p class="text-xs text-content-secondary">暂无交易记录</p>
    </div>
  </XbModal>
</template>
