<script setup lang="ts">
import { ref, watch } from 'vue'

import UserProfileHeader from './UserProfileHeader.vue'
import UserInfoList from './UserInfoList.vue'
import ChangePasswordModal from './ChangePasswordModal.vue'
import BindPhoneModal from './BindPhoneModal.vue'
import BindEmailModal from './BindEmailModal.vue'
import BindWechatModal from './BindWechatModal.vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const activeSubModal = ref<'password' | 'phone' | 'email' | 'wechat' | null>(null)

watch(() => props.visible, (val) => {
  if (!val) {
    activeSubModal.value = null
  }
})
</script>

<template>
  <XbModal v-if="!activeSubModal" :visible="visible" no-padding width="w-[420px]" :show-close="false" @close="emit('close')">
    <UserProfileHeader @close="emit('close')" />
    <UserInfoList @open-sub-modal="activeSubModal = $event" />
  </XbModal>

  <!-- Sub Modals -->
  <ChangePasswordModal
    :visible="activeSubModal === 'password'"
    @close="activeSubModal = null"
  />
  <BindPhoneModal
    :visible="activeSubModal === 'phone'"
    @close="activeSubModal = null"
  />
  <BindEmailModal
    :visible="activeSubModal === 'email'"
    @close="activeSubModal = null"
  />
  <BindWechatModal
    :visible="activeSubModal === 'wechat'"
    @close="activeSubModal = null"
  />
</template>
