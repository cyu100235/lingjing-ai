<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'

const route = useRoute()
// 右侧缩略图滚动容器（draggable 组件实例）
const thumbnailsScrollRef = ref<any>(null)

function scrollThumbnailsToBottom() {
  nextTick(() => {
    const el = thumbnailsScrollRef.value?.$el as HTMLElement | undefined
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  })
}

function onDragEnd() {
  nextTick(() => {
    selectGroup(activeGroupIndex.value)
  })
}

// 当前选中的镜头组
const activeGroupIndex = ref(0)
// 展开的镜头索引集合
const expandedShots = ref<Set<number>>(new Set([0, 1, 2]))

interface Shot {
  id: string
  name: string
  description: string
  dialogue?: string
  shotSize: string
  cameraAngle: string
  cameraMove: string
  image: string
}

interface ShotGroup {
  id: string
  name: string
  shotCount: number
  duration: string
  staging: string
  shots: Shot[]
  thumbnail: string
  videoUrl: string
}

const shotGroups = ref<ShotGroup[]>([
  {
    id: '1',
    name: '测试失败',
    shotCount: 3,
    duration: '12',
    staging: '空间：青云宗测灵台。轴线：林默与赵执事一前一后。走位：林默独自站在测灵碑前 -> 赵执事从高台俯视指责 -> 林默保持静止承受评判。',
    thumbnail: '/vibe_images/bg-palace_1778629654.png',
    videoUrl: '',
    shots: [
      {
        id: 's1',
        name: '镜头1',
        description: '清晨薄雾笼罩着青云宗测灵台，巨大的石台上，测灵碑暗淡无光。林默小小的身影站在碑前，显得孤立无援。周围云海翻腾，远处隐约可见众多弟子身影。',
        shotSize: '全景',
        cameraAngle: '俯视',
        cameraMove: '缓拉',
        image: '/vibe_images/bg-palace_1778629654.png',
      },
      {
        id: 's2',
        name: '镜头2',
        description: '林默缓缓将手从粗糙的测灵碑表面收回。他平静无波的眼神中，瞳孔倒映着灰白色的石碑纹理，没有任何情绪波动。',
        shotSize: '特写',
        cameraAngle: '平视',
        cameraMove: '固定机位',
        image: '/vibe_images/char-scholar_1778629674.png',
      },
      {
        id: 's3',
        name: '镜头3',
        description: '赵执事站在高处的台阶上，身体前倾，居高临下地俯视着林默。他嘴角挂着傲慢的冷笑，手指指向下方。',
        dialogue: '@赵执事：灵根全无，凡骨俗胎。下山去吧。',
        shotSize: '中景',
        cameraAngle: '仰视',
        cameraMove: '固定机位',
        image: '/vibe_images/char-girl_1778629604.png',
      },
    ],
  },
  {
    id: '2',
    name: '初遇师姐',
    shotCount: 2,
    duration: '8',
    staging: '空间：青云宗后山竹林。轴线：苏清歌与林默相对而立。走位：苏清歌从竹林深处走出 -> 林默转身注视 -> 二人相距三步对峙。',
    thumbnail: '/vibe_images/bg-bamboo_1778629636.png',
    videoUrl: '',
    shots: [
      {
        id: 's4',
        name: '镜头1',
        description: '竹林深处，晨光透过竹叶洒下斑驳光影。苏清歌白衣飘飘，手持莲台法器，从雾气中缓缓走出。',
        shotSize: '全景',
        cameraAngle: '平视',
        cameraMove: '推镜',
        image: '/vibe_images/bg-bamboo_1778629636.png',
      },
      {
        id: 's5',
        name: '镜头2',
        description: '林默转身，目光沉稳地注视着眼前的女子。他虽未言语，但眼神中透出一丝警惕与好奇。',
        shotSize: '特写',
        cameraAngle: '平视',
        cameraMove: '固定机位',
        image: '/vibe_images/char-scholar_1778629674.png',
      },
    ],
  },
  {
    id: '3', name: '灵根觉醒', shotCount: 4, duration: '15',
    staging: '空间：测灵台。轴线：林默与测灵碑。走位：林默触摸测灵碑 -> 碑身发光 -> 灵气涌入体内。',
    thumbnail: '/vibe_images/effect-energy-swirl_1778652982.png',
    videoUrl: '',
    shots: [],
  },
  {
    id: '4', name: '宗门审判', shotCount: 3, duration: '10',
    staging: '空间：宗门大殿。轴线：审判席与被告席。走位：众长老落座 -> 林默被押入 -> 审判开始。',
    thumbnail: '/vibe_images/bg-inn_1778629624.png',
    videoUrl: '',
    shots: [],
  },
  {
    id: '5', name: '深夜修炼', shotCount: 2, duration: '6',
    staging: '空间：破旧柴房。轴线：林默与窗外月光。走位：盘坐修炼 -> 灵气汇聚 -> 突破征兆。',
    thumbnail: '/vibe_images/effect-moonlight_1778653080.png',
    videoUrl: '',
    shots: [],
  },
  {
    id: '6', name: '比试开场', shotCount: 3, duration: '9',
    staging: '空间：演武场。轴线：对战双方。走位：双方入场 -> 行礼 -> 摆开架势。',
    thumbnail: '/vibe_images/action-sword-slash_1778653165.png',
    videoUrl: '',
    shots: [],
  },
  {
    id: '7', name: '意外转折', shotCount: 2, duration: '7',
    staging: '空间：后山断崖。轴线：林默与追击者。走位：被逼至崖边 -> 纵身一跃 -> 落入迷雾。',
    thumbnail: '/vibe_images/effect-rune-tornado_1778652993.png',
    videoUrl: '',
    shots: [],
  },
  {
    id: '8', name: '真相浮现', shotCount: 3, duration: '11',
    staging: '空间：秘境洞府。轴线：林默与上古残魂。走位：触发机关 -> 进入洞府 -> 获得传承。',
    thumbnail: '/vibe_images/effect-crystal-lotus_1778652970.png',
    videoUrl: '',
    shots: [],
  },
])

