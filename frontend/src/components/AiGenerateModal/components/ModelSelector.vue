<script setup lang="ts">
import { computed, watch } from 'vue'
import type { AssetType } from '@/stores/assets'
import { getModelsForType, getDefaultModel } from '@/config/aiModels'

const props = defineProps<{
  type: AssetType
}>()

const modelValue = defineModel<string>({ required: true })

const options = computed(() => getModelsForType(props.type).map(m => ({
  ...m,
  label: m.name,
  value: m.id,
})))

watch(() => props.type, () => {
  modelValue.value = getDefaultModel(props.type)
})
</script>

<template>
  <XbSelect v-model="modelValue" :options="options">
    <template #label>
      <label class="text-xs text-content-secondary mb-1.5 block font-medium flex items-center gap-1">
        <XbIcon name="cpu" :size="12" />
        生成模型 <span class="text-red-500">*</span>
      </label>
    </template>
    <template #selected="{ option }">
      <template v-if="option">
        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" :style="{ backgroundColor: option.iconColor }">
          {{ option.iconText }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-content">{{ option.name }}</span>
            <span v-if="option.badge" class="px-1.5 py-0.5 rounded text-[10px] font-medium"
              :class="option.badgeType === 'success' ? 'bg-green-500/15 text-green-400' : option.badgeType === 'hot' ? 'bg-orange-500/15 text-orange-400' : 'bg-blue-500/15 text-blue-400'"
            >{{ option.badge }}</span>
            <span class="flex items-center gap-0.5 text-[11px] text-amber-500">
              <XbIcon name="coins" :size="11" />
              {{ option.cost }}/张
            </span>
          </div>
          <p class="text-[11px] text-content-tertiary mt-0.5 truncate">{{ option.description }}</p>
        </div>
      </template>
      <template v-else>
        <span class="text-sm text-content-tertiary">请选择模型</span>
      </template>
    </template>
    <template #option="{ option }">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold" :style="{ backgroundColor: option.iconColor }">
        {{ option.iconText }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium" :class="modelValue === option.value ? 'text-brand' : 'text-content'">{{ option.name }}</span>
          <span v-if="option.badge" class="px-1.5 py-0.5 rounded text-[10px] font-medium"
            :class="option.badgeType === 'success' ? 'bg-green-500/15 text-green-400' : option.badgeType === 'hot' ? 'bg-orange-500/15 text-orange-400' : 'bg-blue-500/15 text-blue-400'"
          >{{ option.badge }}</span>
          <span class="flex items-center gap-0.5 text-[11px] text-amber-500 ml-auto shrink-0">
            <XbIcon name="coins" :size="11" />
            {{ option.cost }}/张
          </span>
        </div>
        <p class="text-[11px] text-content-tertiary mt-0.5">{{ option.description }}</p>
      </div>
    </template>
  </XbSelect>
</template>
