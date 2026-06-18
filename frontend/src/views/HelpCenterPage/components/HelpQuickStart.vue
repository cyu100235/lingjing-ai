<script setup lang="ts">
import type { Component } from 'vue'
import type { Article } from '@/api/helpArticle'
import { getArticleDetail } from '@/api/helpArticle'

export interface HelpGuide {
  icon: Component | string
  title: string
  desc: string
  color: string
  link_type?: string
  link_value?: string | number
}

/** 判断颜色值是否为 CSS class 名（如 text-blue-400），否则视为实际颜色值（如 #FF5733） */
function isColorClass(color: string): boolean {
  return /^(text|bg|border)-/.test(color)
}

const props = defineProps<{
  guides: HelpGuide[]
}>()

const loading = ref(false)
const articleModalVisible = ref(false)
const currentArticle = ref<Article | null>(null)

async function handleGuideClick(guide: HelpGuide) {
  if (!guide.link_type || guide.link_value === undefined || guide.link_value === '') return

  // link_type: '10' = 内部文章，'20' = 外部链接
  if (guide.link_type === '10') {
    // 内部文章：根据文章ID获取详情并展示弹窗
    try {
      loading.value = true
      const res = await getArticleDetail({ id: Number(guide.link_value) })
      const data = res as any
      const article = data?.data || data
      if (article?.content) {
        currentArticle.value = article
        articleModalVisible.value = true
      }
    } catch (err) {
      console.error('获取文章详情失败:', err)
    } finally {
      loading.value = false
    }
  } else if (guide.link_type === '20') {
    // 外部链接：新窗口打开
    window.open(String(guide.link_value), '_blank', 'noopener,noreferrer')
  }
}

function closeArticleModal() {
  articleModalVisible.value = false
  currentArticle.value = null
}
</script>

<template>
  <div class="mb-8">
    <h3 class="text-sm font-medium text-content-secondary mb-3 flex items-center gap-2">
      <XbIcon name="lightbulb" :size="16" class="text-amber-400" />
      快速入门
    </h3>
    <div class="grid grid-cols-4 gap-4">
      <XbCard
        v-for="guide in guides"
        :key="guide.title"
        hoverable
        class="cursor-pointer"
        :class="{ 'opacity-60 pointer-events-none': loading }"
        @click="handleGuideClick(guide)"
      >
        <component v-if="typeof guide.icon === 'object'" :is="guide.icon" :size="24" :class="isColorClass(guide.color) ? guide.color : ''" :style="!isColorClass(guide.color) ? { color: guide.color } : {}" class="mb-3" />
        <XbIcon v-else :name="guide.icon as string" :size="24" :class="isColorClass(guide.color) ? guide.color : ''" :style="!isColorClass(guide.color) ? { color: guide.color } : {}" class="mb-3" />
        <h4 class="text-sm font-medium text-content mb-1">{{ guide.title }}</h4>
        <p class="text-xs text-content-tertiary">{{ guide.desc }}</p>
      </XbCard>
    </div>

    <!-- 文章详情弹窗 -->
    <XbModal
      :visible="articleModalVisible"
      :title="currentArticle?.title || '文章详情'"
      width="w-[1000px]"
      close-on-overlay
      animation="scale"
      @close="closeArticleModal"
    >
      <div v-if="currentArticle" class="space-y-3 min-h-[400px]">
        <div v-if="currentArticle.summary" class="text-sm text-content-secondary bg-surface-overlay rounded-lg p-3">
          {{ currentArticle.summary }}
        </div>
        <div class="prose prose-sm max-w-none text-content text-sm leading-relaxed whitespace-pre-wrap" v-html="currentArticle.content" />
      </div>
    </XbModal>
  </div>
</template>
