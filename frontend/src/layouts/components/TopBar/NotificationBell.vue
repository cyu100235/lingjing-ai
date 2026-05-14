<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import NotificationPanel from '../NotificationPanel/index.vue'

interface Notification {
  id: string
  type: 'system' | 'review' | 'comment' | 'like'
  title: string
  content: string
  time: string
  read: boolean
}

const showNotification = ref(false)
const notificationRef = ref<HTMLElement | null>(null)

const notifications = ref<Notification[]>([
  {
    id: '1',
    type: 'system',
    title: '系统更新通知',
    content: '侠人2D编辑器已更新至最新版本，新增多项功能优化。',
    time: '刚刚',
    read: false,
  },
  {
    id: '2',
    type: 'review',
    title: '作品审核通过',
    content: '您的作品《江湖风云录》已通过审核，现已上架精选。',
    time: '2小时前',
    read: false,
  },
  {
    id: '3',
    type: 'comment',
    title: '收到新评论',
    content: '用户"剑客行"评论了您的作品：画面效果非常棒！',
    time: '5小时前',
    read: true,
  },
  {
    id: '4',
    type: 'like',
    title: '作品获得点赞',
    content: '您的作品《武林外传》获得了12个新赞。',
    time: '1天前',
    read: true,
  },
])

const totalUnreadCount = computed(() =>
  notifications.value.filter(n => !n.read).length
)

function toggleNotification() {
  showNotification.value = !showNotification.value
}

function handleMarkRead(id: string) {
  const item = notifications.value.find(n => n.id === id)
  if (item) item.read = true
}

function handleMarkAllRead() {
  notifications.value.forEach(n => { n.read = true })
}

function handleClickOutside(e: MouseEvent) {
  if (notificationRef.value && !notificationRef.value.contains(e.target as Node)) {
    showNotification.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
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
      @close="showNotification = false"
      @mark-read="handleMarkRead"
      @mark-all-read="handleMarkAllRead"
    />
  </div>
</template>
