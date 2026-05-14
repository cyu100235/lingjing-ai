<script setup lang="ts">
import { computed, ref } from 'vue'

type NotificationType = 'system' | 'review' | 'comment' | 'like'

interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  content: string
  time: string
  read: boolean
}

const props = defineProps<{
  visible: boolean
  notifications: NotificationItem[]
}>()

const emit = defineEmits<{
  close: []
  'mark-read': [id: string]
  'mark-all-read': []
}>()

const activeTab = ref<'all' | 'system' | 'interactive'>('all')

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') return props.notifications
  if (activeTab.value === 'system') {
    return props.notifications.filter(n => n.type === 'system' || n.type === 'review')
  }
  return props.notifications.filter(n => n.type === 'comment' || n.type === 'like')
})

const systemUnreadCount = computed(() =>
  props.notifications.filter(n => (n.type === 'system' || n.type === 'review') && !n.read).length
)

const interactiveUnreadCount = computed(() =>
  props.notifications.filter(n => (n.type === 'comment' || n.type === 'like') && !n.read).length
)

const totalUnreadCount = computed(() =>
  props.notifications.filter(n => !n.read).length
)

function getIconName(type: NotificationType) {
  switch (type) {
    case 'system': return 'megaphone'
    case 'review': return 'check-circle'
    case 'comment': return 'message-circle'
    case 'like': return 'heart'
  }
}

function getIconClass(type: NotificationType) {
  switch (type) {
    case 'system': return 'text-brand bg-brand/10'
    case 'review': return 'text-amber-400 bg-amber-400/10'
    case 'comment': return 'text-blue-400 bg-blue-400/10'
    case 'like': return 'text-pink-400 bg-pink-400/10'
  }
}
</script>

<template>
  <Transition name="dropdown">
    <div
      v-if="visible"
      class="absolute right-0 top-full mt-2 w-[380px] z-50 rounded-xl border border-border bg-surface-elevated overflow-hidden origin-top-right"
      style="box-shadow: var(--shadow-lg)"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <h3 class="text-sm font-semibold text-content">通知中心</h3>
        <div class="flex items-center gap-2">
          <button
            v-if="totalUnreadCount > 0"
            class="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
            @click="emit('mark-all-read')"
          >
            <XbIcon name="check-check" :size="14" />
            <span>全部已读</span>
          </button>
          <button
            class="p-1 rounded-md text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
            @click="emit('close')"
          >
            <XbIcon name="x" :size="16" />
          </button>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="flex items-center gap-1 px-4 py-2 border-b border-border-subtle">
        <button
          class="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-content-tertiary hover:text-content-secondary hover:bg-surface-overlay/50"
          style="transition: var(--transition-fast)"
          :class="{ 'text-brand bg-brand/10': activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          全部
          <span v-if="totalUnreadCount > 0" class="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-medium bg-brand/20 text-brand">{{ totalUnreadCount }}</span>
        </button>
        <button
          class="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-content-tertiary hover:text-content-secondary hover:bg-surface-overlay/50"
          style="transition: var(--transition-fast)"
          :class="{ 'text-brand bg-brand/10': activeTab === 'system' }"
          @click="activeTab = 'system'"
        >
          系统
          <span v-if="systemUnreadCount > 0" class="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-medium bg-brand/20 text-brand">{{ systemUnreadCount }}</span>
        </button>
        <button
          class="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-content-tertiary hover:text-content-secondary hover:bg-surface-overlay/50"
          style="transition: var(--transition-fast)"
          :class="{ 'text-brand bg-brand/10': activeTab === 'interactive' }"
          @click="activeTab = 'interactive'"
        >
          互动
          <span v-if="interactiveUnreadCount > 0" class="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-medium bg-brand/20 text-brand">{{ interactiveUnreadCount }}</span>
        </button>
      </div>

      <!-- Notification List -->
      <div class="max-h-[380px] overflow-y-auto">
        <template v-if="filteredNotifications.length > 0">
          <div
            v-for="item in filteredNotifications"
            :key="item.id"
            class="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-surface-overlay/50"
            :class="!item.read ? 'border-l-2 border-l-brand bg-brand/5' : 'border-l-2 border-l-transparent'"
            @click="emit('mark-read', item.id)"
          >
            <!-- Icon -->
            <div
              class="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
              :class="getIconClass(item.type)"
            >
              <XbIcon :name="getIconName(item.type)" :size="16" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span
                  class="text-sm font-medium truncate"
                  :class="item.read ? 'text-content-secondary' : 'text-content'"
                >
                  {{ item.title }}
                </span>
                <span class="text-[10px] text-content-tertiary whitespace-nowrap shrink-0">
                  {{ item.time }}
                </span>
              </div>
              <p
                class="text-xs mt-0.5 line-clamp-2"
                :class="item.read ? 'text-content-tertiary' : 'text-content-secondary'"
              >
                {{ item.content }}
              </p>
            </div>

            <!-- Unread dot -->
            <div v-if="!item.read" class="w-2 h-2 rounded-full bg-brand shrink-0 mt-2"></div>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-12">
          <XbIcon name="bell-off" :size="36" class="text-content-tertiary mb-3" />
          <p class="text-sm text-content-tertiary">暂无通知</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-border-subtle text-center">
        <button class="text-xs text-brand hover:text-brand-light transition-colors">
          查看全部通知
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.dropdown-enter-active {
  transition: opacity 0.2s ease-out, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
