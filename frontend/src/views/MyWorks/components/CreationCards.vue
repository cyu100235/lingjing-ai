<script setup lang="ts">
const emit = defineEmits<{
  create: [type: 'script' | 'storyboard' | 'novel']
}>()
</script>

<template>
  <div class="grid grid-cols-3 gap-4 mb-8">
    <!-- 剧本创建 -->
    <div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 p-5 flex flex-col justify-between min-h-[180px] group hover:border-brand/30 transition-all">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-white font-semibold text-base">我有剧本</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white">NEW</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/70">HappyHorse</span>
        </div>
        <p class="text-white/50 text-xs leading-relaxed max-w-[70%]">
          将基于原始剧本内容，生成1个故事板，适用于单集剧本（支持对白模式、解说模式）。
        </p>
      </div>
      <button
        class="mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-500 hover:to-blue-400 transition-all w-fit"
        @click="emit('create', 'script')"
      >
        开始创建
      </button>
      <img
        src="/vibe_images/cover-1_1778629492.png"
        alt="剧本"
        class="absolute right-2 bottom-2 w-20 h-24 object-cover rounded-lg opacity-80 group-hover:scale-105 transition-transform"
      />
    </div>

    <!-- 分镜脚本创建 -->
    <div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 p-5 flex flex-col justify-between min-h-[180px] group hover:border-brand/30 transition-all">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-white font-semibold text-base">我有分镜脚本</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white">NEW</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/70">HappyHorse</span>
        </div>
        <p class="text-white/50 text-xs leading-relaxed max-w-[70%]">
          直接生成1个故事板，适用于已撰写好的分镜脚本（含分镜编号、画面描述、运镜等）。
        </p>
      </div>
      <button
        class="mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-500 hover:to-blue-400 transition-all w-fit"
        @click="emit('create', 'storyboard')"
      >
        开始创建
      </button>
      <img
        src="/vibe_images/cover-2_1778629507.png"
        alt="分镜脚本"
        class="absolute right-2 bottom-2 w-20 h-24 object-cover rounded-lg opacity-80 group-hover:scale-105 transition-transform"
      />
    </div>

    <!-- 小说脚本创建 -->
    <div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 p-5 flex flex-col justify-between min-h-[180px] group hover:border-brand/30 transition-all">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-white font-semibold text-base">我有小说</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/40 border border-white/10">即将上线</span>
        </div>
        <p class="text-white/50 text-xs leading-relaxed max-w-[70%]">
          智能解析原文结构，生成多个故事板，适合长篇小说或分集剧本。
        </p>
      </div>
      <button
        class="mt-4 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:from-blue-500 hover:to-blue-400 transition-all w-fit"
        @click="emit('create', 'novel')"
      >
        开始创建
      </button>
      <img
        src="/vibe_images/cover-3_1778629528.png"
        alt="小说"
        class="absolute right-2 bottom-2 w-20 h-24 object-cover rounded-lg opacity-80 group-hover:scale-105 transition-transform"
      />
    </div>
  </div>
</template>
