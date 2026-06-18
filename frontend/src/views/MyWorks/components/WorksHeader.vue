<script setup lang="ts">

/** 筛选类型 */
type FilterType = 'all' | 'draft' | 'published'
/** 排序方式 */
type SortType = 'update' | 'create' | 'hot'

const props = defineProps<{
  total: number
  filterType: FilterType
  sortBy: SortType
}>()

const emit = defineEmits<{
  'update:filterType': [value: FilterType]
  'update:sortBy': [value: SortType]
}>()

/** 排序菜单显隐 */
const showSortMenu = ref(false)

/** 排序选项 */
const sortOptions = [
  { value: 'update' as SortType, label: '按更新时间排序' },
  { value: 'create' as SortType, label: '按创建时间排序' },
  { value: 'hot' as SortType, label: '按播放热度排序' },
]

/** 筛选选项 */
const filterOptions = [
  { value: 'all' as FilterType, label: '全部类型' },
  { value: 'draft' as FilterType, label: '草稿' },
  { value: 'published' as FilterType, label: '已发布' },
]
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-4">
      <h2 class="text-xl font-semibold text-content">
        共{{ total }}项
      </h2>
      <div class="flex items-center gap-2">
        <button
          v-for="f in filterOptions"
          :key="f.value"
          class="px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
          :class="filterType === f.value ? 'bg-brand/20 text-brand' : 'text-content-secondary hover:text-content hover:bg-surface-overlay'"
          @click="emit('update:filterType', f.value)"
        >
          {{ f.label }}
        </button>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="relative">
        <button
          class="btn-secondary flex items-center gap-1 text-xs"
          @click="showSortMenu = !showSortMenu"
        >
          <XbIcon name="clock" :size="14" />
          {{ sortOptions.find(s => s.value === sortBy)?.label }}
          <XbIcon name="chevron-down" :size="14" />
        </button>
        <div
          v-if="showSortMenu"
          class="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border border-border bg-surface-elevated shadow-card py-1"
        >
          <button
            v-for="opt in sortOptions"
            :key="opt.value"
            class="w-full px-3 py-2 text-left text-xs transition-colors"
            :class="sortBy === opt.value ? 'text-brand bg-brand/10' : 'text-content-secondary hover:text-content hover:bg-surface-overlay'"
            @click="emit('update:sortBy', opt.value); showSortMenu = false"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      <input type="text" placeholder="搜索作品" class="input-base w-40 h-8 text-xs" />
    </div>
  </div>
</template>
