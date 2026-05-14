<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits<{
  close: []
  back: []
}>()

const userStore = useUserStore()

const regPhone = ref('')
const regSmsCode = ref('')
const regPassword = ref('')
const regCaptcha = ref('')
const regAgree = ref(false)
const regLoading = ref(false)
const regError = ref('')
const regSmsCooldown = ref(0)

let cooldownTimer: ReturnType<typeof setInterval> | null = null

function startRegSmsCooldown() {
  if (regSmsCooldown.value > 0) return
  if (!regPhone.value.trim()) {
    regError.value = '请输入手机号码'
    return
  }
  regSmsCooldown.value = 60
  cooldownTimer = setInterval(() => {
    regSmsCooldown.value--
    if (regSmsCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function handleRegister() {
  regError.value = ''
  if (!regPhone.value.trim()) { regError.value = '请输入手机号码'; return }
  if (!regSmsCode.value.trim()) { regError.value = '请输入短信验证码'; return }
  if (!regPassword.value.trim()) { regError.value = '请设置登录密码'; return }
  if (regPassword.value.length < 6) { regError.value = '密码长度不能少于6位'; return }
  if (!regCaptcha.value.trim()) { regError.value = '请输入验证码'; return }
  if (!regAgree.value) { regError.value = '请阅读并同意隐私条款'; return }
  regLoading.value = true
  setTimeout(() => {
    regLoading.value = false
    userStore.isLoggedIn = true
    userStore.userInfo.account = regPhone.value
    userStore.userInfo.nickname = '新用户' + regPhone.value.slice(-4)
    emit('close')
  }, 1500)
}
</script>

<template>
  <div>
    <div class="relative px-8 pt-8 pb-5 bg-gradient-to-br from-brand/15 via-surface-elevated to-surface-elevated">
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
        <h3 class="text-lg font-bold text-content">快速注册</h3>
        <p class="text-xs text-content-tertiary mt-1">注册账号，开启创作之旅</p>
      </div>
    </div>

    <div class="px-8 py-6">
      <div v-if="regError" class="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <p class="text-xs text-red-400">{{ regError }}</p>
      </div>

      <!-- Phone -->
      <div class="mb-4">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">手机号码（即登录账号）</label>
        <div class="relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
            <XbIcon name="phone" :size="16" />
          </div>
          <input
            v-model="regPhone"
            type="tel"
            placeholder="请输入手机号码"
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
              v-model="regSmsCode"
              type="text"
              placeholder="请输入验证码"
              class="input-base pl-9"
              maxlength="6"
            />
          </div>
          <button
            class="px-4 py-2 rounded-lg text-xs font-medium border border-border whitespace-nowrap transition-colors"
            :class="regSmsCooldown > 0 ? 'text-content-tertiary cursor-not-allowed' : 'text-brand border-brand/30 hover:bg-brand/10 cursor-pointer'"
            :disabled="regSmsCooldown > 0"
            @click="startRegSmsCooldown"
          >
            {{ regSmsCooldown > 0 ? `${regSmsCooldown}s` : '获取验证码' }}
          </button>
        </div>
      </div>

      <!-- Password -->
      <div class="mb-4">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">登录密码</label>
        <div class="relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
            <XbIcon name="lock" :size="16" />
          </div>
          <input
            v-model="regPassword"
            type="password"
            placeholder="请设置登录密码（不少于6位）"
            class="input-base pl-9"
          />
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
              v-model="regCaptcha"
              type="text"
              placeholder="请输入图形验证码"
              class="input-base pl-9"
              maxlength="4"
            />
          </div>
          <div class="w-24 h-[38px] rounded-lg bg-surface-overlay border border-border flex items-center justify-center cursor-pointer select-none">
            <span class="text-sm font-mono font-bold tracking-widest text-content-secondary italic">A7x2</span>
          </div>
        </div>
      </div>

      <!-- Privacy agreement -->
      <div class="flex items-start gap-2 mb-5">
        <XbCheckedButton v-model="regAgree" size="sm" />
        <p class="text-[11px] text-content-tertiary leading-relaxed">
          我已阅读并同意<a href="#" class="text-brand hover:text-brand-light transition-colors">《用户协议》</a>和<a href="#" class="text-brand hover:text-brand-light transition-colors">《隐私政策》</a>
        </p>
      </div>

      <!-- Submit -->
      <XbButton block :loading="regLoading" @click="handleRegister">{{ regLoading ? '注册中...' : '注册' }}</XbButton>

      <div class="text-center mt-4">
        <button
          class="text-xs text-content-tertiary hover:text-content-secondary transition-colors cursor-pointer"
          @click="$emit('back')"
        >
          已有账号？返回登录
        </button>
      </div>
    </div>
  </div>
</template>
