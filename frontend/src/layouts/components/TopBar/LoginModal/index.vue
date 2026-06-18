<script setup lang="ts">
import LoginView from './LoginView.vue'
import RegisterView from './RegisterView.vue'
import ForgotView from './ForgotView.vue'
import WechatView from './WechatView.vue'
import SmsView from './SmsView.vue'
import EmailView from './EmailView.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

type ViewType = 'login' | 'register' | 'forgot' | 'wechat' | 'sms' | 'email'
const currentView = ref<ViewType>('login')

watch(() => props.visible, (val) => {
  if (!val) {
    currentView.value = 'login'
  }
})

function switchView(view: ViewType) {
  currentView.value = view
}
</script>

<template>
  <XbModal :visible="visible" no-padding width="w-[400px]" :show-close="false" @close="emit('close')">
    <LoginView
      v-if="currentView === 'login'"
      @close="emit('close')"
      @switch-view="(v: string) => switchView(v as ViewType)"
    />
    <RegisterView
      v-else-if="currentView === 'register'"
      @close="emit('close')"
      @back="switchView('login')"
    />
    <ForgotView
      v-else-if="currentView === 'forgot'"
      @success="switchView('login')"
      @back="switchView('login')"
    />
    <WechatView
      v-else-if="currentView === 'wechat'"
      @close="emit('close')"
      @back="switchView('login')"
    />
    <SmsView
      v-else-if="currentView === 'sms'"
      @close="emit('close')"
      @back="switchView('login')"
    />
    <EmailView
      v-else-if="currentView === 'email'"
      @close="emit('close')"
      @back="switchView('login')"
    />
  </XbModal>
</template>
