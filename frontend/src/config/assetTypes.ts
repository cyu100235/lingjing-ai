import type { AssetType, AssetSubType } from '@/stores/assets'
import type { Component, ComputedRef } from 'vue'

export interface SubTypeOption {
  value: AssetSubType
  label: string
}

export interface CategoryFilterItem {
  value: AssetType | 'all'
  label: string
  icon: Component | string
  count?: ComputedRef<number>
  children?: SubTypeOption[]
  childCounts?: Record<string, ComputedRef<number>>
}

const SUB_TYPE_MAP: Partial<Record<AssetType, SubTypeOption[]>> = {
  voice: [
    { value: 'child_voice', label: '儿童音色' },
    { value: 'teen_voice', label: '少年音色' },
    { value: 'youth_voice', label: '青年音色' },
    { value: 'middle_voice', label: '中年音色' },
    { value: 'elder_voice', label: '老年音色' },
  ],
  sound_effect: [
    { value: 'event_sfx', label: '事件音效' },
    { value: 'character_sfx', label: '人物音效' },
    { value: 'animal_sfx', label: '动物音效' },
    { value: 'combat_sfx', label: '战斗音效' },
    { value: 'weapon_sfx', label: '武器音效' },
    { value: 'atmosphere_sfx', label: '氛围音效' },
    { value: 'environment_sfx', label: '环境音效' },
    { value: 'collision_sfx', label: '碰撞音效' },
    { value: 'explosion_sfx', label: '爆炸音效' },
  ],
  video: [
    { value: 'intro_video', label: '片头视频' },
    { value: 'animation_video', label: '动画视频' },
    { value: 'transition_video', label: '过场视频' },
    { value: 'background_video', label: '背景视频' },
    { value: 'effect_video', label: '特效视频' },
  ],
}

export function getSubTypes(type: AssetType): SubTypeOption[] {
  return SUB_TYPE_MAP[type] || []
}

export function hasSubTypes(type: AssetType): boolean {
  return !!SUB_TYPE_MAP[type]
}

const TYPE_LABELS: Record<AssetType, string> = {
  character: '人物角色',
  background: '场景图片',
  expression: '人物表情',
  prop: '物品道具',
  action: '人物动作',
  effect: '特效贴图',
  voice: '人物音色',
  sound_effect: '其他音效',
  video: '视频素材',
}

export function getTypeLabel(type: AssetType): string {
  return TYPE_LABELS[type]
}
