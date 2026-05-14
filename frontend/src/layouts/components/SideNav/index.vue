<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'


defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const route = useRoute()
const router = useRouter()

const navItems = [
  { icon: 'house', label: '首页', path: '/' },
  { icon: 'folder-open', label: '作品管理', path: '/works' },
  { icon: 'layers', label: '我的资产', path: '/assets' },
  { icon: 'shopping-bag', label: '资产市场', path: '/marketplace' },
  { icon: 'globe', label: '社区动态', path: '/community' },
]

const currentPath = computed(() => route.path)

function navigateTo(path: string) {
  if (path !== '#') {
    router.push(path)
  }
}
</script>

<template>
  <nav
    class="flex flex-col h-full border-r border-border bg-surface-elevated transition-[width] duration-200"
    :class="collapsed ? 'w-12' : 'w-20'"
  >
    <!-- Logo -->
    <div class="flex flex-col items-center py-3 border-b border-border-subtle gap-1">
      <img src="/images/logo.png" alt="侠人2D" class="w-9 h-9 rounded-lg object-cover" />
      <span v-if="!collapsed" class="text-[10px] font-bold text-content whitespace-nowrap">侠人2D</span>
    </div>

    <!-- Main nav -->
    <div class="flex-1 flex flex-col gap-1 px-1.5 py-3">
      <button
        v-for="item in navItems"
        :key="item.label"
        class="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg cursor-pointer transition-all duration-200"
        :class="(currentPath === item.path || currentPath.startsWith(item.path + '/'))
          ? 'text-brand bg-brand/10'
          : 'text-content-secondary hover:text-content hover:bg-surface-overlay'"
        @click="navigateTo(item.path)"
        :title="collapsed ? item.label : ''"
      >
        <XbIcon :name="item.icon" :size="20" class="shrink-0" />
        <span v-if="!collapsed" class="text-[10px] whitespace-nowrap leading-tight">{{ item.label }}</span>
      </button>
    </div>

    <!-- Bottom nav -->
    <div class="flex flex-col gap-1 px-1.5 py-3 border-t border-border-subtle">
      <!-- Collapse/Expand toggle -->
      <button
        class="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg cursor-pointer transition-all duration-200 text-content-tertiary hover:text-content hover:bg-surface-overlay mb-1"
        @click="emit('toggle')"
        :title="collapsed ? '展开菜单' : '收起菜单'"
      >
        <XbIcon v-if="!collapsed" name="panel-left-close" :size="20" />
        <XbIcon v-else name="panel-left-open" :size="20" />
        <span v-if="!collapsed" class="text-[10px] whitespace-nowrap leading-tight">收起菜单</span>
      </button>
    </div>
  </nav>
</template>
