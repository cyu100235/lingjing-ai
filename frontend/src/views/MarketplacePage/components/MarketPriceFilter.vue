<script setup lang="ts">
const props = defineProps<{
  priceMin: number | null
  priceMax: number | null
}>()

const emit = defineEmits<{
  'update:priceMin': [value: number | null]
  'update:priceMax': [value: number | null]
}>()

function onMinChange() {
  let val = props.priceMin
  if (val === null || val === undefined) return
  if (val < 0) val = 0
  if (val > 500) val = 500
  emit('update:priceMin', val)
}

function onMaxChange() {
  let val = props.priceMax
  if (val === null || val === undefined) return
  if (val < 5) val = 5
  if (val > 10000) val = 10000
  emit('update:priceMax', val)
}
</script>

<template>
  <div class="mt-6 p-3 rounded-lg bg-surface-overlay">
    <h4 class="text-xs font-medium text-content-secondary mb-3">价格区间</h4>
    <div class="flex items-center gap-2">
      <input
        type="number"
        :value="priceMin"
        placeholder="最低"
        :min="0"
        :max="500"
        @input="emit('update:priceMin', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
        @change="onMinChange"
        class="input-base h-7 text-[11px] w-full"
      />
      <span class="text-content-tertiary text-xs">-</span>
      <input
        type="number"
        :value="priceMax"
        placeholder="最高"
        :min="5"
        :max="10000"
        @input="emit('update:priceMax', ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : null)"
        @change="onMaxChange"
        class="input-base h-7 text-[11px] w-full"
      />
    </div>
  </div>
</template>
