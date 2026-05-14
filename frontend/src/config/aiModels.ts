import type { AssetType } from '@/stores/assets'

export interface AiModel {
  id: string
  name: string
  description: string
  badge?: string
  badgeType?: 'success' | 'hot' | 'value'
  iconColor: string
  iconText: string
  cost: number
}

export type AssetCategory = 'image' | 'audio' | 'video'

const IMAGE_MODELS: AiModel[] = [
  { id: 'tongyi-wanxiang', name: '通义万象Pro', description: '擅长中式风格，画面质感出众', badge: '效果最好', badgeType: 'success', iconColor: '#f97316', iconText: '通', cost: 8 },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', description: '开源模型，风格多样，社区生态丰富', iconColor: '#8b5cf6', iconText: 'SD', cost: 3 },
  { id: 'midjourney-v6', name: 'MidJourney V6', description: '高质量艺术风格，细节精致', badge: '近期热门', badgeType: 'hot', iconColor: '#3b82f6', iconText: 'MJ', cost: 10 },
  { id: 'dall-e-3', name: 'DALL-E 3', description: '语义理解精准，构图能力强', iconColor: '#10b981', iconText: 'DE', cost: 6 },
]

const AUDIO_MODELS: AiModel[] = [
  { id: 'cosyvoice', name: 'CosyVoice', description: '多音色支持，情感自然', badge: '效果最好', badgeType: 'success', iconColor: '#f97316', iconText: 'CV', cost: 5 },
  { id: 'chattts', name: 'ChatTTS', description: '高自然度语音合成，情感表达丰富', badge: '近期热门', badgeType: 'hot', iconColor: '#8b5cf6', iconText: 'CT', cost: 4 },
  { id: 'fish-audio', name: 'Fish Audio', description: '快速语音克隆与合成', iconColor: '#3b82f6', iconText: 'FA', cost: 6 },
  { id: 'bark', name: 'Bark', description: '多语言语音生成，支持音效合成', badge: '性价比高', badgeType: 'value', iconColor: '#10b981', iconText: 'BK', cost: 2 },
]

const VIDEO_MODELS: AiModel[] = [
  { id: 'tongyi-video', name: '通义视频生成', description: '中式场景优化，画面稳定', iconColor: '#f97316', iconText: '通', cost: 15 },
  { id: 'kling-v2', name: '可灵 V2', description: '动态效果出色，运动一致性强', badge: '效果最好', badgeType: 'success', iconColor: '#8b5cf6', iconText: '可', cost: 20 },
  { id: 'runway-gen3', name: 'Runway Gen-3', description: '专业级AI视频生成，画质顶尖', badge: '近期热门', badgeType: 'hot', iconColor: '#3b82f6', iconText: 'RW', cost: 25 },
  { id: 'pika-v2', name: 'Pika V2', description: '高质量短视频生成，风格化强', badge: '性价比高', badgeType: 'value', iconColor: '#10b981', iconText: 'PK', cost: 12 },
]

const CATEGORY_MODELS: Record<AssetCategory, AiModel[]> = {
  image: IMAGE_MODELS,
  audio: AUDIO_MODELS,
  video: VIDEO_MODELS,
}

const TYPE_CATEGORY_MAP: Record<AssetType, AssetCategory> = {
  character: 'image',
  background: 'image',
  expression: 'image',
  prop: 'image',
  action: 'image',
  effect: 'image',
  voice: 'audio',
  sound_effect: 'audio',
  video: 'video',
}

export function getAssetCategory(type: AssetType): AssetCategory {
  return TYPE_CATEGORY_MAP[type]
}

export function getModelsForType(type: AssetType): AiModel[] {
  return CATEGORY_MODELS[TYPE_CATEGORY_MAP[type]]
}

export function getDefaultModel(type: AssetType): string {
  const models = getModelsForType(type)
  return models.length > 0 ? models[0].id : ''
}
