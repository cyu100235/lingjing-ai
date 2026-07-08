<script setup lang="ts">
type MainTab = 'image' | 'video' | 'audio'

defineProps<{
  modelName?: string
  status?: string
  type?: MainTab
  resolution?: string
  saleAmount?: string
}>()

const TYPE_LABELS: Record<MainTab, string> = {
  image: '图片',
  audio: '音频',
  video: '视频',
}

function statusClass(status?: string) {
  switch (status) {
    case 'success': return 'bg-green-500/10 text-green-500'
    case 'failed': return 'bg-red-500/10 text-red-500'
    case 'running': return 'bg-blue-500/10 text-blue-500'
    case 'pending': return 'bg-amber-500/10 text-amber-500'
    default: return 'bg-surface-overlay text-content-tertiary'
  }
}

function statusText(status?: string) {
  switch (status) {
    case 'success': return '成功'
    case 'failed': return '失败'
    case 'running': return '生成中'
    case 'pending': return '待执行'
    default: return status || '未知'
  }
}
</script>

<template>
  <div class="px-4 py-3 border-b border-border">
    <h4 class="text-sm font-medium text-content mb-2.5">任务信息</h4>
    <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
      <div class="min-w-0 flex items-center gap-1">
        <span class="text-content-secondary shrink-0">模型名称</span>
        <span class="text-content truncate" :title="modelName || ''">{{ modelName || '—' }}</span>
      </div>
      <div class="min-w-0 flex items-center gap-1">
        <span class="text-content-secondary shrink-0">任务状态</span>
        <span
          class="px-1.5 py-0.5 rounded-md font-medium inline-flex items-center gap-1"
          :class="statusClass(status)"
        >
          <XbIcon
            v-if="status === 'running'"
            name="loader-2"
            :size="10"
            class="animate-spin"
          />
          {{ statusText(status) }}
        </span>
      </div>
      <div class="min-w-0 flex items-center gap-1">
        <span class="text-content-secondary shrink-0">任务类型</span>
        <span class="px-1.5 py-0.5 rounded-md bg-surface-overlay text-content-tertiary font-medium">
          {{ type ? TYPE_LABELS[type] : '—' }}
        </span>
      </div>
      <div class="min-w-0 flex items-center gap-1">
        <span class="text-content-secondary shrink-0">分辨率</span>
        <span class="text-content truncate" :title="resolution || ''">{{ resolution || '—' }}</span>
      </div>
      <div class="col-span-2 min-w-0 flex items-center gap-1">
        <span class="text-content-secondary shrink-0">实际消费</span>
        <span class="px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-500 font-medium">
          {{ saleAmount || '—' }}
        </span>
      </div>
    </div>
  </div>
</template>
