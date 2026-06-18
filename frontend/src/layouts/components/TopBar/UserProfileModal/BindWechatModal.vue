<script setup lang="ts">

import { useUserStore } from '@/stores/user'

type Step = 'scan' | 'manage' | 're-scan' | 'confirm-unbind' | 'success'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const userStore = useUserStore()

const step = ref<Step>('scan')
const scanning = ref(false)
const submitting = ref(false)
const successMessage = ref('')

let scanTimeout: ReturnType<typeof setTimeout> | null = null

function clearScanTimeout() {
  if (scanTimeout) {
    clearTimeout(scanTimeout)
    scanTimeout = null
  }
}

async function simulateScan() {
  scanning.value = true
  await userStore.bindWechat('微信用户_' + Math.random().toString(36).slice(2, 8))
  scanning.value = false
  successMessage.value = step.value === 're-scan' ? '微信换绑成功' : '微信绑定成功'
  step.value = 'success'
}

async function handleUnbind() {
  submitting.value = true
  await userStore.unbindWechat()
  submitting.value = false
  successMessage.value = '微信已解绑'
  step.value = 'success'
}

function goToStep(s: Step) {
  clearScanTimeout()
  scanning.value = false
  submitting.value = false
  step.value = s
}

function resetAll() {
  clearScanTimeout()
  scanning.value = false
  submitting.value = false
  successMessage.value = ''
  step.value = userStore.isWechatBound ? 'manage' : 'scan'
}

watch(() => props.visible, (val) => {
  if (val) resetAll()
  else clearScanTimeout()
})

onUnmounted(() => {
  clearScanTimeout()
})

const stepTitle = {
  scan: '绑定微信',
  manage: '微信管理',
  're-scan': '换绑微信',
  'confirm-unbind': '解绑微信',
  success: '操作成功',
}

const stepDesc = {
  scan: '扫描二维码绑定微信账号',
  manage: '管理您的微信绑定',
  're-scan': '扫描二维码绑定新的微信账号',
  'confirm-unbind': '确认解除微信绑定',
  success: '',
}
</script>

