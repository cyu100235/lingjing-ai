<script setup lang="ts">
import CommunityCategoryFilter from './components/CommunityCategoryFilter.vue'
import CommunityPostCard from './components/CommunityPostCard.vue'
import CommunityImagePreview from './components/CommunityImagePreview.vue'
import type { Category } from './components/CommunityCategoryFilter.vue'
import type { Post } from './components/CommunityPostCard.vue'

const categories = ref<Category[]>([])
const activeCategory = ref<string | null>(null)
const loadingCategories = ref(false)

async function fetchCategories() {
  loadingCategories.value = true
  try {
    // TODO: 替换为实际接口地址
    // const res = await fetch('/api/community/categories')
    // categories.value = await res.json()

    // 模拟接口数据
    categories.value = [
      { id: '1', name: '武侠创作', postCount: 256 },
      { id: '2', name: '技巧教程', postCount: 183 },
      { id: '3', name: '求助问答', postCount: 142 },
      { id: '4', name: '作品展示', postCount: 318 },
      { id: '5', name: 'AI绘图', postCount: 95 },
      { id: '6', name: '剧本编写', postCount: 67 },
      { id: '7', name: '素材分享', postCount: 210 },
      { id: '8', name: '官方活动', postCount: 28 },
    ]
  } finally {
    loadingCategories.value = false
  }
}

function toggleCategory(id: string) {
  activeCategory.value = activeCategory.value === id ? null : id
}

onMounted(() => {
  fetchCategories()
})

const posts = ref<Post[]>([
  {
    id: '1',
    author: '武侠迷小张',
    avatar: '/images/user-avatar.png',
    title: '分享我的第一部武侠短漫',
    content: '花了两周时间用镜影漫创完成了我的第一部武侠题材短漫，AI生图效果超出预期！',
    images: ['/images/cover-1.jpg', '/images/cover-2.jpg', '/images/cover-3.jpg'],
    likes: 128,
    comments: 32,
    views: 1520,
    createdAt: '2026-05-13',
  },
  {
    id: '2',
    author: '动画新手阿花',
    avatar: '/images/user-avatar.png',
    title: '求助：如何让角色表情更自然？',
    content: '大家好，我在制作分镜时发现角色表情切换有点生硬，有没有大佬能分享一些技巧？',
    images: ['/images/expr-happy.png', '/images/expr-angry.png', '/images/expr-shy.png', '/images/char-girl.jpg'],
    likes: 45,
    comments: 18,
    views: 680,
    createdAt: '2026-05-12',
  },
  {
    id: '3',
    author: '创作达人老王',
    avatar: '/images/user-avatar.png',
    title: '教程：用AI快速生成场景背景',
    content: '今天给大家分享一个小技巧，通过合理的提示词组合可以快速生成高质量的古风场景背景。',
    images: ['/images/bg-bamboo.jpg', '/images/bg-inn.jpg', '/images/bg-palace.jpg', '/images/bg-scene.jpg', '/images/prop-lantern.jpg', '/images/prop-sword.jpg', '/images/prop-wine.jpg', '/images/cover-4.jpg', '/images/cover-5.jpg'],
    likes: 256,
    comments: 67,
    views: 3200,
    createdAt: '2026-05-11',
  },
])

const activeTab = ref('all')

const tabs = [
  { value: 'all', label: '最新' },
  { value: 'popular', label: '热门' },
]

const previewImage = ref<string | null>(null)

function openPreview(src: string) {
  previewImage.value = src
}

function closePreview() {
  previewImage.value = null
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Category Tags -->
    <CommunityCategoryFilter
      :categories="categories"
      :active-id="activeCategory"
      :loading="loadingCategories"
      @toggle="toggleCategory"
    />

    <!-- Tabs -->
    <XbTabs v-model="activeTab" :tabs="tabs" variant="card" class="mb-6" />

    <!-- Posts -->
    <div class="space-y-4">
      <CommunityPostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @preview="openPreview"
      />
    </div>

    <!-- Image Preview Modal -->
    <CommunityImagePreview :src="previewImage" @close="closePreview" />
  </div>
</template>
