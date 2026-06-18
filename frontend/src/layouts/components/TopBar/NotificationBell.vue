<script setup lang="ts">
import NotificationPanel from '../NotificationPanel/index.vue'
import {
  getNoticeList,
  getNoticeTypeOptions,
  markNoticeRead,
  markAllNoticeRead,
  getUnreadCount,
  type NoticeItem,
  type NoticeTypeOption,
} from '@/api/notice'

export interface NotificationDisplayItem {
  id: string
  /** 类型名称 */
  type: string
  /** 类型标识，对应 NoticeTypeOption.name_key */
  typeKey: string
  /** 模板 ID，对应 NoticeTypeOption.value */
  templateId: number
  title: string
  content: string
  time: string
  read: boolean
}

const showNotification = ref(false)
const notificationRef = ref<HTMLElement | null>(null)
const notifications = ref<NotificationDisplayItem[]>([])
const typeOptions = ref<NoticeTypeOption[]>([])
const totalUnreadCount = ref(0)
const loading = ref(false)

/** 轮询定时器 */
let pollTimer: ReturnType<typeof setInterval> | null = null
const POLL_INTERVAL = 60_000 // 60秒轮询一次未读数

/** 获取通知类型选项 */
async function fetchTypeOptions() {
  try {
    const res = await getNoticeTypeOptions()
    typeOptions.value = res || []
  } catch (e) {
    console.error('获取通知类型选项失败', e)
  }
}

/** 格式化时间为相对时间 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

/** 将 API 数据转换为显示格式 */
function transformNotice(item: NoticeItem): NotificationDisplayItem {
  return {
    id: String(item.id),
    type: item.type_name,
    typeKey: item.type_key,
    templateId: item.template_id,
    title: item.title,
    content: item.content,
    time: formatRelativeTime(item.create_at),
    read: item.is_read === '20',
  }
}

/** 获取通知列表 */
async function fetchNotifications() {
  loading.value = true
  try {
    const res = await getNoticeList({ page: 1, limit: 10 })
    notifications.value = (res.data || []).map(transformNotice)
  } catch (e) {
    console.error('获取通知列表失败', e)
  } finally {
    loading.value = false
  }
}

/** 获取未读数量 */
async function fetchUnreadCount() {
  try {
    const res = await getUnreadCount()
    totalUnreadCount.value = res.count || 0
  } catch (e) {
    console.error('获取未读数量失败', e)
  }
}

/** 切换通知类型（前端过滤，无需重新请求） */
function handleChangeType(_typeName: string) {
  // 前端过滤由 NotificationPanel 内部处理
}

/** 切换通知面板显隐 */
function toggleNotification() {
  showNotification.value = !showNotification.value
  if (showNotification.value) {
    fetchNotifications()
  }
}

/** 标记单条已读 */
async function handleMarkRead(id: string) {
  const item = notifications.value.find(n => n.id === id)
  if (item && !item.read) {
    item.read = true
    totalUnreadCount.value = Math.max(0, totalUnreadCount.value - 1)
    try {
      await markNoticeRead(id)
    } catch (e) {
      // 回滚
      item.read = false
      totalUnreadCount.value += 1
      console.error('标记已读失败', e)
    }
  }
}

/** 全部标记已读 */
async function handleMarkAllRead() {
  const previousStates = notifications.value.map(n => ({ id: n.id, read: n.read }))
  const previousCount = totalUnreadCount.value
  notifications.value.forEach(n => { n.read = true })
  totalUnreadCount.value = 0
  try {
    await markAllNoticeRead()
  } catch (e) {
    // 回滚
    previousStates.forEach(s => {
      const item = notifications.value.find(n => n.id === s.id)
      if (item) item.read = s.read
    })
    totalUnreadCount.value = previousCount
    console.error('全部已读失败', e)
  }
}

function handleClickOutside(e: MouseEvent) {
  if (notificationRef.value && !notificationRef.value.contains(e.target as Node)) {
    showNotification.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 获取通知类型选项
  fetchTypeOptions()
  // 初始获取未读数
  fetchUnreadCount()
  // 定时轮询未读数
  pollTimer = setInterval(fetchUnreadCount, POLL_INTERVAL)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>

<template>
  <div ref="notificationRef" class="relative">
    <button class="btn-ghost p-2 rounded-lg relative" @click.stop="toggleNotification">
      <XbIcon name="bell" :size="18" class="text-content-secondary" />
      <span v-if="totalUnreadCount > 0" class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand"></span>
    </button>
    <NotificationPanel
      :visible="showNotification"
      :notifications="notifications"
      :type-options="typeOptions"
      @close="showNotification = false"
      @mark-read="handleMarkRead"
      @mark-all-read="handleMarkAllRead"
      @change-type="handleChangeType"
    />
  </div>
</template>
