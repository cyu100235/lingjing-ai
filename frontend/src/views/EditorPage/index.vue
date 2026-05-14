<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorksStore, type Scene } from '@/stores/projects'
import { useAssetStore, type Asset, type AssetType, type AssetSubType } from '@/stores/assets'
import AssetPickerModal from '@/components/AssetPickerModal/index.vue'
import AiScriptModal from '@/components/AiScriptModal/index.vue'
import AiGenerateModal from '@/components/AiGenerateModal/index.vue'
import AudioPlayerModal from '@/components/AudioPlayerModal/index.vue'
import type { AudioPlayerInfo } from '@/components/AudioPlayerModal/index.vue'
import VideoPlayerModal from '@/components/VideoPlayerModal/index.vue'
import type { VideoPlayerInfo } from '@/components/VideoPlayerModal/index.vue'

import EditorTopBar from './components/EditorTopBar.vue'
import EditorCanvas from './components/EditorCanvas.vue'
import EditorTimeline from './components/EditorTimeline.vue'
import EditorPropertiesPanel from './components/EditorPropertiesPanel.vue'
import ImagePreviewOverlay from './components/ImagePreviewOverlay.vue'
import type { TimelineItem, VideoClip } from './components/types'
import XbConfirmModal from '@/xbUi/XbConfirmModal/index.vue'

const route = useRoute()
const router = useRouter()
const store = useWorksStore()
const assetStore = useAssetStore()

const worksId = route.params.id as string
const activeEpisode = ref(0)
const activeScene = ref(-1)
const isPlaying = ref(false)
const currentTime = ref(0)
const totalDuration = ref(0)

// 播放目标选择（独立于 activeScene 编辑状态）
const playbackTarget = ref<{ kind: 'scene'; index: number } | { kind: 'video'; clipId: string } | null>({ kind: 'scene', index: 0 })

// 播放模式与队列
const playbackMode = ref<'idle' | 'single' | 'sequential'>('idle')
const playbackQueue = ref<TimelineItem[]>([])
const playbackIndex = ref(0)
const playbackVideoUrl = ref<string | null>(null)
const showAiModal = ref(false)
const showAiScriptModal = ref(false)
const showPublishConfirm = ref(false)
const propertyTab = ref<'scene' | 'script' | 'global'>('scene')

// 图片预览弹窗
const previewImage = ref<{ url: string; name: string } | null>(null)

// 媒体播放弹窗
const audioPlayerVisible = ref(false)
const audioPlayerInfo = ref<AudioPlayerInfo | null>(null)
const videoPlayerVisible = ref(false)
const videoPlayerInfo = ref<VideoPlayerInfo | null>(null)

// 资产选择弹窗状态
const assetPickerVisible = ref(false)
const assetPickerType = ref<AssetType>('character')
const assetPickerMultiple = ref(false)

// 视频片段
const insertedVideos = ref<VideoClip[]>([])

// 画布组件引用
const canvasRef = ref<InstanceType<typeof EditorCanvas> | null>(null)

// 时间轴组件引用
const timelineRef = ref<InstanceType<typeof EditorTimeline> | null>(null)

onMounted(() => {
  store.setCurrentWorks(worksId)
})

onBeforeUnmount(() => {
  stopPlayback()
})

// 切换集数时停止播放
watch(activeEpisode, () => {
  stopPlayback()
  playbackTarget.value = { kind: 'scene', index: 0 }
})

const currentEpisode = computed(() => store.episodes[activeEpisode.value])
const currentScene = computed(() => currentEpisode.value?.scenes[activeScene.value])

// 当前分镜中对应类型已选中的资产名称列表
const currentAssetNames = computed(() => {
  if (!currentScene.value) return []
  const type = assetPickerType.value
  if (type === 'character') return currentScene.value.characters
  if (type === 'expression') return currentScene.value.expressions
  if (type === 'action') return currentScene.value.actions
  if (type === 'prop') return currentScene.value.props
  if (type === 'effect') return currentScene.value.effects
  if (type === 'background') {
    const bg = currentScene.value.background
    if (!bg) return []
    const asset = assetStore.assets.find(a => a.type === 'background' && a.thumbnail === bg)
    return asset ? [asset.name] : []
  }
  return []
})