const activeGroup = computed(() => shotGroups.value[activeGroupIndex.value] ?? {
  id: '',
  name: '',
  shotCount: 0,
  duration: '',
  staging: '',
  thumbnail: '',
  videoUrl: '',
  shots: [],
})

// 脚本内容数据
const scriptContent = ref(`[0s-4s]（缓拉全景）清晨薄雾弥漫的@青云宗测灵台上，云海翻腾，巨大的@测灵碑暗淡无光。@林默身穿青色宽袖长袍，独自站在碑前，身影渺小却笔直，四周空旷，远处隐约有弟子观望。
[4s-7s]（固定特写）@林默缓缓收回按在@测灵碑上的手，指尖离开粗糙石面，眼神平静如深潭，瞳孔中倒映着灰白碑文，毫无波澜。
[7s-12s]（仰视中景）高处台阶上，@赵执事灰袍金饰，身体前倾，居高临下俯视@林默，嘴角挂着傲慢冷笑，右手食指直指下方，厉声喝道："灵根全无，凡骨俗胎。下山去吧。"`)

function toggleShot(index: number) {
  if (expandedShots.value.has(index)) {
    expandedShots.value.delete(index)
  } else {
    expandedShots.value.add(index)
  }
}

function selectGroup(index: number) {
  activeGroupIndex.value = index
  // 默认展开前三个镜头
  const group = shotGroups.value[index]
  if (!group) return
  const toExpand = new Set<number>()
  group.shots.forEach((_, i) => { if (i < 3) toExpand.add(i) })
  expandedShots.value = toExpand
}

function expandAll() {
  const newSet = new Set<number>()
  activeGroup.value.shots.forEach((_, i) => newSet.add(i))
  expandedShots.value = newSet
}

function collapseAll() {
  expandedShots.value.clear()
}

function copyGroup() {
  const current = shotGroups.value[activeGroupIndex.value]
  const copied: ShotGroup = {
    ...JSON.parse(JSON.stringify(current)),
    id: String(Date.now()),
    name: `${current.name} 副本`,
  }
  shotGroups.value.splice(activeGroupIndex.value + 1, 0, copied)
  selectGroup(activeGroupIndex.value + 1)
  scrollThumbnailsToBottom()
}

function addGroup() {
  const newIndex = shotGroups.value.length + 1
  shotGroups.value.push({
    id: String(Date.now()),
    name: `镜头组${newIndex}`,
    shotCount: 0,
    duration: '0',
    staging: '',
    thumbnail: '',
    videoUrl: '',
    shots: [],
  })
  selectGroup(shotGroups.value.length - 1)
  scrollThumbnailsToBottom()
}

// 删除确认弹窗
const showDeleteConfirm = ref(false)
const showLastGroupTip = ref(false)

