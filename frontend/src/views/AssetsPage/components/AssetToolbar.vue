<script setup lang="ts">

const searchInput = defineModel<string>('searchInput')
const batchMode = defineModel<boolean>('batchMode')
const viewMode = defineModel<'grid' | 'list'>('viewMode')

const props = defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  search: []
  searchByTag: [tag: string]
  deleteSelected: []
}>()

const quickTags = ['主角', '配角', '古风', '武侠', '萌宠', 'AI生成']
</script>

<template>
  <div>
    <!-- Search & Actions Bar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 flex-1 max-w-md">
        <XbInput
          v-model="searchInput"
          placeholder="搜索素材名称或标签..."
          class="flex-1"
          @keyup.enter="emit('search')"
        >
          <template #prefix>
            <XbIcon name="search" :size="14" />
          </template>
        </XbInput>
        <XbButton type="primary" size="sm" @click="emit('search')">
          <template #icon><XbIcon name="search" :size="12" /></template>
          搜索
        </XbButton>
      </div>
      <div class="flex items-center gap-2">
        <XbButton
          :type="batchMode ? 'primary' : 'secondary'"
          size="sm"
          @click="batchMode = !batchMode"
        >
          <template #icon><XbIcon name="check-square" :size="14" /></template>
          {{ batchMode ? '退出批量' : '批量编辑' }}
        </XbButton>
        <template v-if="batchMode">
          <span v-if="selectedCount" class="text-xs text-content-secondary">
            已选 {{ selectedCount }} 项
          </span>
          <XbButton
            v-if="selectedCount"
            type="danger"
            size="sm"
            @click="emit('deleteSelected')"
          >
            <template #icon><XbIcon name="trash-2" :size="12" /></template>
            删除
          </XbButton>
        </template>
        <div class="flex border border-border rounded-lg overflow-hidden">
          <button
            class="p-1.5 transition-colors"
            :class="viewMode === 'grid' ? 'bg-brand/20 text-brand' : 'text-content-tertiary hover:text-content'"
            @click="viewMode = 'grid'"
          >
            <XbIcon name="grid" :size="14" />
          </button>
          <button
            class="p-1.5 transition-colors"
            :class="viewMode === 'list' ? 'bg-brand/20 text-brand' : 'text-content-tertiary hover:text-content'"
            @click="viewMode = 'list'"
          >
            <XbIcon name="list" :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- 常用标签 -->
    <div class="flex items-center gap-2 mb-4">
      <span class="text-xs text-content-tertiary shrink-0">常用标签:</span>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="tag in quickTags"
          :key="tag"
          class="px-2 py-0.5 rounded-full text-[10px] border border-border text-content-tertiary hover:border-brand/40 hover:text-content-secondary transition-colors"
          @click="emit('searchByTag', tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>
  </div>
</template>
