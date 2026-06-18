<script setup lang="ts">
import type { ModelItem } from '@/api/model'

const props = defineProps<{
  models: ModelItem[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <XbSelect
    v-model="selectedModel"
    :options="props.models.map(m => ({ label: m.name, value: m.model_id, icon: m.icon, badge: m.badge, badge_type: m.badge_type, description: m.description, price: m.prices_format }))"
    placeholder="选择模型"
  >
    <template #selected="{ option }">
      <div class="flex items-center gap-2.5 min-w-0">
        <XbIcon v-if="option?.icon" :name="option.icon" :size="28" class="text-brand shrink-0" />
        <div v-else class="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
          <XbIcon name="cpu" :size="16" class="text-brand" />
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-content">{{ option?.label || '选择模型' }}</span>
            <span v-if="option?.badge" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/15 text-orange-400 shrink-0">
              {{ option.badge }}
            </span>
            <div v-if="option?.price" class="ml-auto flex items-center gap-0.5 shrink-0">
              <XbIcon name="coins" :size="12" class="text-green-400" />
              <span class="text-xs text-green-400 font-medium">{{ option.price }}</span>
            </div>
          </div>
          <p v-if="option?.description" class="text-[11px] text-content-tertiary/70 truncate">{{ option.description }}</p>
        </div>
      </div>
    </template>
    <template #option="{ option }">
      <div class="flex items-center gap-2.5 w-full">
        <XbIcon v-if="option?.icon" :name="option.icon" :size="28" class="text-brand shrink-0" />
        <div v-else class="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
          <XbIcon name="cpu" :size="16" class="text-brand" />
        </div>
        <div class="flex flex-col min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium" :class="selectedModel === option.value ? 'text-brand' : 'text-content'">{{ option.label }}</span>
            <span v-if="option?.badge" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/15 text-orange-400 shrink-0">
              {{ option.badge }}
            </span>
            <div v-if="option?.price" class="ml-auto flex items-center gap-0.5 shrink-0">
              <XbIcon name="coins" :size="12" class="text-green-400" />
              <span class="text-xs text-green-400 font-medium">{{ option.price }}</span>
            </div>
          </div>
          <p v-if="option?.description" class="text-[11px] text-content-tertiary/70 truncate">{{ option.description }}</p>
        </div>
      </div>
    </template>
  </XbSelect>
</template>
