<script setup lang="ts">

import HelpQuickStart from './components/HelpQuickStart.vue'
import HelpFaq from './components/HelpFaq.vue'
import HelpResources from './components/HelpResources.vue'
import HelpContact from './components/HelpContact.vue'
import type { HelpGuide } from './components/HelpQuickStart.vue'
import type { FaqItem } from './components/HelpFaq.vue'
import type { HelpResource } from './components/HelpResources.vue'

const quickStartGuides: HelpGuide[] = [
  { icon: 'rocket', title: '快速上手', desc: '了解如何创建你的第一个作品', color: 'text-blue-400' },
  { icon: 'palette', title: '素材管理', desc: '上传、管理和使用你的素材库', color: 'text-purple-400' },
  { icon: 'wand-sparkles', title: 'AI创作', desc: '使用AI辅助生成角色、背景等', color: 'text-amber-400' },
  { icon: 'video', title: '作品编辑', desc: '掌握作品编辑器的核心功能', color: 'text-green-400' },
]

const faqList: FaqItem[] = [
  {
    question: '如何创建一个新作品？',
    answer: '进入"作品管理"页面，点击右上角的"新建作品"按钮，输入作品标题即可创建。创建后可以在作品列表中进行管理和编辑。',
  },
  {
    question: '如何使用AI生成素材？',
    answer: '进入"资产管理"页面，点击"AI生成"按钮，选择生成类型（角色、背景、表情、道具），输入描述内容并选择参考风格，点击"开始生成"即可。',
  },
  {
    question: '支持哪些素材格式？',
    answer: '目前支持上传 PNG、JPG、SVG 格式的图片素材。建议使用透明背景的 PNG 格式以获得最佳效果。',
  },
  {
    question: '如何导出我的作品？',
    answer: '在作品编辑器中完成编辑后，点击顶部工具栏的导出按钮，选择导出格式和分辨率即可。会员用户可使用更高分辨率导出。',
  },
  {
    question: '会员有哪些特权？',
    answer: '会员可享受无限AI生成次数、更大存储空间、高分辨率导出、全部模板库访问、优先客服等特权。具体权益请查看会员方案详情。',
  },
  {
    question: '如何联系客服获取帮助？',
    answer: '您可以通过页面底部的"联系我们"发送邮件，或加入官方社区群组获取帮助。会员用户享有优先客服通道。',
  },
]

const helpResources: HelpResource[] = [
  { icon: 'book-open', title: '使用文档', desc: '详细的功能说明和操作指南' },
  { icon: 'video', title: '视频教程', desc: '跟着视频一步步学习' },
  { icon: 'message-circle', title: '社区讨论', desc: '与其他创作者交流经验' },
  { icon: 'file-text', title: '更新日志', desc: '了解最新功能和改进' },
]
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
