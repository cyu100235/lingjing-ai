<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => (route.query.taskId as string) || '')
const workId = computed(() => (route.query.work_id as string) || '')

// 倒计时：5 分钟 = 300 秒
const TOTAL_SECONDS = 5 * 60
const remainingSeconds = ref(TOTAL_SECONDS)
const isExpired = ref(false)
const isFailed = ref(false)
const isPolling = ref(true)
const showFailModal = ref(false)
const pollTimer = ref<ReturnType<typeof setInterval> | null>(null)
const countdownTimer = ref<ReturnType<typeof setInterval> | null>(null)

// 进度百分比
const progressPercent = computed(() => {
  const elapsed = TOTAL_SECONDS - remainingSeconds.value
  return Math.min(Math.round((elapsed / TOTAL_SECONDS) * 100), 100)
})

// 格式化剩余时间 mm:ss
const formattedTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

// 状态文字
const statusText = computed(() => {
  if (isFailed.value) return '生成失败'
  if (isExpired.value) return '已超时'
  return '视频生成中…'
})

// 轮询查询任务结果
async function pollTaskResult() {
  if (!taskId.value || !isPolling.value) return

  try {
    // TODO: 对接后端 API — 替换为真实请求
    // const res = await fetch(`/api/task/${taskId.value}`)
    // const data = await res.json()
    // if (data.status === 'success') {
    //   isPolling.value = false
    //   clearTimers()
    //   router.push({ name: 'preview', query: { taskId: taskId.value, work_id: workId.value } })
    //   return
    // }
    // if (data.status === 'failed') {
    //   isPolling.value = false
    //   isFailed.value = true
    //   clearTimers()
    //   showFailModal.value = true
    //   return
    // }

    // 占位：暂时不做任何处理，等待后端对接
  } catch {
    // 网络错误不中断轮询
  }
}

// 倒计时到期（超时也视为失败）
function onCountdownEnd() {
  isPolling.value = false
  isExpired.value = true
  clearTimers()
  showFailModal.value = true
}

function clearTimers() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

function goBack() {
  router.push({ name: 'episodes', query: workId.value ? { work_id: workId.value } : undefined })
}

function handleFailModalConfirm() {
  showFailModal.value = false
  goBack()
}

onMounted(() => {
  // 启动倒计时
  countdownTimer.value = setInterval(() => {
    if (remainingSeconds.value <= 1) {
      remainingSeconds.value = 0
      onCountdownEnd()
      return
    }
    remainingSeconds.value--
  }, 1000)

  // 每 5 秒轮询一次
  pollTaskResult()
  pollTimer.value = setInterval(pollTaskResult, 5000)
})

onUnmounted(() => {
  clearTimers()
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full min-h-[500px] gap-6 py-10">
    <!-- 进度圆环 -->
    <div class="relative w-40 h-40">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <!-- 背景环 -->
        <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--surface-overlay))" stroke-width="8" />
        <!-- 进度环 -->
        <circle
          cx="80" cy="80" r="70"
          fill="none"
          :stroke="isExpired || isFailed ? 'hsl(var(--danger))' : 'hsl(var(--brand))'"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="2 * Math.PI * 70"
          :stroke-dashoffset="2 * Math.PI * 70 * (1 - progressPercent / 100)"
          class="transition-all duration-1000"
        />
      </svg>
      <!-- 中心文字 -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span v-if="!isExpired && !isFailed" class="text-3xl font-bold text-content tabular-nums">
          {{ formattedTime }}
        </span>
        <XbIcon v-else name="alert-circle" :size="36" class="text-danger" />
      </div>
    </div>

    <!-- 状态文字 -->
    <div class="flex flex-col items-center gap-2">
      <h2 class="text-lg font-semibold text-content">{{ statusText }}</h2>
      <p v-if="!isExpired && !isFailed" class="text-sm text-content-tertiary">
        正在为您合成成片，请耐心等待
      </p>
      <p v-else-if="isExpired" class="text-sm text-content-tertiary">
        生成时间已超过5分钟，请稍后重试或检查任务状态
      </p>
      <p v-else class="text-sm text-content-tertiary">
        视频生成失败，请重试
      </p>
    </div>

    <!-- 任务信息 -->
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-overlay/50">
      <XbIcon name="hash" :size="12" class="text-content-tertiary" />
      <span class="text-xs text-content-tertiary">任务ID：{{ taskId || '—' }}</span>
    </div>

    <!-- 进度条（细条） -->
    <div v-if="!isExpired && !isFailed" class="w-64">
      <div class="h-1 rounded-full bg-surface-overlay overflow-hidden">
        <div
          class="h-full rounded-full bg-brand transition-all duration-1000"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
      <div class="flex items-center justify-between mt-1">
        <span class="text-[10px] text-content-tertiary">进度</span>
        <span class="text-[10px] text-content-tertiary">{{ progressPercent }}%</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center gap-3 mt-2">
      <XbButton type="secondary" @click="goBack">
        <template #icon><XbIcon name="arrow-left" :size="14" /></template>
        返回作品剧集列表
      </XbButton>
    </div>
  </div>

  <!-- 失败/超时提示弹窗 -->
  <XbConfirmModal
    v-model:visible="showFailModal"
    title="生成失败"
    confirm-text="返回剧集列表"
    confirm-type="danger"
    :show-cancel="false"
    @confirm="handleFailModalConfirm"
  >
    <p class="text-sm text-content-secondary">
      {{ isExpired ? '生成时间已超过5分钟，任务超时' : '视频生成失败' }}，请稍后重试。
    </p>
  </XbConfirmModal>
</template>
