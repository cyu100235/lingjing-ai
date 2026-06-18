<script setup lang="ts">
import { XbIcon } from '@/xbUi'

const emit = defineEmits<{
  close: []
  back: []
}>()
</script>

<template>
  <div>
    <div class="relative px-8 pt-8 pb-5 bg-gradient-to-br from-[#07C160]/10 via-surface-elevated to-surface-elevated">
      <button
        class="absolute top-4 left-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="$emit('back')"
      >
        <XbIcon name="arrow-left" :size="18" />
      </button>
      <button
        class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="$emit('close')"
      >
        <XbIcon name="x" :size="18" />
      </button>
      <div class="flex flex-col items-center">
        <h3 class="text-lg font-bold text-content">微信扫码登录</h3>
        <p class="text-xs text-content-tertiary mt-1">使用微信扫描二维码完成登录</p>
      </div>
    </div>

    <div class="px-8 py-8 flex flex-col items-center">
      <!-- QR Code area -->
      <div class="w-48 h-48 rounded-xl bg-white border border-border-subtle flex items-center justify-center mb-5 shadow-sm">
        <div class="flex flex-col items-center gap-3">
          <XbIcon name="qr-code" :size="100" class="text-gray-400" />
          <span class="text-[10px] text-gray-400">模拟二维码</span>
        </div>
      </div>

      <!-- Scan tips -->
      <div class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#07C160]/5 border border-[#07C160]/15">
        <XbIcon name="message-circle" :size="16" class="text-[#07C160] shrink-0" />
        <p class="text-xs text-content-secondary">请打开微信<span class="text-[#07C160] font-medium">「扫一扫」</span>扫描二维码</p>
      </div>

      <div class="text-center mt-6">
        <button
          class="text-xs text-content-tertiary hover:text-content-secondary transition-colors cursor-pointer"
          @click="$emit('back')"
        >
          返回账号登录
        </button>
      </div>
    </div>
  </div>
</template>
