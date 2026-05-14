<script setup lang="ts">

defineProps<{
  visible: boolean
  price: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:price': [value: number]
  'confirm': []
}>()
</script>

<template>
  <XbModal
    :visible="visible"
    title="修改价格"
    width="w-80"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="relative mb-4">
      <XbIcon name="coins" :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
      <input
        :value="price"
        type="number"
        min="1"
        class="input-base pl-9 text-sm"
        placeholder="输入新价格"
        @input="emit('update:price', Number(($event.target as HTMLInputElement).value))"
        @keyup.enter="emit('confirm')"
      />
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <button class="btn-secondary text-xs px-3 py-1.5" @click="emit('update:visible', false)">取消</button>
        <button class="btn-primary text-xs px-3 py-1.5" @click="emit('confirm')" :disabled="price <= 0">确认</button>
      </div>
    </template>
  </XbModal>
</template>
