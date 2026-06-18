<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => (route.query.taskId as string) || '')
const workId = computed(() => (route.query.work_id as string) || '')

// TODO: 对接后端 — 根据 taskId 获取视频数据
// const videoUrl = ref('')
// const videoTitle = ref('')

function goBackToEpisodes() {
  router.push({ name: 'episodes', query: workId.value ? { work_id: workId.value } : undefined })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full min-h-[500px] gap-6 py-10">
    <!-- 成功图标 -->
    <div class="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
      <XbIcon name="circle-check" :size="40" class="text-green-500" />
    </div>

    <!-- 标题 -->
    <h2 class="text-lg font-semibold text-content">成片已生成</h2>
    <p class="text-sm text-content-tertiary">视频已成功生成，可以预览或下载</p>

    <!-- 视频预览区域 -->
    <div class="w-full max-w-2xl card-base p-4 flex flex-col gap-3">
      <XbVideoPlayer :src="''" />
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center gap-3 mt-2">
      <XbButton type="secondary" @click="goBackToEpisodes">
        <template #icon><XbIcon name="arrow-left" :size="14" /></template>
        返回剧集列表
      </XbButton>
      <XbButton type="secondary">
        <template #icon><XbIcon name="download" :size="14" /></template>
        下载视频
      </XbButton>
      <XbButton>
        <template #icon><XbIcon name="share-2" :size="14" /></template>
        发布作品
      </XbButton>
    </div>
  </div>
</template>
