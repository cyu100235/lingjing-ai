<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { getCaptcha } from '@/api/user'
import { XbConfirm, XbIcon, XbMessage } from '@/xbUi'

const emit = defineEmits<{
  close: []
  'switch-view': [view: string]
}>()

const userStore = useUserStore()
const siteConfigStore = useSiteConfigStore()

/** 图形验证码是否开启 */
const captchaEnabled = computed(() => {
  return siteConfigStore.config?.user?.base?.image_captcha_status === '20'
})

const account = ref('')
const password = ref('')
const loading = ref(false)
const captchaKey = ref('')
const captchaImage = ref('')
const captchaCode = ref('')

/** 登录方式名称到视图类型的映射 */
const loginNameToView: Record<string, string> = {
  mobile: 'sms',
  email: 'email',
}

/** 过滤后的登录方式列表 */
const filteredLoginList = computed(() => {
  const list = siteConfigStore.config?.login_list || []
  const base = siteConfigStore.config?.user?.base
  return list.filter((item) => {
    if (item.name === 'mobile' && base?.mobile_code_login_status !== '20') return false
    if (item.name === 'email' && base?.email_code_login_status !== '20') return false
    return true
  })
})

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

onMounted(() => {
  if (captchaEnabled.value) fetchCaptcha()
})

async function handleLogin() {
  if (!account.value.trim()) {
    XbConfirm({ message: '请输入登录账号', showCancel: false })
    return
  }
  if (!password.value.trim()) {
    XbConfirm({ message: '请输入登录密码', showCancel: false })
    return
  }
  if (captchaEnabled.value && !captchaCode.value.trim()) {
    XbConfirm({ message: '请输入图形验证码', showCancel: false })
    return
  }
  loading.value = true
  const result = await userStore.loginAction({
    username: account.value,
    password: password.value,
    ...(captchaEnabled.value
      ? { captcha_key: captchaKey.value, captcha_code: captchaCode.value }
      : {}),
  })
  loading.value = false
  if (result.success) {
    emit('close')
    XbMessage.success(result.message || '登录成功')
  } else {
    XbConfirm({ message: result.message, showCancel: false })
    if (captchaEnabled.value) await fetchCaptcha()
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="relative px-8 pt-8 pb-6 bg-gradient-to-br from-brand/15 via-surface-elevated to-surface-elevated">
      <button
        class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="$emit('close')">
        <XbIcon name="x" :size="18" />
      </button>
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-3 border border-brand/20">
          <img src="/images/logo.png" alt="镜影漫创" class="w-10 h-10 rounded-lg object-cover" />
        </div>
        <h3 class="text-lg font-bold text-content">欢迎登录</h3>
        <p class="text-xs text-content-tertiary mt-1">登录后即可体验全部功能</p>
      </div>
    </div>

    <!-- Login Form -->
    <div class="px-8 py-6">
      <XbFormItem label="登录账号">
        <XbInput v-model="account" type="text" placeholder="请输入账号/手机号/邮箱" @keyup.enter="handleLogin">
          <template #prefix>
            <XbIcon name="user" :size="16" />
          </template>
        </XbInput>
      </XbFormItem>

      <XbFormItem label="登录密码">
        <XbInput v-model="password" type="password" placeholder="请输入密码"
          @keyup.enter="handleLogin">
          <template #prefix>
            <XbIcon name="lock" :size="16" />
          </template>
        </XbInput>
      </XbFormItem>

      <XbFormItem v-if="captchaEnabled" label="图形验证码">
        <div class="flex gap-2">
          <XbInput v-model="captchaCode" type="text" placeholder="请输入图形验证码" @keyup.enter="handleLogin">
            <template #prefix>
              <XbIcon name="key-round" :size="16" />
            </template>
          </XbInput>
          <div
            class="w-24 h-[38px] rounded-lg bg-surface-overlay border border-border flex items-center justify-center cursor-pointer overflow-hidden shrink-0"
            @click="fetchCaptcha">
            <img v-if="captchaImage" :src="captchaImage" class="w-full h-full object-cover" />
          </div>
        </div>
      </XbFormItem>

      <XbButton block :loading="loading" @click="handleLogin">登录</XbButton>

      <div class="flex items-center justify-between mt-4">
        <button class="text-xs text-brand hover:text-brand-light transition-colors cursor-pointer"
          @click="$emit('switch-view', 'register')">
          快速注册
        </button>
        <button class="text-xs text-content-tertiary hover:text-content-secondary transition-colors cursor-pointer"
          @click="$emit('switch-view', 'forgot')">
          找回密码
        </button>
      </div>

      <template v-if="filteredLoginList.length">
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px bg-border"></div>
          <span class="text-[10px] text-content-tertiary">其他登录方式</span>
          <div class="flex-1 h-px bg-border"></div>
        </div>

        <div class="flex items-center justify-center gap-6">
          <button
            v-for="item in filteredLoginList"
            :key="item.name"
            class="login-method-btn flex flex-col items-center gap-1.5 group cursor-pointer"
            @click="$emit('switch-view', loginNameToView[item.name] || item.name)">
            <div
              class="w-11 h-11 rounded-full border border-border flex items-center justify-center transition-all duration-200 login-method-icon"
              :style="{ '--hover-color': item.bg_color || 'hsl(var(--brand))' }">
              <img v-if="item.logo" :src="item.logo" :alt="item.title" class="w-5 h-5 object-contain" />
            </div>
            <span class="text-[10px] text-content-tertiary group-hover:text-content-secondary transition-colors">
              {{ item.title }}
            </span>
          </button>
        </div>
      </template>
    </div>

  </div>
</template>

<style scoped>
.login-method-btn:hover .login-method-icon {
  border-color: color-mix(in srgb, var(--hover-color) 50%, transparent);
  background-color: color-mix(in srgb, var(--hover-color) 5%, transparent);
}
</style>
