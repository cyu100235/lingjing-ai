<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Episode } from '@/stores/projects'
import type { TimelineItem, VideoClip } from './types'

const props = defineProps<{
  timelineItems: TimelineItem[]
  activeScene: number
  selectedVideoClipId: string | null
  isPlaying: boolean
  currentTime: number
  totalDuration: number
  playbackTarget: { kind: 'scene'; index: number } | { kind: 'video'; clipId: string } | null
  currentEpisode: Episode | undefined
  insertedVideos: VideoClip[]
}>()

const emit = defineEmits<{
  'toggle-play': []
  'select-scene': [index: number]
  'select-video-clip': [clipId: string]
  'add-scene': []
  'delete-scene': [index: number]
  'clear-selection': []
  'reorder-scene': [fromIndex: number, toIndex: number]
  'insert-video': [assetData: { id: string; name: string; thumbnail: string; duration: number }, position: number]
  'resize-video-clip': [clip: VideoClip, newDuration: number]
  'remove-video-clip': [clipId: string]
}>()

// 拖拽相关状态（组件内部管理）
const dragOverIndex = ref<number | null>(null)
const timelineTrackRef = ref<HTMLElement | null>(null)
let dragEnterCount = 0
let isDraggingVideo = false

// 分镜拖拽排序状态
let isDraggingScene = false
const draggingSceneIndex = ref(-1)
const sceneDragOverIndex = ref<number | null>(null)

// 视频片段时长调整状态
let resizingClip: VideoClip | null = null
let resizeStartX = 0
let resizeStartDuration = 0

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const playbackLabel = computed(() => {
  const target = props.playbackTarget
  if (target === null) return '全部播放'
  if (target.kind === 'scene') return `分镜 ${target.index + 1} / ${props.currentEpisode?.scenes.length || 0}`
  const clip = props.insertedVideos.find(v => v.id === (target as { kind: 'video'; clipId: string }).clipId)
  return clip?.name || '视频片段'
})

function onTimelineWheel(e: WheelEvent) {
  const container = e.currentTarget as HTMLElement
  container.scrollLeft += e.deltaY
}

// 拖拽辅助函数
function calcDropIndex(event: DragEvent): number {
  const container = timelineTrackRef.value
  if (!container) return props.timelineItems.length
  const items = container.querySelectorAll<HTMLElement>('[data-timeline-idx]')
  for (const el of items) {
    const rect = el.getBoundingClientRect()
    const midX = rect.left + rect.width / 2
    if (event.clientX < midX) {
      return parseInt(el.dataset.timelineIdx!)
    }
  }
  return props.timelineItems.length
}

function indexToPosition(idx: number): number {
  const items = props.timelineItems
  if (idx >= items.length) {
    const lastScene = [...items].reverse().find(i => i.kind === 'scene')
    return lastScene ? lastScene.index + 1 : 0
  }
  const item = items[idx]
  if (item.kind === 'scene') return item.index
  for (let i = idx; i < items.length; i++) {
    if (items[i].kind === 'scene') return (items[i] as { kind: 'scene'; scene: any; index: number }).index
  }
  const lastScene = [...items].reverse().find(i => i.kind === 'scene')
  return lastScene ? (lastScene as { kind: 'scene'; scene: any; index: number }).index + 1 : 0
}

function onSceneDragStart(event: DragEvent, sceneIndex: number) {
  isDraggingScene = true
  draggingSceneIndex.value = sceneIndex
  event.dataTransfer!.setData('text/x-scene-reorder', String(sceneIndex))
  event.dataTransfer!.effectAllowed = 'move'
}

function onSceneDragEnd() {
  isDraggingScene = false
  draggingSceneIndex.value = -1
  sceneDragOverIndex.value = null
}

function calcSceneDropIndex(event: DragEvent): number {
  const container = timelineTrackRef.value
  if (!container) return -1
  const sceneEls = container.querySelectorAll<HTMLElement>('[data-scene-idx]')
  for (const el of sceneEls) {
    const rect = el.getBoundingClientRect()
    const midX = rect.left + rect.width / 2
    const idx = parseInt(el.dataset.sceneIdx!)
    if (event.clientX < midX) {
      return idx
    }
  }
  return props.currentEpisode?.scenes.length ?? 0
}

function onTimelineDragEnter() {
  if (!isDraggingVideo && !isDraggingScene) return
  dragEnterCount++
}

function onTimelineContainerDragOver(event: DragEvent) {
  if (isDraggingScene) {
    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'
    const dropIdx = calcSceneDropIndex(event)
    if (dropIdx === draggingSceneIndex.value || dropIdx === draggingSceneIndex.value + 1) {
      sceneDragOverIndex.value = null
    } else {
      sceneDragOverIndex.value = dropIdx
    }
    return
  }
  if (!isDraggingVideo) return
  event.dataTransfer!.dropEffect = 'copy'
  dragOverIndex.value = calcDropIndex(event)
}

