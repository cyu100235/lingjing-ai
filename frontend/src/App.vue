<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'

const route = useRoute()
const isMobileRoute = computed(() => route.name === 'mobile')
</script>

<template>
  <router-view v-if="isMobileRoute" />
  <AppLayout v-else />
</template>
