<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SideNav from './components/SideNav/index.vue'
import TopBar from './components/TopBar/index.vue'

const route = useRoute()
const sidebarCollapsed = ref(false)
const mainRef = ref<HTMLElement | null>(null)

watch(() => route.path, () => {
  mainRef.value?.scrollTo({ top: 0 })
})
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-surface">
    <SideNav :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    <div class="flex flex-1 flex-col overflow-hidden">
      <TopBar />
      <main ref="mainRef" class="flex-1 overflow-auto p-6">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
        <footer class="pt-8 text-center">
          <p class="text-xs text-content-tertiary">Copyright © 2023-2025 贵州云铺网络科技有限公司 All Rights Reserved</p>
        </footer>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
