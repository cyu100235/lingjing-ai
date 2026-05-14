<script setup lang="ts">
import { useMarketplaceStore } from '@/stores/marketplace'
import { ref, watch } from 'vue'
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

const marketplaceStore = useMarketplaceStore()

const rechargePackages = [
  { id: 1, coins: 100, price: 10, label: '100金币' },
  { id: 2, coins: 500, price: 45, label: '500金币', tag: '9折' },
  { id: 3, coins: 1000, price: 80, label: '1000金币', tag: '8折' },
  { id: 4, coins: 5000, price: 350, label: '5000金币', tag: '7折' },
]
const selectedPackage = ref(rechargePackages[1])
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
    marketplaceStore.wallet.balance += selectedPackage.value.coins
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
  selectedPackage.value = rechargePackages[1]
  rechargePayMethod.value = 'alipay'
}

function onSelectPackage(pkg: typeof rechargePackages[0]) {
  selectedPackage.value = pkg
}

function onSelectPayMethod(method: 'alipay' | 'wechat') {
  rechargePayMethod.value = method
}

watch(() => props.visible, (val) => {
  if (val) {
    selectedPackage.value = rechargePackages[1]
    rechargePayMethod.value = 'alipay'
    rechargeLoading.value = false
    rechargeStep.value = 'select'
  }
})
</script>

<template>
  <XbModal :visible="props.visible" width="w-[480px]" no-padding :show-close="false" @close="close">
    <RechargeHeader :balance="marketplaceStore.wallet.balance" @close="close" />

    <RechargeSuccess
      v-if="rechargeStep === 'success'"
      :coins="selectedPackage.coins"
      :balance="marketplaceStore.wallet.balance"
      @close="close" />

    <RechargeQrCode
      v-else-if="rechargeStep === 'qrcode'"
      :selected-package="selectedPackage"
      :recharge-pay-method="rechargePayMethod"
      :recharge-loading="rechargeLoading"
      @back-to-select="backToSelect"
      @confirm-recharge="confirmRecharge" />

    <RechargePackageSelect
      v-else
      :recharge-packages="rechargePackages"
      :selected-package="selectedPackage"
      :recharge-pay-method="rechargePayMethod"
      @select-package="onSelectPackage"
      @select-pay-method="onSelectPayMethod"
      @go-to-qr-code="goToQrCode" />
  </XbModal>
</template>
