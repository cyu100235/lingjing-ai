<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { getCaptcha } from '@/api/user'
import { sendSms } from '@/api/sms'
import { sendEmailCode } from '@/api/email'
import { XbButton, XbConfirm, XbIcon, XbInput } from '@/xbUi'

const emit = defineEmits<{
  close: []
  back: []
}>()

const route = useRoute()
const userStore = useUserStore()
const siteConfigStore = useSiteConfigStore()

type RegisterType = '10' | '20' | '30'

/** 当前注册类型，来自站点配置 */
const registerType = computed<RegisterType>(() => {
  return siteConfigStore.config?.user?.base?.main_register_type ?? '20'
})

const isPhoneReg = computed(() => registerType.value === '20')
const isEmailReg = computed(() => registerType.value === '30')
const isUsernameReg = computed(() => registerType.value === '10')

/** 图形验证码是否开启 */
const captchaEnabled = computed(() => {
  return siteConfigStore.config?.user?.base?.image_captcha_status === '20'
})

/** 注册类型标签文案 */
const registerTypeLabel = computed(() => {
  const map: Record<RegisterType, string> = {
    '10': '字母+数字',
    '20': '手机号',
    '30': '邮箱',
  }
  return map[registerType.value]
})

/** 账号输入值（手机号/邮箱/用户名） */
const regAccount = ref('')
const regVerifyCode = ref('')
const regPassword = ref('')
const regCaptcha = ref('')
const regAgree = ref(false)
const regLoading = ref(false)
const verifyCooldown = ref(0)
const captchaKey = ref('')
const captchaImage = ref('')

let cooldownTimer: ReturnType<typeof setInterval> | null = null

async function fetchCaptcha() {
  try {
    const res = await getCaptcha()
    captchaKey.value = res.captcha_key
    captchaImage.value = res.captcha_image
    regCaptcha.value = ''
  } catch (e) {
    console.error('获取验证码失败', e)
  }
}

onMounted(() => {
  if (captchaEnabled.value) fetchCaptcha()
})

/** 发送验证码（短信/邮箱） */
async function sendVerifyCode() {
  if (verifyCooldown.value > 0) return
  if (!regAccount.value.trim()) {
    const hint = isPhoneReg.value ? '请输入手机号码' : '请输入邮箱地址'
    XbConfirm({ message: hint, showCancel: false })
    return
  }
  try {
    if (isPhoneReg.value) {
      await sendSms({ name: siteConfigStore.getSmsSceneName('register'), mobile: regAccount.value.trim() })
    } else if (isEmailReg.value) {
      await sendEmailCode({ name: siteConfigStore.getEmailSceneName('register'), email: regAccount.value.trim() })
    }
    verifyCooldown.value = 60
    cooldownTimer = setInterval(() => {
      verifyCooldown.value--
      if (verifyCooldown.value <= 0 && cooldownTimer) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }, 1000)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '验证码发送失败，请重试'
    XbConfirm({ message, showCancel: false })
  }
}

