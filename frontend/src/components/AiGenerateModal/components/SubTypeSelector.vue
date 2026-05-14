<script setup lang="ts">
import { computed } from 'vue'
import type { AssetType, AssetSubType } from '@/stores/assets'
import { hasSubTypes, getSubTypes } from '@/config/assetTypes'

const props = defineProps<{
  type: AssetType
}>()

const modelValue = defineModel<AssetSubType | ''>({ required: true })

const subTypes = computed(() => getSubTypes(props.type))
</script>

<template>
  <div v-if="hasSubTypes(type)">
    <label class="text-xs text-content-secondary mb-2 block">子分类 <span class="text-red-500">*</span></label>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="sub in subTypes"
        :key="sub.value"
        class="flex items-center justify-center p-2.5 rounded-lg border text-xs transition-all duration-200"
        :class="modelValue === sub.value ? 'border-brand bg-brand/10 text-brand' : 'border-border text-content-secondary hover:border-brand/30'"
        @click="modelValue = sub.value"
      >
        {{ sub.label }}
      </button>
    </div>
  </div>
</template>
