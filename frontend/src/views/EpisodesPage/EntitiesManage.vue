<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useWorksStore } from '@/stores/projects'
import { useSiteConfigStore } from '@/stores/siteConfig'
import type { TabItem } from '@/xbUi/XbTabs/types'

const route = useRoute()
const router = useRouter()
const store = useWorksStore()
const siteConfigStore = useSiteConfigStore()

const worksId = route.query.work_id as string

function goToShotList() {
  router.push({
    path: '/works/episodes/groupMultiEdit',
    query: worksId ? { work_id: worksId } : undefined,
  })
}

const activeTab = ref('character')

const tabs: TabItem[] = [
  { label: '角色列表', value: 'character' },
  { label: '场景列表', value: 'scene' },
  { label: '道具列表', value: 'prop' },
]

interface Entity {
  id: string
  name: string
  type: string
  avatar: string
  voiceType: string
  description: string
  biography: string
}

// 角色数据
const characters = ref<Entity[]>([
  {
    id: '1',
    name: '苏清歌',
    type: '角色',
    avatar: '/vibe_images/char-girl_1778629604.png',
    voiceType: '尖锐强势女·青年',
    description: '苏清歌，纯白背景，无其他人物和场景；苏清歌的单人全身立绘，正对镜头站立，表情自然；身穿白色仙裙，手持莲台法器，气质清冷高贵。',
    biography: '青年，女，清冷算计，青云宗天才仙子，企图利用他人温养天道碎片却反被削弱的掌控者。',
  },
  {
    id: '2',
    name: '赵执事',
    type: '角色',
    avatar: '/vibe_images/char-scholar_1778629674.png',
    voiceType: '沉稳老练男·中年',
    description: '赵执事，纯白背景，无其他人和场景；赵执事的单人全身立绘，正对镜头站立，表情自然；身穿灰色执事袍，手持名册，面容严肃。',
    biography: '中年，男，傲慢势利，青云宗测灵台执事，负责筛选弟子，崇尚灵根天赋而轻视凡人。',
  },
  {
    id: '3',
    name: '林默',
    type: '角色',
    avatar: '/vibe_images/char-scholar_1778629674.png',
    voiceType: '沉稳理性男·青年',
    description: '林默，纯白背景，无其他人和场景；林默的单人全身立绘，正对镜头站立，表情自然；青年修士装扮，目光沉稳内敛。',
    biography: '青年，男，沉稳内敛，青云宗低阶弟子，被判定为无灵根的凡骨俗胎实则拥有吞噬灵力的无相灵根。',
  },
])

// 场景数据
interface Scene {
  id: string
  name: string
  image: string
  description: string
}

const scenes = ref<Scene[]>([
  {
    id: 's1',
    name: '藏经阁窗边',
    image: '/vibe_images/bg-bamboo_1778629636.png',
    description: '藏经阁窗边，画面中不出现任何角色；纯场景、纯环境、无人物；架空古代修仙世界，藏经阁内光线柔和，窗外可见远山云雾。',
  },
  {
    id: 's2',
    name: '测灵台大殿',
    image: '/vibe_images/bg-palace_1778629654.png',
    description: '青云宗测灵台大殿，宏伟庄严，殿内陈设古朴，中央摆放着测灵石碑，四周烛火摇曳。',
  },
  {
    id: 's3',
    name: '山间客栈',
    image: '/vibe_images/bg-inn_1778629624.png',
    description: '山间客栈，木质结构，窗外竹林掩映，店内灯火通明，桌案上摆放着茶具和酒壶。',
  },
])

// 道具数据
interface Prop {
  id: string
  name: string
  image: string
  description: string
}

const propsList = ref<Prop[]>([
  {
    id: 'p1',
    name: '莲台法器',
    image: '/vibe_images/prop-lantern_1778629777.png',
    description: '苏清歌所持法器，白玉雕琢而成，散发着淡淡灵光，可温养天道碎片。',
  },
  {
    id: 'p2',
    name: '测灵名册',
    image: '/vibe_images/prop-sword_1778629752.png',
    description: '赵执事手中的名册，记录着参与测灵的弟子信息，以灵墨书写。',
  },
])

// 当前显示的实体列表（根据 tab 切换）
const currentTabLabel = computed(() => {
  const tab = tabs.find(t => t.value === activeTab.value)
  return tab?.label || ''
})

