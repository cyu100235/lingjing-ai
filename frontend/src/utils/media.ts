import type { AssetType } from '@/stores/assets'

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function isAudioAsset(type: AssetType): boolean {
  return type === 'voice' || type === 'sound_effect'
}

export function isVideoAsset(type: AssetType): boolean {
  return type === 'video'
}

/**
 * 获取视频第一帧截图，返回 base64 DataURL
 */
export function getVideoFirstFrame(videoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.preload = 'metadata'
    video.src = videoUrl

    video.onloadeddata = () => {
      // 跳到第一帧
      video.currentTime = 0
    }

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 320
        canvas.height = video.videoHeight || 180
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataUrl)
      } catch (e) {
        reject(e)
      } finally {
        video.remove()
      }
    }

    video.onerror = () => {
      video.remove()
      reject(new Error(`Failed to load video: ${videoUrl}`))
    }
  })
}
