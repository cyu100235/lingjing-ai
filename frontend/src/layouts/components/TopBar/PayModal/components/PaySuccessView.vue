<script setup lang="ts">
import type { VipPlan } from '../../VipModal/types'

defineProps<{
  selectedPlan: VipPlan | null
}>()

const emit = defineEmits<{
  startUsing: []
}>()
</script>

<template>
  <div class="px-6 py-10 flex flex-col items-center">
    <div class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-bounce-in">
      <XbIcon name="check" :size="32" class="text-green-500" />
    </div>
    <h4 class="text-lg font-bold text-content mb-1">支付成功</h4>
    <p class="text-sm text-content-secondary mb-6">恭喜你，{{ selectedPlan?.name }}已开通</p>
    <button
      class="px-8 py-2.5 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand/90 transition-colors"
      @click="emit('startUsing')"
    >
      开始使用
    </button>
  </div>
</template>
