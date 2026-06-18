<script setup lang="ts">
import type { RechargeAmountItem } from '@/api/config'

interface Props {
  selectedPackage: RechargeAmountItem
  rechargePayMethod: 'alipay' | 'wechat'
  rechargeLoading: boolean
  currencyName: string
}

defineProps<Props>()

const emit = defineEmits<{
  backToSelect: []
  confirmRecharge: []
}>()

function backToSelect() {
  emit('backToSelect')
}

function confirmRecharge() {
  emit('confirmRecharge')
}
</script>

<template>
  <div class="px-6 py-5">
    <!-- Order Summary -->
    <div class="p-4 rounded-xl bg-surface-overlay/60 border border-border-subtle mb-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-content-secondary">充值套餐</span>
        <span class="text-sm font-medium text-content">{{ selectedPackage.recharge_amount }}{{ currencyName }}<span v-if="Number(selectedPackage.give_amount) > 0" class="text-red-500 text-xs ml-1">+赠{{ selectedPackage.give_amount }}{{ currencyName }}</span></span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs text-content-secondary">支付金额</span>
        <div class="flex items-baseline gap-0.5">
          <span class="text-xs text-yellow-400">¥</span>
          <span class="text-xl font-bold text-yellow-400">{{ selectedPackage.recharge_amount }}</span>
        </div>
      </div>
    </div>

    <!-- QR Code -->
    <div class="flex flex-col items-center p-5 rounded-xl border border-border-subtle bg-surface-overlay/40 mb-5">
      <div class="w-44 h-44 rounded-lg bg-white flex items-center justify-center border border-border-subtle mb-3">
        <div class="flex flex-col items-center gap-2">
          <XbIcon name="qr-code" :size="90" class="text-content-tertiary" />
          <span class="text-[10px] text-content-tertiary">模拟二维码</span>
        </div>
      </div>
      <p class="text-xs text-content-secondary">
        请使用<span
          :class="rechargePayMethod === 'alipay' ? 'text-[#1677FF] font-medium' : 'text-[#07C160] font-medium'">{{
            rechargePayMethod === 'alipay' ? '支付宝' : '微信' }}</span>扫描二维码完成支付
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
      <XbButton type="secondary" size="lg" class="flex-1" @click="backToSelect">
        返回修改
      </XbButton>
      <button
        class="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2"
        :class="rechargePayMethod === 'alipay'
          ? 'bg-[#1677FF] hover:bg-[#1677FF]/90 shadow-[0_4px_12px_rgba(22,119,255,0.3)]'
          : 'bg-[#07C160] hover:bg-[#07C160]/90 shadow-[0_4px_12px_rgba(7,193,96,0.3)]'"
        :disabled="rechargeLoading" @click="confirmRecharge">
        <span v-if="rechargeLoading"
          class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        <XbIcon v-else name="check" :size="16" />
        {{ rechargeLoading ? '确认中...' : '我已完成支付' }}
      </button>
    </div>
    <p class="text-center text-[10px] text-content-tertiary mt-3">
      <XbIcon name="shield-check" :size="10" class="inline -mt-0.5" />
      支付安全由第三方平台保障，请放心支付
    </p>
  </div>
</template>
