<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { getCaptcha } from '@/api/user'
import { sendSms } from '@/api/sms'
import { XbButton, XbConfirm, XbIcon, XbInput, XbMessage } from '@/xbUi'

const emit = defineEmits<{
  success: []
  back: []
}>()

const userStore = useUserStore()
const siteConfigStore = useSiteConfigStore()

/** 图形验证码是否开启 */
const captchaEnabled = computed(() => {
  return siteConfigStore.config?.user?.base?.image_captcha_status === '20'
})

const forgotPhone = ref('')
const forgotSmsCode = ref('')
const forgotNewPwd = ref('')
const forgotConfirmPwd = ref('')
const forgotCaptcha = ref('')
const forgotLoading = ref(false)
const forgotSmsCooldown = ref(0)
const captchaKey = ref('')
const captchaImage = ref('')

let cooldownTimer: ReturnType<typeof setInterval> | null = null

async function fetchCaptcha() {
  try {
    const res = await getCaptcha()
    captchaKey.value = res.captcha_key
    captchaImage.value = res.captcha_image
    forgotCaptcha.value = ''
  } catch (e) {
    console.error('获取验证码失败', e)
  }
}

onMounted(() => {
  if (captchaEnabled.value) fetchCaptcha()
})

async function sendForgotSmsCode() {
  if (forgotSmsCooldown.value > 0) return
  if (!forgotPhone.value.trim()) {
    XbConfirm({ message: '请输入手机号码', showCancel: false })
    return
  }
  try {
    await sendSms({ name: siteConfigStore.getSmsSceneName('find_password'), mobile: forgotPhone.value.trim() })
    forgotSmsCooldown.value = 60
    cooldownTimer = setInterval(() => {
      forgotSmsCooldown.value--
      if (forgotSmsCooldown.value <= 0 && cooldownTimer) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }, 1000)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '验证码发送失败，请重试'
    XbConfirm({ message, showCancel: false })
  }
}

async function handleForgotSubmit() {
  if (!forgotPhone.value.trim()) { XbConfirm({ message: '请输入手机号码', showCancel: false }); return }
  if (!forgotSmsCode.value.trim()) { XbConfirm({ message: '请输入验证码', showCancel: false }); return }
  if (!forgotNewPwd.value.trim()) { XbConfirm({ message: '请输入新密码', showCancel: false }); return }
  if (forgotNewPwd.value.length < 6 || forgotNewPwd.value.length > 20) { XbConfirm({ message: '密码长度为6-20位', showCancel: false }); return }
  if (forgotNewPwd.value !== forgotConfirmPwd.value) { XbConfirm({ message: '两次密码输入不一致', showCancel: false }); return }
  if (captchaEnabled.value && !forgotCaptcha.value.trim()) { XbConfirm({ message: '请输入验证码', showCancel: false }); return }
  forgotLoading.value = true
  const result = await userStore.resetPasswordAction({
    username: forgotPhone.value,
    code: forgotSmsCode.value,
    password: forgotNewPwd.value,
    ...(captchaEnabled.value
      ? { captcha_key: captchaKey.value, captcha_code: forgotCaptcha.value }
      : {}),
  })
  forgotLoading.value = false  
  if (result.success) {
    XbMessage.success('密码重置成功，请重新登录')
    emit('back')
  } else {
    XbConfirm({ message: result.message, showCancel: false })
    if (captchaEnabled.value) await fetchCaptcha()
  }
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

    <form @submit.prevent="handleForgotSubmit" class="px-8 py-6">
      <!-- Phone -->
      <div class="mb-4">
        <XbInput label="手机号码" v-model="forgotPhone" type="tel" placeholder="请输入注册时使用的手机号">
          <template #prefix><XbIcon name="phone" :size="16" /></template>
        </XbInput>
      </div>

      <!-- SMS Code -->
      <div class="mb-4">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">短信验证码</label>
        <div class="flex gap-2">
          <XbInput v-model="forgotSmsCode" type="text" placeholder="请输入验证码" :maxlength="6" class="flex-1 min-w-0">
            <template #prefix><XbIcon name="shield-check" :size="16" /></template>
          </XbInput>
          <XbButton
            type="outline"
            size="sm"
            tabindex="-1"
            :disabled="forgotSmsCooldown > 0"
            @click="sendForgotSmsCode"
          >
            {{ forgotSmsCooldown > 0 ? `${forgotSmsCooldown}s` : '获取验证码' }}
          </XbButton>
        </div>
      </div>

      <!-- New Password -->
      <div class="mb-4">
        <XbInput label="新密码" v-model="forgotNewPwd" type="password" placeholder="请输入新密码（6-20位）">
          <template #prefix><XbIcon name="lock" :size="16" /></template>
        </XbInput>
      </div>

      <!-- Confirm Password -->
      <div class="mb-4">
        <XbInput label="确认密码" v-model="forgotConfirmPwd" type="password" placeholder="请再次输入新密码">
          <template #prefix><XbIcon name="lock" :size="16" /></template>
        </XbInput>
      </div>

      <!-- Captcha -->
      <div v-if="captchaEnabled" class="mb-5">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">图形验证码</label>
        <div class="flex gap-2">
          <XbInput v-model="forgotCaptcha" type="text" placeholder="请输入图形验证码" :maxlength="4" class="flex-1 min-w-0">
            <template #prefix><XbIcon name="key-round" :size="16" /></template>
          </XbInput>
          <div
            class="w-24 h-[38px] rounded-lg bg-surface-overlay border border-border flex items-center justify-center cursor-pointer overflow-hidden shrink-0"
            @click="fetchCaptcha"
          >
            <img v-if="captchaImage" :src="captchaImage" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- Submit -->
      <XbButton block native-type="submit" :loading="forgotLoading">{{ forgotLoading ? '提交中...' : '重置密码' }}</XbButton>

      <div class="text-center mt-4">
        <button
          class="text-xs text-content-tertiary hover:text-content-secondary transition-colors cursor-pointer"
          @click="$emit('back')"
        >
          返回登录
        </button>
      </div>
    </form>
  </div>
</template>
