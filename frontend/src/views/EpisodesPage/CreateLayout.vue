<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import type { StepItem } from '@/xbUi'

const route = useRoute()
const router = useRouter()

const currentStep = computed(() => (route.meta.currentStep as number) || 1)
const pageTitle = computed(() => (route.meta.pageTitle as string) || '')
const backPath = computed(() => (route.meta.backPath as string) || '')

const steps: StepItem[] = [
  { label: '上传剧本' },
  { label: '主体管理' },
  { label: '分镜管理' },
  { label: '视频生成' },
  { label: '成品预览' },
]

function handleStepClick(step: number) {
  const workId = route.query.work_id
  const query = workId ? { work_id: workId as string } : undefined

  switch (step) {
    case 1:
      router.push({ name: 'works-create', query })
      break
    case 2:
      router.push({ name: 'entities', query })
      break
    case 3:
      router.push({ name: 'group-multi-edit', query })
      break
    case 4:
      router.push({ name: 'generate', query })
      break
    case 5:
      router.push({ name: 'preview', query })
      break
  }
}

function handleBack() {
  if (backPath.value) {
    router.push(backPath.value)
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="animate-fade-in h-full flex flex-col p-5">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm mb-2">
      <button class="text-content-secondary hover:text-content transition-colors" @click="handleBack">
        <XbIcon name="arrow-left" :size="16" />
      </button>
      <span class="text-content-secondary">分集管理</span>
      <span class="text-content-tertiary">/</span>
      <span class="text-content">{{ pageTitle }}</span>
    </div>

    <!-- Step Navigation -->
    <div class="mb-6">
      <XbSteps :current="currentStep" :steps="steps" clickable @step-click="handleStepClick" />
    </div>
    <router-view />
  </div>
</template>
