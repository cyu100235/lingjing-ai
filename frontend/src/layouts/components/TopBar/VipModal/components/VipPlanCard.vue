<script setup lang="ts">
import type { VipPlan } from '../types'

defineProps<{
  plan: VipPlan
}>()

const emit = defineEmits<{
  select: [plan: VipPlan]
}>()
</script>

<template>
  <div
    class="relative flex flex-col rounded-xl border p-5 transition-all duration-200 hover:-translate-y-1"
    :class="plan.popular
      ? 'border-amber-400/50 bg-amber-400/5 shadow-[0_0_20px_hsl(45_80%_50%/0.1)]'
      : 'border-border hover:border-amber-400/30'"
  >
    <div v-if="plan.popular" class="absolute -top-2.5 left-1/2 -translate-x-1/2">
      <XbTag size="sm" round color="#fbbf24" text-color="#1c1917">最受欢迎</XbTag>
    </div>
    <h4 class="text-sm font-semibold text-content mb-3">{{ plan.name }}</h4>
    <div class="flex items-baseline gap-0.5 mb-4">
      <template v-if="plan.free">
        <span class="text-2xl font-bold text-content">免费</span>
      </template>
      <template v-else>
        <span class="text-xs text-content-secondary">¥</span>
        <span class="text-2xl font-bold text-content">{{ plan.price }}</span>
        <span class="text-xs text-content-tertiary">{{ plan.unit }}</span>
      </template>
    </div>
    <ul class="space-y-2 flex-1">
      <li
        v-for="feature in plan.features"
        :key="feature"
        class="flex items-center gap-2 text-xs text-content-secondary"
      >
        <XbIcon name="check" :size="12" class="text-brand shrink-0" />
        {{ feature }}
      </li>
    </ul>
    <XbButton
      v-if="plan.free"
      type="secondary"
      size="sm"
      block
      disabled
      class="mt-5"
    >
      当前方案
    </XbButton>
    <XbButton
      v-else
      :type="plan.popular ? 'primary' : 'secondary'"
      size="sm"
      block
      class="mt-5"
      :color="plan.popular ? '#fbbf24' : ''"
      :gradient="plan.popular"
      @click="emit('select', plan)"
    >
      立即开通
    </XbButton>
  </div>
</template>
