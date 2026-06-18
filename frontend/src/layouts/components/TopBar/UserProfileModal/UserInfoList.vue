<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { XbMessage } from '@/xbUi'

type SubModalType = 'password' | 'phone' | 'email' | 'wechat'

const userStore = useUserStore()

const emit = defineEmits<{
  openSubModal: [type: SubModalType]
  close: []
}>()

async function handleLogout() {
  await userStore.logoutAction()
  XbMessage.success('退出登录成功')
  emit('close')
}
</script>

<template>
  <div class="px-6 py-5 space-y-4">
    <!-- Login Account -->
    <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-overlay/50">
      <div class="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
        <XbIcon name="user" :size="16" class="text-brand" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] text-content-tertiary leading-tight">登录账号</p>
        <p class="text-sm text-content truncate">{{ userStore.userInfo.username }}</p>
      </div>
    </div>

    <!-- Password -->
    <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-overlay/50">
      <div class="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
        <XbIcon name="lock" :size="16" class="text-brand" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] text-content-tertiary leading-tight">登录密码</p>
        <p class="text-sm text-content">********</p>
      </div>
      <button
        class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-brand border border-brand/30 hover:bg-brand/10 transition-colors"
        @click="$emit('openSubModal', 'password')"
      >
        <XbIcon name="pencil" :size="12" />
        修改
      </button>
    </div>

    <!-- Phone -->
    <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-overlay/50">
      <div class="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
        <XbIcon name="phone" :size="16" class="text-brand" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] text-content-tertiary leading-tight">手机号码</p>
        <p class="text-sm" :class="userStore.isPhoneBound ? 'text-content' : 'text-content-tertiary'">
          {{ userStore.userInfo.mobile || '未绑定' }}
        </p>
      </div>
      <button
        class="px-2.5 py-1.5 rounded-lg text-xs transition-colors"
        :class="userStore.isPhoneBound
          ? 'text-brand border border-brand/30 hover:bg-brand/10'
          : 'text-content-secondary border border-border hover:border-brand/30 hover:text-brand'"
        @click="$emit('openSubModal', 'phone')"
      >
        {{ userStore.isPhoneBound ? '管理' : '去绑定' }}
      </button>
    </div>

    <!-- Email -->
    <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-overlay/50">
      <div class="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
        <XbIcon name="mail" :size="16" class="text-brand" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] text-content-tertiary leading-tight">绑定邮箱</p>
        <p class="text-sm" :class="userStore.isEmailBound ? 'text-content' : 'text-content-tertiary'">
          {{ userStore.userInfo.email || '未绑定' }}
        </p>
      </div>
      <button
        class="px-2.5 py-1.5 rounded-lg text-xs transition-colors"
        :class="userStore.isEmailBound
          ? 'text-brand border border-brand/30 hover:bg-brand/10'
          : 'text-content-secondary border border-border hover:border-brand/30 hover:text-brand'"
        @click="$emit('openSubModal', 'email')"
      >
        {{ userStore.isEmailBound ? '管理' : '去绑定' }}
      </button>
    </div>

    <!-- WeChat -->
    <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-overlay/50">
      <div class="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
        <XbIcon name="message-circle" :size="16" class="text-brand" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] text-content-tertiary leading-tight">绑定微信</p>
        <p class="text-sm" :class="userStore.isWechatBound ? 'text-content' : 'text-content-tertiary'">
          {{ userStore.userInfo.wechat || '未绑定' }}
        </p>
      </div>
      <button
        class="px-2.5 py-1.5 rounded-lg text-xs transition-colors"
        :class="userStore.isWechatBound
          ? 'text-brand border border-brand/30 hover:bg-brand/10'
          : 'text-content-secondary border border-border hover:border-brand/30 hover:text-brand'"
        @click="$emit('openSubModal', 'wechat')"
      >
        {{ userStore.isWechatBound ? '管理' : '去绑定' }}
      </button>
    </div>

    <!-- Logout -->
    <div class="pt-2">
      <button
        class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
        @click="handleLogout"
      >
        <XbIcon name="log-out" :size="16" />
        退出登录
      </button>
    </div>
  </div>
</template>
