<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { MEMBERSHIP_CONFIG } from '@/stores/user'

const userStore = useUserStore()

// 昵称编辑状态
const isEditingNickname = ref(false)
const editingNickname = ref('')
const isSavingNickname = ref(false)

// 头像上传
const avatarInputRef = ref<HTMLInputElement | null>(null)
const isUploadingAvatar = ref(false)

function startEditNickname() {
  editingNickname.value = userStore.userInfo.nickname
  isEditingNickname.value = true
}

async function saveNickname() {
  const trimmed = editingNickname.value.trim()
  if (!trimmed || trimmed === userStore.userInfo.nickname) {
    isEditingNickname.value = false
    return
  }
  isSavingNickname.value = true
  await userStore.updateNickname(trimmed)
  isSavingNickname.value = false
  isEditingNickname.value = false
}

function cancelEditNickname() {
  isEditingNickname.value = false
}

function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

async function handleAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  isUploadingAvatar.value = true
  // 模拟上传：将文件转为本地 URL 预览
  const url = URL.createObjectURL(file)
  await userStore.updateAvatar(url)
  isUploadingAvatar.value = false
  // 重置 input 以便再次选择同一文件
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="relative px-6 pt-8 pb-6 bg-gradient-to-br from-brand/20 via-surface-elevated to-surface-elevated">
    <button
      class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
      @click="$emit('close')"
    >
      <XbIcon name="x" :size="18" />
    </button>

    <!-- Avatar and Name -->
    <div class="flex flex-col items-center">
      <!-- 头像 -->
      <div class="relative group cursor-pointer" @click="triggerAvatarUpload">
        <img
          :src="userStore.userInfo.avatar"
          alt="用户头像"
          class="w-20 h-20 rounded-full object-cover border-3 border-brand/30 shadow-[0_0_20px_hsl(142_80%_50%/0.15)]"
          :class="isUploadingAvatar ? 'opacity-50' : ''"
        />
        <!-- 上传遮罩 -->
        <div
          class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          :class="isUploadingAvatar ? '!opacity-100' : ''"
        >
          <XbIcon v-if="!isUploadingAvatar" name="camera" :size="20" class="text-white" />
          <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand flex items-center justify-center shadow-md">
          <XbIcon name="check" :size="12" class="text-white" />
        </div>
      </div>
      <input
        ref="avatarInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleAvatarChange"
      />

      <!-- 昵称 -->
      <div class="mt-4 flex items-center gap-1.5">
        <template v-if="isEditingNickname">
          <XbInput
            v-model="editingNickname"
            size="sm"
            maxlength="20"
            class="w-36"
            @keydown.enter="saveNickname"
            @keydown.escape="cancelEditNickname"
          />
          <button
            class="p-1 rounded-md text-brand hover:bg-brand/10 transition-colors"
            :disabled="isSavingNickname"
            @click="saveNickname"
          >
            <XbIcon name="check" :size="16" />
          </button>
          <button
            class="p-1 rounded-md text-content-tertiary hover:bg-surface-overlay transition-colors"
            @click="cancelEditNickname"
          >
            <XbIcon name="x" :size="16" />
          </button>
        </template>
        <template v-else>
          <h3 class="text-lg font-bold text-content">{{ userStore.userInfo.nickname }}</h3>
          <button
            class="p-1 rounded-md text-content-tertiary hover:text-brand hover:bg-brand/10 transition-colors"
            @click="startEditNickname"
          >
            <XbIcon name="pencil" :size="14" />
          </button>
        </template>
      </div>
      <span class="mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full" :class="[MEMBERSHIP_CONFIG[userStore.userInfo.level].color, 'bg-surface-overlay']">{{ MEMBERSHIP_CONFIG[userStore.userInfo.level].label }}</span>
      <span class="mt-1 text-xs text-content-tertiary">ID: {{ userStore.userInfo.account }}</span>
    </div>
  </div>
</template>
