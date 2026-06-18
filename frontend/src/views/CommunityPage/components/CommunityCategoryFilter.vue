<script setup lang="ts">
export interface Category {
  id: string
  name: string
  postCount?: number
}

const props = defineProps<{
  categories: Category[]
  activeId: string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
}>()

function handleClick(id: string) {
  emit('toggle', id)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 mb-6">
    <button
      v-for="cat in categories"
      :key="cat.id"
      class="px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-150"
      :class="activeId === cat.id
        ? 'bg-brand text-white border-brand'
        : 'bg-surface-overlay text-content-secondary border-transparent hover:text-content hover:border-border'"
      @click="handleClick(cat.id)"
    >
      {{ cat.name }}
      <span v-if="cat.postCount" class="ml-1 opacity-60">{{ cat.postCount }}</span>
    </button>
  </div>
</template>