function onTimelineDragLeave() {
  if (!isDraggingVideo && !isDraggingScene) return
  dragEnterCount--
  if (dragEnterCount <= 0) {
    dragOverIndex.value = null
    sceneDragOverIndex.value = null
    dragEnterCount = 0
  }
}

function onTimelineContainerDrop(event: DragEvent) {
  if (isDraggingScene) {
    const dropIdx = calcSceneDropIndex(event)
    sceneDragOverIndex.value = null
    if (dropIdx !== -1 && dropIdx !== draggingSceneIndex.value && dropIdx !== draggingSceneIndex.value + 1) {
      const targetIdx = dropIdx > draggingSceneIndex.value ? dropIdx - 1 : dropIdx
      emit('reorder-scene', draggingSceneIndex.value, targetIdx)
    }
    isDraggingScene = false
    draggingSceneIndex.value = -1
    return
  }
  if (!isDraggingVideo) return
  const idx = calcDropIndex(event)
  const position = indexToPosition(idx)
  dragOverIndex.value = null
  const raw = event.dataTransfer?.getData('application/json')
  if (!raw) return
  try {
    const asset = JSON.parse(raw)
    emit('insert-video', {
      id: asset.id,
      name: asset.name,
      thumbnail: asset.thumbnail,
      duration: asset.duration || 10,
    }, position)
  } catch { /* ignore invalid data */ }
}

// 视频片段选中与时长调整
function selectVideoClip(clipId: string) {
  emit('select-video-clip', clipId)
}

