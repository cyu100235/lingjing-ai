<script setup lang="ts">
import type { NoticeTypeOption } from '@/api/notice'

interface NotificationItem {
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

const props = defineProps<{
  visible: boolean
  notifications: NotificationItem[]
  typeOptions: NoticeTypeOption[]
}>()

const emit = defineEmits<{
  close: []
  'mark-read': [id: string]
  'mark-all-read': []
  'change-type': [typeName: string]
}>()

/** 当前选中的类型标签，'all' 为全部 */
const activeTab = ref<string>('all')

function handleTabChange(nameKey: string) {
  activeTab.value = nameKey
  emit('change-type', nameKey === 'all' ? '' : nameKey)
}

/** 根据 type_key === name_key 过滤通知 */
const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') return props.notifications
  return props.notifications.filter(n => n.typeKey === activeTab.value)
})

const totalUnreadCount = computed(() =>
  props.notifications.filter(n => !n.read).length
)

/** 获取指定类型的未读数 */
function getTypeUnreadCount(nameKey: string): number {
  return props.notifications.filter(n => n.typeKey === nameKey && !n.read).length
}

/** 根据 type 获取对应的类型选项 */
function getTypeOption(type: string): NoticeTypeOption | undefined {
  return props.typeOptions.find(opt => opt.name_key === type)
}

/** 图标映射（可根据后端类型扩展） */
function getIconName(type: string): string {
  const iconMap: Record<string, string> = {
    system: 'megaphone',
    review: 'check-circle',
    comment: 'message-circle',
    like: 'heart',
    notice: 'bell',
  }
  return iconMap[type] || 'bell'
}

/** 图标样式，优先使用接口返回的 color */
function getIconStyle(type: string): Record<string, string> {
  const opt = getTypeOption(type)
  if (opt?.color) {
    return { color: opt.color, backgroundColor: `${opt.color}1a` }
  }
  return {}
}

/** 图标样式 class（无动态颜色时的 fallback） */
function getIconClass(type: string): string {
  const opt = getTypeOption(type)
  if (opt?.color) return ''
  const classMap: Record<string, string> = {
    system: 'text-brand bg-brand/10',
    review: 'text-amber-400 bg-amber-400/10',
    comment: 'text-blue-400 bg-blue-400/10',
    like: 'text-pink-400 bg-pink-400/10',
  }
  return classMap[type] || 'text-content-secondary bg-surface-overlay'
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
          class="notice-tab-btn flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-black"
          :class="{ 'active': activeTab === 'all' }"
          style="--tab-color: #ffffff; --tab-idle: 60%"
          @click="handleTabChange('all')"
        >
          全部
          <span v-if="totalUnreadCount > 0" class="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-medium bg-black/20 text-black">{{ totalUnreadCount }}</span>
        </button>
        <button
          v-for="opt in typeOptions"
          :key="opt.name_key"
          class="notice-tab-btn flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white"
          :class="{ 'active': activeTab === opt.name_key }"
          :style="{ '--tab-color': opt.color }"
          @click="handleTabChange(opt.name_key)"
        >
          {{ opt.label }}
          <span
            v-if="getTypeUnreadCount(opt.name_key) > 0"
            class="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-medium bg-white/30 text-white"
          >{{ getTypeUnreadCount(opt.name_key) }}</span>
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
              :style="getIconStyle(item.type)"
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
.notice-tab-btn {
  background-color: color-mix(in srgb, var(--tab-color) var(--tab-idle, 40%), transparent);
  transition: background-color 0.3s ease;
}

.notice-tab-btn:hover {
  background-color: color-mix(in srgb, var(--tab-color) var(--tab-hover, 60%), transparent);
}

.notice-tab-btn.active {
  background-color: var(--tab-color);
}

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
