<script setup lang="ts">
import HelpQuickStart from './components/HelpQuickStart.vue'
import HelpFaq from './components/HelpFaq.vue'
import HelpResources from './components/HelpResources.vue'
import HelpContact from './components/HelpContact.vue'
import type { HelpGuide } from './components/HelpQuickStart.vue'
import type { FaqItem } from './components/HelpFaq.vue'
import type { HelpResource } from './components/HelpResources.vue'
import { getGuideList } from '@/api/helpGuide'
import { getFaqList } from '@/api/helpFaq'
import { getResourceList } from '@/api/helpResource'

const quickStartGuides = ref<HelpGuide[]>([])
const faqList = ref<FaqItem[]>([])
const helpResources = ref<HelpResource[]>([])

const defaultGuideMeta = [
  { icon: 'rocket', color: 'text-blue-400' },
  { icon: 'palette', color: 'text-purple-400' },
  { icon: 'wand-sparkles', color: 'text-amber-400' },
  { icon: 'video', color: 'text-green-400' },
]

const defaultResourceIcons = ['book-open', 'video', 'message-circle', 'file-text']

function extractList(data: unknown): any[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.list)) return obj.list
    if (Array.isArray(obj.data)) return obj.data
  }
  return []
}

async function loadHelpData() {
  try {
    const [guidesData, faqsData, resourcesData] = await Promise.all([
      getGuideList(),
      getFaqList(),
      getResourceList(),
    ])

    const guides = extractList(guidesData)
    quickStartGuides.value = guides.map((item, index) => ({
      icon: item.icon || defaultGuideMeta[index % defaultGuideMeta.length].icon,
      title: item.title || '',
      desc: item.desc || item.description || item.content || '',
      color: item.color || 'text-white',
      link_type: item.link_type || '',
      link_value: item.link_value || '',
    }))

    const faqs = extractList(faqsData)
    faqList.value = faqs.map((item) => ({
      question: item.question || item.title || '',
      answer: item.answer || item.content || '',
    }))

    const resources = extractList(resourcesData)
    helpResources.value = resources.map((item, index) => ({
      icon: item.icon || defaultResourceIcons[index % defaultResourceIcons.length],
      title: item.title || '',
      desc: item.desc || item.description || '',
      link_url: item.link_url || '',
    }))
  } catch (err) {
    console.error('获取帮助中心数据失败:', err)
  }
}

onMounted(() => {
  loadHelpData()
})
</script>

<template>
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-content">新手帮助</h2>
    </div>

    <!-- Quick Start Section -->
    <HelpQuickStart :guides="quickStartGuides" />

    <div class="flex gap-6">
      <!-- FAQ Section -->
      <HelpFaq :faqs="faqList" />

      <!-- Resources Sidebar -->
      <div class="w-64 shrink-0">
        <HelpResources :resources="helpResources" />
        <HelpContact />
      </div>
    </div>
  </div>
</template>
