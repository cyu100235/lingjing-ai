<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useWorksStore } from '@/stores/projects'
import StyleSelector from './create/StyleSelector.vue'
import type { StyleItem } from './create/StyleSelector.vue'

const router = useRouter()
const store = useWorksStore()

// Form state
const title = ref('')
const language = ref('zh')
const minScenes = ref<number | null>(null)
const scriptContent = ref(`剧名：《无痕仙途》第一集：空壳与珍宝\n场景：1-4场\n人物：林默、赵执事、苏清歌\n\n第一场\n地点：青云宗测灵台\n时间：清晨\n测灵碑暗淡无光，林默收回手，神情古井无波。\n赵执事（傲慢）：灵根全无，凡骨俗胎。下山去吧。\n林默转身，步伐稳健。天际铃音大作，云雾裂开，苏清歌踏金莲缓缓降临。众弟子齐齐低头。\n苏清歌（清冷）：此人，我要了。\n赵执事（愕然）：仙子，这可是个废人……\n苏清歌：他的"空"，正是我所求。\n苏清歌轻挥袖，一朵云雾将林默托起。两人视线交错，林默眼中寒光一闪。\n\n第二场\n地点：后山禁地·剑冢\n时间：夜`)
const selectedStyle = ref('custom')
const videoRatio = ref('16:9')
const isSaving = ref(false)
const isGenerating = ref(false)
const showErrorModal = ref(false)
const errorMessage = ref('')

const languageOptions = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
]

const ratioOptions = [
  { label: '16:9 横屏', value: '16:9' },
  { label: '9:16 竖屏', value: '9:16' },
  { label: '1:1 方形', value: '1:1' },
]

const styleOptions: StyleItem[] = [
  { id: 'custom', name: '自定义', image: '/vibe_images/cover-1_1778629492.png' },
  { id: 'realistic-pro', name: '真人写实Pro', image: '/vibe_images/cover-2_1778629507.png', hot: true },
  { id: 'ancient-pro', name: '真人古装Pro', image: '/vibe_images/cover-3_1778629528.png', hot: true },
  { id: 'xianxia-pro', name: '真人仙侠Pro', image: '/vibe_images/cover-4_1778629542.png', hot: true },
  { id: 'euro-realistic', name: '欧美写实Pro', image: '/vibe_images/cover-5_1778629554.png' },
  { id: 'realistic', name: '真人写实', image: '/vibe_images/cover-6_1778629582.png', hot: true },
  { id: 'ancient', name: '真人古装', image: '/vibe_images/char-girl_1778629604.png', hot: true },
  { id: 'xianxia', name: '真人仙侠', image: '/vibe_images/char-panda_1778629593.png', hot: true },
  { id: 'doom', name: '真人废土', image: '/vibe_images/char-scholar_1778629674.png' },
  { id: 'retro', name: '真人年代感', image: '/vibe_images/char-dog_1778629686.png' },
  { id: '2d-cn', name: '2D国风动漫', image: '/vibe_images/bg-bamboo_1778629636.png', hot: true },
  { id: '3d-cn', name: '3D国风动漫', image: '/vibe_images/bg-inn_1778629624.png', hot: true },
  { id: 'ancient-anime', name: '动漫古言', image: '/vibe_images/bg-palace_1778629654.png' },
  { id: 'apocalypse', name: '动漫末世', image: '/vibe_images/effect-crystal-lotus_1778652970.png' },
  { id: '3d-cartoon', name: '3D卡通', image: '/vibe_images/effect-energy-swirl_1778652982.png' },
  { id: '3d-render', name: '逼真3D渲染', image: '/vibe_images/effect-fire-burst_1778653055.png' },
  { id: 'scifi-real', name: '科幻写实', image: '/vibe_images/effect-holy-aura_1778653019.png' },
  { id: '3d-q', name: '3D Q版', image: '/vibe_images/effect-ice-crystal_1778653032.png' },
  { id: 'jp-comic', name: '日系漫画', image: '/vibe_images/effect-lightning-chain_1778653069.png' },
  { id: 'new-jp', name: '新时代日漫', image: '/vibe_images/effect-moonlight_1778653080.png' },
  { id: '2d-fairy', name: '2D童话', image: '/vibe_images/effect-rune-tornado_1778652993.png' },
  { id: '2d-doom', name: '2D废土', image: '/vibe_images/expr-happy_1778629706.png' },
  { id: 'ink-wuxia', name: '水墨武侠', image: '/vibe_images/expr-angry_1778629718.png' },
  { id: 'panda-style', name: '熊猫头风格', image: '/vibe_images/expr-shy_1778629730.png' },
  { id: '2d-q', name: '2D Q版', image: '/vibe_images/action-arms-crossed_1778653103.png' },
]

