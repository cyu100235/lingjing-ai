<script setup lang="ts">
import type { VipPlan } from '../../VipModal/types'

defineProps<{
  selectedPlan: VipPlan | null
  payMethod: 'alipay' | 'wechat'
  payLoading: boolean
}>()

const emit = defineEmits<{
  selectMethod: [method: 'alipay' | 'wechat']
  confirmPay: []
}>()
</script>

<template>
  <div class="px-6 py-5">
    <!-- 订单信息 -->
    <div class="p-4 rounded-xl bg-surface-overlay/60 border border-border-subtle mb-5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-content-secondary">套餐名称</span>
        <span class="text-sm font-medium text-content">{{ selectedPlan?.name }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs text-content-secondary">支付金额</span>
        <div class="flex items-baseline gap-0.5">
          <span class="text-xs text-amber-400">¥</span>
          <span class="text-xl font-bold text-amber-400">{{ selectedPlan?.price }}</span>
        </div>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="mb-5">
      <label class="text-xs text-content-secondary mb-3 block font-medium">选择支付方式</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          class="relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200"
          :class="payMethod === 'alipay'
            ? 'border-[#1677FF] bg-[#1677FF]/5 shadow-[0_0_12px_rgba(22,119,255,0.15)]'
            : 'border-border hover:border-[#1677FF]/40'"
          @click="emit('selectMethod', 'alipay')"
        >
          <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="payMethod === 'alipay' ? 'bg-[#1677FF]/15' : 'bg-surface-overlay'">
            <svg viewBox="0 0 1024 1024" class="w-5 h-5">
              <path d="M230.4 460.8c-12.8 0-25.6-12.8-25.6-25.6V384c0-12.8 12.8-25.6 25.6-25.6s25.6 12.8 25.6 25.6v51.2c0 12.8-12.8 25.6-25.6 25.6z" fill="#1677FF"/>
              <path d="M512 0C230.4 0 0 230.4 0 512s230.4 512 512 512 512-230.4 512-512S793.6 0 512 0z m268.8 627.2c-12.8 6.4-76.8 38.4-153.6 64-25.6-51.2-51.2-108.8-76.8-166.4h108.8c12.8 0 25.6-12.8 25.6-25.6s-12.8-25.6-25.6-25.6H569.6v-51.2h108.8c12.8 0 25.6-12.8 25.6-25.6s-12.8-25.6-25.6-25.6H569.6v-64c0-12.8-12.8-25.6-25.6-25.6s-25.6 12.8-25.6 25.6v64h-108.8c-12.8 0-25.6 12.8-25.6 25.6s12.8 25.6 25.6 25.6h108.8v51.2h-108.8c-12.8 0-25.6 12.8-25.6 25.6s12.8 25.6 25.6 25.6H480c25.6 57.6 51.2 115.2 76.8 166.4C480 704 384 729.6 294.4 729.6c-12.8 0-25.6 12.8-25.6 25.6s12.8 25.6 25.6 25.6c102.4 0 204.8-25.6 294.4-64 89.6 38.4 166.4 64 179.2 64 12.8 0 25.6-12.8 25.6-25.6-6.4-44.8-6.4-89.6 0-128z" fill="#1677FF"/>
            </svg>
          </div>
          <div class="text-left">
            <p class="text-sm font-medium" :class="payMethod === 'alipay' ? 'text-[#1677FF]' : 'text-content'">支付宝</p>
            <p class="text-[10px] text-content-tertiary mt-0.5">Alipay</p>
          </div>
          <div v-if="payMethod === 'alipay'" class="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1677FF] flex items-center justify-center">
            <XbIcon name="check" :size="10" class="text-white" />
          </div>
        </button>
        <button
          class="relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200"
          :class="payMethod === 'wechat'
            ? 'border-[#07C160] bg-[#07C160]/5 shadow-[0_0_12px_rgba(7,193,96,0.15)]'
            : 'border-border hover:border-[#07C160]/40'"
          @click="emit('selectMethod', 'wechat')"
        >
          <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="payMethod === 'wechat' ? 'bg-[#07C160]/15' : 'bg-surface-overlay'">
            <svg viewBox="0 0 1024 1024" class="w-5 h-5">
              <path d="M690.1 377.4c5.9 0 11.8 0.3 17.6 0.8-15.8-73.2-88.5-127.8-174.3-127.8-95.5 0-173.2 63.2-173.2 142.4 0 46.2 25.1 84.6 67.3 113.2l-16.8 50.4 58.8-29.4c21.1 4.2 37.9 8.4 58.8 8.4 5.7 0 11.3-0.3 16.9-0.8-3.5-12.2-5.5-24.8-5.5-37.9 0-67.6 67.6-119.3 150.4-119.3z m-94.5-49.3c12.6 0 21.1 8.4 21.1 21.1 0 12.6-8.4 21.1-21.1 21.1-12.6 0-25.1-8.4-25.1-21.1 0-12.7 12.5-21.1 25.1-21.1z m-126.1 42.1c-12.6 0-25.1-8.4-25.1-21.1 0-12.6 12.6-21.1 25.1-21.1 12.6 0 21.1 8.4 21.1 21.1 0 12.7-8.5 21.1-21.1 21.1z" fill="#07C160"/>
              <path d="M820.4 496.2c0-67.6-67.6-122.6-143.5-122.6-80.1 0-143.5 55-143.5 122.6 0 67.6 63.4 122.6 143.5 122.6 16.8 0 33.6-4.2 50.4-8.4l46.2 25.1-12.6-42c33.6-25.1 59.5-59.3 59.5-97.3z m-190.5-21.1c-8.4 0-16.8-8.4-16.8-16.8 0-8.4 8.4-16.8 16.8-16.8 12.6 0 21.1 8.4 21.1 16.8 0 8.4-8.5 16.8-21.1 16.8z m94.5 0c-8.4 0-16.8-8.4-16.8-16.8 0-8.4 8.4-16.8 16.8-16.8 12.6 0 21.1 8.4 21.1 16.8 0 8.4-8.4 16.8-21.1 16.8z" fill="#07C160"/>
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m185.4 581.4c-21.1 16.8-46.2 29.4-75.4 37.9l16.8 54.6-63.4-33.6c-21.1 4.2-42.1 8.4-63.4 8.4-1.1 0-2.2 0-3.3-0.1 13.8-19.2 22-41.9 22-66.3 0-76.1-72.6-137.8-162.1-137.8-10.8 0-21.3 1-31.5 2.7-1.8-10.7-2.7-21.6-2.7-32.7 0-97.2 84.6-176.6 189.5-176.6 100.6 0 189.5 75.4 189.5 168.2 0 42-21.1 80.1-59.5 109.5l16.8 50.4-58.8-29.4c5.8 13.5 9.6 27.9 9.6 43.3 0 0.3-0.1 0.7-0.1 1z" fill="#07C160"/>
            </svg>
          </div>
          <div class="text-left">
            <p class="text-sm font-medium" :class="payMethod === 'wechat' ? 'text-[#07C160]' : 'text-content'">微信支付</p>
            <p class="text-[10px] text-content-tertiary mt-0.5">WeChat Pay</p>
          </div>
          <div v-if="payMethod === 'wechat'" class="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#07C160] flex items-center justify-center">
            <XbIcon name="check" :size="10" class="text-white" />
          </div>
        </button>
      </div>
    </div>

    <!-- 二维码 -->
    <div class="flex flex-col items-center p-5 rounded-xl border border-border-subtle bg-surface-overlay/40 mb-5">
      <div class="w-40 h-40 rounded-lg bg-white flex items-center justify-center border border-border-subtle mb-3">
        <div class="flex flex-col items-center gap-2">
          <XbIcon name="qr-code" :size="80" class="text-content-tertiary" />
          <span class="text-[10px] text-content-tertiary">模拟二维码</span>
        </div>
      </div>
      <p class="text-xs text-content-secondary">
        请使用<span :class="payMethod === 'alipay' ? 'text-[#1677FF] font-medium' : 'text-[#07C160] font-medium'">{{ payMethod === 'alipay' ? '支付宝' : '微信' }}</span>扫码支付
      </p>
    </div>

    <!-- 确认支付 -->
    <button
      class="w-full py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2"
      :class="payMethod === 'alipay'
        ? 'bg-[#1677FF] hover:bg-[#1677FF]/90 shadow-[0_4px_12px_rgba(22,119,255,0.3)]'
        : 'bg-[#07C160] hover:bg-[#07C160]/90 shadow-[0_4px_12px_rgba(7,193,96,0.3)]'"
      :disabled="payLoading"
      @click="emit('confirmPay')"
    >
      <span v-if="payLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      <XbIcon v-else name="shield-check" :size="16" />
      {{ payLoading ? '支付处理中...' : `确认支付 ¥${selectedPlan?.price}` }}
    </button>
    <p class="text-center text-[10px] text-content-tertiary mt-3">
      <XbIcon name="shield-check" :size="10" class="inline -mt-0.5" />
      支付安全由第三方平台保障，请放心支付
    </p>
  </div>
</template>