<template>
  <XbModal :visible="visible" no-padding width="w-[420px]" :show-close="false" @close="emit('close')">
    <!-- Header -->
    <div class="relative px-6 pt-6 pb-5 bg-gradient-to-br from-brand/20 via-surface-elevated to-surface-elevated border-b border-border-subtle">
      <button
        class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="emit('close')"
      >
        <XbIcon name="x" :size="18" />
      </button>
      <button
        v-if="step === 're-scan' || step === 'confirm-unbind'"
        class="absolute top-4 left-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="goToStep('manage')"
      >
        <XbIcon name="arrow-left" :size="18" />
      </button>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#07C160]/15 flex items-center justify-center">
          <XbIcon name="message-circle" :size="22" class="text-[#07C160]" />
        </div>
        <div>
          <h3 class="text-base font-bold text-content">{{ stepTitle[step] }}</h3>
          <p v-if="stepDesc[step]" class="text-xs text-content-tertiary mt-0.5">{{ stepDesc[step] }}</p>
        </div>
      </div>
    </div>

    <!-- Success State -->
    <div v-if="step === 'success'" class="px-6 py-10 flex flex-col items-center">
      <div class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-bounce-in">
        <XbIcon name="check" :size="32" class="text-green-500" />
      </div>
      <h4 class="text-lg font-bold text-content mb-1">{{ successMessage }}</h4>
      <p class="text-sm text-content-secondary mb-6">操作已完成</p>
      <XbButton size="sm" @click="emit('close')">完成</XbButton>
    </div>

    <!-- Manage State -->
    <div v-else-if="step === 'manage'" class="px-6 py-5 space-y-4">
      <div class="p-4 rounded-xl bg-surface-overlay/60 border border-border-subtle">
        <p class="text-xs text-content-tertiary mb-2">当前绑定微信</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#07C160]/15 flex items-center justify-center">
            <XbIcon name="message-circle" :size="20" class="text-[#07C160]" />
          </div>
          <div>
            <p class="text-sm font-bold text-content">{{ userStore.userInfo.wechat }}</p>
            <p class="text-[10px] text-content-tertiary">已绑定</p>
          </div>
        </div>
      </div>
      <div class="space-y-3">
        <button
          class="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-[#07C160]/30 hover:bg-[#07C160]/5 transition-all group"
          @click="goToStep('re-scan')"
        >
          <div class="w-9 h-9 rounded-lg bg-[#07C160]/10 flex items-center justify-center shrink-0">
            <XbIcon name="qr-code" :size="18" class="text-[#07C160]" />
          </div>
          <div class="flex-1 text-left">
            <p class="text-sm font-medium text-content group-hover:text-[#07C160] transition-colors">换绑微信</p>
            <p class="text-[10px] text-content-tertiary">扫码绑定新的微信账号</p>
          </div>
          <XbIcon name="arrow-left" :size="16" class="text-content-tertiary rotate-180" />
        </button>
        <button
          class="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-danger/30 hover:bg-danger/5 transition-all group"
          @click="goToStep('confirm-unbind')"
        >
          <div class="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
            <XbIcon name="unlink" :size="18" class="text-danger" />
          </div>
          <div class="flex-1 text-left">
            <p class="text-sm font-medium text-content group-hover:text-danger transition-colors">解绑微信</p>
            <p class="text-[10px] text-content-tertiary">解除当前微信的绑定</p>
          </div>
          <XbIcon name="arrow-left" :size="16" class="text-content-tertiary rotate-180" />
        </button>
      </div>
    </div>

    <!-- Scan / Re-scan State -->
    <div v-else-if="step === 'scan' || step === 're-scan'" class="px-6 py-5">
      <div class="flex flex-col items-center p-5 rounded-xl border border-border-subtle bg-surface-overlay/40 mb-5">
        <!-- QR Code Area -->
        <div class="relative w-44 h-44 rounded-lg bg-white flex items-center justify-center border border-border-subtle mb-3">
          <div class="flex flex-col items-center gap-2">
            <XbIcon name="qr-code" :size="80" class="text-gray-400" />
            <span class="text-[10px] text-gray-500">模拟二维码</span>
          </div>
          <!-- Scanning overlay -->
          <div
            v-if="scanning"
            class="absolute inset-0 rounded-lg bg-black/50 flex flex-col items-center justify-center"
          >
            <div class="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
            <span class="text-xs text-white">扫码中...</span>
          </div>
        </div>
        <p class="text-xs text-content-secondary">
          请使用<span class="text-[#07C160] font-medium">微信</span>扫描二维码
        </p>
      </div>

      <!-- Simulate scan button -->
      <XbButton
        block
        :loading="scanning"
        class="bg-[#07C160] hover:opacity-90 mb-3"
        @click="simulateScan()"
      >
        <template #icon><XbIcon v-if="!scanning" name="message-circle" :size="16" /></template>
        {{ scanning ? '等待扫码...' : '模拟扫码成功' }}
      </XbButton>

      <XbButton type="secondary" block @click="step === 're-scan' ? goToStep('manage') : emit('close')">取消</XbButton>
    </div>

    <!-- Confirm Unbind State -->
    <div v-else-if="step === 'confirm-unbind'" class="px-6 py-5">
      <div class="flex flex-col items-center py-4">
        <div class="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mb-4">
          <XbIcon name="alert-triangle" :size="28" class="text-danger" />
        </div>
        <h4 class="text-base font-bold text-content mb-2">确认解绑微信？</h4>
        <p class="text-sm text-content-secondary text-center mb-1">
          解绑后将无法使用微信登录
        </p>
        <p class="text-xs text-content-tertiary text-center">
          当前绑定：{{ userStore.userInfo.wechat }}
        </p>
      </div>

      <div class="flex gap-3 pt-2">
        <XbButton type="secondary" block @click="goToStep('manage')">取消</XbButton>
        <XbButton type="danger" block :loading="submitting" @click="handleUnbind">确认解绑</XbButton>
      </div>
    </div>
  </XbModal>
</template>
