<script setup lang="ts">
interface Props {
  coins: number
  balance: number
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

function close() {
  emit('close')
}
</script>

<template>
  <div class="px-6 py-10 flex flex-col items-center">
    <div class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 animate-bounce-in">
      <XbIcon name="check" :size="32" class="text-green-500" />
    </div>
    <h4 class="text-lg font-bold text-content mb-1">充值成功</h4>
    <p class="text-sm text-content-secondary mb-2">
      已成功充值 <span class="text-yellow-400 font-medium">{{ coins }}</span> 金币
    </p>
    <p class="text-xs text-content-tertiary mb-6">当前余额: {{ balance }} 金币</p>
    <XbButton type="primary" size="md" @click="close">
      完成
    </XbButton>
  </div>
</template>
