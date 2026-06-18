<script setup lang="ts">

export interface StyleItem {
  id: string
  name: string
  image: string
  hot?: boolean
}

const props = defineProps<{
  modelValue: string
  options: StyleItem[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function selectStyle(id: string) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="space-y-3">
    <label class="text-xs text-content-secondary block">画面风格</label>
    <div class="grid grid-cols-5 gap-2">
      <div
        v-for="style in options"
        :key="style.id"
        class="relative rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 aspect-square group"
        :class="
          modelValue === style.id
            ? 'border-brand ring-2 ring-brand/30'
            : 'border-border hover:border-brand/40'
        "
        @click="selectStyle(style.id)"
      >
        <img :src="style.image" class="w-full h-full object-cover" />
        <div
          class="absolute inset-x-0 bottom-0 h-1/2 flex flex-col justify-end items-center pb-2"
          :class="
            modelValue === style.id
              ? 'bg-gradient-to-t from-brand/80 to-transparent'
              : 'bg-gradient-to-t from-surface/90 to-transparent'
          "
        >
          <span
            class="text-[10px] font-medium px-1 text-center leading-tight"
            :class="modelValue === style.id ? 'text-white' : 'text-content-secondary'"
          >
            {{ style.name }}
          </span>
        </div>
        <!-- HOT badge -->
        <div
          v-if="style.hot"
          class="absolute top-1 left-1 px-1 py-0.5 rounded text-[9px] font-bold text-white"
          style="background: linear-gradient(135deg, #ff6b6b, #ee5a5a);"
        >
          HOT
        </div>
        <!-- Check icon for selected -->
        <div
          v-if="modelValue === style.id"
          class="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand flex items-center justify-center"
        >
          <XbIcon name="check" :size="10" class="text-white" />
        </div>
      </div>
    </div>
  </div>
</template>
