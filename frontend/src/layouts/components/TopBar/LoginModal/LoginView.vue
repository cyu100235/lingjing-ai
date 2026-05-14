<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const emit = defineEmits<{
  close: []
  'switch-view': [view: string]
}>()

const userStore = useUserStore()

const account = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  if (!account.value.trim()) {
    errorMsg.value = '请输入登录账号'
    return
  }
  if (!password.value.trim()) {
    errorMsg.value = '请输入登录密码'
    return
  }
  loading.value = true
  const result = await userStore.login(account.value, password.value)
  loading.value = false
  if (result.success) {
    emit('close')
  } else {
    errorMsg.value = result.message
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="relative px-8 pt-8 pb-6 bg-gradient-to-br from-brand/15 via-surface-elevated to-surface-elevated">
      <button
        class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="$emit('close')"
      >
        <XbIcon name="x" :size="18" />
      </button>
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-3 border border-brand/20">
          <img src="/images/logo.png" alt="侠人2D" class="w-10 h-10 rounded-lg object-cover" />
        </div>
        <h3 class="text-lg font-bold text-content">欢迎登录</h3>
        <p class="text-xs text-content-tertiary mt-1">登录后即可体验全部功能</p>
      </div>
    </div>

    <!-- Login Form -->
    <div class="px-8 py-6">
      <div v-if="errorMsg" class="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <p class="text-xs text-red-400">{{ errorMsg }}</p>
      </div>

      <XbFormItem label="登录账号">
        <XbInput
          v-model="account"
          type="text"
          placeholder="请输入账号/手机号/邮箱"
          @keyup.enter="handleLogin"
        >
          <template #prefix><XbIcon name="user" :size="16" /></template>
        </XbInput>
      </XbFormItem>

      <XbFormItem label="登录密码">
        <XbInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix><XbIcon name="lock" :size="16" /></template>
          <template #suffix>
            <button type="button" class="hover:text-content transition-colors" @click="showPassword = !showPassword">
              <XbIcon v-if="showPassword" name="eye" :size="16" />
              <XbIcon v-else name="eye-off" :size="16" />
            </button>
          </template>
        </XbInput>
      </XbFormItem>

      <XbButton block :loading="loading" @click="handleLogin">登录</XbButton>

      <div class="flex items-center justify-between mt-4">
        <button
          class="text-xs text-brand hover:text-brand-light transition-colors cursor-pointer"
          @click="$emit('switch-view', 'register')"
        >
          快速注册
        </button>
        <button
          class="text-xs text-content-tertiary hover:text-content-secondary transition-colors cursor-pointer"
          @click="$emit('switch-view', 'forgot')"
        >
          找回密码
        </button>
      </div>

      <div class="flex items-center gap-3 my-5">
        <div class="flex-1 h-px bg-border"></div>
        <span class="text-[10px] text-content-tertiary">其他登录方式</span>
        <div class="flex-1 h-px bg-border"></div>
      </div>

      <div class="flex items-center justify-center gap-6">
        <button
          class="flex flex-col items-center gap-1.5 group cursor-pointer"
          @click="$emit('switch-view', 'wechat')"
        >
          <div class="w-11 h-11 rounded-full border border-border flex items-center justify-center transition-all duration-200 group-hover:border-[#07C160]/50 group-hover:bg-[#07C160]/5">
            <XbIcon name="message-circle" :size="20" class="text-content-tertiary group-hover:text-[#07C160] transition-colors" />
          </div>
          <span class="text-[10px] text-content-tertiary group-hover:text-content-secondary transition-colors">微信登录</span>
        </button>

        <button
          class="flex flex-col items-center gap-1.5 group cursor-pointer"
          @click="$emit('switch-view', 'sms')"
        >
          <div class="w-11 h-11 rounded-full border border-border flex items-center justify-center transition-all duration-200 group-hover:border-brand/50 group-hover:bg-brand/5">
            <XbIcon name="smartphone" :size="20" class="text-content-tertiary group-hover:text-brand transition-colors" />
          </div>
          <span class="text-[10px] text-content-tertiary group-hover:text-content-secondary transition-colors">验证码登录</span>
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