function openAssetPicker(type: AssetType, multiple = true) {
  assetPickerType.value = type
  assetPickerMultiple.value = multiple
  assetPickerVisible.value = true
}

function onAssetSelected(selected: Asset[]) {
  const type = assetPickerType.value
  if (!currentScene.value) return
  if (type === 'background') {
    currentScene.value.background = selected.length > 0 ? selected[0].thumbnail : ''
    return
  }
  const names = selected.map(a => a.name)
  if (type === 'character') currentScene.value.characters = names
  else if (type === 'expression') currentScene.value.expressions = names
  else if (type === 'action') currentScene.value.actions = names
  else if (type === 'prop') currentScene.value.props = names
  else if (type === 'effect') currentScene.value.effects = names
}

function openMediaPlayer(asset: Asset) {
  if (!asset.mediaUrl) return
  if (asset.type === 'video') {
    videoPlayerInfo.value = { name: asset.name, thumbnail: asset.thumbnail, mediaUrl: asset.mediaUrl }
    videoPlayerVisible.value = true
  } else {
    audioPlayerInfo.value = { name: asset.name, thumbnail: asset.thumbnail, mediaUrl: asset.mediaUrl }
    audioPlayerVisible.value = true
  }
}

function addScene() {
  store.addScene(activeEpisode.value)
  const scenes = currentEpisode.value?.scenes
  if (scenes) {
    activeScene.value = scenes.length - 1
    playbackTarget.value = { kind: 'scene', index: scenes.length - 1 }
  }
}

function deleteScene(sceneIndex: number) {
  const scenes = currentEpisode.value?.scenes
  if (!scenes || scenes.length <= 1) return
  store.deleteScene(activeEpisode.value, sceneIndex)
  if (activeScene.value === sceneIndex) {
    activeScene.value = -1
  } else if (activeScene.value > sceneIndex) {
    activeScene.value--
  }
}

// 播放控制
function togglePlay() {
  if (isPlaying.value) {
    canvasRef.value?.pause()
    isPlaying.value = false
    return
  }
  if (playbackTarget.value !== null) {
    const item = findTimelineItem(playbackTarget.value)
    if (!item) return
    const url = resolveVideoUrl(item)
    if (!url) return
    playbackMode.value = 'single'
    playbackVideoUrl.value = url
    nextTick(() => startPlayback())
  } else {
    const playable = getPlayableItems()
    if (playable.length === 0) return
    playbackQueue.value = playable
    playbackMode.value = 'sequential'
    playbackIndex.value = 0
    playbackVideoUrl.value = resolveVideoUrl(playable[0])
    nextTick(() => startPlayback())
  }
}

function resolveVideoUrl(item: TimelineItem): string | null {
  if (item.kind === 'scene') return item.scene.videoUrl ?? null
  if (item.kind === 'video') {
    return assetStore.assets.find(a => a.id === item.clip.assetId)?.mediaUrl ?? null
  }
  return null
}

function getPlayableItems(): TimelineItem[] {
  return timelineItems.value.filter(item => resolveVideoUrl(item) !== null)
}

function findTimelineItem(target: { kind: 'scene'; index: number } | { kind: 'video'; clipId: string }): TimelineItem | undefined {
  if (target.kind === 'scene') {
    return timelineItems.value.find(i => i.kind === 'scene' && i.index === target.index)
  }
  return timelineItems.value.find(i => i.kind === 'video' && i.clip.id === target.clipId)
}

function startPlayback() {
  canvasRef.value?.play()?.catch(() => { isPlaying.value = false })
  isPlaying.value = true
}

function stopPlayback() {
  canvasRef.value?.pause()
  canvasRef.value?.reset()
  isPlaying.value = false
  playbackMode.value = 'idle'
  playbackVideoUrl.value = null
  currentTime.value = 0
}

function onVideoEnded() {
  if (playbackMode.value === 'single') {
    stopPlayback()
    return
  }
  playbackIndex.value++
  if (playbackIndex.value >= playbackQueue.value.length) {
    stopPlayback()
    return
  }
  playbackVideoUrl.value = resolveVideoUrl(playbackQueue.value[playbackIndex.value])
  nextTick(() => startPlayback())
}

