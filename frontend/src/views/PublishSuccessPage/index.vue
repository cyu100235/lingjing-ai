<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const worksId = route.query.work_id as string

function goToEpisodes() {
  router.push(`/works/episodes?work_id=${worksId}`)
}

function goToEditor() {
  router.push(`/works/episodes/create?work_id=${worksId}`)
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-10rem)] animate-fade-in">
    <div class="flex flex-col items-center gap-6 p-10 rounded-2xl border border-border bg-surface-elevated shadow-card max-w-md w-full">
      <!-- 成功图标 -->
      <div class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
        <XbIcon name="check-circle" :size="36" class="text-green-500" />
      </div>

      <!-- 成功文案 -->
      <div class="text-center">
        <h2 class="text-lg font-semibold text-content mb-2">发布成功</h2>
        <p class="text-sm text-content-secondary">分镜已成功发布，可在连载页面查看。</p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-col gap-3 w-full mt-2">
        <button
          class="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          @click="goToEpisodes"
        >
          <XbIcon name="book-open" :size="16" />
          返回连载页面
        </button>
        <button
          class="btn-secondary w-full flex items-center justify-center gap-2 py-2.5"
          @click="goToEditor"
        >
          <XbIcon name="pen-line" :size="16" />
          返回作品编辑器
        </button>
      </div>
    </div>
  </div>
</template>
