<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { XbMessage } from '@/xbUi'
import UserProfileHeader from './UserProfileHeader.vue'
import ChangePasswordModal from './ChangePasswordModal.vue'
import BindPhoneModal from './BindPhoneModal.vue'
import BindEmailModal from './BindEmailModal.vue'
import BindWechatModal from './BindWechatModal.vue'

const userStore = useUserStore()

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const activeSubModal = ref<'password' | 'phone' | 'email' | 'wechat' | null>(null)

watch(() => props.visible, (val) => {
  if (!val) {
    activeSubModal.value = null
  }
})

async function handleLogout() {
  await userStore.logoutAction()
  XbMessage.success('退出登录成功')
  emit('close')
}
</script>

<template>
  <XbModal v-if="!activeSubModal" :visible="visible" no-padding width="w-[780px]" :show-close="false" @close="emit('close')">
    <div class="relative flex">
      <!-- Close Button -->
      <button
        class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors z-10"
        @click="emit('close')"
      >
        <XbIcon name="x" :size="18" />
      </button>

      <!-- Left: Header + Account + Password -->
      <div class="flex-1 min-w-0 border-r border-border/50">
        <UserProfileHeader @close="emit('close')" />
        <div class="px-5 py-4 space-y-3">
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
              @click="activeSubModal = 'password'"
            >
              <XbIcon name="pencil" :size="12" />
              修改
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
      </div>

      <!-- Right: Account Bindings -->
      <div class="w-[320px] shrink-0 flex flex-col">
        <div class="px-5 pt-6 pb-5">
          <h4 class="text-xs font-medium text-content-tertiary mb-3">
            账号绑定
          </h4>
        </div>
        <div class="flex-1 overflow-y-auto px-5 pb-5 space-y-3 max-h-[400px] scrollbar-hide">
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
              class="shrink-0 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
              :class="userStore.isPhoneBound
                ? 'text-brand border border-brand/30 hover:bg-brand/10'
                : 'text-content-secondary border border-border hover:border-brand/30 hover:text-brand'"
              @click="activeSubModal = 'phone'"
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
              class="shrink-0 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
              :class="userStore.isEmailBound
                ? 'text-brand border border-brand/30 hover:bg-brand/10'
                : 'text-content-secondary border border-border hover:border-brand/30 hover:text-brand'"
              @click="activeSubModal = 'email'"
            >
              {{ userStore.isEmailBound ? '管理' : '去绑定' }}
            </button>
          </div>

          <!-- WeChat -->
          <!-- <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-overlay/50">
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
              class="shrink-0 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
              :class="userStore.isWechatBound
                ? 'text-brand border border-brand/30 hover:bg-brand/10'
                : 'text-content-secondary border border-border hover:border-brand/30 hover:text-brand'"
              @click="activeSubModal = 'wechat'"
            >
              {{ userStore.isWechatBound ? '管理' : '去绑定' }}
            </button>
          </div> -->
        </div>
      </div>
    </div>
  </XbModal>

  <!-- Sub Modals -->
  <ChangePasswordModal
    :visible="activeSubModal === 'password'"
    @close="activeSubModal = null"
  />
  <BindPhoneModal
    :visible="activeSubModal === 'phone'"
    @close="activeSubModal = null"
  />
  <BindEmailModal
    :visible="activeSubModal === 'email'"
    @close="activeSubModal = null"
  />
  <BindWechatModal
    :visible="activeSubModal === 'wechat'"
    @close="activeSubModal = null"
  />
</template>
