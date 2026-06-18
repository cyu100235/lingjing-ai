<script setup lang="ts">
import { useRouter } from 'vue-router'

export interface HelpResource {
  icon: string
  title: string
  desc: string
  link_url?: string
}

const props = defineProps<{
  resources: HelpResource[]
}>()

const router = useRouter()

function handleResourceClick(resource: HelpResource) {
  if (!resource.link_url) return

  // 判断是否为外部链接
  if (/^https?:\/\//.test(resource.link_url)) {
    window.open(resource.link_url, '_blank', 'noopener,noreferrer')
  } else {
    router.push(resource.link_url)
  }
}
</script>

<template>
  <div>
    <h3 class="text-sm font-medium text-content-secondary mb-3">帮助资源</h3>
    <div class="space-y-2">
      <div
        v-for="resource in resources"
        :key="resource.title"
        class="card-base p-3 flex items-center gap-3 cursor-pointer hover:bg-surface-overlay transition-colors"
        @click="handleResourceClick(resource)"
      >
        <XbIcon :name="resource.icon" :size="18" class="text-brand shrink-0" />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-medium text-content">{{ resource.title }}</h4>
          <p class="text-[10px] text-content-tertiary truncate">{{ resource.desc }}</p>
        </div>
        <XbIcon name="chevron-right" :size="14" class="text-content-tertiary shrink-0" />
      </div>
    </div>
  </div>
</template>