/** 邮箱格式校验 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function handleRegister() {
  // ——— 账号校验 ———
  if (!regAccount.value.trim()) {
    const hint = isPhoneReg.value ? '请输入手机号码' : isEmailReg.value ? '请输入邮箱地址' : '请输入登录账号'
    XbConfirm({ message: hint, showCancel: false }); return
  }
  if (isEmailReg.value && !isValidEmail(regAccount.value.trim())) {
    XbConfirm({ message: '请输入正确的邮箱格式', showCancel: false }); return
  }

  // ——— 验证码校验（手机/邮箱需要） ———
  if (isPhoneReg.value && !regVerifyCode.value.trim()) {
    XbConfirm({ message: '请输入短信验证码', showCancel: false }); return
  }
  if (isEmailReg.value && !regVerifyCode.value.trim()) {
    XbConfirm({ message: '请输入邮箱验证码', showCancel: false }); return
  }

  // ——— 密码校验 ———
  if (!regPassword.value.trim()) { XbConfirm({ message: '请设置登录密码', showCancel: false }); return }
  if (regPassword.value.length < 6) { XbConfirm({ message: '密码长度不能少于6位', showCancel: false }); return }

  // ——— 图形验证码校验 ———
  if (captchaEnabled.value && !regCaptcha.value.trim()) { XbConfirm({ message: '请输入验证码', showCancel: false }); return }

  // ——— 协议校验 ———
  if (!regAgree.value) { XbConfirm({ message: '请阅读并同意隐私条款', showCancel: false }); return }

  regLoading.value = true
  const randomSuffix = String(Math.floor(1000 + Math.random() * 9000))
  const nickname = '新用户' + randomSuffix

  const result = await userStore.registerAction({
    username: regAccount.value.trim(),
    password: regPassword.value,
    nickname,
    ...(captchaEnabled.value
      ? { captcha_key: captchaKey.value, captcha_code: regCaptcha.value }
      : {}),
    code: regVerifyCode.value || undefined,
    icode: (route.query.icode as string) || undefined,
  })

  regLoading.value = false
  if (result.success) {
    XbConfirm({ message: '注册成功，请登录', showCancel: false })
    emit('back')
  } else {
    XbConfirm({ message: result.message, showCancel: false })
    if (captchaEnabled.value) await fetchCaptcha()
  }
}
</script>

<template>
  <div>
    <div class="relative px-8 pt-8 pb-5 bg-gradient-to-br from-brand/15 via-surface-elevated to-surface-elevated">
      <button
        class="absolute top-4 left-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="$emit('back')">
        <XbIcon name="arrow-left" :size="18" />
      </button>
      <button
        class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="$emit('close')">
        <XbIcon name="x" :size="18" />
      </button>
      <div class="flex flex-col items-center">
        <h3 class="text-lg font-bold text-content">快速注册</h3>
        <p class="text-xs text-content-tertiary mt-1">注册账号，开启创作之旅</p>
      </div>
    </div>

    <form class="px-8 py-6" @submit.prevent="handleRegister">
      <!-- ====== 字母+数字注册 (type=10) ====== -->
      <template v-if="isUsernameReg">
        <div class="mb-4">
          <XbInput label="登录账号（字母+数字）" v-model="regAccount" type="text" placeholder="请输入字母+数字账号">
            <template #prefix><XbIcon name="user" :size="16" /></template>
          </XbInput>
        </div>
      </template>

      <!-- ====== 手机号注册 (type=20) ====== -->
      <template v-else-if="isPhoneReg">
        <div class="mb-4">
          <XbInput label="手机号码（即登录账号）" v-model="regAccount" type="tel" placeholder="请输入手机号码">
            <template #prefix><XbIcon name="phone" :size="16" /></template>
          </XbInput>
        </div>

        <div class="mb-4">
          <label class="text-xs text-content-secondary mb-1.5 block font-medium">短信验证码</label>
          <div class="flex gap-2">
            <XbInput v-model="regVerifyCode" type="text" placeholder="请输入验证码" :maxlength="6" class="flex-1 min-w-0">
              <template #prefix><XbIcon name="shield-check" :size="16" /></template>
            </XbInput>
            <XbButton
              type="outline"
              size="sm"
              tabindex="-1"
              :disabled="verifyCooldown > 0"
              @click="sendVerifyCode">
              {{ verifyCooldown > 0 ? `${verifyCooldown}s` : '获取验证码' }}
            </XbButton>
          </div>
        </div>

      </template>

      <!-- ====== 邮箱注册 (type=30) ====== -->
      <template v-else-if="isEmailReg">
        <div class="mb-4">
          <XbInput label="邮箱地址（即登录账号）" v-model="regAccount" type="email" placeholder="请输入邮箱地址">
            <template #prefix><XbIcon name="mail" :size="16" /></template>
          </XbInput>
        </div>

        <div class="mb-4">
          <label class="text-xs text-content-secondary mb-1.5 block font-medium">邮箱验证码</label>
          <div class="flex gap-2">
            <XbInput v-model="regVerifyCode" type="text" placeholder="请输入验证码" :maxlength="6" class="flex-1 min-w-0">
              <template #prefix><XbIcon name="shield-check" :size="16" /></template>
            </XbInput>
            <XbButton
              type="outline"
              size="sm"
              tabindex="-1"
              :disabled="verifyCooldown > 0"
              @click="sendVerifyCode">
              {{ verifyCooldown > 0 ? `${verifyCooldown}s` : '获取验证码' }}
            </XbButton>
          </div>
        </div>

      </template>

      <!-- ====== 公共字段：密码 ====== -->
      <div class="mb-4">
        <XbInput label="登录密码" v-model="regPassword" type="password" placeholder="请设置登录密码（不少于6位）">
          <template #prefix><XbIcon name="lock" :size="16" /></template>
        </XbInput>
      </div>

      <!-- ====== 公共字段：图形验证码 ====== -->
      <div v-if="captchaEnabled" class="mb-5">
        <label class="text-xs text-content-secondary mb-1.5 block font-medium">图形验证码</label>
        <div class="flex gap-2">
          <XbInput v-model="regCaptcha" type="text" placeholder="请输入图形验证码" :maxlength="4" class="flex-1 min-w-0">
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

      <!-- Privacy agreement -->
      <div class="flex items-start mb-5">
        <XbCheckedButton v-model="regAgree" size="sm" />
        <p class="text-[11px] text-content-tertiary leading-relaxed">
          我已阅读并同意<a href="#" class="text-brand hover:text-brand-light transition-colors">《用户协议》</a>和<a href="#"
            class="text-brand hover:text-brand-light transition-colors">《隐私政策》</a>
        </p>
      </div>

      <!-- Submit -->
      <XbButton block native-type="submit" :loading="regLoading">{{ regLoading ? '注册中...' : '注册' }}</XbButton>

      <div class="text-center mt-4">
        <button class="text-xs text-content-tertiary hover:text-content-secondary transition-colors cursor-pointer"
          @click="$emit('back')">
          已有账号？返回登录
        </button>
      </div>
    </form>
  </div>
</template>