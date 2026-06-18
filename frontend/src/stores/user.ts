import { defineStore } from 'pinia'
import { login, mobileLogin, emailLogin, register, getUserInfo, resetPassword, changePassword, logout, editProfileField } from '@/api/user'
import { upload } from '@/api/upload'
import { bindMobile, unlockBindMobile, bindMail, unlockMail } from '@/api/bind'
import type { LoginParams, MobileLoginParams, EmailLoginParams, RegisterParams, ChangePasswordParams, ResetPasswordParams, UserInfo } from '@/api/user'

/** 会员等级类型：免费 / 月度 / 年度 / 终身 */
export type MembershipLevel = 'free' | 'monthly' | 'annual' | 'lifetime'

/** 会员等级配置（标签与颜色） */
export const MEMBERSHIP_CONFIG: Record<MembershipLevel, { label: string; color: string }> = {
  free: { label: '免费会员', color: 'text-content-tertiary' },
  monthly: { label: '月度会员', color: 'text-amber-400' },
  annual: { label: '年度会员', color: 'text-purple-400' },
  lifetime: { label: '终身会员', color: 'text-amber-400' },
}

/** 用户状态管理 */
export const useUserStore = defineStore('user', () => {
  /** 是否已登录 */
  const isLoggedIn = ref(false)

  /** 用户信息初始化 Promise，防止并发重复调用 */
  const initPromise = ref<Promise<void> | null>(null)

  /** 用户信息 */
  const userInfo = ref<UserInfo>({
    id: '',
    create_at: '',
    username: '',
    nickname: '',
    mobile: '',
    email: '',
    avatar: '/images/user-avatar.png',
    login_ip: '',
    login_time: '',
    balance: 0,
    freeze_balance: 0,
    integral: 0,
    level: 'free',
  })

  /** 手机号是否已绑定 */
  const isPhoneBound = computed(() => !!userInfo.value.mobile)
  /** 邮箱是否已绑定 */
  const isEmailBound = computed(() => !!userInfo.value.email)
  /** 微信是否已绑定 */
  const isWechatBound = computed(() => !!userInfo.value.wechat)

  /** 保存 token 到 localStorage */
  function saveToken(token: string) {
    localStorage.setItem('token', token)
  }

  /** 从 localStorage 获取 token */
  function getToken(): string | null {
    return localStorage.getItem('token')
  }

  /** 清除 token */
  function clearToken() {
    localStorage.removeItem('token')
  }

  /** 初始化用户信息（页面刷新时调用） */
  async function initUser() {
    if (initPromise.value) return initPromise.value
    initPromise.value = (async () => {
      const token = getToken()
      if (token) {
        try {
          const info = await getUserInfo()
          userInfo.value = info
          isLoggedIn.value = true
        } catch (error) {
          // token 失效，清除登录状态
          clearToken()
          isLoggedIn.value = false
          userInfo.value = {
            id: '',
            create_at: '',
            username: '',
            nickname: '',
            mobile: '',
            email: '',
            avatar: '/images/user-avatar.png',
            login_ip: '',
            login_time: '',
            balance: 0,
            freeze_balance: 0,
            integral: 0,
            level: 'free',
          }
        }
      }
    })()
    return initPromise.value
  }

  /** 用户登录 */
  async function loginAction(params: LoginParams): Promise<{ success: boolean; message: string }> {
    try {
      const result = await login(params)      
      // 登录成功，保存 token
      if (result && result.access_token) {
        saveToken(result.access_token)
        // 获取用户信息
        const info = await getUserInfo()
        userInfo.value = info
        isLoggedIn.value = true
        return { success: true, message: '登录成功' }
      }
      return { success: false, message: '登录失败' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '登录失败！'
      return { success: false, message }
    }
  }

  /** 手机验证码登录 */
  async function mobileLoginAction(params: MobileLoginParams): Promise<{ success: boolean; message: string }> {
    try {
      const result = await mobileLogin(params)
      if (result && result.access_token) {
        saveToken(result.access_token)
        const info = await getUserInfo()
        userInfo.value = info
        isLoggedIn.value = true
        return { success: true, message: '登录成功' }
      }
      return { success: false, message: '登录失败' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '登录失败！'
      return { success: false, message }
    }
  }

  /** 邮箱验证码登录 */
  async function emailLoginAction(params: EmailLoginParams): Promise<{ success: boolean; message: string }> {
    try {
      const result = await emailLogin(params)
      if (result && result.access_token) {
        saveToken(result.access_token)
        const info = await getUserInfo()
        userInfo.value = info
        isLoggedIn.value = true
        return { success: true, message: '登录成功' }
      }
      return { success: false, message: '登录失败' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '登录失败！'
      return { success: false, message }
    }
  }

  /** 用户登出 */
  async function logoutAction() {
    try {
      // 调用服务端退出登录接口
      await logout({ client: 'web' })
    } catch (error) {
      // 即使接口调用失败，也要清除本地登录状态
      console.error('退出登录接口调用失败:', error)
    } finally {
      // 清除本地 token 和用户信息
      clearToken()
      isLoggedIn.value = false
      userInfo.value = {
        id: '',
        create_at: '',
        username: '',
        nickname: '',
        mobile: '',
        email: '',
        avatar: '/images/user-avatar.png',
        login_ip: '',
        login_time: '',
        balance: 0,
        freeze_balance: 0,
        integral: 0,
        level: 'free',
      }
    }
  }

  /** 用户注册 */
  async function registerAction(params: RegisterParams): Promise<{ success: boolean; message: string }> {
    try {
      await register(params)
      return { success: true, message: '注册成功' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '注册失败'
      return { success: false, message }
    }
  }

  /** 修改密码 */
  async function changePasswordAction(params: ChangePasswordParams): Promise<{ success: boolean; message: string }> {
    try {
      await changePassword(params)
      return { success: true, message: '密码修改成功' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '密码修改失败'
      return { success: false, message }
    }
  }

  /** 找回密码 */
  async function resetPasswordAction(params: ResetPasswordParams): Promise<{ success: boolean; message: string }> {
    try {
      await resetPassword(params)
      return { success: true, message: '密码重置成功' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '密码重置失败'
      return { success: false, message }
    }
  }

  /** 绑定手机号 */
  async function bindPhone(mobile: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      await bindMobile({ mobile, code })
      userInfo.value.mobile = mobile
      return { success: true, message: '手机绑定成功' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '手机绑定失败'
      return { success: false, message }
    }
  }

  /** 解绑手机号 */
  async function unbindPhone(code: string): Promise<{ success: boolean; message: string }> {
    try {
      await unlockBindMobile({ code })
      userInfo.value.mobile = ''
      return { success: true, message: '手机已解绑' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '手机解绑失败'
      return { success: false, message }
    }
  }

  /** 绑定邮箱 */
  async function bindEmailAction(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      await bindMail({ email, code })
      userInfo.value.email = email
      return { success: true, message: '邮箱绑定成功' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '邮箱绑定失败'
      return { success: false, message }
    }
  }

  /** 解绑邮箱 */
  async function unbindEmailAction(code: string): Promise<{ success: boolean; message: string }> {
    try {
      await unlockMail({ code })
      userInfo.value.email = ''
      return { success: true, message: '邮箱已解绑' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '邮箱解绑失败'
      return { success: false, message }
    }
  }

  /** 绑定微信 */
  function bindWechat(wechatId: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.wechat = wechatId
        resolve({ success: true, message: '微信绑定成功' })
      }, 2000)
    })
  }

  /** 解绑微信 */
  function unbindWechat(): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value.wechat = ''
        resolve({ success: true })
      }, 1000)
    })
  }

  /** 上传并更新用户头像 */
  async function updateAvatar(file: File): Promise<{ success: boolean; message: string }> {
    try {
      // 调用 upload 接口上传图片，获取服务端返回的 URL
      const { url } = await upload(file)
      // 调用 editProfileField 接口保存头像
      await editProfileField({ field: 'avatar', value: url })
      userInfo.value.avatar = url
      return { success: true, message: '头像修改成功' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '头像修改失败'
      return { success: false, message }
    }
  }

  /** 更新用户昵称 */
  async function updateNickname(nickname: string): Promise<{ success: boolean; message: string }> {
    try {
      await editProfileField({ field: 'nickname', value: nickname })
      userInfo.value.nickname = nickname
      return { success: true, message: '昵称修改成功' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '昵称修改失败'
      return { success: false, message }
    }
  }

  return {
    isLoggedIn,
    userInfo,
    isPhoneBound,
    isEmailBound,
    isWechatBound,
    saveToken,
    getToken,
    clearToken,
    initUser,
    loginAction,
    mobileLoginAction,
    emailLoginAction,
    logoutAction,
    registerAction,
    changePasswordAction,
    resetPasswordAction,
    bindPhone,
    unbindPhone,
    bindEmailAction,
    unbindEmailAction,
    bindWechat,
    unbindWechat,
    updateAvatar,
    updateNickname,
  }
})
