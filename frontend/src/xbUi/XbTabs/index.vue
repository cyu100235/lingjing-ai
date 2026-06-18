<script setup lang="ts">
import type { TabItem } from './types'

const props = withDefaults(defineProps<{
  modelValue: string
  tabs: TabItem[]
  variant?: 'line' | 'card'
  size?: 'sm' | 'md' | 'lg'
}>(), {
  variant: 'line',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  activeTab.value = val
})

function handleTabClick(tab: TabItem) {
  if (tab.disabled) return
  activeTab.value = tab.value
  emit('update:modelValue', tab.value)
}

const sizeClasses = computed(() => {
  const map = {
    sm: { nav: 'gap-1', button: 'px-3 py-1.5 text-xs' },
    md: { nav: 'gap-2', button: 'px-4 py-2 text-sm' },
    lg: { nav: 'gap-3', button: 'px-5 py-2.5 text-base' },
  }
  return map[props.size]
})
</script>

<template>
  <div class="xb-tabs">
    <!-- Tab Nav -->
    <div
      class="xb-tabs-nav flex"
      :class="[
        sizeClasses.nav,
        variant === 'line' ? 'border-b border-border' : 'bg-surface-overlay/50 rounded-lg p-1',
      ]"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="xb-tab-item relative font-medium transition-all duration-200 whitespace-nowrap"
        :class="[
          sizeClasses.button,
          variant === 'line'
            ? activeTab === tab.value
              ? 'text-brand'
              : 'text-content-tertiary hover:text-content-secondary'
            : activeTab === tab.value
              ? 'bg-surface-elevated text-content rounded-md shadow-sm'
              : 'text-content-tertiary hover:text-content-secondary rounded-md',
          tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ]"
        @click="handleTabClick(tab)"
      >
        <component v-if="tab.icon" :is="tab.icon" :size="14" class="inline-block mr-1.5 -translate-y-px" />
        {{ tab.label }}
        <span
          v-if="variant === 'line' && activeTab === tab.value"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
        />
      </button>
    </div>

    <!-- Tab Panel -->
    <div class="xb-tabs-panel mt-4">
      <slot :name="activeTab" />
      <slot />
    </div>
  </div>
</template>
