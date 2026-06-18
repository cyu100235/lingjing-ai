<script setup lang="ts">
import type { StepItem } from './types'

const props = withDefaults(defineProps<{
  /** Current active step (1-based) */
  current: number
  steps: StepItem[]
  /** Layout direction */
  direction?: 'horizontal' | 'vertical'
  /** Allow clicking on all steps, not just completed ones */
  clickable?: boolean
}>(), {
  direction: 'horizontal',
  clickable: false,
})

const emit = defineEmits<{
  /** Fired when a step is clicked; only for steps before current */
  stepClick: [step: number]
}>()

function handleClick(index: number) {
  // Allow clicking if clickable prop is true or step is completed (before current)
  if (props.clickable || index + 1 < props.current) {
    emit('stepClick', index + 1)
  }
}
</script>

<template>
  <div
    class="flex gap-2"
    :class="
      direction === 'horizontal'
        ? 'flex-row items-center justify-center'
        : 'flex-col items-start'
    "
  >
    <template v-for="(step, index) in steps" :key="index">
      <!-- Step circle + label -->
      <div
        class="flex gap-2"
        :class="[
          direction === 'horizontal' ? 'items-center' : 'items-start',
          index + 1 < current ? 'cursor-pointer' : props.clickable ? 'cursor-pointer' : 'cursor-default',
        ]"
        @click="handleClick(index)"
      >
        <div
          class="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
          :class="
            index + 1 === current
              ? 'bg-brand text-white'
              : index + 1 < current
                ? 'bg-brand/30 text-brand'
                : 'bg-surface-overlay text-content-tertiary border border-border'
          "
        >
          <template v-if="index + 1 < current">
            <XbIcon :name="step.icon || 'check'" :size="14" />
          </template>
          <template v-else>
            {{ index + 1 }}
          </template>
        </div>
        <span
          class="text-sm font-medium transition-colors"
          :class="[
            index + 1 === current ? 'text-content' : 'text-content-tertiary',
            direction === 'vertical' ? 'pt-0.5' : '',
          ]"
        >
          {{ step.label }}
        </span>
      </div>
      <!-- Connector -->
      <div
        v-if="index < steps.length - 1"
        class="transition-colors"
        :class="[
          direction === 'horizontal'
            ? 'w-8 h-px'
            : 'h-6 w-px ml-3',
          index + 1 < current ? 'bg-brand/50' : 'bg-border',
        ]"
      />
    </template>
  </div>
</template>
