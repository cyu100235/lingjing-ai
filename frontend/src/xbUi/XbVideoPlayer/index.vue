<script setup lang="ts">

const props = withDefaults(defineProps<{
  src?: string
  poster?: string
  autoplay?: boolean
  /** 是否默认静音 */
  muted?: boolean
}>(), {
  src: '',
  poster: '',
  autoplay: false,
  muted: false,
})

const emit = defineEmits<{
  play: []
  pause: []
  ended: []
  timeupdate: [currentTime: number]
}>()

// ─── Refs ──────────────────────────────────────────────
const videoRef = ref<HTMLVideoElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(props.muted)
const isFullscreen = ref(false)
const showControls = ref(true)
const isDragging = ref(false)
const playbackRate = ref(1)
const isLoaded = ref(false)

// 控制栏自动隐藏 timer
let hideTimer: ReturnType<typeof setTimeout> | null = null

// ─── 倍速选项 ──────────────────────────────────────────
const rateOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]
const showRateMenu = ref(false)

// ─── 格式化时间 ────────────────────────────────────────
function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── 进度条 ────────────────────────────────────────────
const progress = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

function seekTo(e: MouseEvent | TouchEvent) {
  const bar = (e.currentTarget as HTMLDivElement)
  const rect = bar.getBoundingClientRect()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
  if (videoRef.value) {
    videoRef.value.currentTime = ratio * duration.value
    currentTime.value = videoRef.value.currentTime
  }
}

function onProgressMouseDown(e: MouseEvent) {
  isDragging.value = true
  seekTo(e)
}

function onProgressMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  seekTo(e)
}

function onProgressMouseUp() {
  isDragging.value = false
}

// ─── 播放控制 ──────────────────────────────────────────
function togglePlay() {
  const v = videoRef.value
  if (!v) return
  if (isPlaying.value) {
    v.pause()
  } else {
    v.play()
  }
}

function onPlay() {
  isPlaying.value = true
  emit('play')
}

function onPause() {
  isPlaying.value = false
  emit('pause')
}

function onEnded() {
  isPlaying.value = false
  emit('ended')
}

function onTimeUpdate() {
  if (!isDragging.value && videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    emit('timeupdate', currentTime.value)
  }
}

function onLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
    isLoaded.value = true
    if (props.autoplay) videoRef.value.play()
  }
}

// ─── 音量 ──────────────────────────────────────────────
function toggleMute() {
  isMuted.value = !isMuted.value
  if (videoRef.value) videoRef.value.muted = isMuted.value
}

// ─── 倍速 ──────────────────────────────────────────────
function setRate(rate: number) {
  playbackRate.value = rate
  if (videoRef.value) videoRef.value.playbackRate = rate
  showRateMenu.value = false
}

function toggleRateMenu() {
  showRateMenu.value = !showRateMenu.value
}

// ─── 全屏 ──────────────────────────────────────────────
async function toggleFullscreen() {
  const el = containerRef.value
  if (!el) return
  if (!isFullscreen.value) {
    if (el.requestFullscreen) await el.requestFullscreen()
  } else {
    if (document.exitFullscreen) await document.exitFullscreen()
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

// ─── 控制栏自动隐藏 ────────────────────────────────────
function resetHideTimer() {
  showControls.value = true
  if (hideTimer) clearTimeout(hideTimer)
  if (isPlaying.value) {
    hideTimer = setTimeout(() => {
      showControls.value = false
      showRateMenu.value = false
    }, 3000)
  }
}

function onMouseLeave() {
  if (isPlaying.value) {
    showControls.value = false
    showRateMenu.value = false
  }
}

// ─── 空格键播放暂停 ────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if ((e.target as HTMLElement).tagName === 'INPUT') return
  if (e.code === 'Space') {
    e.preventDefault()
    togglePlay()
  }
}

// ─── Lifecycle ─────────────────────────────────────────
onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('mouseup', onProgressMouseUp)
  document.addEventListener('mousemove', onProgressMouseMove as EventListener)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('mouseup', onProgressMouseUp)
  document.removeEventListener('mousemove', onProgressMouseMove as EventListener)
  window.removeEventListener('keydown', onKeydown)
  if (hideTimer) clearTimeout(hideTimer)
})

watch(() => props.src, () => {
  isLoaded.value = false
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
})
</script>

