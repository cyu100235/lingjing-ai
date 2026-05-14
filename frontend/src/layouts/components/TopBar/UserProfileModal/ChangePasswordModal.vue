<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

import { useUserStore } from '@/stores/user'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const userStore = useUserStore()

const step = ref<'editing' | 'success'>('editing')
const submitting = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordStrength = computed(() => {
  const pwd = form.newPassword
  if (!pwd) return { level: 0, label: '', color: '' }

  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 2) return { level: 1, label: '弱', color: 'bg-danger' }
  if (score === 3) return { level: 2, label: '中', color: 'bg-amber-400' }
  if (score === 4) return { level: 3, label: '强', color: 'bg-brand' }
  return { level: 4, label: '很强', color: 'bg-brand-glow' }
})

function validateField(field: 'oldPassword' | 'newPassword' | 'confirmPassword') {
  if (field === 'oldPassword') {
    errors.oldPassword = form.oldPassword ? '' : '请输入旧密码'
  } else if (field === 'newPassword') {
    if (!form.newPassword) {
      errors.newPassword = '请输入新密码'
    } else if (form.newPassword.length < 8) {
      errors.newPassword = '密码长度不能少于8位'
    } else if (form.newPassword === form.oldPassword) {
      errors.newPassword = '新密码不能与旧密码相同'
    } else {
      errors.newPassword = ''
    }
    if (form.confirmPassword) {
      validateField('confirmPassword')
    }
  } else if (field === 'confirmPassword') {
    if (!form.confirmPassword) {
      errors.confirmPassword = '请确认新密码'
    } else if (form.confirmPassword !== form.newPassword) {
      errors.confirmPassword = '两次输入的密码不一致'
    } else {
      errors.confirmPassword = ''
    }
  }
}

function validateAll(): boolean {
  validateField('oldPassword')
  validateField('newPassword')
  validateField('confirmPassword')
  return !errors.oldPassword && !errors.newPassword && !errors.confirmPassword
}

async function handleSubmit() {
  if (!validateAll()) return
  submitting.value = true
  await userStore.changePassword(form.oldPassword, form.newPassword)
  submitting.value = false
  step.value = 'success'
}

function resetForm() {
  form.oldPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  errors.oldPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  showOldPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
  step.value = 'editing'
  submitting.value = false
}

watch(() => props.visible, (val) => {
  if (val) resetForm()
})
</script>

<template>
  <XbModal :visible="visible" no-padding width="w-[420px]" :show-close="false" @close="emit('close')">
    <!-- Header -->
    <div class="relative px-6 pt-6 pb-5 bg-gradient-to-br from-brand/20 via-surface-elevated to-surface-elevated border-b border-border-subtle">
      <button
        class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
        @click="emit('close')"
      >
        <XbIcon name="x" :size="18" />
      </button>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center">
          <XbIcon name="lock" :size="22" class="text-brand" />
        </div>
        <div>
          <h3 class="text-base font-bold text-content">修改密码</h3>
          <p class="text-xs text-content-tertiary mt-0.5">请设置新的登录密码</p>
        </div>
      </div>
    </div>

    <!-- Success State -->
    <div v-if="step === 'success'" class="px-6 py-10 flex flex-col items-center">
      <div class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-bounce-in">
        <XbIcon name="check" :size="32" class="text-green-500" />
      </div>
      <h4 class="text-lg font-bold text-content mb-1">密码修改成功</h4>
      <p class="text-sm text-content-secondary mb-6">新密码已生效，请牢记您的新密码</p>
      <XbButton size="sm" @click="emit('close')">知道了</XbButton>
    </div>

    <!-- Form -->
    <div v-else class="px-6 py-5 space-y-4">
      <!-- Old Password -->
      <XbFormItem label="旧密码" required>
        <XbInput
          v-model="form.oldPassword"
          :type="showOldPassword ? 'text' : 'password'"
          placeholder="请输入旧密码"
          :error="errors.oldPassword"
          @blur="validateField('oldPassword')"
        >
          <template #suffix>
            <button type="button" class="hover:text-content transition-colors" @click="showOldPassword = !showOldPassword">
              <XbIcon v-if="showOldPassword" name="eye-off" :size="16" />
              <XbIcon v-else name="eye" :size="16" />
            </button>
          </template>
        </XbInput>
      </XbFormItem>

      <!-- New Password -->
      <XbFormItem label="新密码" required>
        <XbInput
          v-model="form.newPassword"
          :type="showNewPassword ? 'text' : 'password'"
          placeholder="请输入新密码（至少8位）"
          :error="errors.newPassword"
          @blur="validateField('newPassword')"
        >
          <template #suffix>
            <button type="button" class="hover:text-content transition-colors" @click="showNewPassword = !showNewPassword">
              <XbIcon v-if="showNewPassword" name="eye-off" :size="16" />
              <XbIcon v-else name="eye" :size="16" />
            </button>
          </template>
        </XbInput>
        <!-- Password Strength Indicator -->
        <template v-if="form.newPassword">
          <div class="mt-2">
            <div class="flex gap-1.5 mb-1">
              <div
                v-for="i in 4"
                :key="i"
                class="h-1 flex-1 rounded-full transition-colors duration-300"
                :class="i <= passwordStrength.level ? passwordStrength.color : 'bg-surface-overlay'"
              />
            </div>
            <p class="text-[10px]" :class="passwordStrength.level <= 1 ? 'text-danger' : passwordStrength.level === 2 ? 'text-amber-400' : 'text-brand'">
              密码强度：{{ passwordStrength.label }}
            </p>
          </div>
        </template>
      </XbFormItem>

      <!-- Confirm Password -->
      <XbFormItem label="确认新密码" required>
        <XbInput
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="请再次输入新密码"
          :error="errors.confirmPassword"
          @blur="validateField('confirmPassword')"
        >
          <template #suffix>
            <button type="button" class="hover:text-content transition-colors" @click="showConfirmPassword = !showConfirmPassword">
              <XbIcon v-if="showConfirmPassword" name="eye-off" :size="16" />
              <XbIcon v-else name="eye" :size="16" />
            </button>
          </template>
        </XbInput>
      </XbFormItem>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <XbButton type="secondary" block @click="emit('close')">取消</XbButton>
        <XbButton block :loading="submitting" @click="handleSubmit">确认修改</XbButton>
      </div>
    </div>
  </XbModal>
</template>
