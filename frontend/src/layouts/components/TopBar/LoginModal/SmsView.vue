<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { getCaptcha } from '@/api/user'
import { sendSms } from '@/api/sms'
import { XbConfirm, XbIcon, XbMessage } from '@/xbUi'

const emit = defineEmits<{
  close: []
  back: []
}>()

const userStore = useUserStore()
const siteConfigStore = useSiteConfigStore()

const smsPhone = ref('')
const smsCode = ref('')
const smsLoading = ref(false)
const smsSmsCooldown = ref(0)
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

function startSmsCooldown() {
  if (smsSmsCooldown.value > 0) return
  if (!smsPhone.value.trim()) {
    XbConfirm({ message: '请输入手机号码', showCancel: false })
    return
  }
  sendSms({ name: siteConfigStore.getSmsSceneName('login'), mobile: smsPhone.value.trim() }).then(() => {
    smsSmsCooldown.value = 60
    cooldownTimer = setInterval(() => {
      smsSmsCooldown.value--
      if (smsSmsCooldown.value <= 0 && cooldownTimer) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }, 1000)
  }).catch((e) => {
    console.error('发送短信验证码失败', e)
    XbConfirm({ message: '验证码发送失败，请稍后重试', showCancel: false })
  })
}

async function handleSmsLogin() {
  if (!smsPhone.value.trim()) { XbConfirm({ message: '请输入手机号码', showCancel: false }); return }
  if (!smsCode.value.trim()) { XbConfirm({ message: '请输入短信验证码', showCancel: false }); return }
  if (!captchaCode.value.trim()) { XbConfirm({ message: '请输入图形验证码', showCancel: false }); return }
  smsLoading.value = true
  const result = await userStore.mobileLoginAction({
    mobile: smsPhone.value.trim(),
    code: smsCode.value.trim(),
    captcha_key: captchaKey.value,
    captcha_code: captchaCode.value.trim(),
  })
  smsLoading.value = false
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
        <h3 class="text-lg font-bold text-content">验证码登录</h3>
        <p class="text-xs text-content-tertiary mt-1">使用手机验证码快速登录</p>
      </div>
    </div>

    <div class="px-8 py-6">
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
      <div class="mb-4">
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
            @click="startSmsCooldown"
          >
            {{ smsSmsCooldown > 0 ? `${smsSmsCooldown}s` : '获取验证码' }}
          </button>
        </div>
      </div>

      <!-- Captcha -->
      <div class="mb-5">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">图形验证码</label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
              <XbIcon name="key-round" :size="16" />
            </div>
            <input
              v-model="captchaCode"
              type="text"
              placeholder="请输入图形验证码"
              class="input-base pl-9"
              maxlength="4"
            />
          </div>
          <div
            class="w-24 h-[38px] rounded-lg bg-surface-overlay border border-border flex items-center justify-center cursor-pointer overflow-hidden shrink-0"
            @click="fetchCaptcha"
          >
            <img v-if="captchaImage" :src="captchaImage" class="w-full h-full object-cover" />
          </div>
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
