<script setup lang="ts">

export interface Post {
  id: string
  author: string
  avatar: string
  title: string
  content: string
  images?: string[]
  likes: number
  comments: number
  views: number
  createdAt: string
}

const props = defineProps<{
  post: Post
}>()

const emit = defineEmits<{
  preview: [src: string]
}>()

function getGridCols(count: number): string {
  if (count === 1) return 'grid-cols-1'
  if (count === 2 || count === 4) return 'grid-cols-2'
  return 'grid-cols-3'
}

function getDisplayImages(images: string[]): string[] {
  return images.slice(0, 9)
}

function handlePreview(src: string) {
  emit('preview', src)
}
</script>

<template>
  <div class="card-base p-5 hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer">
    <!-- Author info -->
    <div class="flex items-center gap-3 mb-3">
      <img :src="post.avatar" :alt="post.author" class="w-8 h-8 rounded-full object-cover" />
      <div>
        <p class="text-sm font-medium text-content">{{ post.author }}</p>
        <p class="text-[10px] text-content-tertiary">{{ post.createdAt }}</p>
      </div>
    </div>

    <!-- Content -->
    <h3 class="text-sm font-semibold text-content mb-2">{{ post.title }}</h3>
    <p class="text-xs text-content-secondary leading-relaxed mb-3">{{ post.content }}</p>

    <!-- Images grid -->
    <div
      v-if="post.images?.length"
      class="mb-3 grid gap-1 rounded-lg overflow-hidden"
      :class="getGridCols(Math.min(post.images.length, 9))"
    >
      <div
        v-for="(img, idx) in getDisplayImages(post.images)"
        :key="idx"
        class="relative cursor-zoom-in overflow-hidden"
        :class="post.images.length === 1 ? 'max-h-60' : 'aspect-square'"
        @click.stop="handlePreview(img)"
      >
        <img
          :src="img"
          :alt="`${post.title} - ${idx + 1}`"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
        <div
          v-if="idx === 8 && post.images.length > 9"
          class="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <span class="text-white text-lg font-semibold">+{{ post.images.length - 9 }}</span>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="flex items-center gap-5 text-content-tertiary">
      <span class="flex items-center gap-1.5 text-xs hover:text-brand transition-colors">
        <XbIcon name="heart" :size="14" />
        {{ post.likes }}
      </span>
      <span class="flex items-center gap-1.5 text-xs hover:text-brand transition-colors">
        <XbIcon name="message-circle" :size="14" />
        {{ post.comments }}
      </span>
      <span class="flex items-center gap-1.5 text-xs">
        <XbIcon name="eye" :size="14" />
        {{ post.views }}
      </span>
      <span class="flex items-center gap-1.5 text-xs hover:text-brand transition-colors ml-auto">
        <XbIcon name="share-2" :size="14" />
        分享
      </span>
    </div>
  </div>
</template>