function startResizeVideo(event: MouseEvent, clip: VideoClip) {
  resizingClip = clip
  resizeStartX = event.clientX
  resizeStartDuration = clip.duration
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(event: MouseEvent) {
  if (!resizingClip) return
  const deltaX = event.clientX - resizeStartX
  const deltaDuration = deltaX / 40
  const newDuration = Math.min(resizingClip.maxDuration, Math.max(1, Math.round((resizeStartDuration + deltaDuration) * 10) / 10))
  emit('resize-video-clip', resizingClip, newDuration)
}

function onResizeEnd() {
  resizingClip = null
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

// 通知父组件有视频资产正在被拖拽（供资产面板设置 isDraggingVideo）
function notifyVideoDragStart() {
  isDraggingVideo = true
}

function notifyVideoDragEnd() {
  dragOverIndex.value = null
  dragEnterCount = 0
  isDraggingVideo = false
}

defineExpose({ notifyVideoDragStart, notifyVideoDragEnd })
</script>

<template>
  <div class="h-40 border-t border-border bg-surface-elevated overflow-hidden flex flex-col">
    <!-- Transport Controls -->
    <div class="flex items-center gap-4 px-4 py-2 border-b border-border-subtle">
      <div class="flex items-center gap-1">
        <button class="btn-ghost p-1 rounded">
          <XbIcon name="skip-back" :size="14" class="text-content-secondary" />
        </button>
        <button class="btn-ghost p-1.5 rounded" @click="emit('toggle-play')">
          <XbIcon v-if="!isPlaying" name="play" :size="16" class="text-brand" />
          <XbIcon v-else name="pause" :size="16" class="text-brand" />
        </button>
        <button class="btn-ghost p-1 rounded">
          <XbIcon name="skip-forward" :size="14" class="text-content-secondary" />
        </button>
      </div>
      <span class="text-xs text-content-secondary font-mono">
        {{ formatTime(currentTime) }} / {{ formatTime(totalDuration) }}
      </span>
      <div class="flex-1" />
      <span class="text-xs text-content-tertiary">{{ playbackLabel }}</span>
    </div>

    <!-- Timeline Track -->
    <div class="flex-1 px-4 pt-3 pb-0 overflow-x-auto min-w-0" @wheel.prevent="onTimelineWheel" @click="emit('clear-selection')">
      <div
        class="flex items-center h-full w-max gap-2"
        @dragenter="onTimelineDragEnter"
        @dragover.prevent="onTimelineContainerDragOver"
        @dragleave="onTimelineDragLeave"
        @drop.prevent="onTimelineContainerDrop"
        ref="timelineTrackRef"
      >
        <template v-for="(item, idx) in timelineItems" :key="item.kind === 'scene' ? item.scene.id : item.clip.id">
          <!-- 视频拖放指示器（显示在当前项之前） -->
          <div
            v-if="dragOverIndex === idx"
            class="h-16 w-16 flex items-center justify-center shrink-0 bg-purple-500/10 border-2 border-dashed border-purple-400 rounded-lg pointer-events-none"
          >
            <div class="flex flex-col items-center gap-0.5">
              <XbIcon name="film" :size="12" class="text-purple-400" />
              <span class="text-[9px] text-purple-400">放置</span>
            </div>
          </div>

          <!-- 分镜排序指示器（显示在目标位置） -->
          <div
            v-if="item.kind === 'scene' && sceneDragOverIndex === item.index"
            class="h-16 w-1.5 rounded-full bg-brand shrink-0 pointer-events-none"
          />

          <!-- 分镜块 -->
          <div
            v-if="item.kind === 'scene'"
            class="h-16 rounded-lg border cursor-pointer flex flex-col justify-center px-3 transition-all duration-200 min-w-[120px] shrink-0 relative group/scene"
            :class="[
              item.scene.videoUrl
                ? (activeScene === item.index ? 'border-purple-400 ring-1 ring-purple-400/30 bg-purple-500/15' : 'border-purple-500/50 bg-purple-500/10 hover:border-purple-400/60')
                : (activeScene === item.index ? 'border-green-400 ring-1 ring-green-400/30 bg-green-500/15' : 'border-border bg-surface-overlay hover:border-green-400/30'),
              draggingSceneIndex === item.index ? 'opacity-50' : ''
            ]"
            :style="{ width: `${item.scene.duration * 40}px` }"
            :data-timeline-idx="idx"
            :data-scene-idx="item.index"
            draggable="true"
            @dragstart="onSceneDragStart($event, item.index)"
            @dragend="onSceneDragEnd"
            @click.stop="emit('select-scene', item.index)"
          >
            <div class="flex items-center gap-1">
              <XbIcon v-if="item.scene.videoUrl" name="film" :size="10" class="text-purple-400 shrink-0" />
              <span class="text-[10px] font-medium truncate" :class="item.scene.videoUrl ? 'text-purple-300' : (activeScene === item.index ? 'text-green-300' : 'text-content-secondary')">
                {{ item.scene.title }}
              </span>
            </div>
            <span class="text-[10px] mt-0.5" :class="item.scene.videoUrl ? 'text-purple-400/70' : 'text-content-tertiary'">{{ item.scene.videoUrl ? item.scene.duration + 's' : '0s' }}</span>
            <button
              v-if="currentEpisode && currentEpisode.scenes.length > 1"
              class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/scene:opacity-100 transition-opacity"
              title="删除分镜"
              @click.stop="emit('delete-scene', item.index)"
            >
              <XbIcon name="x" :size="10" />
            </button>
          </div>

          <!-- 视频片段块 -->
          <div
            v-if="item.kind === 'video'"
            class="h-16 rounded-lg border flex flex-col justify-center px-3 transition-all duration-200 min-w-[100px] shrink-0 relative group/clip"
            :class="selectedVideoClipId === item.clip.id ? 'border-purple-400 ring-1 ring-purple-400/30 bg-purple-500/15' : 'border-purple-500/50 bg-purple-500/10'"
            :style="{ width: `${item.clip.duration * 40}px` }"
            :data-timeline-idx="idx"
            @click.stop="selectVideoClip(item.clip.id)"
          >
            <div class="flex items-center gap-1">
              <XbIcon name="film" :size="10" class="text-purple-400 shrink-0" />
              <span class="text-[10px] font-medium truncate text-purple-300">{{ item.clip.name }}</span>
            </div>
            <span class="text-[10px] text-purple-400/70 mt-0.5">{{ item.clip.duration }}s</span>
            <button
              class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-opacity"
              title="移除视频"
              @click.stop="emit('remove-video-clip', item.clip.id)"
            >
              <XbIcon name="x" :size="10" />
            </button>
            <!-- 右边缘拖拽手柄（选中时显示） -->
            <div
              v-if="selectedVideoClipId === item.clip.id"
              class="absolute top-0 right-0 w-2 h-full cursor-col-resize flex items-center justify-center bg-purple-500/30 rounded-r-lg hover:bg-purple-500/50 transition-colors"
              @mousedown.stop="startResizeVideo($event, item.clip)"
            >
              <div class="w-0.5 h-6 bg-purple-400 rounded" />
            </div>
          </div>
        </template>

        <!-- 末尾拖放指示器 -->
        <div
          v-if="dragOverIndex === timelineItems.length"
          class="h-16 w-16 flex items-center justify-center shrink-0 bg-purple-500/10 border-2 border-dashed border-purple-400 rounded-lg pointer-events-none"
        >
          <div class="flex flex-col items-center gap-0.5">
            <XbIcon name="film" :size="12" class="text-purple-400" />
            <span class="text-[9px] text-purple-400">放置</span>
          </div>
        </div>

        <!-- 末尾分镜排序指示器 -->
        <div
          v-if="sceneDragOverIndex !== null && sceneDragOverIndex === (currentEpisode?.scenes.length ?? 0)"
          class="h-16 w-1.5 rounded-full bg-brand shrink-0 pointer-events-none"
        />

        <button
          class="h-16 min-w-[80px] rounded-lg border-2 border-dashed border-border hover:border-brand/40 flex items-center justify-center transition-colors shrink-0"
          @click="emit('add-scene')"
        >
          <XbIcon name="plus" :size="16" class="text-content-tertiary" />
        </button>
      </div>
    </div>
  </div>
</template>