function confirmDelete() {
  if (shotGroups.value.length <= 1) {
    showLastGroupTip.value = true
    return
  }
  showDeleteConfirm.value = true
}

function handleDeleteConfirm() {
  shotGroups.value.splice(activeGroupIndex.value, 1)
  if (shotGroups.value.length === 0) {
    activeGroupIndex.value = 0
  } else if (activeGroupIndex.value >= shotGroups.value.length) {
    activeGroupIndex.value = shotGroups.value.length - 1
  }
  showDeleteConfirm.value = false
}

// 编辑弹窗
const isEditing = ref(false)

const shotSizeOptions = ['全景', '远景', '中景', '近景', '特写']
const cameraAngleOptions = ['平视', '俯视', '仰视']
const cameraMoveOptions = ['固定机位', '推镜', '拉镜', '摇镜', '缓拉', '跟拍']
const characterOptions = ['林默', '赵执事', '苏清歌', '长老', '旁白']

// @ Mention functionality
const mentionState = reactive({ show: false, query: '', startIndex: -1, currentShot: null as Shot | null })
const mentionActiveIndex = ref(0)

const filteredCharacters = computed(() => {
  if (!mentionState.query) return characterOptions
  return characterOptions.filter(c => c.includes(mentionState.query))
})

function onDialogueInput(shot: Shot, event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  const cursorPos = textarea.selectionStart
  const text = shot.dialogue || ''
  const textBeforeCursor = text.substring(0, cursorPos)
  const atMatch = textBeforeCursor.match(/@([^@\s：]*)$/)
  if (atMatch) {
    mentionState.query = atMatch[1]
    mentionState.startIndex = cursorPos - atMatch[0].length
    mentionState.show = true
    mentionState.currentShot = shot
    mentionActiveIndex.value = 0
  } else {
    mentionState.show = false
  }
}

function onDialogueKeydown(event: KeyboardEvent) {
  if (!mentionState.show || !filteredCharacters.value.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    mentionActiveIndex.value = (mentionActiveIndex.value + 1) % filteredCharacters.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    mentionActiveIndex.value = (mentionActiveIndex.value - 1 + filteredCharacters.value.length) % filteredCharacters.value.length
  } else if (event.key === 'Enter') {
    event.preventDefault()
    if (mentionState.currentShot) {
      selectMention(mentionState.currentShot, filteredCharacters.value[mentionActiveIndex.value])
    }
  } else if (event.key === 'Escape') {
    mentionState.show = false
  }
}

function selectMention(shot: Shot, character: string) {
  if (mentionState.startIndex < 0) return
  const text = shot.dialogue || ''
  const queryLen = mentionState.query.length + 1 // +1 for @
  const before = text.substring(0, mentionState.startIndex)
  const after = text.substring(mentionState.startIndex + queryLen)
  shot.dialogue = `${before}@${character}：${after}`
  mentionState.show = false
  nextTick(() => {
    const newPos = mentionState.startIndex + character.length + 2 // @ + name + ：
    const textarea = document.activeElement as HTMLTextAreaElement
    textarea?.setSelectionRange(newPos, newPos)
  })
}

function toggleEdit() {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    expandAll()
  }
}

function addShotToGroup() {
  const group = shotGroups.value[activeGroupIndex.value]
  if (!group) return
  group.shots.push({
    id: `s${Date.now()}`,
    name: `镜头${group.shots.length + 1}`,
    description: '',
    shotSize: '全景',
    cameraAngle: '平视',
    cameraMove: '固定机位',
    image: '',
  })
  group.shotCount = group.shots.length
  nextTick(() => {
    expandedShots.value.add(group.shots.length - 1)
  })
}

function removeShotFromGroup(index: number) {
  const group = shotGroups.value[activeGroupIndex.value]
  if (!group) return
  group.shots.splice(index, 1)
  group.shotCount = group.shots.length
  expandedShots.value.delete(index)
}

const router = useRouter()
const isSubmitting = ref(false)

