<script setup lang="ts">
interface Props {
  balance: number
  currencyName: string
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
  <div
    class="relative px-6 pt-6 pb-5 bg-gradient-to-br from-yellow-500/15 via-surface-elevated to-surface-elevated border-b border-border-subtle">
    <button
      class="absolute top-4 right-4 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
      @click="close">
      <XbIcon name="x" :size="18" />
    </button>
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-yellow-400/15 flex items-center justify-center">
        <XbIcon name="coins" :size="22" class="text-yellow-400" />
      </div>
      <div>
        <h3 class="text-base font-bold text-content">{{ currencyName }}充值</h3>
        <p class="text-xs text-content-tertiary mt-0.5">
          当前{{ currencyName }}：
          <span class="text-yellow-400 font-medium">
            {{ balance }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>
