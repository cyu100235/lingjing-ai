import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AspectRatio = '16:9' | '9:16'

export interface Works {
  id: string
  title: string
  cover: string
  updatedAt: string
  episodes: number
  status: 'draft' | 'published'
  aspectRatio: AspectRatio
}

export interface Episode {
  id: string
  worksId: string
  title: string
  cover: string
  order: number
  scenes: Scene[]
}

export interface Scene {
  id: string
  title: string
  background: string
  characters: string[]
  expressions: string[]
  actions: string[]
  props: string[]
  effects: string[]
  action: string
  cameraLang: string
  narration: string
  dialogue: string
  duration: number
  videoUrl?: string
}

export const useWorksStore = defineStore('works', () => {
  const works = ref<Works[]>([
    {
      id: '1',
      title: '穷神来了',
      cover: '/images/cover-1.jpg',
      updatedAt: '2026-05-12 18:15',
      episodes: 31,
      status: 'published',
      aspectRatio: '16:9',
    },
    {
      id: '2',
      title: '江湖奇谈',
      cover: '/images/cover-2.jpg',
      updatedAt: '2026-05-02 05:19',
      episodes: 12,
      status: 'draft',
      aspectRatio: '16:9',
    },
    {
      id: '3',
      title: '熊猫大侠',
      cover: '/images/cover-3.jpg',
      updatedAt: '2026-05-02 05:19',
      episodes: 8,
      status: 'published',
      aspectRatio: '9:16',
    },
    {
      id: '4',
      title: '古风茶话',
      cover: '/images/cover-4.jpg',
      updatedAt: '2026-04-28 00:40',
      episodes: 5,
      status: 'draft',
      aspectRatio: '16:9',
    },
    {
      id: '5',
      title: '仙侠传说',
      cover: '/images/cover-5.jpg',
      updatedAt: '2026-04-28 00:22',
      episodes: 15,
      status: 'published',
      aspectRatio: '9:16',
    },
    {
      id: '6',
      title: '萌宠日记',
      cover: '/images/cover-6.jpg',
      updatedAt: '2026-04-27 19:32',
      episodes: 3,
      status: 'draft',
      aspectRatio: '16:9',
    },
  ])

  const currentWorks = ref<Works | null>(null)
  const episodes = ref<Episode[]>([])

  function addWorks(title: string, aspectRatio: AspectRatio = '16:9') {
    const newWorks: Works = {
      id: Date.now().toString(),
      title,
      cover: '/images/cover-default.jpg',
      updatedAt: new Date().toLocaleString('zh-CN'),
      episodes: 0,
      status: 'draft',
      aspectRatio,
    }
    works.value.unshift(newWorks)
    return newWorks
  }

  function deleteWorks(id: string) {
    works.value = works.value.filter(p => p.id !== id)
  }

  function updateWorks(id: string, updates: Partial<Works>) {
    const index = works.value.findIndex(p => p.id === id)
    if (index !== -1) {
      works.value[index] = { ...works.value[index], ...updates }
    }
  }

  function setCurrentWorks(id: string) {
    currentWorks.value = works.value.find(p => p.id === id) || null
    if (currentWorks.value) {
      loadEpisodes(id)
    }
  }

  function loadEpisodes(worksId: string) {
    const covers = ['/images/cover-1.jpg', '/images/cover-2.jpg', '/images/cover-3.jpg', '/images/cover-4.jpg', '/images/cover-5.jpg']
    // Mock episodes data
    episodes.value = Array.from({ length: 5 }, (_, i) => ({
      id: `ep-${i + 1}`,
      worksId,
      title: `第${i + 1}集`,
      cover: covers[i % covers.length],
      order: i + 1,
      scenes: [],
    }))
  }

  function addEpisode(worksId: string) {
    const newEp: Episode = {
      id: `ep-${Date.now()}`,
      worksId,
      title: `第${episodes.value.length + 1}集`,
      cover: '/images/cover-default.jpg',
      order: episodes.value.length + 1,
      scenes: [],
    }
    episodes.value.push(newEp)
  }

  function addScene(episodeIndex: number) {
    const episode = episodes.value[episodeIndex]
    if (!episode) return
    const sceneCount = episode.scenes.length
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      title: `分镜${sceneCount + 1}`,
      background: '',
      characters: [],
      expressions: [],
      actions: [],
      props: [],
      effects: [],
      action: '',
      cameraLang: '',
      narration: '',
      dialogue: '',
      duration: 5,
    }
    episode.scenes.push(newScene)
  }

  function addScenesBatch(episodeIndex: number, scenes: Omit<Scene, 'id'>[]) {
    const episode = episodes.value[episodeIndex]
    if (!episode) return
    scenes.forEach((scene) => {
      const newScene: Scene = {
        ...scene,
        id: `scene-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }
      episode.scenes.push(newScene)
    })
  }

  function reorderScene(episodeIndex: number, fromIndex: number, toIndex: number) {
    const episode = episodes.value[episodeIndex]
    if (!episode) return
    const scenes = episode.scenes
    if (fromIndex < 0 || fromIndex >= scenes.length || toIndex < 0 || toIndex >= scenes.length) return
    if (fromIndex === toIndex) return
    const [moved] = scenes.splice(fromIndex, 1)
    scenes.splice(toIndex, 0, moved)
  }

  function deleteScene(episodeIndex: number, sceneIndex: number) {
    const episode = episodes.value[episodeIndex]
    if (!episode) return
    if (sceneIndex < 0 || sceneIndex >= episode.scenes.length) return
    episode.scenes.splice(sceneIndex, 1)
  }

  function updateEpisode(id: string, updates: Partial<Episode>) {
    const index = episodes.value.findIndex(ep => ep.id === id)
    if (index !== -1) {
      episodes.value[index] = { ...episodes.value[index], ...updates }
    }
  }

  return {
    works,
    currentWorks,
    episodes,
    addWorks,
    deleteWorks,
    updateWorks,
    setCurrentWorks,
    addEpisode,
    updateEpisode,
    addScene,
    addScenesBatch,
    reorderScene,
    deleteScene,
  }
})
