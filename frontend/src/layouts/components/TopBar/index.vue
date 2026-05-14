<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import VipModal from './VipModal/index.vue'
import PayModal from './PayModal/index.vue'
import RechargeModal from './RechargeModal/index.vue'
import NotificationBell from './NotificationBell.vue'
import UserProfileModal from './UserProfileModal/index.vue'
import LoginModal from './LoginModal/index.vue'
import { useUserStore } from '@/stores/user'
import { MEMBERSHIP_CONFIG } from '@/stores/user'
import { useMarketplaceStore } from '@/stores/marketplace'
import type { VipPlan } from './VipModal/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const marketplaceStore = useMarketplaceStore()
const userName = computed(() => userStore.isLoggedIn ? userStore.userInfo.nickname : '未登录')
const showVipModal = ref(false)
const showUserModal = ref(false)
const showLoginModal = ref(false)
const showRechargeModal = ref(false)

// 支付弹窗相关
const showPayModal = ref(false)
const selectedPlan = ref<VipPlan | null>(null)

function openPayModal(plan: VipPlan) {
  selectedPlan.value = plan
  showPayModal.value = true
}

function handlePaySuccess() {
  showPayModal.value = false
  showVipModal.value = false
}

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': '首页',
    '/works': '我的作品',
    '/assets': '我的资产',
    '/marketplace': '资产市场',
    '/community': '社区动态',
  }
  if (route.path.includes('/publish-success')) return '发布成功'
  if (route.path.includes('/editor')) return '作品编辑器'
  if (route.path.startsWith('/works/')) return '剧集管理'
  return titles[route.path] || '侠人2D'
})
</script>

<template>
  <header class="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-surface-elevated/50">
    <h1 class="text-base font-semibold text-content">{{ pageTitle }}</h1>
    <div class="flex items-center gap-3">
      <!-- 新手帮助 -->
      <button
        class="btn-ghost p-2 rounded-lg flex items-center gap-1.5 text-content-secondary hover:text-content transition-colors"
        @click="router.push('/help')"
        title="新手帮助"
      >
        <XbIcon name="help-circle" :size="18" />
        <span class="text-xs hidden sm:inline">新手帮助</span>
      </button>

      <!-- 开通会员 -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-400 hover:bg-surface-overlay transition-colors cursor-pointer"
        @click="showVipModal = true"
        title="开通会员"
      >
        <XbIcon name="crown" :size="18" />
        <span class="text-xs font-medium hidden sm:inline">开通会员</span>
      </button>

      <!-- 金币余额 -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-overlay transition-colors cursor-pointer group"
        @click="showRechargeModal = true"
        title="金币充值"
      >
        <XbIcon name="coins" :size="18" class="text-yellow-400" />
        <span class="text-xs font-medium text-yellow-400 hidden sm:inline">{{ marketplaceStore.wallet.balance }}</span>
        <span class="w-4 h-4 rounded-full bg-yellow-400/15 flex items-center justify-center group-hover:bg-yellow-400/25 transition-colors">
          <XbIcon name="plus" :size="10" class="text-yellow-400" />
        </span>
      </button>

      <!-- 通知铃铛 -->
      <NotificationBell />

      <!-- 用户头像 -->
      <div
        class="flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-colors hover:bg-surface-overlay"
        @click="userStore.isLoggedIn ? showUserModal = true : showLoginModal = true"
      >
        <template v-if="userStore.isLoggedIn">
          <img src="/images/user-avatar.png" alt="用户头像" class="w-7 h-7 rounded-full object-cover shrink-0" />
        </template>
        <template v-else>
          <div class="w-7 h-7 rounded-full bg-surface-overlay border border-border flex items-center justify-center shrink-0">
            <XbIcon name="user" :size="14" class="text-content-tertiary" />
          </div>
        </template>
        <div v-if="userStore.isLoggedIn" class="flex flex-col leading-tight hidden sm:flex">
          <span class="text-xs text-content-secondary max-w-[60px] truncate">{{ userName }}</span>
          <span class="text-[10px] font-medium" :class="MEMBERSHIP_CONFIG[userStore.userInfo.level].color">{{ MEMBERSHIP_CONFIG[userStore.userInfo.level].label }}</span>
        </div>
        <span v-else class="text-xs text-content-secondary hidden sm:inline max-w-[60px] truncate">{{ userName }}</span>
      </div>
    </div>
  </header>

  <!-- VIP Modal -->
  <VipModal
    :visible="showVipModal"
    @close="showVipModal = false"
    @open-pay-modal="openPayModal"
  />

  <!-- User Profile Modal -->
  <UserProfileModal :visible="showUserModal" @close="showUserModal = false" />

  <!-- Login Modal -->
  <LoginModal :visible="showLoginModal" @close="showLoginModal = false" />

  <!-- Payment Modal -->
  <PayModal
    :visible="showPayModal"
    :selected-plan="selectedPlan"
    @close="showPayModal = false"
    @pay-success="handlePaySuccess"
  />

  <!-- Recharge Modal -->
  <RechargeModal
    :visible="showRechargeModal"
    @close="showRechargeModal = false"
  />
</template>
