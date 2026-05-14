<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import VideoPlayerModal from '@/components/VideoPlayerModal/index.vue'
import type { VideoPlayerInfo, Episode } from '@/components/VideoPlayerModal/index.vue'
import WorkCard from './components/WorkCard.vue'
import CommunityCard from './components/CommunityCard.vue'
import HeroBanner from './components/HeroBanner.vue'

const router = useRouter()

// Video player modal state
const showVideoModal = ref(false)
const selectedMedia = ref<VideoPlayerInfo | null>(null)

// Map work id to demo video path
const workVideoMap: Record<string, string> = {
  '1': '/video/16-9/1.mp4',
  '2': '/video/16-9/2.mp4',
  '3': '/video/16-9/3.mp4',
  '4': '/video/16-9/1.mp4',
  '5': '/video/16-9/2.mp4',
  '6': '/video/16-9/3.mp4',
}

const featuredWorks = [
  { id: '1', title: '穷神来了', author: '创作者小王', cover: '/images/cover-1.jpg', views: '12.5万', likes: '3.2万', episodes: [
    { id: 'e1', title: '第一集：初遇穷神', mediaUrl: '/video/16-9/1.mp4', thumbnail: '/images/cover-1.jpg' },
    { id: 'e2', title: '第二集：倒霉日常', mediaUrl: '/video/16-9/2.mp4', thumbnail: '/images/cover-1.jpg' },
    { id: 'e3', title: '第三集：意外转机', mediaUrl: '/video/16-9/3.mp4', thumbnail: '/images/cover-1.jpg' },
  ]},
  { id: '2', title: '江湖奇谈', author: '动画大师', cover: '/images/cover-2.jpg', views: '8.7万', likes: '2.1万', episodes: [
    { id: 'e1', title: '第一集：江湖初现', mediaUrl: '/video/16-9/2.mp4', thumbnail: '/images/cover-2.jpg' },
    { id: 'e2', title: '第二集：暗流涌动', mediaUrl: '/video/16-9/1.mp4', thumbnail: '/images/cover-2.jpg' },
  ]},
  { id: '3', title: '熊猫大侠', author: '熊猫工作室', cover: '/images/cover-3.jpg', views: '6.3万', likes: '1.8万', episodes: [
    { id: 'e1', title: '第一集：出山', mediaUrl: '/video/16-9/3.mp4', thumbnail: '/images/cover-3.jpg' },
    { id: 'e2', title: '第二集：挑战', mediaUrl: '/video/16-9/2.mp4', thumbnail: '/images/cover-3.jpg' },
    { id: 'e3', title: '第三集：决战', mediaUrl: '/video/16-9/1.mp4', thumbnail: '/images/cover-3.jpg' },
  ]},
  { id: '4', title: '古风茶话', author: '茶香四溢', cover: '/images/cover-4.jpg', views: '4.2万', likes: '1.2万', episodes: [
    { id: 'e1', title: '第一集：茶缘', mediaUrl: '/video/16-9/1.mp4', thumbnail: '/images/cover-4.jpg' },
  ]},
]

const hotWorks = [
  { id: '5', title: '仙侠传说', author: '云端创作', cover: '/images/cover-5.jpg', views: '25.8万', likes: '8.6万', rank: 1, episodes: [
    { id: 'e1', title: '第一集：仙缘', mediaUrl: '/video/16-9/1.mp4', thumbnail: '/images/cover-5.jpg' },
    { id: 'e2', title: '第二集：修炼', mediaUrl: '/video/16-9/2.mp4', thumbnail: '/images/cover-5.jpg' },
    { id: 'e3', title: '第三集：试炼', mediaUrl: '/video/16-9/3.mp4', thumbnail: '/images/cover-5.jpg' },
    { id: 'e4', title: '第四集：突破', mediaUrl: '/video/16-9/1.mp4', thumbnail: '/images/cover-5.jpg' },
  ]},
  { id: '1', title: '穷神来了', author: '创作者小王', cover: '/images/cover-1.jpg', views: '18.3万', likes: '5.4万', rank: 2, episodes: [
    { id: 'e1', title: '第一集：初遇穷神', mediaUrl: '/video/16-9/1.mp4', thumbnail: '/images/cover-1.jpg' },
    { id: 'e2', title: '第二集：倒霉日常', mediaUrl: '/video/16-9/2.mp4', thumbnail: '/images/cover-1.jpg' },
    { id: 'e3', title: '第三集：意外转机', mediaUrl: '/video/16-9/3.mp4', thumbnail: '/images/cover-1.jpg' },
  ]},
  { id: '6', title: '萌宠日记', author: '萌宠乐园', cover: '/images/cover-6.jpg', views: '15.1万', likes: '4.7万', rank: 3, episodes: [
    { id: 'e1', title: '第一集：领养', mediaUrl: '/video/16-9/2.mp4', thumbnail: '/images/cover-6.jpg' },
    { id: 'e2', title: '第二集：日常', mediaUrl: '/video/16-9/3.mp4', thumbnail: '/images/cover-6.jpg' },
  ]},
]

