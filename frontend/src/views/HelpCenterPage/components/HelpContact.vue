<script setup lang="ts">
import { createFeedback } from '@/api/helpFeedback'
import { XbMessage } from '@/xbUi'

const showModal = ref(false)
const feedbackContent = ref('')
const contactInfo = ref('')
const submitting = ref(false)

function handleFeedback() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  feedbackContent.value = ''
  contactInfo.value = ''
}

async function handleSubmit() {
  if (!feedbackContent.value.trim()) {
    XbMessage.warning('请输入反馈内容')
    return
  }

  submitting.value = true
  try {
    await createFeedback({
      content: feedbackContent.value.trim(),
      contact: contactInfo.value.trim() || undefined,
    })
    XbMessage.success('反馈提交成功')
    closeModal()
  } catch (err) {
    XbMessage.error('反馈提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <XbCard class="mt-6">
    <div class="flex items-center gap-2 mb-2">
      <XbIcon name="mail" :size="16" class="text-brand" />
      <h4 class="text-xs font-medium text-content">联系我们</h4>
    </div>
    <p class="text-[10px] text-content-tertiary mb-3">遇到问题？随时联系我们的支持团队</p>
    <XbButton type="primary" size="sm" block @click="handleFeedback">
      发送反馈
    </XbButton>
  </XbCard>

  <XbModal
    v-model:visible="showModal"
    title="发送反馈"
    width="w-[480px]"
    :close-on-overlay="true"
  >
    <div class="space-y-4">
      <XbTextarea
        v-model="feedbackContent"
        label="反馈内容"
        placeholder="请描述您遇到的问题或建议..."
        :rows="4"
        resize="none"
      />
      <XbInput
        v-model="contactInfo"
        label="联系方式（选填）"
        placeholder="邮箱或手机号，方便我们回复您"
      />
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <XbButton type="secondary" size="sm" @click="closeModal">
          取消
        </XbButton>
        <XbButton type="primary" size="sm" :loading="submitting" @click="handleSubmit">
          提交
        </XbButton>
      </div>
    </template>
  </XbModal>
</template>