<template>
  <div
    ref="containerRef"
    class="xbvp-container"
    :class="{ 'xbvp-fullscreen': isFullscreen }"
    @mousemove="resetHideTimer"
    @mouseleave="onMouseLeave"
    @click.self="togglePlay"
  >
    <!-- Video Element -->
    <video
      ref="videoRef"
      class="xbvp-video"
      :src="src || undefined"
      :poster="poster || undefined"
      :muted="isMuted"
      preload="metadata"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @click="togglePlay"
    />

    <!-- No source placeholder -->
    <div v-if="!src" class="xbvp-placeholder">
      <div class="xbvp-placeholder-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <span class="xbvp-placeholder-text">暂无视频</span>
    </div>

    <!-- Center Play Overlay (large play button when paused) -->
    <Transition name="xbvp-fade">
      <div
        v-if="!isPlaying && src && isLoaded"
        class="xbvp-center-play"
        @click="togglePlay"
      >
        <div class="xbvp-center-play-btn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
      </div>
    </Transition>

    <!-- Controls Bar -->
    <Transition name="xbvp-slide">
      <div v-show="showControls || !isPlaying" class="xbvp-controls">
        <!-- Progress Bar -->
        <div
          class="xbvp-progress-track"
          @mousedown="onProgressMouseDown"
        >
          <div class="xbvp-progress-bg" />
          <div
            class="xbvp-progress-fill"
            :style="{ width: progress + '%' }"
          />
          <div
            class="xbvp-progress-thumb"
            :style="{ left: progress + '%' }"
          />
        </div>

        <!-- Bottom Row -->
        <div class="xbvp-bottom-row">
          <!-- Left: play + time -->
          <div class="xbvp-left">
            <!-- Play/Pause Button -->
            <button class="xbvp-ctrl-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
              <svg v-if="!isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>

            <!-- Time -->
            <span class="xbvp-time">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </span>
          </div>

          <!-- Right: speed + volume + fullscreen -->
          <div class="xbvp-right">
            <!-- Playback Rate -->
            <div class="xbvp-rate-wrap">
              <button class="xbvp-ctrl-btn xbvp-rate-btn" @click.stop="toggleRateMenu" title="倍速">
                {{ playbackRate === 1 ? '1x' : playbackRate + 'x' }}
              </button>
              <Transition name="xbvp-fade">
                <div v-if="showRateMenu" class="xbvp-rate-menu" @click.stop>
                  <button
                    v-for="rate in rateOptions"
                    :key="rate"
                    class="xbvp-rate-option"
                    :class="{ 'xbvp-rate-active': playbackRate === rate }"
                    @click="setRate(rate)"
                  >
                    {{ rate === 1 ? '1x' : rate + 'x' }}
                  </button>
                </div>
              </Transition>
            </div>

            <!-- Volume / Mute -->
            <button class="xbvp-ctrl-btn" @click="toggleMute" :title="isMuted ? '取消静音' : '静音'">
              <!-- Speaker on -->
              <svg v-if="!isMuted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" stroke="none"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
              <!-- Speaker muted -->
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor" stroke="none"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            </button>

            <!-- Fullscreen -->
            <button class="xbvp-ctrl-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
              <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15,3 21,3 21,9"/>
                <polyline points="9,21 3,21 3,15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4,14 10,14 10,20"/>
                <polyline points="20,10 14,10 14,4"/>
                <line x1="10" y1="14" x2="3" y2="21"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── Container ── */
.xbvp-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.xbvp-container.xbvp-fullscreen {
  border-radius: 0;
  aspect-ratio: unset;
  width: 100vw;
  height: 100vh;
}

/* ── Video ── */
.xbvp-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* ── Placeholder ── */
.xbvp-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: hsl(220 20% 8%);
  pointer-events: none;
}

.xbvp-placeholder-icon {
  color: hsl(220 8% 35%);
}

.xbvp-placeholder-text {
  font-size: 13px;
  color: hsl(220 8% 40%);
}

/* ── Center play overlay ── */
.xbvp-center-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.xbvp-center-play-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.2s, transform 0.2s;
  padding-left: 4px;
}

.xbvp-center-play-btn:hover {
  background: rgba(0, 0, 0, 0.75);
  transform: scale(1.08);
}

/* ── Controls Bar ── */
.xbvp-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 12px 10px;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Progress Track ── */
.xbvp-progress-track {
  position: relative;
  height: 18px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.xbvp-progress-bg {
  position: absolute;
  left: 0; right: 0;
  height: 3px;
  border-radius: 2px;
  background: rgba(255,255,255,0.2);
}

.xbvp-progress-fill {
  position: absolute;
  left: 0;
  height: 3px;
  border-radius: 2px;
  background: #3b82f6;
  transition: width 0.1s linear;
  pointer-events: none;
}

.xbvp-progress-thumb {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #3b82f6;
  transform: translateX(-50%);
  pointer-events: none;
  transition: left 0.1s linear;
  opacity: 0;
  transition: opacity 0.15s;
}

.xbvp-progress-track:hover .xbvp-progress-thumb {
  opacity: 1;
}

.xbvp-progress-track:hover .xbvp-progress-fill,
.xbvp-progress-track:hover .xbvp-progress-bg {
  height: 4px;
}

/* ── Bottom Row ── */
.xbvp-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.xbvp-left,
.xbvp-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ── Control Buttons ── */
.xbvp-ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.85);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}

.xbvp-ctrl-btn:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}

/* ── Time Display ── */
.xbvp-time {
  font-size: 12px;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.3px;
  white-space: nowrap;
  padding: 0 6px;
  font-variant-numeric: tabular-nums;
}

/* ── Rate Button ── */
.xbvp-rate-btn {
  font-size: 12px;
  font-weight: 600;
  width: auto;
  padding: 0 8px;
  letter-spacing: 0.2px;
}

/* ── Rate Menu ── */
.xbvp-rate-wrap {
  position: relative;
}

.xbvp-rate-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  background: rgba(20, 22, 28, 0.95);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 68px;
  z-index: 20;
  backdrop-filter: blur(8px);
}

.xbvp-rate-option {
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.75);
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s, color 0.15s;
}

.xbvp-rate-option:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.xbvp-rate-active {
  color: #3b82f6 !important;
  font-weight: 600;
}

/* ── Transitions ── */
.xbvp-fade-enter-active,
.xbvp-fade-leave-active {
  transition: opacity 0.2s ease;
}
.xbvp-fade-enter-from,
.xbvp-fade-leave-to {
  opacity: 0;
}

.xbvp-slide-enter-active,
.xbvp-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.xbvp-slide-enter-from,
.xbvp-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
