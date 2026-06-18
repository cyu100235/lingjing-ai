<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next'
import { lobeIcons } from './lobeIcons'

const props = withDefaults(defineProps<{
  /** 图标名称，支持 lobe: 前缀指定 LobeHub 图标，如 lobe:OpenAI、lobe:DeepSeek；
   *  也可直接传入 LobeHub 图标名，如 OpenAI、DeepSeek */
  name: string
  /** 图标大小（px） */
  size?: number
  /** Lucide 图标线宽 */
  strokeWidth?: number
  /** 是否使用绝对线宽（Lucide） */
  absoluteStrokeWidth?: boolean
  /** 图标颜色（用于 Mono LobeHub 图标，覆盖默认 avatarColor） */
  color?: string
}>(), {
  size: 24,
  strokeWidth: 2,
  absoluteStrokeWidth: false,
  color: '',
})

// ─── LobeHub 图标判断 ─────────────────────────────────────

/** 支持 lobe: 前缀，如 lobe:OpenAI；也支持直接传入图标名，如 OpenAI */
const LOBE_PREFIX = 'lobe:'

/** 是否为 LobeHub 图标 */
const isLobeIcon = computed(() => {
  if (props.name.startsWith(LOBE_PREFIX)) return true
  return !!lobeIcons[props.name]
})

/** LobeHub 图标名（去除前缀后） */
const lobeIconName = computed(() =>
  props.name.startsWith(LOBE_PREFIX) ? props.name.slice(LOBE_PREFIX.length) : props.name,
)

/** LobeHub 图标数据 */
const lobeIconData = computed(() => {
  if (!isLobeIcon.value) return null
  return lobeIcons[lobeIconName.value] || null
})

// ─── 彩色图标 SVG ID 冲突处理 ─────────────────────────────

/** 是否为 LobeHub 彩色图标（含渐变/多色填充） */
const isLobeColorIcon = computed(() => !!lobeIconData.value?.hasColor)

/** 组件实例唯一后缀，避免同一页面多个相同图标导致 SVG defs ID 冲突 */
const lobeInstanceId = Math.random().toString(36).slice(2, 8)

/** 处理后的 LobeHub 彩色图标 paths（替换 defs 中的 ID 和引用为实例唯一值） */
const processedLobePaths = computed(() => {
  if (!lobeIconData.value?.hasColor) return lobeIconData.value?.paths || ''
  let p = lobeIconData.value.paths
  // 替换 id="lobe-Name-N" 为 id="lobe-Name-N-{instanceId}"
  p = p.replace(/id="lobe-([^"]+)-(\d+)"/g, `id="lobe-$1-$2-${lobeInstanceId}"`)
  // 替换 url(#lobe-Name-N) 为 url(#lobe-Name-N-{instanceId})
  p = p.replace(/url\(#lobe-([^)]+)-(\d+)\)/g, `url(#lobe-$1-$2-${lobeInstanceId})`)
  return p
})

// ─── Avatar 风格（Mono 图标）─────────────────────────────────

/** 计算尺寸样式 */
const sizeStyle = computed(() => `${props.size}px`)

/** Avatar 风格样式：圆形品牌色背景 + 图标 */
const avatarStyle = computed(() => {
  const bg = lobeIconData.value?.avatarBg || '#000'
  const s = sizeStyle.value
  const isLightBg = /^#fff$/i.test(bg) || /^#ffffff$/i.test(bg)
  return {
    width: s,
    height: s,
    background: bg,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: isLightBg ? '1px solid #ddd' : 'none',
    flexShrink: '0',
  }
})

/** Avatar 内图标尺寸（按 avatarMultiple 缩放） */
const iconSizeStyle = computed(() => {
  const multiple = lobeIconData.value?.avatarMultiple || 0.6
  return `${Math.round(props.size * multiple)}px`
})

/** Mono 图标在 Avatar 上的颜色：优先 color prop，否则 avatarColor */
const lobeAvatarIconColor = computed(() => props.color || lobeIconData.value?.avatarColor || '#fff')

// ─── Lucide 图标 ──────────────────────────────────────────

/** Lucide 图标组件（支持 kebab-case 转 PascalCase，如 arrow-left → ArrowLeft） */
const iconComponent = computed(() => {
  if (isLobeIcon.value) return null
  const pascalName = props.name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') as string
  return (LucideIcons as Record<string, any>)[pascalName] ?? null
})
</script>

<template>
  <!-- Lucide 图标（默认） -->
  <component
    v-if="iconComponent"
    :is="iconComponent"
    :size="size"
    :stroke-width="strokeWidth"
    :absolute-stroke-width="absoluteStrokeWidth"
    v-bind="$attrs"
  />
  <!-- LobeHub 彩色图标渲染（自带颜色/渐变） -->
  <svg
    v-else-if="lobeIconData && isLobeColorIcon"
    :viewBox="lobeIconData.viewBox"
    :width="sizeStyle"
    :height="sizeStyle"
    xmlns="http://www.w3.org/2000/svg"
    v-html="processedLobePaths"
    v-bind="$attrs"
  />
  <!-- LobeHub Mono 图标渲染（Avatar 风格：品牌色圆形背景 + 白色图标） -->
  <span
    v-else-if="lobeIconData"
    class="lobe-avatar"
    :style="avatarStyle"
    v-bind="$attrs"
  >
    <svg
      :viewBox="lobeIconData.viewBox"
      :width="iconSizeStyle"
      :height="iconSizeStyle"
      fill="currentColor"
      fill-rule="evenodd"
      :style="{ color: lobeAvatarIconColor }"
      v-html="lobeIconData.paths"
    />
  </span>
</template>
