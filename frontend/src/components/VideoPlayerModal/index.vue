<script setup lang="ts">
import { ref, watch, computed } from 'vue'

import { formatTime } from '@/utils/media'

export interface Episode {
  id: string
  title: string
  mediaUrl: string
  thumbnail?: string
}

export interface VideoPlayerInfo {
  name: string
  thumbnail: string
  mediaUrl: string
  episodes?: Episode[]
  currentEpisodeId?: string
  views?: string
  likes?: string
  workId?: string
}

const props = defineProps<{
  visible: boolean
  media: VideoPlayerInfo | null
  showLike?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'like', workId: string): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const currentEpisodeId = ref<string>('')
const isLiked = ref(false)

const progress = computed(() => {
  if (duration.value <= 0) return 0
  return (currentTime.value / duration.value) * 100
})

watch(() => props.visible, (val) => {
  if (val) {
    isPlaying.value = false
    isMuted.value = false
    currentTime.value = 0
    duration.value = 0
  } else {
    if (videoRef.value) {
      videoRef.value.pause()
      videoRef.value.currentTime = 0
    }
  }
})

watch(() => props.media, (media) => {
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  isLiked.value = false
  if (media?.episodes?.length) {
    const targetId = media.currentEpisodeId || media.episodes[0].id
    currentEpisodeId.value = targetId
  } else {
    currentEpisodeId.value = ''
  }
})

const currentEpisode = computed<Episode | null>(() => {
  if (!props.media?.episodes?.length) return null
  return props.media.episodes.find(e => e.id === currentEpisodeId.value) || props.media.episodes[0]
})

const currentMediaUrl = computed(() => {
  if (currentEpisode.value) {
    return currentEpisode.value.mediaUrl
  }
  return props.media?.mediaUrl || ''
})

function handleClose() {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
  isPlaying.value = false
  emit('close')
}

function togglePlay() {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

function toggleMute() {
  if (!videoRef.value) return
  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
}

function seekTo(event: MouseEvent) {
  if (!videoRef.value || duration.value <= 0) return
  const bar = event.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  videoRef.value.currentTime = ratio * duration.value
  currentTime.value = videoRef.value.currentTime
}

function onTimeUpdate() {
  if (videoRef.value) currentTime.value = videoRef.value.currentTime
}

function onLoadedMetadata() {
  if (videoRef.value) duration.value = videoRef.value.duration
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
}

function toggleFullscreen() {
  if (videoRef.value) videoRef.value.requestFullscreen()
}

function switchEpisode(episode: Episode) {
  if (episode.id === currentEpisodeId.value) return
  currentEpisodeId.value = episode.id
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
    videoRef.value.load()
  }
}

function toggleLike() {
  if (!props.media?.workId) return
  isLiked.value = !isLiked.value
  emit('like', props.media.workId)
}

const likeDisplay = computed(() => {
  if (!props.media?.likes) return '点赞'
  return isLiked.value ? `${props.media.likes}` : `${props.media.likes}`
})
</script>

<template>
  <XbModal :visible="visible && !!media" no-padding width="w-[56rem]" :show-close="true" @close="handleClose">
    <div class="flex h-[480px]">
      <!-- Left: Video + Info -->
      <div class="flex-1 min-w-0 flex flex-col">
        <!-- Video Player Content -->
        <div class="relative bg-black group flex-1 min-h-0" @contextmenu.prevent>
          <video
            ref="videoRef"
            :src="currentMediaUrl"
            :poster="media!.thumbnail"
            class="w-full h-full object-contain"
            controlsList="nodownload"
            oncontextmenu="return false"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @ended="onEnded"
            @click="togglePlay"
          ></video>
          <!-- Play overlay -->
          <div
            v-if="!isPlaying"
            class="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            @click="togglePlay"
          >
            <div class="w-16 h-16 rounded-full bg-brand/90 flex items-center justify-center shadow-xl">
              <XbIcon name="play" :size="28" class="text-white ml-1" />
            </div>
          </div>
          <!-- Controls bar -->
          <div class="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <!-- Progress -->
            <div
              class="w-full h-1.5 rounded-full bg-white/30 cursor-pointer mb-2"
              @click.stop="seekTo"
            >
              <div
                class="h-full rounded-full bg-brand"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <button class="text-white/90 hover:text-white" @click.stop="togglePlay">
                  <XbIcon v-if="isPlaying" name="pause" :size="16" />
                  <XbIcon v-else name="play" :size="16" />
                </button>
                <button class="text-white/90 hover:text-white" @click.stop="toggleMute">
                  <XbIcon v-if="isMuted" name="volume-x" :size="16" />
                  <XbIcon v-else name="volume-2" :size="16" />
                </button>
                <span class="text-[11px] text-white/80" style="font-variant-numeric: tabular-nums;">
                  {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                </span>
              </div>
              <button class="text-white/90 hover:text-white" @click.stop="toggleFullscreen">
                <XbIcon name="maximize" :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- Info bar -->
        <div class="flex items-center justify-between px-4 py-3 bg-surface-elevated border-t border-border flex-shrink-0">
          <h4 class="text-sm font-medium text-content truncate">
            {{ currentEpisode ? `${media!.name} · ${currentEpisode.title}` : media!.name }}
          </h4>
          <div class="flex items-center gap-3 flex-shrink-0 ml-4">
            <span v-if="media!.views" class="flex items-center gap-1 text-xs text-content-secondary">
              <XbIcon name="play" :size="12" />
              {{ media!.views }}
            </span>
            <button
              v-if="showLike !== false"
              class="flex items-center gap-1 text-xs transition-colors"
              :class="isLiked ? 'text-brand' : 'text-content-secondary hover:text-content'"
              @click="toggleLike"
            >
              <XbIcon name="heart" :size="12" :fill="isLiked ? 'currentColor' : 'none'" />
              <span>{{ likeDisplay }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Episode List -->
      <div v-if="media!.episodes?.length" class="w-56 border-l border-border bg-surface-elevated flex flex-col flex-shrink-0">
        <div class="px-4 py-3 border-b border-border flex-shrink-0">
          <h4 class="text-sm font-medium text-content">选集</h4>
          <p class="text-xs text-content-secondary mt-0.5">共 {{ media!.episodes.length }} 集</p>
        </div>
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            v-for="(episode, index) in media!.episodes"
            :key="episode.id"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors"
            :class="episode.id === currentEpisodeId
              ? 'bg-brand/10 text-brand'
              : 'hover:bg-surface-overlay text-content-secondary'
            "
            @click="switchEpisode(episode)"
          >
            <div class="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-surface-overlay">
              <img
                v-if="episode.thumbnail"
                :src="episode.thumbnail"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="min-w-0">
              <div
                class="text-xs font-medium truncate"
                :class="episode.id === currentEpisodeId ? 'text-brand' : 'text-content'"
              >
                {{ episode.title }}
              </div>
              <div class="text-[10px] text-content-tertiary">第 {{ index + 1 }} 集</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </XbModal>
</template>

