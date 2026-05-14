<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  success: []
  back: []
}>()

const forgotPhone = ref('')
const forgotSmsCode = ref('')
const forgotNewPwd = ref('')
const forgotConfirmPwd = ref('')
const forgotCaptcha = ref('')
const forgotLoading = ref(false)
const forgotError = ref('')
const forgotSmsCooldown = ref(0)
const showForgotPwd = ref(false)
const showForgotConfirmPwd = ref(false)

let cooldownTimer: ReturnType<typeof setInterval> | null = null

function startForgotSmsCooldown() {
  if (forgotSmsCooldown.value > 0) return
  if (!forgotPhone.value.trim()) {
    forgotError.value = '请输入手机号码'
    return
  }
  forgotSmsCooldown.value = 60
  cooldownTimer = setInterval(() => {
    forgotSmsCooldown.value--
    if (forgotSmsCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function handleForgotSubmit() {
  forgotError.value = ''
  if (!forgotPhone.value.trim()) { forgotError.value = '请输入手机号码'; return }
  if (!forgotSmsCode.value.trim()) { forgotError.value = '请输入验证码'; return }
  if (!forgotNewPwd.value.trim()) { forgotError.value = '请输入新密码'; return }
  if (forgotNewPwd.value.length < 6) { forgotError.value = '密码长度不能少于6位'; return }
  if (forgotNewPwd.value !== forgotConfirmPwd.value) { forgotError.value = '两次密码输入不一致'; return }
  if (!forgotCaptcha.value.trim()) { forgotError.value = '请输入验证码'; return }
  forgotLoading.value = true
  setTimeout(() => {
    forgotLoading.value = false
    emit('success')
  }, 1500)
}
</script>

<template>
  <div>
    <div class="relative px-8 pt-8 pb-5 bg-gradient-to-br from-amber-500/10 via-surface-elevated to-surface-elevated">
      <button
        class="absolute top-4 left-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="$emit('back')"
      >
        <XbIcon name="arrow-left" :size="18" />
      </button>
      <button
        class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="$emit('back')"
      >
        <XbIcon name="x" :size="18" />
      </button>
      <div class="flex flex-col items-center">
        <h3 class="text-lg font-bold text-content">找回密码</h3>
        <p class="text-xs text-content-tertiary mt-1">通过手机验证码重置密码</p>
      </div>
    </div>

    <div class="px-8 py-6">
      <div v-if="forgotError" class="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <p class="text-xs text-red-400">{{ forgotError }}</p>
      </div>

      <!-- Phone -->
      <div class="mb-4">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">手机号码</label>
        <div class="relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
            <XbIcon name="phone" :size="16" />
          </div>
          <input
            v-model="forgotPhone"
            type="tel"
            placeholder="请输入注册时使用的手机号"
            class="input-base pl-9"
          />
        </div>
      </div>

      <!-- SMS Code -->
      <div class="mb-4">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">短信验证码</label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
              <XbIcon name="shield-check" :size="16" />
            </div>
            <input
              v-model="forgotSmsCode"
              type="text"
              placeholder="请输入验证码"
              class="input-base pl-9"
              maxlength="6"
            />
          </div>
          <button
            class="px-4 py-2 rounded-lg text-xs font-medium border border-border whitespace-nowrap transition-colors"
            :class="forgotSmsCooldown > 0 ? 'text-content-tertiary cursor-not-allowed' : 'text-brand border-brand/30 hover:bg-brand/10 cursor-pointer'"
            :disabled="forgotSmsCooldown > 0"
            @click="startForgotSmsCooldown"
          >
            {{ forgotSmsCooldown > 0 ? `${forgotSmsCooldown}s` : '获取验证码' }}
          </button>
        </div>
      </div>

      <!-- New Password -->
      <div class="mb-4">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">新密码</label>
        <div class="relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
            <XbIcon name="lock" :size="16" />
          </div>
          <input
            v-model="forgotNewPwd"
            :type="showForgotPwd ? 'text' : 'password'"
            placeholder="请输入新密码（不少于6位）"
            class="input-base pl-9 pr-9"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content transition-colors"
            @click="showForgotPwd = !showForgotPwd"
          >
            <XbIcon v-if="showForgotPwd" name="eye" :size="16" />
            <XbIcon v-else name="eye-off" :size="16" />
          </button>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="mb-4">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">确认密码</label>
        <div class="relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
            <XbIcon name="lock" :size="16" />
          </div>
          <input
            v-model="forgotConfirmPwd"
            :type="showForgotConfirmPwd ? 'text' : 'password'"
            placeholder="请再次输入新密码"
            class="input-base pl-9 pr-9"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content transition-colors"
            @click="showForgotConfirmPwd = !showForgotConfirmPwd"
          >
            <XbIcon v-if="showForgotConfirmPwd" name="eye" :size="16" />
            <XbIcon v-else name="eye-off" :size="16" />
          </button>
        </div>
      </div>

      <!-- Captcha -->
      <div class="mb-5">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">验证码</label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
              <XbIcon name="key-round" :size="16" />
            </div>
            <input
              v-model="forgotCaptcha"
              type="text"
              placeholder="请输入图形验证码"
              class="input-base pl-9"
              maxlength="4"
            />
          </div>
          <div class="w-24 h-[38px] rounded-lg bg-surface-overlay border border-border flex items-center justify-center cursor-pointer select-none">
            <span class="text-sm font-mono font-bold tracking-widest text-content-secondary italic">K9mP</span>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <XbButton block :loading="forgotLoading" @click="handleForgotSubmit">{{ forgotLoading ? '提交中...' : '重置密码' }}</XbButton>

      <div class="text-center mt-4">
        <button
          class="text-xs text-content-tertiary hover:text-content-secondary transition-colors cursor-pointer"
          @click="$emit('back')"
        >
          返回登录
        </button>
      </div>
    </div>
  </div>
</template>
