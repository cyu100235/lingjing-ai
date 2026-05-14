import type { Scene } from '@/stores/projects'

// 视频片段插入到时间轴
export interface VideoClip {
  id: string
  assetId: string
  name: string
  thumbnail: string
  duration: number
  maxDuration: number // 视频原始时长，拖拽不能超过此值
  position: number // 插入在第几个分镜之后（0 表示最前面）
}

// 时间轴作品（分镜 + 视频片段混合）
export type TimelineItem =
  | { kind: 'scene'; scene: Scene & { startTime: number }; index: number }
  | { kind: 'video'; clip: VideoClip }
