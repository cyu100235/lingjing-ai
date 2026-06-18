<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { getCaptcha } from '@/api/user'
import { sendEmailCode } from '@/api/email'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { XbConfirm, XbIcon, XbMessage } from '@/xbUi'

const emit = defineEmits<{
  close: []
  back: []
}>()

const userStore = useUserStore()
const siteConfigStore = useSiteConfigStore()

const emailAddr = ref('')
const emailCode = ref('')
const emailLoading = ref(false)
const emailCooldown = ref(0)
const captchaKey = ref('')
const captchaImage = ref('')
const captchaCode = ref('')

let cooldownTimer: ReturnType<typeof setInterval> | null = null

async function fetchCaptcha() {
  try {
    const res = await getCaptcha()
    captchaKey.value = res.captcha_key
    captchaImage.value = res.captcha_image
    captchaCode.value = ''
  } catch (e) {
    console.error('获取验证码失败', e)
  }
}

onMounted(fetchCaptcha)

function startEmailCooldown() {
  if (emailCooldown.value > 0) return
  if (!emailAddr.value.trim()) {
    XbConfirm({ message: '请输入邮箱地址', showCancel: false })
    return
  }
  // 简单邮箱格式校验
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(emailAddr.value.trim())) {
    XbConfirm({ message: '请输入正确的邮箱地址', showCancel: false })
    return
  }
  sendEmailCode({ name: siteConfigStore.getEmailSceneName('login'), email: emailAddr.value.trim() }).then(() => {
    emailCooldown.value = 60
    cooldownTimer = setInterval(() => {
      emailCooldown.value--
      if (emailCooldown.value <= 0 && cooldownTimer) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }, 1000)
  }).catch((e) => {
    console.error('发送邮箱验证码失败', e)
    XbConfirm({ message: '验证码发送失败，请稍后重试', showCancel: false })
  })
}

async function handleEmailLogin() {
  if (!emailAddr.value.trim()) { XbConfirm({ message: '请输入邮箱地址', showCancel: false }); return }
  if (!emailCode.value.trim()) { XbConfirm({ message: '请输入邮箱验证码', showCancel: false }); return }
  if (!captchaCode.value.trim()) { XbConfirm({ message: '请输入图形验证码', showCancel: false }); return }
  emailLoading.value = true
  const result = await userStore.emailLoginAction({
    email: emailAddr.value.trim(),
    code: emailCode.value.trim(),
    captcha_key: captchaKey.value,
    captcha_code: captchaCode.value.trim(),
  })
  emailLoading.value = false
  if (result.success) {
    emit('close')
    XbMessage.success(result.message || '登录成功')
  } else {
    XbConfirm({ message: result.message, showCancel: false })
    fetchCaptcha()
  }
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
        <h3 class="text-lg font-bold text-content">邮箱登录</h3>
        <p class="text-xs text-content-tertiary mt-1">使用邮箱验证码快速登录</p>
      </div>
    </div>

    <div class="px-8 py-6">
      <!-- Email -->
      <XbFormItem label="邮箱地址">
        <XbInput v-model="emailAddr" type="email" placeholder="请输入邮箱地址">
          <template #prefix>
            <XbIcon name="mail" :size="16" />
          </template>
        </XbInput>
      </XbFormItem>

      <!-- Email Code -->
      <XbFormItem label="邮箱验证码">
        <div class="flex gap-2">
          <XbInput v-model="emailCode" type="text" placeholder="请输入验证码" maxlength="6" @keyup.enter="handleEmailLogin">
            <template #prefix>
              <XbIcon name="shield-check" :size="16" />
            </template>
          </XbInput>
          <button
            class="px-4 py-2 rounded-lg text-xs font-medium border border-border whitespace-nowrap transition-colors shrink-0"
            :class="emailCooldown > 0 ? 'text-content-tertiary cursor-not-allowed' : 'text-brand border-brand/30 hover:bg-brand/10 cursor-pointer'"
            :disabled="emailCooldown > 0"
            @click="startEmailCooldown"
          >
            {{ emailCooldown > 0 ? `${emailCooldown}s` : '获取验证码' }}
          </button>
        </div>
      </XbFormItem>

      <!-- Captcha -->
      <XbFormItem label="图形验证码">
        <div class="flex gap-2">
          <XbInput v-model="captchaCode" type="text" placeholder="请输入图形验证码" maxlength="4" @keyup.enter="handleEmailLogin">
            <template #prefix>
              <XbIcon name="key-round" :size="16" />
            </template>
          </XbInput>
          <div
            class="w-24 h-[38px] rounded-lg bg-surface-overlay border border-border flex items-center justify-center cursor-pointer overflow-hidden shrink-0"
            @click="fetchCaptcha"
          >
            <img v-if="captchaImage" :src="captchaImage" class="w-full h-full object-cover" />
          </div>
        </div>
      </XbFormItem>

      <!-- Login button -->
      <XbButton block :loading="emailLoading" @click="handleEmailLogin">{{ emailLoading ? '登录中...' : '登录' }}</XbButton>

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
