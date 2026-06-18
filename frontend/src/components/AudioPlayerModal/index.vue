<script setup lang="ts">

import { formatTime } from '@/utils/media'

export interface AudioPlayerInfo {
  name: string
  thumbnail: string
  mediaUrl: string
}

const props = defineProps<{
  visible: boolean
  media: AudioPlayerInfo | null
  prompt?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)

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
    if (audioRef.value) {
      audioRef.value.pause()
      audioRef.value.currentTime = 0
    }
  }
})

watch(() => props.media, () => {
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
})

function handleClose() {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }
  isPlaying.value = false
  emit('close')
}

function togglePlay() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

function toggleMute() {
  if (!audioRef.value) return
  isMuted.value = !isMuted.value
  audioRef.value.muted = isMuted.value
}

function seekTo(event: MouseEvent) {
  if (!audioRef.value || duration.value <= 0) return
  const bar = event.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  audioRef.value.currentTime = ratio * duration.value
  currentTime.value = audioRef.value.currentTime
}

function onTimeUpdate() {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime
}

function onLoadedMetadata() {
  if (audioRef.value) duration.value = audioRef.value.duration
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
}
</script>

<template>
  <XbModal :visible="visible && !!media" no-padding width="w-[70rem]" :show-close="true" @close="handleClose">
    <div class="flex h-[70vh]">
      <!-- Audio Player Content -->
      <div class="flex-1 min-w-0 flex flex-col items-center px-8 py-10 bg-surface-overlay">
        <audio
          ref="audioRef"
          :src="media!.mediaUrl"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @ended="onEnded"
        ></audio>
        <!-- Cover art -->
        <div class="w-40 h-40 overflow-hidden border border-border shadow-lg mb-6">
          <img :src="media!.thumbnail" :alt="media!.name" class="w-full h-full object-cover" />
        </div>
        <!-- Title -->
        <h4 class="text-base font-medium text-content mb-5">{{ media!.name }}</h4>
        <!-- Progress bar -->
        <div
          class="w-full h-2 rounded-full bg-content/10 cursor-pointer mb-2 relative group"
          @click="seekTo"
        >
          <div
            class="h-full rounded-full bg-brand transition-all"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <!-- Time -->
        <div class="w-full flex justify-between text-[10px] text-content-tertiary mb-4" style="font-variant-numeric: tabular-nums;">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
        <!-- Controls -->
        <div class="flex items-center gap-4">
          <button
            class="p-2 rounded-full text-content-secondary hover:text-content transition-colors"
            @click="toggleMute"
          >
            <XbIcon v-if="isMuted" name="volume-x" :size="18" />
            <XbIcon v-else name="volume-2" :size="18" />
          </button>
          <button
            class="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white shadow-lg hover:bg-brand/90 transition-colors"
            @click="togglePlay"
          >
            <XbIcon v-if="isPlaying" name="pause" :size="20" />
            <XbIcon v-else name="play" :size="20" class="ml-0.5" />
          </button>
          <div class="w-[18px]"></div>
        </div>
      </div>
      <!-- Prompt -->
      <div v-if="prompt" class="w-[25rem] shrink-0 border-l border-border bg-surface-elevated flex flex-col">
        <div class="px-4 py-3 border-b border-border flex-shrink-0">
          <h4 class="text-sm font-medium text-content">提示词</h4>
        </div>
        <div class="flex-1 overflow-y-auto px-4 py-3">
          <p class="text-xs text-content-secondary leading-relaxed whitespace-pre-wrap break-words">{{ prompt.replace(/\\n/g, '\n') }}</p>
        </div>
      </div>
    </div>
  </XbModal>
</template>