function openVideoPlayer(work: { id: string; title: string; cover: string; episodes?: Episode[]; views?: string; likes?: string }) {
  selectedMedia.value = {
    name: work.title,
    thumbnail: work.cover,
    mediaUrl: workVideoMap[work.id] || '/video/16-9/1.mp4',
    episodes: work.episodes,
    views: work.views,
    likes: work.likes,
    workId: work.id,
  }
  showVideoModal.value = true
}

function closeVideoModal() {
  showVideoModal.value = false
}

function handleLike(workId: string) {
  // Update like count in local data
  const allWorks = [...featuredWorks, ...hotWorks]
  const work = allWorks.find(w => w.id === workId)
  if (work && work.likes) {
    // Parse current likes (simplified: just append visual feedback)
    console.log('Liked work:', workId)
  }
}

const communityPosts = [
  { id: 'p1', author: '动画爱好者', avatar: '爱', content: '刚完成了第一个AI生成的角色，效果太惊艳了！分享给大家看看~', time: '2小时前', likes: 42 },
  { id: 'p2', author: '熊猫工作室', avatar: '熊', content: '新功能太好用了，AI背景生成省了我好多时间！推荐大家试试', time: '5小时前', likes: 128 },
  { id: 'p3', author: '古风创作者', avatar: '古', content: '有没有人一起合作做一部古风长篇？求画师和编剧~', time: '1天前', likes: 67 },
]

function startCreating() {
  router.push('/works')
}
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Hero Banner -->
    <HeroBanner
      image="/images/hero-banner.png"
      title="AI驱动的2D动画创作"
      description="用AI轻松生成角色、场景、表情和道具，让你的创意动画梦想触手可及"
      primary-action="开始创作"
      secondary-action="观看教程"
      @primary-click="startCreating"
    />

    <!-- Hot Works Ranking -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <XbIcon name="trending-up" :size="20" class="text-brand" />
          <h3 class="text-lg font-semibold text-content">热门作品</h3>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <WorkCard
          v-for="work in hotWorks"
          :key="work.id"
          :cover="work.cover"
          :title="work.title"
          :author="work.author"
          :views="work.views"
          :likes="work.likes"
          :rank="work.rank"
          @click="openVideoPlayer(work)"
        />
      </div>
    </section>

    <!-- Featured Gallery -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <XbIcon name="sparkles" :size="20" class="text-brand" />
          <h3 class="text-lg font-semibold text-content">精选作品</h3>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <WorkCard
          v-for="work in featuredWorks"
          :key="work.id"
          :cover="work.cover"
          :title="work.title"
          :author="work.author"
          :views="work.views"
          :likes="work.likes"
          @click="openVideoPlayer(work)"
        />
      </div>
    </section>

    <!-- Community Section -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <XbIcon name="users" :size="20" class="text-brand" />
          <h3 class="text-lg font-semibold text-content">社区动态</h3>
        </div>
        <button class="btn-ghost text-xs" @click="router.push('/community')">进入社区</button>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <CommunityCard
          v-for="post in communityPosts"
          :key="post.id"
          :avatar="post.avatar"
          :author="post.author"
          :time="post.time"
          :content="post.content"
          :likes="post.likes"
        />
      </div>
    </section>

    <!-- Video Player Modal -->
    <VideoPlayerModal
      :visible="showVideoModal"
      :media="selectedMedia"
      @close="closeVideoModal"
      @like="handleLike"
    />
  </div>
</template>