const charCount = computed(() => scriptContent.value.length)
const maxChars = 5000

function handleImport() {
  // Trigger file import
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.txt,.docx,.doc'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        scriptContent.value = (ev.target?.result as string) || ''
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

function smartExpand() {
  isGenerating.value = true
  setTimeout(() => {
    scriptContent.value += '\n\n【智能扩写内容】\n林默被带入禁地深处，四周剑气纵横。苏清歌立于剑冢中央，回首望向林默。\n苏清歌：从今日起，你便是我的剑侍。\n林默：为什么选我？\n苏清歌（浅笑）：因为空无，方能容纳万象。'
    isGenerating.value = false
  }, 1500)
}

function handleSave() {
  // Validation
  const errors: string[] = []
  if (!title.value.trim()) {
    errors.push('请填写作品标题')
  }
  if (!language.value) {
    errors.push('请选择剧本语言')
  }
  if (!scriptContent.value.trim()) {
    errors.push('请填写剧本内容')
  }
  if (errors.length > 0) {
    errorMessage.value = errors.join('\n')
    showErrorModal.value = true
    return
  }

  isSaving.value = true
  setTimeout(() => {
    const works = store.addWorks(title.value.trim(), videoRatio.value as '16:9' | '9:16')
    isSaving.value = false
    // Navigate to entities management page
    router.push({ path: '/works/episodes/EntitiesManage', query: { work_id: works.id } })
  }, 800)
}

</script>

<template>
  <!-- Main Content Grid -->
  <div class="flex gap-6 items-start">
      <!-- Left Panel -->
      <div class="flex-1 min-w-0 flex flex-col gap-5" style="min-height: calc(100vh - 8rem)">
        <!-- Title & Language -->
        <div class="card-base p-5 space-y-4">
          <XbInput v-model="title" label="标题" placeholder="输入作品标题..." />
          <XbSelect v-model="language" label="剧本语言" :options="languageOptions" />
        </div>

        <!-- Min Scenes -->
        <div class="card-base p-5">
          <div class="flex items-center gap-4">
            <label class="text-xs text-content-secondary whitespace-nowrap">
              剧本最小分镜数（选填）
            </label>
            <input
              v-model.number="minScenes"
              type="number"
              min="1"
              max="100"
              placeholder="自动"
              class="input-base w-24 text-sm"
            />
          </div>
        </div>

        <!-- Script Editor -->
        <div class="card-base p-5 flex-1 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-content">剧本</span>
              <span class="text-xs text-content-tertiary">（系统将基于剧本，自动创建分镜脚本）</span>
            </div>
            <button class="text-xs text-brand hover:text-brand-light transition-colors flex items-center gap-1" @click="handleImport">
              <XbIcon name="upload" :size="12" />
              导入剧本TXT、DOCX文件
            </button>
          </div>
          <textarea
            v-model="scriptContent"
            placeholder="在此输入剧本内容..."
            class="xb-script-textarea flex-1 min-h-0 w-full px-3 py-2 rounded-lg border border-border focus:border-brand/50 focus:shadow-[0_0_0_3px_hsl(var(--brand)/0.1)] bg-surface text-content text-sm resize-y outline-none transition-all duration-200"
          />
          <div class="flex items-center justify-between">
            <span class="text-xs text-content-tertiary">{{ charCount }}/{{ maxChars }}</span>
            <XbButton
              size="sm"
              type="secondary"
              :loading="isGenerating"
              @click="smartExpand"
            >
              <template #icon>
                <XbIcon v-if="!isGenerating" name="sparkles" :size="12" />
              </template>
              智能扩写
            </XbButton>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="w-[40rem] shrink-0 flex flex-col gap-5 sticky top-4" style="height: calc(100vh - 8rem)">
        <!-- Style Selector -->
        <div class="card-base p-4 min-h-0 flex-1 overflow-y-auto style-scroll-card">
          <StyleSelector v-model="selectedStyle" :options="styleOptions" />
        </div>

        <!-- Video Ratio -->
        <div class="card-base p-4">
          <XbSelect v-model="videoRatio" label="视频尺寸" :options="ratioOptions" />
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-3">
          <XbButton :loading="isSaving" block @click="handleSave">
            立即创建分集
          </XbButton>
        </div>
      </div>
    </div>
  <XbConfirmModal
    v-model:visible="showErrorModal"
    title="提示"
    :message="errorMessage"
    confirm-text="知道了"
    :show-cancel="false"
  />
</template>

<style scoped>
.xb-script-textarea::placeholder {
  color: hsl(var(--content-tertiary));
}
</style>
