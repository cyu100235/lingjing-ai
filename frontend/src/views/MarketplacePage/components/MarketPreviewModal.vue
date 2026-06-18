<script setup lang="ts">
import type { MarketListing } from '@/stores/marketplace'
import { getTypeLabel } from '@/config/assetTypes'
import { isAudioAsset, isVideoAsset } from '@/utils/media'
import { onImgError } from '@/utils/image'
import { formatTime } from '@/utils/media'

const props = defineProps<{
  visible: boolean
  listing: MarketListing | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'purchase': [listing: MarketListing]
}>()

const previewMediaType = computed(() => {
  if (!props.listing) return 'image'
  if (isAudioAsset(props.listing.asset.type)) return 'audio'
  if (isVideoAsset(props.listing.asset.type)) return 'video'
  return 'image'
})

// Audio player state
const audioRef = ref<HTMLAudioElement | null>(null)
const isAudioPlaying = ref(false)
const isAudioMuted = ref(false)
const audioCurrentTime = ref(0)
const audioDuration = ref(0)

function toggleAudioPlay() {
  if (!audioRef.value) return
  if (isAudioPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isAudioPlaying.value = !isAudioPlaying.value
}

function toggleAudioMute() {
  if (!audioRef.value) return
  isAudioMuted.value = !isAudioMuted.value
  audioRef.value.muted = isAudioMuted.value
}

function seekAudio(event: MouseEvent) {
  if (!audioRef.value || !audioDuration.value) return
  const bar = event.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  audioRef.value.currentTime = percent * audioDuration.value
}

function onAudioTimeUpdate() {
  if (audioRef.value) audioCurrentTime.value = audioRef.value.currentTime
}

function onAudioLoadedMetadata() {
  if (audioRef.value) audioDuration.value = audioRef.value.duration
}

function onAudioEnded() {
  isAudioPlaying.value = false
  audioCurrentTime.value = 0
}

// Video player state
const videoRef = ref<HTMLVideoElement | null>(null)
const isVideoPlaying = ref(false)
const isVideoMuted = ref(false)
const videoCurrentTime = ref(0)
const videoDuration = ref(0)

function toggleVideoPlay() {
  if (!videoRef.value) return
  if (isVideoPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
  isVideoPlaying.value = !isVideoPlaying.value
}

function toggleVideoMute() {
  if (!videoRef.value) return
  isVideoMuted.value = !isVideoMuted.value
  videoRef.value.muted = isVideoMuted.value
}

function seekVideo(event: MouseEvent) {
  if (!videoRef.value || !videoDuration.value) return
  const bar = event.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * videoDuration.value
}

function onVideoTimeUpdate() {
  if (videoRef.value) videoCurrentTime.value = videoRef.value.currentTime
}

function onVideoLoadedMetadata() {
  if (videoRef.value) videoDuration.value = videoRef.value.duration
}

function onVideoEnded() {
  isVideoPlaying.value = false
  videoCurrentTime.value = 0
}

function toggleFullscreen() {
  if (videoRef.value) videoRef.value.requestFullscreen()
}

// Cleanup on close
watch(() => props.visible, (val) => {
  if (!val) {
    if (audioRef.value) {
      audioRef.value.pause()
      audioRef.value.currentTime = 0
    }
    if (videoRef.value) {
      videoRef.value.pause()
      videoRef.value.currentTime = 0
    }
    isAudioPlaying.value = false
    isVideoPlaying.value = false
    audioCurrentTime.value = 0
    videoCurrentTime.value = 0
    audioDuration.value = 0
    videoDuration.value = 0
  }
})

function handlePurchase() {
  if (props.listing) {
    emit('purchase', props.listing)
    emit('update:visible', false)
  }
}
</script>

<template>
  <XbModal
    :visible="visible && !!listing"
    no-padding
    width="w-[48rem]"
    :show-close="true"
    @update:visible="emit('update:visible', $event)"
  >
    <template v-if="listing">
      <!-- Image Preview -->
      <img
        v-if="previewMediaType === 'image'"
        :src="listing.asset.thumbnail"
        :alt="listing.asset.name"
        class="w-full max-h-[70vh] object-cover bg-black/5"
        @error="(e: any) => onImgError(e)"
      />

    <!-- Audio Player -->
    <div v-else-if="previewMediaType === 'audio'" class="flex flex-col items-center px-8 py-10 bg-surface-overlay">
      <audio
        ref="audioRef"
        :src="listing.asset.mediaUrl"
        @timeupdate="onAudioTimeUpdate"
        @loadedmetadata="onAudioLoadedMetadata"
        @ended="onAudioEnded"
      ></audio>
      <!-- Cover art -->
      <div class="w-40 h-40 overflow-hidden border border-border shadow-lg mb-6">
        <img :src="listing.asset.thumbnail" :alt="listing.asset.name" class="w-full h-full object-cover" @error="(e: any) => onImgError(e)" />
      </div>
      <!-- Title -->
      <h4 class="text-base font-medium text-content mb-5">{{ listing.asset.name }}</h4>
      <!-- Progress bar -->
      <div
        class="w-full h-2 rounded-full bg-content/10 cursor-pointer mb-2 relative group"
        @click="seekAudio"
      >
        <div
          class="h-full rounded-full bg-brand transition-all"
          :style="{ width: audioDuration ? `${(audioCurrentTime / audioDuration) * 100}%` : '0%' }"
        ></div>
      </div>
      <!-- Time -->
      <div class="w-full flex justify-between text-[10px] text-content-tertiary mb-4" style="font-variant-numeric: tabular-nums;">
        <span>{{ formatTime(audioCurrentTime) }}</span>
        <span>{{ formatTime(audioDuration) }}</span>
      </div>
      <!-- Controls -->
      <div class="flex items-center gap-4">
        <button
          class="p-2 rounded-full text-content-secondary hover:text-content transition-colors"
          @click="toggleAudioMute"
        >
          <XbIcon v-if="isAudioMuted" name="volume-x" :size="18" />
          <XbIcon v-else name="volume-2" :size="18" />
        </button>
        <button
          class="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white shadow-lg hover:bg-brand/90 transition-colors"
          @click="toggleAudioPlay"
        >
          <XbIcon v-if="isAudioPlaying" name="pause" :size="20" />
          <XbIcon v-else name="play" :size="20" class="ml-0.5" />
        </button>
        <div class="w-[18px]"></div>
      </div>
    </div>

    <!-- Video Player -->
    <div v-else-if="previewMediaType === 'video'" class="relative bg-black group">
      <video
        ref="videoRef"
        :src="listing.asset.mediaUrl"
        :poster="listing.asset.thumbnail"
        class="w-full max-h-[70vh] object-contain"
        @timeupdate="onVideoTimeUpdate"
        @loadedmetadata="onVideoLoadedMetadata"
        @ended="onVideoEnded"
        @click="toggleVideoPlay"
      ></video>
      <!-- Play overlay -->
      <div
        v-if="!isVideoPlaying"
        class="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
        @click="toggleVideoPlay"
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
          @click="seekVideo"
        >
          <div
            class="h-full rounded-full bg-brand"
            :style="{ width: videoDuration ? `${(videoCurrentTime / videoDuration) * 100}%` : '0%' }"
          ></div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button class="text-white/90 hover:text-white" @click.stop="toggleVideoPlay">
              <XbIcon v-if="isVideoPlaying" name="pause" :size="16" />
              <XbIcon v-else name="play" :size="16" />
            </button>
            <button class="text-white/90 hover:text-white" @click.stop="toggleVideoMute">
              <XbIcon v-if="isVideoMuted" name="volume-x" :size="16" />
              <XbIcon v-else name="volume-2" :size="16" />
            </button>
            <span class="text-[11px] text-white/80" style="font-variant-numeric: tabular-nums;">
              {{ formatTime(videoCurrentTime) }} / {{ formatTime(videoDuration) }}
            </span>
          </div>
          <button class="text-white/90 hover:text-white" @click.stop="toggleFullscreen">
            <XbIcon name="maximize" :size="16" />
          </button>
        </div>
      </div>
    </div>

      <!-- Info bar (shared for all types) -->
      <div class="flex items-center justify-between px-4 py-3 bg-surface-elevated border-t border-border">
        <div>
          <h4 class="text-sm font-medium text-content">{{ listing.asset.name }}</h4>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[10px] text-content-tertiary">{{ getTypeLabel(listing.asset.type) }}</span>
            <span
              v-for="tag in listing.asset.tags"
              :key="tag"
              class="px-1.5 py-0.5 rounded text-[10px] bg-surface-overlay text-content-tertiary"
            >{{ tag }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <XbIcon name="coins" :size="12" class="text-amber-400" />
            <span class="text-sm font-bold text-brand">{{ listing.price }}</span>
          </div>
          <button
            class="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/80 transition-colors"
            @click="handlePurchase"
          >
            <XbIcon name="shopping-cart" :size="12" />
            购买
          </button>
        </div>
      </div>
    </template>
  </XbModal>
</template>
