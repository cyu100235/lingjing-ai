<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const copied = ref(false)
const siteUrl = '2d.xbcode.net'

onMounted(() => {
  const ua = navigator.userAgent || navigator.vendor || window.opera || ''
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)
  const narrowScreen = window.innerWidth <= 768
  if (!mobileUA && !narrowScreen) {
    router.replace({ name: 'home' })
  }
})

function copyUrl() {
  navigator.clipboard.writeText(`https://${siteUrl}`).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}
</script>

<template>
  <div class="mobile-page">
    <!-- Header -->
    <header class="mobile-header">
      <div class="header-logo">
        <div class="w-6 h-6 rounded bg-[hsl(142,71%,45%)] flex items-center justify-center text-white text-xs font-bold">N</div>
        <span class="header-title">AI动画漫剧创作</span>
      </div>
    </header>

    <!-- Video Player Area -->
    <div class="video-container">
      <div class="video-poster">
        <img src="/images/hero-banner.png" alt="preview" class="poster-image" />
        <!-- Play button overlay -->
        <div class="play-overlay">
          <div class="play-button">
            <XbIcon name="play" :size="20" class="text-white" />
          </div>
        </div>
        <!-- Text overlay -->
        <div class="video-text-overlay">
          <div class="brand-label">AI动画漫剧创作</div>
          <h1 class="main-title">漫剧专业级编辑器<br/>创作全程尽在掌控</h1>
        </div>
      </div>
      <!-- Video controls bar -->
      <div class="video-controls">
        <XbIcon name="play" :size="16" class="text-white control-icon" />
        <div class="progress-bar">
          <div class="progress-track"></div>
          <div class="progress-fill"></div>
        </div>
        <span class="time-display">0:00 / 0:46</span>
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="bottom-section">
      <p class="hint-text">请用电脑设备打开本网页</p>
      <p class="site-url">{{ siteUrl }}</p>
      <button class="copy-btn" @click="copyUrl">
        {{ copied ? '已复制' : '复制电脑端地址' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.mobile-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f1419;
  overflow: hidden;
}

.mobile-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #1a1f26;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: #e5e7eb;
}

.video-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.video-poster {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.play-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.video-text-overlay {
  position: absolute;
  bottom: 40px;
  left: 20px;
  right: 20px;
}

.brand-label {
  font-size: 13px;
  color: hsl(142, 71%, 55%);
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.brand-label::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: hsl(142, 71%, 55%);
}

.main-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.4;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.video-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #1a1f26;
}

.control-icon {
  flex-shrink: 0;
  opacity: 0.8;
}

.progress-bar {
  flex: 1;
  height: 3px;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
}

.progress-track {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0%;
  background: white;
  border-radius: 2px;
}

.time-display {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.bottom-section {
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: #0f1419;
}

.hint-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.site-url {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
}

.copy-btn {
  margin-top: 12px;
  width: 100%;
  padding: 14px 24px;
  border-radius: 8px;
  border: none;
  background: #ffffff;
  color: #0f1419;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.copy-btn:active {
  opacity: 0.8;
}
</style>
