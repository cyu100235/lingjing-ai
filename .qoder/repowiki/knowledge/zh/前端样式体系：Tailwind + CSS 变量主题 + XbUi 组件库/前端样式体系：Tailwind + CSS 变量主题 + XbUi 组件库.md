---
kind: frontend_style
name: 前端样式体系：Tailwind + CSS 变量主题 + XbUi 组件库
category: frontend_style
scope:
    - '**'
source_files:
    - frontend/tailwind.config.js
    - frontend/postcss.config.js
    - frontend/vite.config.ts
    - frontend/package.json
    - frontend/src/index.css
    - frontend/src/xbUi/index.ts
    - frontend/src/xbUi/XbButton/index.vue
---

## 1. 系统概览
- 技术栈：Vue3 + Vite + TypeScript，样式层采用 **Tailwind CSS 3** + **PostCSS + Autoprefixer**。
- 主题方案：**CSS HSL 变量**集中定义在 `src/index.css` 的 `:root` 中，通过 Tailwind `theme.extend.colors` 映射为语义化 token（surface/brand/content/border/danger），实现暗色主题与品牌绿色调。
- 组件库：自研轻量 UI 库 **XbUi**（`src/xbUi/*`），以 Vue 单文件组件形式提供按钮、表单、弹窗、分页等基础能力，并通过插件方式全局注册。

## 2. 关键文件与包
- 构建与样式管线
  - `frontend/tailwind.config.js`：Tailwind 配置，扩展颜色、圆角、阴影、动画及 keyframes。
  - `frontend/postcss.config.js`：启用 tailwindcss 与 autoprefixer。
  - `frontend/vite.config.ts`：Vite 配置，含 `@` 别名、自动导入（vue/vue-router/pinia）与开发代理。
  - `frontend/package.json`：依赖声明（tailwindcss、autoprefixer、sass、lucide-vue-next 等）。
- 主题与全局样式
  - `frontend/src/index.css`：Tailwind 三层注入（base/components/utilities）、CSS 变量主题、全局组件类（card-base/btn-primary/input-base/modal-overlay 等）、滚动条与过渡动画。
- 自定义组件库 XbUi
  - `frontend/src/xbUi/index.ts`：统一导出所有组件与类型，并作为 Vue Plugin 全局注册。
  - `frontend/src/xbUi/XbButton/index.vue`：示例组件，展示 props 驱动 class 组合、CSS 变量注入、渐变与阴影风格。

## 3. 架构与设计约定
- 设计 Token 分层
  - 根级 CSS 变量（`--surface/--brand/--content/--border/--danger` 等）承载色彩、渐变、阴影、间距、圆角、过渡时间等原子值。
  - Tailwind `theme.extend` 将这些变量暴露为 `hsl(var(--xxx))`，业务代码仅使用 `bg-surface-elevated`、`text-brand` 等语义化类名。
- 样式组织模式
  - `@layer base`：重置、全局字体/背景/滚动条、body 样式。
  - `@layer components`：复用型复合样式（`.card-base`、`.btn-primary`、`.input-base`、`.modal-overlay` 等），内部再组合 Tailwind 原子类。
  - `@layer utilities`：页面级工具类（`.text-gradient`、`.glass`、`.scrollbar-hide`）。
- 组件样式策略
  - 优先使用 Tailwind 原子类描述布局与状态；对复杂交互或可复用的视觉模式，抽取为 scoped `<style>` 块（如 XbButton 的 hover 阴影、渐变）。
  - 组件通过 props 动态拼接 class（如 `sizeClasses` / `typeClasses`），避免硬编码多套样式分支。
- 图标与资源
  - 图标采用 `lucide-vue-next` 与 `@lobehub/icons`，通过脚本 `scripts/extract-lobe-icons.mjs` 提取 SVG 资源。
  - 静态图片统一放在 `public/images/`，按功能域命名（action-/char-/effect-/bg-/cover- 前缀）。

## 4. 开发者规范与建议
- 颜色与主题
  - 新增颜色时先在 `:root` 定义 CSS 变量，再在 `tailwind.config.js` 的 `theme.extend.colors` 中映射，禁止在组件内直接写死色值。
  - 保持暗色主题一致性：背景用 `surface-*`，文字用 `content-*`，强调用 `brand-*`，危险用 `danger`。
- 布局与尺寸
  - 间距、圆角、阴影尽量复用 `--space-*`、`--radius-*`、`boxShadow` 扩展；需要新尺寸时在 `tailwind.config.js` 的 `extend` 中追加。
- 组件开发
  - 新建组件遵循 `src/xbUi/XbXxx/index.vue` 目录结构，并在 `index.ts` 中统一导出与注册。
  - 组件 props 应覆盖常见变体（type/size/loading/disabled 等），class 通过 computed 组合，避免模板内大量条件拼接。
  - 若需超出 Tailwind 的能力（如复杂阴影、渐变、动画），使用 scoped `<style>` 并以 BEM 式类名（如 `.xb-btn-*`）命名。
- 动画与过渡
  - 常用动画已在 `tailwind.config.js` 中定义为 `animation.*` 与 `keyframes.*`，直接使用 `animate-fade-in`、`animate-slide-up` 等类名。
  - 页面级过渡沿用 `src/index.css` 中的 `.fade-enter-active/.fade-leave-active` 约定。
- 响应式与移动端
  - 当前未引入断点扩展，建议继续使用 Tailwind 默认断点（sm/md/lg/xl）配合 `@apply` 组合类实现响应式布局。
  - 移动端专用页面位于 `src/views/MobilePage/`，注意与桌面端布局解耦。
- 构建与优化
  - 图片资源建议使用 `scripts/compress-images.mjs` 进行压缩后再放入 `public/images/`。
  - 按需引入 XbUi 组件（从 `src/xbUi` 单独 import）可减少打包体积，而非全部全局注册。