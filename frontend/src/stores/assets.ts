import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AssetType = 'character' | 'background' | 'expression' | 'prop' | 'action' | 'effect' | 'voice' | 'sound_effect' | 'video'

export type VoiceSubType = 'child_voice' | 'teen_voice' | 'youth_voice' | 'middle_voice' | 'elder_voice'

export type SoundEffectSubType = 'event_sfx' | 'character_sfx' | 'animal_sfx' | 'combat_sfx' | 'weapon_sfx' | 'atmosphere_sfx' | 'environment_sfx' | 'collision_sfx' | 'explosion_sfx'

export type VideoSubType = 'intro_video' | 'animation_video' | 'transition_video' | 'background_video' | 'effect_video'

export type AssetSubType = VoiceSubType | SoundEffectSubType | VideoSubType

export interface Asset {
  id: string
  name: string
  type: AssetType
  subType?: AssetSubType
  thumbnail: string
  mediaUrl?: string
  duration?: number // 视频/音频素材的原始时长（秒）
  tags: string[]
  createdAt: string
  listingId?: string
}

export const useAssetStore = defineStore('assets', () => {
  const assets = ref<Asset[]>([
    // Characters
    { id: 'c1', name: '熊猫侠客', type: 'character', thumbnail: '/images/char-panda.jpg', tags: ['主角', '武侠'], createdAt: '2026-05-10' },
    { id: 'c2', name: '古装少女', type: 'character', thumbnail: '/images/char-girl.jpg', tags: ['女主', '古风'], createdAt: '2026-05-08' },
    { id: 'c3', name: '老学究', type: 'character', thumbnail: '/images/char-scholar.jpg', tags: ['配角', '搞笑'], createdAt: '2026-05-06' },
    { id: 'c4', name: '白狗将军', type: 'character', thumbnail: '/images/char-dog.jpg', tags: ['配角', '萌宠'], createdAt: '2026-05-04' },
    // Backgrounds
    { id: 'b1', name: '客栈大厅', type: 'background', thumbnail: '/images/bg-inn.jpg', tags: ['室内', '古风'], createdAt: '2026-05-09' },
    { id: 'b2', name: '竹林小道', type: 'background', thumbnail: '/images/bg-bamboo.jpg', tags: ['室外', '自然'], createdAt: '2026-05-07' },
    { id: 'b3', name: '皇宫大殿', type: 'background', thumbnail: '/images/bg-palace.jpg', tags: ['室内', '宏伟'], createdAt: '2026-05-05' },
    // Expressions
    { id: 'e1', name: '开心大笑', type: 'expression', thumbnail: '/images/expr-happy.png', tags: ['正面', '夸张'], createdAt: '2026-05-10' },
    { id: 'e2', name: '生气怒吼', type: 'expression', thumbnail: '/images/expr-angry.png', tags: ['负面', '夸张'], createdAt: '2026-05-09' },
    { id: 'e3', name: '害羞脸红', type: 'expression', thumbnail: '/images/expr-shy.png', tags: ['正面', '可爱'], createdAt: '2026-05-08' },
    { id: 'e4', name: '悲伤哭泣', type: 'expression', thumbnail: '/images/expr-sad.png', tags: ['负面', '哭泣'], createdAt: '2026-05-07' },
    { id: 'e5', name: '震惊惊讶', type: 'expression', thumbnail: '/images/expr-surprised.png', tags: ['夸张', '情绪'], createdAt: '2026-05-06' },
    { id: 'e6', name: '冷漠无情', type: 'expression', thumbnail: '/images/expr-cold.png', tags: ['负面', '冷漠'], createdAt: '2026-05-05' },
    // Props
    { id: 'p1', name: '宝剑', type: 'prop', thumbnail: '/images/prop-sword.jpg', tags: ['武器', '古风'], createdAt: '2026-05-10' },
    { id: 'p2', name: '酒壶', type: 'prop', thumbnail: '/images/prop-wine.jpg', tags: ['道具', '生活'], createdAt: '2026-05-08' },
    { id: 'p3', name: '灯笼', type: 'prop', thumbnail: '/images/prop-lantern.jpg', tags: ['装饰', '节日'], createdAt: '2026-05-06' },
    // Actions (2D动画姿态)
    { id: 'a1', name: '抱臂站立', type: 'action', thumbnail: '/images/action-arms-crossed.jpg', tags: ['站姿', '日常'], createdAt: '2026-05-11' },
    { id: 'a2', name: '盘腿静坐', type: 'action', thumbnail: '/images/action-sitting.jpg', tags: ['坐姿', '日常'], createdAt: '2026-05-10' },
    { id: 'a3', name: '指向远方', type: 'action', thumbnail: '/images/action-pointing.jpg', tags: ['站姿', '互动'], createdAt: '2026-05-09' },
    { id: 'a4', name: '拔剑劈砍', type: 'action', thumbnail: '/images/action-sword-slash.jpg', tags: ['打斗', '武侠'], createdAt: '2026-05-08' },
    { id: 'a5', name: '奔跑冲刺', type: 'action', thumbnail: '/images/action-run.jpg', tags: ['跑步', '运动'], createdAt: '2026-05-07' },
    { id: 'a6', name: '掩面哭泣', type: 'action', thumbnail: '/images/action-cry.jpg', tags: ['哭泣', '情绪'], createdAt: '2026-05-06' },
    { id: 'a7', name: '怒目挥拳', type: 'action', thumbnail: '/images/action-punch.jpg', tags: ['愤怒', '打斗'], createdAt: '2026-05-05' },
    { id: 'a8', name: '悠闲行走', type: 'action', thumbnail: '/images/action-walk.jpg', tags: ['走路', '日常'], createdAt: '2026-05-04' },
    // Effects (特效贴图)
    { id: 'ef1', name: '水晶莲花绽放', type: 'effect', thumbnail: '/images/effect-crystal-lotus.jpg', tags: ['光效', '技能', '魔法'], createdAt: '2026-05-11' },
    { id: 'ef2', name: '能量旋涡光轨', type: 'effect', thumbnail: '/images/effect-energy-swirl.jpg', tags: ['光效', '技能', '能量'], createdAt: '2026-05-10' },
    { id: 'ef3', name: '符文魔法龙卷', type: 'effect', thumbnail: '/images/effect-rune-tornado.jpg', tags: ['魔法', '技能', '符文'], createdAt: '2026-05-09' },
    { id: 'ef4', name: '火焰爆裂冲击', type: 'effect', thumbnail: '/images/effect-fire-burst.jpg', tags: ['火焰', '技能', '攻击'], createdAt: '2026-05-08' },
    { id: 'ef5', name: '圣光治愈光环', type: 'effect', thumbnail: '/images/effect-holy-aura.jpg', tags: ['光效', '治愈', '辅助'], createdAt: '2026-05-07' },
    { id: 'ef6', name: '冰霜结晶碎裂', type: 'effect', thumbnail: '/images/effect-ice-crystal.jpg', tags: ['冰霜', '技能', '攻击'], createdAt: '2026-05-06' },
    { id: 'ef7', name: '雷电链锁', type: 'effect', thumbnail: '/images/effect-lightning-chain.jpg', tags: ['雷电', '技能', '攻击'], createdAt: '2026-05-05' },
    { id: 'ef8', name: '月光柔辉', type: 'effect', thumbnail: '/images/effect-moonlight.jpg', tags: ['光效', '氛围', '场景灯光'], createdAt: '2026-05-04' },
    // Voice (人物音色)
    { id: 'v1', name: '甜美童声', type: 'voice', subType: 'child_voice', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/voice-child.mp3', duration: 12, tags: ['童声', '甜美'], createdAt: '2026-05-11' },
    { id: 'v2', name: '活泼少年', type: 'voice', subType: 'teen_voice', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/voice-teen.mp3', duration: 15, tags: ['少年', '活泼'], createdAt: '2026-05-10' },
    { id: 'v3', name: '温柔青年', type: 'voice', subType: 'youth_voice', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/voice-youth.mp3', duration: 18, tags: ['青年', '温柔'], createdAt: '2026-05-09' },
    { id: 'v4', name: '沉稳中年', type: 'voice', subType: 'middle_voice', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/voice-middle.mp3', duration: 20, tags: ['中年', '沉稳'], createdAt: '2026-05-08' },
    { id: 'v5', name: '苍老长者', type: 'voice', subType: 'elder_voice', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/voice-elder.mp3', duration: 16, tags: ['老年', '沧桑'], createdAt: '2026-05-07' },
    // Sound Effects (其他音效)
    { id: 'sfx1', name: '开门声', type: 'sound_effect', subType: 'event_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-door.mp3', duration: 3, tags: ['事件', '日常'], createdAt: '2026-05-11' },
    { id: 'sfx2', name: '脚步声', type: 'sound_effect', subType: 'character_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-footstep.mp3', duration: 4, tags: ['人物', '行走'], createdAt: '2026-05-10' },
    { id: 'sfx3', name: '鸟鸣声', type: 'sound_effect', subType: 'animal_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-bird.mp3', duration: 6, tags: ['动物', '自然'], createdAt: '2026-05-09' },
    { id: 'sfx4', name: '刀剑交击', type: 'sound_effect', subType: 'combat_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-sword-clash.mp3', duration: 2, tags: ['战斗', '激烈'], createdAt: '2026-05-08' },
    { id: 'sfx5', name: '弓弦声', type: 'sound_effect', subType: 'weapon_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-bow.mp3', duration: 2, tags: ['武器', '远程'], createdAt: '2026-05-07' },
    { id: 'sfx6', name: '风声呼啸', type: 'sound_effect', subType: 'atmosphere_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-wind.mp3', duration: 10, tags: ['氛围', '风'], createdAt: '2026-05-06' },
    { id: 'sfx7', name: '雨滴落地', type: 'sound_effect', subType: 'environment_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-rain.mp3', duration: 15, tags: ['环境', '雨'], createdAt: '2026-05-05' },
    { id: 'sfx8', name: '木头碰撞', type: 'sound_effect', subType: 'collision_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-wood.mp3', duration: 1, tags: ['碰撞', '木'], createdAt: '2026-05-04' },
    { id: 'sfx9', name: '火药爆炸', type: 'sound_effect', subType: 'explosion_sfx', thumbnail: '/images/audio-cover.svg', mediaUrl: '/media/sfx-explosion.mp3', duration: 5, tags: ['爆炸', '火药'], createdAt: '2026-05-03' },
    // Video (视频素材)
    { id: 'vid1', name: '古风片头', type: 'video', subType: 'intro_video', thumbnail: '/images/video-cover.svg', mediaUrl: '/media/intro-ancient.mp4', duration: 15, tags: ['片头', '古风'], createdAt: '2026-05-11' },
    { id: 'vid2', name: '武打动画', type: 'video', subType: 'animation_video', thumbnail: '/images/video-cover.svg', mediaUrl: '/media/animation-fight.mp4', duration: 8, tags: ['动画', '武打'], createdAt: '2026-05-10' },
    { id: 'vid3', name: '场景过渡', type: 'video', subType: 'transition_video', thumbnail: '/images/video-cover.svg', mediaUrl: '/media/transition-fade.mp4', duration: 5, tags: ['过场', '转换'], createdAt: '2026-05-09' },
    { id: 'vid4', name: '竹林风景', type: 'video', subType: 'background_video', thumbnail: '/images/video-cover.svg', mediaUrl: '/media/bg-bamboo.mp4', duration: 20, tags: ['背景', '自然'], createdAt: '2026-05-08' },
    { id: 'vid5', name: '爆炸特效', type: 'video', subType: 'effect_video', thumbnail: '/images/video-cover.svg', mediaUrl: '/media/effect-explosion.mp4', duration: 4, tags: ['特效', '爆炸'], createdAt: '2026-05-07' },
  ])

  const searchQuery = ref('')
  const activeFilter = ref<AssetType | 'all'>('all')
  const activeSubFilter = ref<AssetSubType | 'all'>('all')

  function addAsset(asset: Omit<Asset, 'id' | 'createdAt'>) {
    assets.value.unshift({
      ...asset,
      id: `asset-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    })
  }

  function deleteAsset(id: string) {
    const asset = assets.value.find(a => a.id === id)
    if (asset?.listingId) return false
    assets.value = assets.value.filter(a => a.id !== id)
    return true
  }

  function getFilteredAssets() {
    let filtered = assets.value
    if (activeFilter.value !== 'all') {
      filtered = filtered.filter(a => a.type === activeFilter.value)
    }
    if (activeSubFilter.value !== 'all') {
      filtered = filtered.filter(a => a.subType === activeSubFilter.value)
    }
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.tags.some(t => t.toLowerCase().includes(query))
      )
    }
    return filtered
  }

  return {
    assets,
    searchQuery,
    activeFilter,
    activeSubFilter,
    addAsset,
    deleteAsset,
    getFilteredAssets,
  }
})
