<script setup lang="ts">


function handleFeedback() {
  // TODO: 打开反馈弹窗或跳转反馈页面
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
</template>