async function handleComposite() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    // TODO: 对接后端 API — 发送合成任务
    // const res = await fetch('/api/composite', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ shotGroups: shotGroups.value }),
    // })
    // const data = await res.json()
    // const taskId = data.taskId

    // 占位：模拟获取任务ID
    const taskId = `task_${Date.now()}`

    router.push({
      name: 'generate',
      query: { taskId, work_id: route.query.work_id as string },
    })
  } catch {
    // TODO: 错误处理
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-7.5rem)] overflow-hidden">
    <div class="flex-1 min-h-0 grid grid-cols-[420px_1fr_5rem] gap-4 overflow-hidden pt-2">
      <!-- Left: Shot Group List -->
      <div class="w-[420px] flex flex-col gap-3 min-h-0">
        <!-- Group Header -->
        <div class="card-base p-4 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <template v-if="!isEditing">
                <h3 class="text-sm font-semibold text-content">镜头组{{ activeGroupIndex + 1 }}：{{ activeGroup.name }}</h3>
                <span class="badge-brand px-1.5 py-0.5 text-[10px]">分镜数量{{ activeGroup.shotCount }}</span>
              </template>
              <template v-else>
                <input v-model="activeGroup.name" class="input-base text-sm font-semibold flex-1" placeholder="镜头组名称" />
              </template>
            </div>
            <button class="flex items-center gap-1 text-xs transition-colors" :class="isEditing ? 'text-brand' : 'text-brand hover:text-brand-light'" @click="toggleEdit">
              <XbIcon :name="isEditing ? 'check' : 'pencil'" :size="12" />
              {{ isEditing ? '完成' : '编辑' }}
            </button>
          </div>
          <template v-if="!isEditing">
            <div class="text-sm text-content-secondary">镜头组时长：{{ activeGroup.duration }}s</div>
            <p class="text-sm text-content-secondary leading-relaxed">场面调度：{{ activeGroup.staging }}</p>
          </template>
          <template v-else>
            <div class="flex items-center gap-2">
              <span class="text-xs text-content-tertiary shrink-0">时长</span>
              <input v-model="activeGroup.duration" class="input-base text-sm w-20" placeholder="如 12" />
              <span class="text-xs text-content-tertiary">秒</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-content-tertiary">场面调度</span>
              <textarea v-model="activeGroup.staging" class="input-base text-sm resize-none" rows="4" placeholder="空间、轴线、走位描述" />
            </div>
          </template>
        </div>

        <!-- Expand/Collapse Controls -->
        <div class="flex items-center justify-between gap-2 px-1">
          <template v-if="isEditing">
            <button class="flex items-center gap-1 text-xs text-brand hover:text-brand-light transition-colors" @click="addShotToGroup">
              <XbIcon name="plus" :size="12" />
              添加镜头
            </button>
          </template>
          <template v-else>
            <div></div>
          </template>
          <div class="flex items-center gap-2">
            <button class="text-[11px] text-content-tertiary hover:text-content-secondary transition-colors" @click="expandAll">
              全部展开
            </button>
            <span class="text-content-tertiary">|</span>
            <button class="text-[11px] text-content-tertiary hover:text-content-secondary transition-colors" @click="collapseAll">
              全部收起
            </button>
          </div>
        </div>

        <!-- Shots List (View Mode) -->
        <div v-if="!isEditing" class="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 py-2 -my-2">
          <div
            v-for="(shot, index) in activeGroup.shots"
            :key="shot.id"
            class="card-base transition-shadow hover:shadow-[0_0_0_1px_hsl(var(--brand)/0.3),0_4px_16px_hsl(var(--brand)/0.1)] hover:border-[hsl(var(--brand)/0.5)]"
          >
            <!-- Shot Header -->
            <div
              class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface-overlay/30 transition-colors"
              @click="toggleShot(index)"
            >
              <div class="flex items-center gap-2">
                <XbIcon
                  name="chevron-down"
                  :size="14"
                  class="text-content-tertiary transition-transform"
                  :class="{ '-rotate-90': !expandedShots.has(index) }"
                />
                <span class="text-sm font-medium text-content">{{ shot.name }}</span>
              </div>
            </div>

            <!-- Shot Detail -->
            <div v-if="expandedShots.has(index)" class="px-3 pb-3 flex flex-col gap-2">
              <div class="flex flex-col gap-1">
                <span class="text-xs text-content-tertiary font-medium">画面描述</span>
                <p class="text-sm text-content-secondary leading-relaxed">{{ shot.description }}</p>
              </div>
              <div v-if="shot.dialogue" class="flex flex-col gap-1">
                <span class="text-xs text-content-tertiary font-medium">台词旁白</span>
                <p class="text-sm text-content-secondary leading-relaxed">{{ shot.dialogue }}</p>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-overlay/50">
                  <span class="text-xs text-content-tertiary">景别：</span>
                  <span class="text-xs text-content font-medium">{{ shot.shotSize }}</span>
                </div>
                <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-overlay/50">
                  <span class="text-xs text-content-tertiary">摄像机角度：</span>
                  <span class="text-xs text-content font-medium">{{ shot.cameraAngle }}</span>
                </div>
                <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-overlay/50">
                  <span class="text-xs text-content-tertiary">运镜：</span>
                  <span class="text-xs text-content font-medium">{{ shot.cameraMove }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeGroup.shots.length === 0" class="card-base p-6 flex flex-col items-center justify-center gap-2 min-h-[200px]">
            <XbIcon name="image-off" :size="24" class="text-content-tertiary" />
            <span class="text-sm text-content-tertiary">暂无分镜数据</span>
          </div>
        </div>

        <!-- Shots List (Edit Mode) -->
        <div v-else class="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 py-2 -my-2">
          <draggable
            v-model="activeGroup.shots"
            item-key="id"
            class="flex flex-col gap-2"
            ghost-class="opacity-30"
            :animation="200"
            handle=".drag-handle"
          >
            <template #item="{ element: shot, index }">
              <div class="card-base flex flex-col gap-2">
                <div class="flex items-center justify-between px-3 py-2">
                  <div class="flex items-center gap-2">
                    <span class="drag-handle cursor-grab active:cursor-grabbing text-content-tertiary hover:text-content transition-colors">
                      <XbIcon name="grip-vertical" :size="14" />
                    </span>
                    <input v-model="shot.name" class="input-base text-sm w-28" placeholder="镜头名称" />
                  </div>
                  <button class="text-content-tertiary hover:text-danger transition-colors" @click="removeShotFromGroup(index)">
                    <XbIcon name="trash-2" :size="14" />
                  </button>
                </div>
                <div class="px-3 pb-3 flex flex-col gap-2">
                  <div class="flex flex-col gap-1">
                    <span class="text-xs text-content-tertiary">画面描述</span>
                    <textarea v-model="shot.description" class="input-base text-sm resize-none" rows="4" placeholder="描述画面内容" />
                  </div>
                  <div class="flex flex-col gap-1 relative">
                    <span class="text-xs text-content-tertiary">台词旁白</span>
                    <textarea v-model="shot.dialogue" class="input-base text-sm resize-none" rows="4" placeholder="输入@选择角色，如 @林默：..." @input="onDialogueInput(shot, $event)" @keydown="onDialogueKeydown($event)" />
                    <!-- @ Mention Popup -->
                    <div v-if="mentionState.show && filteredCharacters.length" class="absolute left-0 bottom-full mb-1 bg-surface border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                      <button
                        v-for="(char, ci) in filteredCharacters"
                        :key="char"
                        class="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-overlay/50 transition-colors"
                        :class="{ 'bg-surface-overlay/50': ci === mentionActiveIndex }"
                        @click="selectMention(shot, char)"
                        @mouseenter="mentionActiveIndex = ci"
                      >
                        @{{ char }}
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="flex flex-col gap-1 flex-1">
                      <span class="text-xs text-content-tertiary">景别</span>
                      <select v-model="shot.shotSize" class="input-base text-sm">
                        <option v-for="opt in shotSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                    </div>
                    <div class="flex flex-col gap-1 flex-1">
                      <span class="text-xs text-content-tertiary">摄像机角度</span>
                      <select v-model="shot.cameraAngle" class="input-base text-sm">
                        <option v-for="opt in cameraAngleOptions" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                    </div>
                    <div class="flex flex-col gap-1 flex-1">
                      <span class="text-xs text-content-tertiary">运镜</span>
                      <select v-model="shot.cameraMove" class="input-base text-sm">
                        <option v-for="opt in cameraMoveOptions" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </draggable>

          <div v-if="activeGroup.shots.length === 0" class="card-base p-6 flex flex-col items-center justify-center gap-2 min-h-[200px]">
            <XbIcon name="image-off" :size="24" class="text-content-tertiary" />
            <span class="text-sm text-content-tertiary">暂无分镜，点击上方添加</span>
          </div>
        </div>
      </div>

      <!-- Center: Script -->
      <div class="flex-1 flex flex-col gap-3 min-w-0 min-h-0 overflow-x-hidden py-2 -my-2">
        <!-- Script Area -->
        <div class="card-base p-4 flex flex-col gap-2 flex-1 min-h-0 transition-shadow hover:shadow-[0_0_0_1px_hsl(var(--brand)/0.3),0_4px_16px_hsl(var(--brand)/0.1)] hover:border-[hsl(var(--brand)/0.5)]">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-content">脚本</span>
            <div class="flex items-center gap-2">
              <XbButton type="secondary">
                <template #icon><XbIcon name="wand-2" :size="14" /></template>
                创作视频
              </XbButton>
              <XbButton type="secondary">
                <template #icon><XbIcon name="play-circle" :size="14" /></template>
                预览视频
              </XbButton>
            </div>
          </div>
          <textarea
            v-model="scriptContent"
            class="flex-1 w-full resize-none input-base text-xs leading-relaxed focus:border-border focus:shadow-none focus:ring-0"
            placeholder="输入脚本内容..."
          />
        </div>
      </div>

      <!-- Right: Group Thumbnails -->
      <draggable
        ref="thumbnailsScrollRef"
        v-model="shotGroups"
        item-key="id"
        class="min-h-0 overflow-y-auto flex flex-col gap-2"
        ghost-class="opacity-30"
        :animation="200"
        @end="onDragEnd"
      >
        <template #item="{ element, index }">
          <div
            class="relative aspect-square shrink-0 rounded-lg border-2 cursor-grab overflow-hidden transition-all active:cursor-grabbing"
            :class="activeGroupIndex === index ? 'border-brand' : 'border-transparent hover:border-border'"
            @click="selectGroup(index)"
          >
            <img v-if="element.thumbnail" :src="element.thumbnail" class="w-full h-full object-cover" :alt="element.name" />
            <div v-else class="w-full h-full bg-surface-overlay/40 flex items-center justify-center">
              <XbIcon name="image-off" :size="18" class="text-content-tertiary/60" />
            </div>
            <!-- Group Name -->
            <div class="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5 text-center">
              <span class="text-xs text-white font-medium leading-tight truncate">镜头组{{ index + 1 }}</span>
            </div>
            <!-- Checked indicator -->
            <div
              v-if="activeGroupIndex === index"
              class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-brand flex items-center justify-center"
            >
              <XbIcon name="check" :size="10" class="text-white" />
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Bottom Toolbar -->
    <div class="flex items-center justify-between mt-4 pt-4 border-t border-border">
      <!-- Left: Group Actions -->
      <div class="flex items-center gap-2">
        <button class="w-8 h-8 rounded-lg bg-surface-overlay/50 flex items-center justify-center text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors" title="添加镜头组" @click="addGroup">
          <XbIcon name="plus" :size="14" />
        </button>
        <button class="w-8 h-8 rounded-lg bg-surface-overlay/50 flex items-center justify-center text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors" title="复制" @click="copyGroup">
          <XbIcon name="copy" :size="14" />
        </button>
        <button class="w-8 h-8 rounded-lg bg-surface-overlay/50 flex items-center justify-center text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors" title="删除" @click="confirmDelete">
          <XbIcon name="trash-2" :size="14" />
        </button>
      </div>

      <!-- Right: Batch Actions -->
      <div class="flex items-center gap-3">
        <XbButton type="secondary">
          <template #icon><XbIcon name="video" :size="12" /></template>
          批量生成视频
        </XbButton>
        <XbButton type="secondary">
          <template #icon><XbIcon name="volume-2" :size="12" /></template>
          批量修复音频
          <XbIcon name="help-circle" :size="11" class="ml-1 text-content-tertiary" />
        </XbButton>
        <XbButton type="secondary">
          <template #icon><XbIcon name="download" :size="12" /></template>
          批量下载
        </XbButton>
        <XbButton type="secondary">
          <template #icon><XbIcon name="eye" :size="12" /></template>
          预览
        </XbButton>
        <XbButton :disabled="isSubmitting" @click="handleComposite">
          <template #icon><XbIcon name="film" :size="12" /></template>
          {{ isSubmitting ? '提交中…' : '成片合成' }}
        </XbButton>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <XbConfirmModal
      v-model:visible="showDeleteConfirm"
      title="删除分镜组"
      confirm-text="确认删除"
      confirm-type="danger"
      @confirm="handleDeleteConfirm"
    >
      <p class="text-sm text-content-secondary">确定删除「{{ activeGroup.name }}」吗？</p>
      <p class="text-sm text-content-tertiary mt-1">删除后不可恢复。</p>
    </XbConfirmModal>

    <!-- Last Group Tip Modal -->
    <XbConfirmModal
      v-model:visible="showLastGroupTip"
      title="提示"
      message="至少保留一个分镜组"
      :show-confirm="false"
      cancel-text="知道了"
    />
  </div>
</template>
