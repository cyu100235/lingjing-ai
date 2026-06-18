<script setup lang="ts">
import type { AssetType, AssetSubType } from '@/stores/assets'
import type { CategoryFilterItem } from '@/config/assetTypes'


const props = withDefaults(defineProps<{
  items: CategoryFilterItem[]
  activeFilter: AssetType | 'all'
  activeSubFilter?: AssetSubType | 'all'
  showCounts?: boolean
}>(), {
  activeSubFilter: 'all',
  showCounts: true,
})

const emit = defineEmits<{
  (e: 'select', type: AssetType | 'all', subType?: AssetSubType | 'all'): void
}>()

const expandedFilters = ref<string[]>([])

function toggleFilterExpand(value: string) {
  if (expandedFilters.value.includes(value)) {
    expandedFilters.value = []
  } else {
    expandedFilters.value = [value]
  }
}

function handleMainClick(filter: CategoryFilterItem) {
  emit('select', filter.value)
  if (filter.children) {
    toggleFilterExpand(filter.value as string)
  }
}

function handleChildClick(parentValue: AssetType | 'all', childValue: AssetSubType) {
  emit('select', parentValue, childValue)
}

function handleAllChildClick(parentValue: AssetType | 'all') {
  emit('select', parentValue, 'all')
}
</script>

<template>
  <div class="space-y-1">
    <template v-for="filter in items" :key="filter.value">
      <div class="relative">
        <button
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
          :class="activeFilter === filter.value && activeSubFilter === 'all'
            ? 'bg-brand/15 text-brand'
            : activeFilter === filter.value
              ? 'bg-brand/5 text-brand/80'
              : 'text-content-secondary hover:text-content hover:bg-surface-overlay'"
          @click="handleMainClick(filter)"
        >
          <component v-if="typeof filter.icon === 'object'" :is="filter.icon" :size="16" class="shrink-0" />
          <XbIcon v-else :name="filter.icon" :size="16" class="shrink-0" />
          <span class="flex-1 text-left">{{ filter.label }}</span>
          <XbIcon
            v-if="filter.children"
            name="chevron-down"
            :size="12"
            class="shrink-0 transition-transform duration-200"
            :class="expandedFilters.includes(filter.value) ? 'rotate-180' : ''"
          />
          <span v-else-if="showCounts && filter.count" class="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-overlay text-content-tertiary">
            {{ filter.count.value }}
          </span>
        </button>
        <!-- Subcategories -->
        <div
          v-if="filter.children"
          class="ml-6 grid transition-[grid-template-rows] duration-200 ease-in-out"
          :class="expandedFilters.includes(filter.value) ? 'grid-rows-[1fr] mt-0.5' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden space-y-0.5">
            <button
              class="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-200"
              :class="activeFilter === filter.value && activeSubFilter === 'all'
                ? 'bg-brand/10 text-brand'
                : 'text-content-tertiary hover:text-content-secondary hover:bg-surface-overlay'"
              @click.stop="handleAllChildClick(filter.value)"
            >
              <span class="flex-1 text-left">全部</span>
              <span v-if="showCounts && filter.count" class="text-[10px] px-1 py-0 rounded-full bg-surface-overlay text-content-tertiary">
                {{ filter.count.value }}
              </span>
            </button>
            <button
              v-for="child in filter.children"
              :key="child.value"
              class="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-200"
              :class="activeSubFilter === child.value
                ? 'bg-brand/10 text-brand'
                : 'text-content-tertiary hover:text-content-secondary hover:bg-surface-overlay'"
              @click.stop="handleChildClick(filter.value, child.value)"
            >
              <span class="flex-1 text-left">{{ child.label }}</span>
              <span v-if="showCounts && filter.childCounts?.[child.value]" class="text-[10px] px-1 py-0 rounded-full bg-surface-overlay text-content-tertiary">
                {{ filter.childCounts[child.value].value }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