const narratorVoice = ref('经典解说女·青年 / 中文')

function replaceEntity(id: string) {
  // TODO: 从角色库替换
}

function deleteEntity(id: string) {
  // TODO: 删除角色
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-10rem)]">
    <!-- Main Content -->
    <div class="flex-1 min-h-0 flex flex-col">
      <XbTabs v-model="activeTab" :tabs="tabs" variant="line" class="entities-tabs flex-1 min-h-0 flex flex-col">
        <!-- Character Tab Panel -->
        <template #character>
          <div class="flex flex-wrap gap-4">
            <!-- Add New Character Card -->
            <div
              class="card-base p-6 flex flex-col items-center justify-center cursor-pointer w-[320px] h-[325px] shrink-0 border-dashed !border-border/60 hover:!border-brand/50"
            >
              <div class="w-12 h-12 rounded-full border-2 border-dashed border-content-tertiary flex items-center justify-center mb-3">
                <XbIcon name="plus" :size="20" class="text-content-tertiary" />
              </div>
              <span class="text-sm font-medium text-brand mb-1">添加新角色</span>
              <span class="text-xs text-content-tertiary text-center">创建空白角色或从角色库中添加</span>
            </div>

            <!-- Character Cards -->
            <div
              v-for="entity in characters"
              :key="entity.id"
              class="entity-card overflow-hidden w-[320px] h-[325px] shrink-0 rounded-xl border border-border p-3"
            >
              <!-- Top Section: Avatar + Info (horizontal) -->
              <div class="flex flex-row">
                <!-- Left: Avatar -->
                <div class="relative w-[100px] h-[140px] shrink-0 overflow-hidden rounded-lg bg-surface-overlay/30">
                  <img :src="entity.avatar" :alt="entity.name" class="w-full h-full object-cover" />
                  <!-- Generate Image Button -->
                  <XbTooltip :content="`消耗10${siteConfigStore.currencyName}`">
                    <button class="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-black/60 text-emerald-400 text-sm font-medium hover:bg-black/70 transition-colors whitespace-nowrap">
                      <span class="text-emerald-400">✦</span>
                      生成形象
                    </button>
                  </XbTooltip>
                </div>

                <!-- Right: Basic Info -->
                <div class="flex-1 pl-3 flex flex-col gap-1.5 min-w-0">
                  <!-- Top Actions -->
                  <div class="flex items-center justify-end gap-1">
                    <XbTooltip content="编辑">
                      <button class="w-7 h-7 rounded flex items-center justify-center text-content-tertiary hover:text-content hover:bg-surface-overlay/50 transition-colors">
                        <XbIcon name="pencil" :size="14" />
                      </button>
                    </XbTooltip>
                    <XbTooltip content="替换">
                      <button class="w-7 h-7 rounded flex items-center justify-center text-content-tertiary hover:text-content hover:bg-surface-overlay/50 transition-colors" @click="replaceEntity(entity.id)">
                        <XbIcon name="replace" :size="14" />
                      </button>
                    </XbTooltip>
                    <XbTooltip content="删除">
                      <button class="w-7 h-7 rounded flex items-center justify-center text-content-tertiary hover:text-danger hover:bg-surface-overlay/50 transition-colors" @click="deleteEntity(entity.id)">
                        <XbIcon name="trash-2" :size="14" />
                      </button>
                    </XbTooltip>
                  </div>

                  <!-- Name -->
                  <div>
                    <p class="text-xs text-content-tertiary">角色名</p>
                    <h3 class="text-base font-semibold text-content">{{ entity.name }}</h3>
                  </div>

                  <!-- Voice Type -->
                  <div>
                    <div class="flex items-center gap-1">
                      <span class="text-xs text-content-tertiary">角色音色</span>
                      <XbIcon name="help-circle" :size="12" class="text-content-tertiary" />
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <p class="text-sm text-content-secondary truncate">{{ entity.voiceType }}…</p>
                      <button class="flex items-center gap-0.5 text-sm text-brand hover:text-brand-light transition-colors shrink-0">
                        <XbIcon name="volume-2" :size="16" />
                        试听
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bottom Section: Description + Biography (vertical) -->
              <div class="pt-2.5 flex flex-col gap-2.5">
                <!-- Description -->
                <div>
                  <p class="text-xs text-content-tertiary mb-1">角色描述</p>
                  <XbTooltip :content="entity.description">
                    <p class="text-sm text-content-secondary line-clamp-2 leading-relaxed">{{ entity.description }}</p>
                  </XbTooltip>
                </div>

                <!-- Biography -->
                <div>
                  <p class="text-xs text-content-tertiary mb-1">角色小传</p>
                  <XbTooltip :content="entity.biography">
                    <p class="text-sm text-content-secondary line-clamp-2 leading-relaxed">{{ entity.biography }}</p>
                  </XbTooltip>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Scene Tab Panel -->
        <template #scene>
          <div class="flex flex-wrap gap-4">
            <!-- Add New Scene Card -->
            <div
              class="card-base p-6 flex flex-col items-center justify-center cursor-pointer w-[320px] h-[325px] shrink-0 border-dashed !border-border/60 hover:!border-brand/50"
            >
              <div class="w-12 h-12 rounded-full border-2 border-dashed border-content-tertiary flex items-center justify-center mb-3">
                <XbIcon name="plus" :size="20" class="text-content-tertiary" />
              </div>
              <span class="text-sm font-medium text-brand mb-1">添加新场景</span>
              <span class="text-xs text-content-tertiary text-center">创建空白场景或从场景库中添加</span>
            </div>

            <!-- Scene Cards -->
            <div
              v-for="scene in scenes"
              :key="scene.id"
              class="entity-card overflow-hidden w-[320px] h-[325px] shrink-0 rounded-xl border border-border flex flex-col"
            >
              <!-- Top: Scene Image -->
              <div class="relative h-[180px] shrink-0 overflow-hidden bg-surface-overlay/30">
                <img :src="scene.image" :alt="scene.name" class="w-full h-full object-cover" />
                <!-- Generate Image Button -->
                <XbTooltip :content="`消耗10${siteConfigStore.currencyName}`">
                  <button class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-black/60 text-emerald-400 text-sm font-medium hover:bg-black/70 transition-colors whitespace-nowrap">
                    <span class="text-emerald-400">✦</span>
                    生成图片
                  </button>
                </XbTooltip>
              </div>

              <!-- Bottom: Info -->
              <div class="flex-1 p-3 flex flex-col gap-2 min-h-0">
                <!-- Top Row: Scene Name + Actions -->
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-xs text-content-tertiary mb-0.5">场景名</p>
                    <h3 class="text-base font-semibold text-content truncate">{{ scene.name }}</h3>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <XbTooltip content="编辑">
                      <button class="w-7 h-7 rounded flex items-center justify-center text-content-tertiary hover:text-content hover:bg-surface-overlay/50 transition-colors">
                        <XbIcon name="pencil" :size="14" />
                      </button>
                    </XbTooltip>
                    <XbTooltip content="替换">
                      <button class="w-7 h-7 rounded flex items-center justify-center text-content-tertiary hover:text-content hover:bg-surface-overlay/50 transition-colors" @click="replaceEntity(scene.id)">
                        <XbIcon name="replace" :size="14" />
                      </button>
                    </XbTooltip>
                    <XbTooltip content="删除">
                      <button class="w-7 h-7 rounded flex items-center justify-center text-content-tertiary hover:text-danger hover:bg-surface-overlay/50 transition-colors" @click="deleteEntity(scene.id)">
                        <XbIcon name="trash-2" :size="14" />
                      </button>
                    </XbTooltip>
                  </div>
                </div>

                <!-- Scene Description -->
                <div class="flex-1 min-h-0">
                  <p class="text-xs text-content-tertiary mb-1">场景描述</p>
                  <XbTooltip :content="scene.description">
                    <p class="text-sm text-content-secondary line-clamp-2 leading-relaxed">{{ scene.description }}</p>
                  </XbTooltip>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Prop Tab Panel -->
        <template #prop>
          <div class="flex flex-wrap gap-4">
            <!-- Add New Prop Card -->
            <div
              class="card-base p-6 flex flex-col items-center justify-center cursor-pointer w-[320px] h-[325px] shrink-0 border-dashed !border-border/60 hover:!border-brand/50"
            >
              <div class="w-12 h-12 rounded-full border-2 border-dashed border-content-tertiary flex items-center justify-center mb-3">
                <XbIcon name="plus" :size="20" class="text-content-tertiary" />
              </div>
              <span class="text-sm font-medium text-brand mb-1">添加新道具</span>
              <span class="text-xs text-content-tertiary text-center">创建空白道具或从道具库中添加</span>
            </div>

            <!-- Prop Cards -->
            <div
              v-for="prop in propsList"
              :key="prop.id"
              class="entity-card overflow-hidden w-[320px] h-[325px] shrink-0 rounded-xl border border-border flex flex-col"
            >
              <!-- Top: Prop Image -->
              <div class="relative h-[180px] shrink-0 overflow-hidden bg-surface-overlay/30">
                <img :src="prop.image" :alt="prop.name" class="w-full h-full object-cover" />
                <!-- Generate Image Button -->
                <XbTooltip :content="`消耗10${siteConfigStore.currencyName}`">
                  <button class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-black/60 text-emerald-400 text-sm font-medium hover:bg-black/70 transition-colors whitespace-nowrap">
                    <span class="text-emerald-400">✦</span>
                    生成图片
                  </button>
                </XbTooltip>
              </div>

              <!-- Bottom: Info -->
              <div class="flex-1 p-3 flex flex-col gap-2 min-h-0">
                <!-- Top Row: Prop Name + Actions -->
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-xs text-content-tertiary mb-0.5">道具名</p>
                    <h3 class="text-base font-semibold text-content truncate">{{ prop.name }}</h3>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <XbTooltip content="编辑">
                      <button class="w-7 h-7 rounded flex items-center justify-center text-content-tertiary hover:text-content hover:bg-surface-overlay/50 transition-colors">
                        <XbIcon name="pencil" :size="14" />
                      </button>
                    </XbTooltip>
                    <XbTooltip content="替换">
                      <button class="w-7 h-7 rounded flex items-center justify-center text-content-tertiary hover:text-content hover:bg-surface-overlay/50 transition-colors" @click="replaceEntity(prop.id)">
                        <XbIcon name="replace" :size="14" />
                      </button>
                    </XbTooltip>
                    <XbTooltip content="删除">
                      <button class="w-7 h-7 rounded flex items-center justify-center text-content-tertiary hover:text-danger hover:bg-surface-overlay/50 transition-colors" @click="deleteEntity(prop.id)">
                        <XbIcon name="trash-2" :size="14" />
                      </button>
                    </XbTooltip>
                  </div>
                </div>

                <!-- Prop Description -->
                <div class="flex-1 min-h-0">
                  <p class="text-xs text-content-tertiary mb-1">道具描述</p>
                  <XbTooltip :content="prop.description">
                    <p class="text-sm text-content-secondary line-clamp-2 leading-relaxed">{{ prop.description }}</p>
                  </XbTooltip>
                </div>
              </div>
            </div>
          </div>
        </template>
      </XbTabs>

      <!-- Bottom Toolbar -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <!-- Left: Narrator Voice -->
        <XbButton type="secondary">
          <template #icon>
            <XbIcon name="headphones" :size="14" />
          </template>
          <span class="text-content-tertiary mr-1">旁白</span>
          <span class="text-content-secondary">{{ narratorVoice }}</span>
          <XbIcon name="chevron-right" :size="12" class="text-content-tertiary ml-1" />
        </XbButton>

        <!-- Right: Action Buttons -->
        <div class="flex items-center gap-3">
          <XbButton type="secondary">
            <template #icon><XbIcon name="image" :size="12" /></template>
            {{ activeTab === 'character' ? '批量生成角色图片' : activeTab === 'scene' ? '批量生成场景图片' : '批量生成道具图片' }}
          </XbButton>
          <XbButton @click="goToShotList">
            <template #icon><XbIcon name="refresh-cw" :size="12" /></template>
            重新生成分镜列表
          </XbButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.entities-tabs :deep(.xb-tabs-panel) {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  margin-top: 1rem;
  padding-top: 2px;
}

.entity-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.10) 100%),
    url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 0 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.entity-card:hover {
  transform: translateY(-2px);
  border-color: hsl(var(--brand) / 0.3);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 0 30px rgba(0, 0, 0, 0.3),
    0 0 0 1px hsl(var(--brand) / 0.15),
    0 4px 16px hsl(var(--brand) / 0.1),
    0 8px 24px hsl(var(--brand) / 0.05);
}
</style>
