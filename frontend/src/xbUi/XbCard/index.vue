<script setup lang="ts">

const props = withDefaults(defineProps<{
  hoverable?: boolean
  bordered?: boolean
  padding?: boolean
  shadow?: boolean
}>(), {
  hoverable: true,
  bordered: true,
  padding: true,
  shadow: false,
})

const cardClass = computed(() => [
  'xb-card rounded-xl bg-surface-elevated transition-all duration-200',
  props.bordered ? 'border border-border' : '',
  props.padding ? 'p-4' : '',
  props.shadow ? 'shadow-card' : '',
  props.hoverable ? 'hover:border-brand/30 hover:shadow-card-hover hover:-translate-y-0.5' : '',
])
</script>

<template>
  <div :class="cardClass">
    <div v-if="$slots.cover" class="xb-card-cover -mx-4 -mt-4 mb-4 first:rounded-t-xl overflow-hidden">
      <slot name="cover" />
    </div>
    <div v-if="$slots.header" class="xb-card-header mb-3">
      <slot name="header" />
    </div>
    <div class="xb-card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="xb-card-footer mt-3 pt-3 border-t border-border">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.xb-card-cover :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
