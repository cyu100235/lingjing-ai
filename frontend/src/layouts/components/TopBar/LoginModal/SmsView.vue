<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits<{
  close: []
  back: []
}>()

const userStore = useUserStore()

const smsPhone = ref('')
const smsCode = ref('')
const smsLoading = ref(false)
const smsError = ref('')
const smsSmsCooldown = ref(0)

let cooldownTimer: ReturnType<typeof setInterval> | null = null

function startSmsSmsCooldown() {
  if (smsSmsCooldown.value > 0) return
  if (!smsPhone.value.trim()) {
    smsError.value = '请输入手机号码'
    return
  }
  smsSmsCooldown.value = 60
  cooldownTimer = setInterval(() => {
    smsSmsCooldown.value--
    if (smsSmsCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function handleSmsLogin() {
  smsError.value = ''
  if (!smsPhone.value.trim()) { smsError.value = '请输入手机号码'; return }
  if (!smsCode.value.trim()) { smsError.value = '请输入验证码'; return }
  smsLoading.value = true
  setTimeout(() => {
    smsLoading.value = false
    userStore.isLoggedIn = true
    userStore.userInfo.account = smsPhone.value
    userStore.userInfo.nickname = '用户' + smsPhone.value.slice(-4)
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
        <h3 class="text-lg font-bold text-content">验证码登录</h3>
        <p class="text-xs text-content-tertiary mt-1">使用手机验证码快速登录</p>
      </div>
    </div>

    <div class="px-8 py-6">
      <div v-if="smsError" class="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <p class="text-xs text-red-400">{{ smsError }}</p>
      </div>

      <!-- Phone -->
      <div class="mb-4">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">手机号码</label>
        <div class="relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
            <XbIcon name="phone" :size="16" />
          </div>
          <input
            v-model="smsPhone"
            type="tel"
            placeholder="请输入手机号码"
            class="input-base pl-9"
          />
        </div>
      </div>

      <!-- SMS Code -->
      <div class="mb-5">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">短信验证码</label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
              <XbIcon name="shield-check" :size="16" />
            </div>
            <input
              v-model="smsCode"
              type="text"
              placeholder="请输入验证码"
              class="input-base pl-9"
              maxlength="6"
            />
          </div>
          <button
            class="px-4 py-2 rounded-lg text-xs font-medium border border-border whitespace-nowrap transition-colors"
            :class="smsSmsCooldown > 0 ? 'text-content-tertiary cursor-not-allowed' : 'text-brand border-brand/30 hover:bg-brand/10 cursor-pointer'"
            :disabled="smsSmsCooldown > 0"
            @click="startSmsSmsCooldown"
          >
            {{ smsSmsCooldown > 0 ? `${smsSmsCooldown}s` : '获取验证码' }}
          </button>
        </div>
      </div>

      <!-- Login button -->
      <XbButton block :loading="smsLoading" @click="handleSmsLogin">{{ smsLoading ? '登录中...' : '登录' }}</XbButton>

      <div class="text-center mt-4">
        <button
          class="text-xs text-content-tertiary hover:text-content-secondary transition-colors cursor-pointer"
          @click="$emit('back')"
        >
          返回账号登录
        </button>
      </div>
    </div>

    <div class="px-8 pb-6 text-center">
      <p class="text-[10px] text-content-tertiary">
        登录即表示同意<a href="#" class="text-brand hover:text-brand-light transition-colors">《用户协议》</a>和<a href="#" class="text-brand hover:text-brand-light transition-colors">《隐私政策》</a>
      </p>
    </div>
  </div>
</template>
