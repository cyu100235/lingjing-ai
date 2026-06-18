<script setup lang="ts">


const props = withDefaults(defineProps<{
  currentPage: number
  totalPages: number
  maxVisible?: number
}>(), {
  maxVisible: 7,
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

/**
 * 计算可见的页码列表，当总页数超出 maxVisible 时显示省略号
 */
const visiblePages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const max = props.maxVisible

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []
  const half = Math.floor((max - 2) / 2)

  let start = Math.max(2, current - half)
  let end = Math.min(total - 1, current + half)

  // 调整起止位置，确保中间区域始终有 max - 2 个元素
  if (current - half < 2) {
    end = Math.min(total - 1, max - 1)
  }
  if (current + half > total - 1) {
    start = Math.max(2, total - max + 2)
  }

  pages.push(1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('...')
  if (total > 1) pages.push(total)

  return pages
})

function goTo(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1">
    <!-- 上一页 -->
    <button
      class="p-1.5 rounded-lg transition-colors"
      :class="currentPage === 1
        ? 'text-content-tertiary cursor-not-allowed'
        : 'text-content-secondary hover:text-content hover:bg-surface-overlay'"
      :disabled="currentPage === 1"
      @click="goTo(currentPage - 1)"
    >
      <XbIcon name="chevron-left" :size="16" />
    </button>

    <!-- 页码 -->
    <template v-for="(page, idx) in visiblePages" :key="idx">
      <span
        v-if="page === '...'"
        class="w-8 h-8 flex items-center justify-center text-xs text-content-tertiary select-none"
      >...</span>
      <button
        v-else
        class="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
        :class="page === currentPage
          ? 'bg-brand/20 text-brand'
          : 'text-content-secondary hover:text-content hover:bg-surface-overlay'"
        @click="goTo(page as number)"
      >
        {{ page }}
      </button>
    </template>

    <!-- 下一页 -->
    <button
      class="p-1.5 rounded-lg transition-colors"
      :class="currentPage === totalPages
        ? 'text-content-tertiary cursor-not-allowed'
        : 'text-content-secondary hover:text-content hover:bg-surface-overlay'"
      :disabled="currentPage === totalPages"
      @click="goTo(currentPage + 1)"
    >
      <XbIcon name="chevron-right" :size="16" />
    </button>
  </div>
</template>