function onVideoTimeUpdate(time: number) {
  if (playbackMode.value === 'sequential') {
    const elapsed = playbackQueue.value
      .slice(0, playbackIndex.value)
      .reduce((sum, item) => sum + (item.kind === 'scene' ? item.scene.duration : item.clip.duration), 0)
    currentTime.value = elapsed + time
  } else {
    currentTime.value = time
  }
}

function onVideoLoadedMetadata(duration: number) {
  if (playbackMode.value === 'single') {
    totalDuration.value = duration
  }
}

function onAiGenerate(payload: { type: AssetType; subType: AssetSubType | '' | undefined; model: string; style: string; prompt: string; tags: string[] }) {
  const thumbnail = payload.type === 'voice' || payload.type === 'sound_effect'
    ? '/images/audio-cover.svg'
    : payload.type === 'video'
      ? '/images/video-cover.svg'
      : '/images/ai-generated-placeholder.jpg'
  assetStore.addAsset({
    name: `AI生成-${payload.prompt.slice(0, 10)}`,
    type: payload.type,
    subType: payload.subType || undefined,
    thumbnail,
    tags: payload.tags,
  })
  showAiModal.value = false
}

function onScriptConfirm(scenes: Omit<Scene, 'id'>[]) {
  const ep = currentEpisode.value
  if (ep) {
    ep.scenes.splice(0, ep.scenes.length)
  }
  store.addScenesBatch(activeEpisode.value, scenes)
  showAiScriptModal.value = false
  activeScene.value = 0
  playbackTarget.value = { kind: 'scene', index: 0 }
}

// 视频拖拽（从资产面板拖到时间轴）
function onVideoDragStart(event: DragEvent, asset: Asset) {
  event.dataTransfer!.setData('application/json', JSON.stringify({
    id: asset.id,
    name: asset.name,
    thumbnail: asset.thumbnail,
    duration: asset.duration || 10,
  }))
  event.dataTransfer!.effectAllowed = 'copy'
  // 通知时间轴组件开始视频拖拽
  timelineRef.value?.notifyVideoDragStart()
}

function onVideoDragEnd() {
  timelineRef.value?.notifyVideoDragEnd()
}

// 时间轴事件处理
function onTimelineSelectScene(index: number) {
  activeScene.value = index
  playbackTarget.value = { kind: 'scene', index }
}

function onTimelineSelectVideoClip(clipId: string) {
  playbackTarget.value = { kind: 'video', clipId }
}

function onTimelineClearSelection() {
  activeScene.value = -1
  playbackTarget.value = null
}

