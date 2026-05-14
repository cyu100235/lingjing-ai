import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 会员等级类型
export type MembershipLevel = 'free' | 'monthly' | 'annual' | 'lifetime'

// 会员等级配置
export const MEMBERSHIP_CONFIG: Record<MembershipLevel, { label: string; color: string }> = {
  free: { label: '免费会员', color: 'text-content-tertiary' },
  monthly: { label: '月度会员', color: 'text-amber-400' },
  annual: { label: '年度会员', color: 'text-purple-400' },
  lifetime: { label: '终身会员', color: 'text-amber-400' },
}

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)

  const userInfo = ref({
    avatar: '/images/user-avatar.png',
    nickname: '创作者小明同学',
    account: 'xiaoming2024',
    password: '********',
    phone: '',
    email: 'xiaoming@example.com',
    wechat: '',
    level: 'free' as MembershipLevel,
  })

  const isPhoneBound = computed(() => !!userInfo.value.phone)
  const isEmailBound = computed(() => !!userInfo.value.email)
  const isWechatBound = computed(() => !!userInfo.value.wechat)

  function login(account: string, _password: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        isLoggedIn.value = true
        userInfo.value.account = account
        userInfo.value.nickname = '创作者小明同学'
        resolve({ success: true, message: '登录成功' })
      }, 1500)
    })
  }

  function logout() {
    isLoggedIn.value = false
  }

  function changePassword(oldPwd: string, newPwd: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.password = '********'
        resolve({ success: true, message: '密码修改成功' })
      }, 1500)
    })
  }

  function sendVerifyCode(target: string, type: 'phone' | 'email'): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  }

  function bindPhone(phone: string, _code: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.phone = phone
        resolve({ success: true, message: '手机绑定成功' })
      }, 1500)
    })
  }

  function unbindPhone(): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.phone = ''
        resolve({ success: true })
      }, 1000)
    })
  }

  function bindEmail(email: string, _code: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.email = email
        resolve({ success: true, message: '邮箱绑定成功' })
      }, 1500)
    })
  }

  function unbindEmail(): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.email = ''
        resolve({ success: true })
      }, 1000)
    })
  }

  function bindWechat(wechatId: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.wechat = wechatId
        resolve({ success: true, message: '微信绑定成功' })
      }, 2000)
    })
  }

  function unbindWechat(): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.wechat = ''
        resolve({ success: true })
      }, 1000)
    })
  }

  function updateAvatar(avatarUrl: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.avatar = avatarUrl
        resolve({ success: true, message: '头像修改成功' })
      }, 1000)
    })
  }

  function updateNickname(nickname: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.nickname = nickname
        resolve({ success: true, message: '昵称修改成功' })
      }, 1000)
    })
  }

  return {
    isLoggedIn,
    userInfo,
    isPhoneBound,
    isEmailBound,
    isWechatBound,
    login,
    logout,
    changePassword,
    sendVerifyCode,
    bindPhone,
    unbindPhone,
    bindEmail,
    unbindEmail,
    bindWechat,
    unbindWechat,
    updateAvatar,
    updateNickname,
  }
})
