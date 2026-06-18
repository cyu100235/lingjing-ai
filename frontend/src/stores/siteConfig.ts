import { defineStore } from 'pinia'
import { getSiteConfig } from '@/api/config'
import type { SiteConfig, SmsSceneName, EmailSceneName } from '@/api/config'
import { useUserStore } from './user'

/** 站点配置状态管理 */
export const useSiteConfigStore = defineStore('siteConfig', () => {
  /** 站点配置数据 */
  const config = ref<SiteConfig | null>(null)

  /** 是否已完成初始化 */
  const initialized = ref(false)

  /** 是否正在加载 */
  const loading = ref(false)

  /** 初始化站点配置（从后端拉取） */
  async function init() {
    if (initialized.value) return
    loading.value = true
    try {
      config.value = await getSiteConfig()
      initialized.value = true
    } catch (e) {
      console.error('[SiteConfig] 获取站点配置失败', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据模板标识（字典 key）获取短信场景模板名称
   * @param key 模板标识（对应 config.sms 的字典下标）
   * @returns 匹配的模板 name，未找到时返回传入的 key 本身
   */
  function getSmsSceneName(key: SmsSceneName): string {
    return config.value?.sms?.[key]?.name ?? key
  }

  /**
   * 根据模板标识（字典 key）获取邮件场景模板名称
   * @param key 模板标识（对应 config.email 的字典下标）
   * @returns 匹配的模板 name，未找到时返回传入的 key 本身
   */
  function getEmailSceneName(key: EmailSceneName): string {
    return config.value?.email?.[key]?.name ?? key
  }

  /**
   * 货币名称：根据 recharge_type 决定使用余额货币名称还是积分货币名称
   * recharge_type === '10' 使用 balance_currency_name，否则使用 integral_currency_name
   */
  const currencyName = computed(() => {
    const recharge = config.value?.user?.recharge
    if (!recharge) return ''
    return recharge.recharge_type === '10'
      ? recharge.balance_currency_name
      : recharge.integral_currency_name
  })

  /**
   * 货币余额：根据 recharge_type 决定使用 user.balance 还是 user.integral
   * recharge_type === '10' 使用 userInfo.balance，否则使用 userInfo.integral
   */
  const currencyBalance = computed(() => {
    const userStore = useUserStore()
    const recharge = config.value?.user?.recharge
    if (!recharge) return 0
    return recharge.recharge_type === '10'
      ? userStore.userInfo.balance
      : userStore.userInfo.integral
  })

  /**
   * 设置货币余额：根据 recharge_type 决定写入 user.balance 还是 user.integral
   */
  function setCurrencyBalance(value: number) {
    const userStore = useUserStore()
    const recharge = config.value?.user?.recharge
    if (!recharge) return
    if (recharge.recharge_type === '10') {
      userStore.userInfo.balance = value
    } else {
      userStore.userInfo.integral = value
    }
  }

  return {
    config,
    initialized,
    loading,
    currencyName,
    currencyBalance,
    setCurrencyBalance,
    init,
    getSmsSceneName,
    getEmailSceneName,
  }
})
