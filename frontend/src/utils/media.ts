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
