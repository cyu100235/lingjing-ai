<script setup lang="ts">
import { useSiteConfigStore } from '@/stores/siteConfig'
import RechargeHeader from './components/RechargeHeader.vue'
import RechargeSuccess from './components/RechargeSuccess.vue'
import RechargeQrCode from './components/RechargeQrCode.vue'
import RechargePackageSelect from './components/RechargePackageSelect.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const siteConfigStore = useSiteConfigStore()

/** 充值配置 */
const rechargeConfig = computed(() => siteConfigStore.config?.user.recharge)
/** 充值金额列表 */
const rechargeAmountList = computed(() => rechargeConfig.value?.recharge_amount_list ?? [])
/** 货币名称：根据 recharge_type 决定显示余额货币名称还是积分货币名称 */
const currencyName = computed(() => {
  if (!rechargeConfig.value) return ''
  return rechargeConfig.value.recharge_type === '10'
    ? rechargeConfig.value.balance_currency_name
    : rechargeConfig.value.integral_currency_name
})

const selectedPackage = ref<typeof rechargeAmountList.value[0] | null>(null)
const rechargePayMethod = ref<'alipay' | 'wechat'>('alipay')
const rechargeLoading = ref(false)
const rechargeStep = ref<'select' | 'qrcode' | 'success'>('select')

function goToQrCode() {
  rechargeStep.value = 'qrcode'
}

function confirmRecharge() {
  rechargeLoading.value = true
  setTimeout(() => {
    rechargeLoading.value = false
    rechargeStep.value = 'success'
    const addAmount = Number(selectedPackage.value?.recharge_amount ?? 0) + Number(selectedPackage.value?.give_amount ?? 0)
    siteConfigStore.setCurrencyBalance(siteConfigStore.currencyBalance + addAmount)
  }, 2000)
}

function backToSelect() {
  rechargeStep.value = 'select'
  rechargeLoading.value = false
}

function close() {
  emit('close')
  rechargeStep.value = 'select'
  rechargeLoading.value = false
  selectedPackage.value = rechargeAmountList.value[1] ?? rechargeAmountList.value[0] ?? null
  rechargePayMethod.value = 'alipay'
}

function onSelectPackage(pkg: typeof rechargeAmountList.value[0]) {
  selectedPackage.value = pkg
}

function onSelectPayMethod(method: 'alipay' | 'wechat') {
  rechargePayMethod.value = method
}

watch(() => props.visible, (val) => {
  if (val) {
    selectedPackage.value = rechargeAmountList.value[1] ?? rechargeAmountList.value[0] ?? null
    rechargePayMethod.value = 'alipay'
    rechargeLoading.value = false
    rechargeStep.value = 'select'
  }
})
</script>

<template>
  <XbModal :visible="props.visible" width="w-[480px]" no-padding :show-close="false" @close="close">
    <RechargeHeader :balance="siteConfigStore.currencyBalance" :currency-name="currencyName" @close="close" />

    <RechargeSuccess
      v-if="rechargeStep === 'success' && selectedPackage"
      :recharge-amount="selectedPackage.recharge_amount"
      :give-amount="selectedPackage.give_amount"
      :balance="siteConfigStore.currencyBalance"
      :currency-name="currencyName"
      @close="close" />

    <RechargeQrCode
      v-else-if="rechargeStep === 'qrcode' && selectedPackage"
      :selected-package="selectedPackage"
      :recharge-pay-method="rechargePayMethod"
      :recharge-loading="rechargeLoading"
      :currency-name="currencyName"
      @back-to-select="backToSelect"
      @confirm-recharge="confirmRecharge" />

    <RechargePackageSelect
      v-else
      :recharge-packages="rechargeAmountList"
      :selected-package="selectedPackage"
      :recharge-pay-method="rechargePayMethod"
      :currency-name="currencyName"
      @select-package="onSelectPackage"
      @select-pay-method="onSelectPayMethod"
      @go-to-qr-code="goToQrCode" />
  </XbModal>
</template>
