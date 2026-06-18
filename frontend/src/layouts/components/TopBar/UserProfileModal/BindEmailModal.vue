<script setup lang="ts">

import { useUserStore } from '@/stores/user'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { sendAuthEmailCode } from '@/api/email'

type Step = 'bind' | 'manage' | 'verify-unbind' | 'success'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const userStore = useUserStore()
const siteConfigStore = useSiteConfigStore()

const step = ref<Step>('bind')
const email = ref('')
const code = ref('')
const countdown = ref(0)
const submitting = ref(false)
const emailError = ref('')
const codeError = ref('')
const successMessage = ref('')

let countdownTimer: ReturnType<typeof setInterval> | null = null

function maskEmail(e: string): string {
  const atIndex = e.indexOf('@')
  if (atIndex <= 2) return e
  const name = e.slice(0, atIndex)
  const domain = e.slice(atIndex)
  const visible = Math.min(3, Math.floor(name.length / 2))
  return name.slice(0, visible) + '***' + domain
}

function validateEmail(): boolean {
  if (!email.value) {
    emailError.value = '请输入邮箱地址'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = '请输入正确的邮箱地址'
    return false
  }
  emailError.value = ''
  return true
}

function validateCode(): boolean {
  if (!code.value) {
    codeError.value = '请输入验证码'
    return false
  }
  if (!/^\d{4,6}$/.test(code.value)) {
    codeError.value = '验证码为4-6位数字'
    return false
  }
  codeError.value = ''
  return true
}

function startCountdown() {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearCountdown()
    }
  }, 1000)
}

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  countdown.value = 0
}

async function handleSendCode() {
  if (!validateEmail()) return
  try {
    const sceneName = siteConfigStore.getEmailSceneName('bind')
    await sendAuthEmailCode({ name: sceneName, email: email.value })
    startCountdown()
  } catch (e: unknown) {
    emailError.value = e instanceof Error ? e.message : '验证码发送失败，请重试'
  }
}

async function handleSendUnbindCode() {
  try {
    const sceneName = siteConfigStore.getEmailSceneName('unbind')
    await sendAuthEmailCode({ name: sceneName, email: userStore.userInfo.email })
    startCountdown()
  } catch (e: unknown) {
    codeError.value = e instanceof Error ? e.message : '验证码发送失败，请重试'
  }
}

async function handleBind() {
  if (!validateEmail() || !validateCode()) return
  submitting.value = true
  try {
    const result = await userStore.bindEmailAction(email.value, code.value)
    if (result.success) {
      successMessage.value = '邮箱绑定成功'
      step.value = 'success'
    } else {
      codeError.value = result.message
    }
  } catch (e: unknown) {
    codeError.value = e instanceof Error ? e.message : '绑定失败，请重试'
  } finally {
    submitting.value = false
  }
}

async function handleUnbind() {
  if (!validateCode()) return
  submitting.value = true
  try {
    const result = await userStore.unbindEmailAction(code.value)
    if (result.success) {
      successMessage.value = '邮箱已解绑'
      step.value = 'success'
    } else {
      codeError.value = result.message
    }
  } catch (e: unknown) {
    codeError.value = e instanceof Error ? e.message : '解绑失败，请重试'
  } finally {
    submitting.value = false
  }
}

function goToStep(s: Step) {
  clearCountdown()
  email.value = ''
  code.value = ''
  emailError.value = ''
  codeError.value = ''
  submitting.value = false
  step.value = s
}

function resetAll() {
  clearCountdown()
  email.value = ''
  code.value = ''
  emailError.value = ''
  codeError.value = ''
  submitting.value = false
  successMessage.value = ''
  step.value = userStore.isEmailBound ? 'manage' : 'bind'
}

watch(() => props.visible, (val) => {
  if (val) resetAll()
  else clearCountdown()
})

onUnmounted(() => {
  clearCountdown()
})