function onTimelineInsertVideo(assetData: { id: string; name: string; thumbnail: string; duration: number }, position: number) {
  const maxDuration = assetData.duration || 10
  insertedVideos.value.push({
    id: `vclip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    assetId: assetData.id,
    name: assetData.name,
    thumbnail: assetData.thumbnail,
    duration: Math.min(3, maxDuration),
    maxDuration,
    position,
  })
}

function onTimelineResizeVideoClip(clip: VideoClip, newDuration: number) {
  clip.duration = newDuration
}

function onTimelineRemoveVideoClip(clipId: string) {
  insertedVideos.value = insertedVideos.value.filter(v => v.id !== clipId)
}

function onTimelineReorderScene(fromIndex: number, toIndex: number) {
  store.reorderScene(activeEpisode.value, fromIndex, toIndex)
  activeScene.value = toIndex
}

// 构建时间轴作品（分镜 + 视频片段混合）
const timelineItems = computed<TimelineItem[]>(() => {
  if (!currentEpisode.value) return []
  const scenes = currentEpisode.value.scenes
  const items: TimelineItem[] = []
  let time = 0

  for (let i = 0; i < scenes.length; i++) {
    const videosBefore = insertedVideos.value.filter(v => v.position === i)
    for (const clip of videosBefore) {
      items.push({ kind: 'video', clip })
      time += clip.duration
    }
    items.push({ kind: 'scene', scene: { ...scenes[i], startTime: time }, index: i })
    time += scenes[i].duration
  }
  const videosAfter = insertedVideos.value.filter(v => v.position === scenes.length)
  for (const clip of videosAfter) {
    items.push({ kind: 'video', clip })
    time += clip.duration
  }
  return items
})

// 动态更新总时长
watch(timelineItems, (items) => {
  if (playbackMode.value === 'idle') {
    totalDuration.value = items.reduce((sum, item) =>
      sum + (item.kind === 'scene' ? item.scene.duration : item.clip.duration), 0)
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-10rem)] animate-fade-in border border-border rounded-lg overflow-hidden">
    <!-- Editor Top Bar -->
    <EditorTopBar
      :works-id="worksId"
      :title="store.currentWorks?.title || '未命名作品'"
      :episode-title="currentEpisode?.title || '第1集'"
      @show-ai-modal="showAiModal = true"
      @show-ai-script-modal="showAiScriptModal = true"
      @publish="showPublishConfirm = true"
    />

    <div class="flex flex-1 overflow-hidden">
      <!-- Main Canvas Area -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Preview Canvas -->
        <EditorCanvas
          ref="canvasRef"
          :playback-video-url="playbackVideoUrl"
          :is-playing="isPlaying"
          :current-scene="currentScene ?? null"
          @toggle-play="togglePlay"
          @video-ended="onVideoEnded"
          @video-time-update="onVideoTimeUpdate"
          @video-loaded-metadata="onVideoLoadedMetadata"
        />

        <!-- Timeline -->
        <EditorTimeline
          ref="timelineRef"
          :timeline-items="timelineItems"
          :active-scene="activeScene"
          :selected-video-clip-id="null"
          :is-playing="isPlaying"
          :current-time="currentTime"
          :total-duration="totalDuration"
          :playback-target="playbackTarget"
          :current-episode="currentEpisode"
          :inserted-videos="insertedVideos"
          @toggle-play="togglePlay"
          @select-scene="onTimelineSelectScene"
          @select-video-clip="onTimelineSelectVideoClip"
          @add-scene="addScene"
          @delete-scene="deleteScene"
          @clear-selection="onTimelineClearSelection"
          @reorder-scene="onTimelineReorderScene"
          @insert-video="onTimelineInsertVideo"
          @resize-video-clip="onTimelineResizeVideoClip"
          @remove-video-clip="onTimelineRemoveVideoClip"
        />
      </div>

      <!-- Scene Properties Panel -->
      <EditorPropertiesPanel
        :property-tab="propertyTab"
        :current-scene="currentScene ?? null"
        :assets="assetStore.assets"
        @update:property-tab="propertyTab = $event"
        @open-asset-picker="openAssetPicker"
        @open-image-preview="(url, name) => previewImage = { url, name }"
        @open-media-player="openMediaPlayer"
        @video-drag-start="onVideoDragStart"
        @video-drag-end="onVideoDragEnd"
      />
    </div>

    <!-- 资产选择弹窗 -->
    <AssetPickerModal
      :visible="assetPickerVisible"
      :type="assetPickerType"
      :multiple="assetPickerMultiple"
      :initial-selected="currentAssetNames"
      @close="assetPickerVisible = false"
      @confirm="onAssetSelected"
    />

    <!-- AI 生成助手弹窗 -->
    <AiGenerateModal
      :visible="showAiModal"
      @close="showAiModal = false"
      @generate="onAiGenerate"
    />
    <!-- AI 剧本创作弹窗 -->
    <AiScriptModal
      :visible="showAiScriptModal"
      @close="showAiScriptModal = false"
      @confirm="onScriptConfirm"
    />

    <!-- 音频播放弹窗 -->
    <AudioPlayerModal
      :visible="audioPlayerVisible"
      :media="audioPlayerInfo"
      @close="audioPlayerVisible = false"
    />

    <!-- 视频播放弹窗 -->
    <VideoPlayerModal
      :visible="videoPlayerVisible"
      :media="videoPlayerInfo"
      :show-like="false"
      @close="videoPlayerVisible = false"
    />

    <!-- 发布确认弹窗 -->
    <XbConfirmModal
      v-model:visible="showPublishConfirm"
      title="确认发布"
      message="发布后将无法撤销，是否确认发布该剧集？"
      confirm-text="确认发布"
      @confirm="router.push(`/works/${worksId}/episodes/publish-success`)"
    />

    <!-- 图片预览弹窗 -->
    <ImagePreviewOverlay
      :visible="!!previewImage"
      :image-url="previewImage?.url || ''"
      :image-name="previewImage?.name || ''"
      @close="previewImage = null"
    />
  </div>
</template>