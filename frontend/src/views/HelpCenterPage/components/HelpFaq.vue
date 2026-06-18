<script setup lang="ts">


export interface FaqItem {
  question: string
  answer: string
}

const props = defineProps<{
  faqs: FaqItem[]
}>()

const expandedIndex = ref<number | null>(null)

function toggle(index: number) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}
</script>

<template>
  <div class="flex-1">
    <h3 class="text-sm font-medium text-content-secondary mb-3 flex items-center gap-2">
      <XbIcon name="help-circle" :size="16" class="text-brand" />
      常见问题
    </h3>
    <div class="space-y-2">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="card-base overflow-hidden"
      >
        <XbButton
          type="ghost"
          block
          class="!justify-between !p-4"
          @click="toggle(index)"
        >
          <span class="text-sm font-medium text-content">{{ faq.question }}</span>
          <XbIcon
            name="chevron-down"
            :size="16"
            class="text-content-tertiary shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': expandedIndex === index }"
          />
        </XbButton>
        <div
          v-if="expandedIndex === index"
          class="px-4 pb-4 text-sm text-content-secondary leading-relaxed"
        >
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </div>
</template>