const stepTitle = {
  bind: '绑定邮箱',
  manage: '邮箱管理',
  'verify-unbind': '解绑邮箱',
  success: '操作成功',
}

const stepDesc = {
  bind: '绑定邮箱以接收重要通知',
  manage: '管理您的邮箱绑定',
  'verify-unbind': '验证后将解除邮箱绑定',
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
        v-if="step === 'verify-unbind'"
        class="absolute top-4 left-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="goToStep('manage')"
      >
        <XbIcon name="arrow-left" :size="18" />
      </button>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center">
          <XbIcon name="mail" :size="22" class="text-brand" />
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
        <p class="text-xs text-content-tertiary mb-1">当前绑定邮箱</p>
        <p class="text-lg font-bold text-content">{{ maskEmail(userStore.userInfo.email) }}</p>
      </div>
      <div class="space-y-3">
        <button
          class="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-danger/30 hover:bg-danger/5 transition-all group"
          @click="goToStep('verify-unbind')"
        >
          <div class="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
            <XbIcon name="x" :size="18" class="text-danger" />
          </div>
          <div class="flex-1 text-left">
            <p class="text-sm font-medium text-content group-hover:text-danger transition-colors">解绑邮箱</p>
            <p class="text-[10px] text-content-tertiary">解除当前邮箱的绑定</p>
          </div>
          <XbIcon name="arrow-left" :size="16" class="text-content-tertiary rotate-180" />
        </button>
      </div>
    </div>

    <!-- Bind State -->
    <div v-else-if="step === 'bind'" class="px-6 py-5 space-y-4">
      <XbFormItem label="邮箱地址" required>
        <XbInput
          v-model="email"
          type="email"
          placeholder="请输入邮箱地址"
          :error="emailError"
          @blur="email && validateEmail()"
        />
      </XbFormItem>

      <XbFormItem label="验证码" required>
        <div class="flex gap-3">
          <XbInput
            v-model="code"
            type="text"
            :maxlength="6"
            placeholder="请输入验证码"
            :error="codeError"
            @blur="code && validateCode()"
          />
          <XbButton
            type="secondary"
            size="sm"
            :disabled="countdown > 0"
            @click="handleSendCode()"
          >
            <template #icon><XbIcon v-if="countdown === 0" name="send" :size="12" /></template>
            {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
          </XbButton>
        </div>
      </XbFormItem>

      <div class="flex gap-3 pt-2">
        <XbButton type="secondary" block @click="emit('close')">取消</XbButton>
        <XbButton block :loading="submitting" @click="handleBind()">确认绑定</XbButton>
      </div>
    </div>

    <!-- Verify Unbind State -->
    <div v-else-if="step === 'verify-unbind'" class="px-6 py-5 space-y-4">
      <div class="p-4 rounded-xl bg-surface-overlay/60 border border-border-subtle text-center">
        <p class="text-xs text-content-tertiary mb-1">验证码将发送至</p>
        <p class="text-base font-bold text-content">{{ maskEmail(userStore.userInfo.email) }}</p>
      </div>

      <XbFormItem label="验证码" required>
        <div class="flex gap-3">
          <XbInput
            v-model="code"
            type="text"
            :maxlength="6"
            placeholder="请输入验证码"
            :error="codeError"
            @blur="code && validateCode()"
          />
          <XbButton
            type="secondary"
            size="sm"
            :disabled="countdown > 0"
            @click="handleSendUnbindCode()"
          >
            <template #icon><XbIcon v-if="countdown === 0" name="send" :size="12" /></template>
            {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
          </XbButton>
        </div>
      </XbFormItem>

      <div class="flex gap-3 pt-2">
        <XbButton type="secondary" block @click="goToStep('manage')">取消</XbButton>
        <XbButton
          block
          type="danger"
          :loading="submitting"
          @click="handleUnbind()"
        >
          确认解绑
        </XbButton>
      </div>
    </div>
  </XbModal>
</template>
