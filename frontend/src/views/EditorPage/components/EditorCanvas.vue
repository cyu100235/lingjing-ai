<script setup lang="ts">
import { ref } from 'vue'
import type { Scene } from '@/stores/projects'
import { onImgError } from '@/utils/image'

const props = defineProps<{
  playbackVideoUrl: string | null
  isPlaying: boolean
  currentScene: Scene | null
}>()

const emit = defineEmits<{
  'toggle-play': []
  'video-ended': []
  'video-time-update': [currentTime: number]
  'video-loaded-metadata': [duration: number]
}>()

const stageVideoRef = ref<HTMLVideoElement | null>(null)

function onTimeUpdate() {
  if (!stageVideoRef.value) return
  emit('video-time-update', stageVideoRef.value.currentTime)
}

function onLoadedMetadata() {
  if (!stageVideoRef.value) return
  emit('video-loaded-metadata', stageVideoRef.value.duration)
}

// 暴露给父组件的视频控制方法
function play() {
  return stageVideoRef.value?.play()
}

function pause() {
  stageVideoRef.value?.pause()
}

function reset() {
  if (stageVideoRef.value) {
    stageVideoRef.value.pause()
    stageVideoRef.value.currentTime = 0
  }
}

defineExpose({ stageVideoRef, play, pause, reset })
</script>

<template>
  <div class="flex-1 relative bg-surface overflow-hidden flex items-center justify-center">
    <div class="w-full max-w-3xl aspect-video rounded-lg overflow-hidden border border-border-subtle relative">
      <!-- 播放中：显示视频 -->
      <template v-if="playbackVideoUrl">
        <video
          ref="stageVideoRef"
          :src="playbackVideoUrl"
          class="w-full h-full object-contain bg-black"
          @ended="emit('video-ended')"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
        />
        <!-- 暂停时显示播放按钮覆盖层 -->
        <div
          v-if="!isPlaying"
          class="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          @click="emit('toggle-play')"
        >
          <div class="w-14 h-14 rounded-full bg-brand/90 flex items-center justify-center shadow-lg">
            <XbIcon name="play" :size="24" class="text-white ml-0.5" />
          </div>
        </div>
      </template>
      <!-- 非播放状态：显示静态分镜 -->
      <template v-else>
        <img
          v-if="currentScene?.background"
          :src="currentScene.background"
          alt="分镜背景"
          class="w-full h-full object-cover"
          @error="onImgError"
        />
        <div v-else class="w-full h-full bg-surface-overlay flex items-center justify-center">
          <span class="text-content-tertiary text-sm">选择或生成分镜背景</span>
        </div>
      </template>
    </div>
  </div>
</template>
