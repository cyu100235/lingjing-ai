<script setup lang="ts">
import type { VipPlan } from '../VipModal/types'
import PaySuccessView from './components/PaySuccessView.vue'
import PayFormView from './components/PayFormView.vue'

const props = defineProps<{
  visible: boolean
  selectedPlan: VipPlan | null
}>()

const emit = defineEmits<{
  close: []
  paySuccess: []
}>()

const payMethod = ref<'alipay' | 'wechat'>('alipay')
const payLoading = ref(false)
const paySuccess = ref(false)

function confirmPay() {
  payLoading.value = true
  setTimeout(() => {
    payLoading.value = false
    paySuccess.value = true
  }, 2000)
}

function close() {
  paySuccess.value = false
  payLoading.value = false
  payMethod.value = 'alipay'
  emit('close')
}

watch(() => props.visible, (val) => {
  if (val) {
    payMethod.value = 'alipay'
    payLoading.value = false
    paySuccess.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="props.visible" class="modal-overlay">
      <div class="modal-content w-[420px] p-0 overflow-hidden">
        <div class="relative px-6 pt-6 pb-5 bg-gradient-to-br from-amber-500/15 via-surface-elevated to-surface-elevated border-b border-border-subtle">
          <button
            class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
            @click="close"
          >
            <XbIcon name="x" :size="18" />
          </button>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center">
              <XbIcon name="shield-check" :size="22" class="text-amber-400" />
            </div>
            <div>
              <h3 class="text-base font-bold text-content">确认支付</h3>
              <p class="text-xs text-content-tertiary mt-0.5">安全支付，即时开通</p>
            </div>
          </div>
        </div>
        <PaySuccessView
          v-if="paySuccess"
          :selected-plan="props.selectedPlan"
          @start-using="emit('paySuccess'); close()"
        />
        <PayFormView
          v-else
          :selected-plan="props.selectedPlan"
          :pay-method="payMethod"
          :pay-loading="payLoading"
          @select-method="payMethod = $event"
          @confirm-pay="confirmPay"
        />
      </div>
    </div>
  </Teleport>
</template>
