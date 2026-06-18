<script setup lang="ts">
import XbModal from '@/xbUi/XbModal/index.vue'
import VipPlanCard from './components/VipPlanCard.vue'
import type { VipPlan } from './types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  openPayModal: [plan: VipPlan]
}>()

const vipPlans: VipPlan[] = [
  {
    name: '免费会员',
    price: '0',
    unit: '',
    features: ['10次AI生成', '5GB储存空间', '720P导出'],
    popular: false,
    free: true,
  },
  {
    name: '月度会员',
    price: '29',
    unit: '/月',
    features: ['每日50次AI生成', '10GB存储空间', '720P导出', '基础模板库'],
    popular: false,
    free: false,
  },
  {
    name: '年度会员',
    price: '199',
    unit: '/年',
    features: ['无限AI生成', '100GB存储空间', '1080P导出', '全部模板库', '优先客服', '商用授权'],
    popular: true,
    free: false,
  },
  {
    name: '终身会员',
    price: '599',
    unit: '/永久',
    features: ['无限AI生成', '无限存储空间', '4K导出', '全部模板库', '专属客服', '商用授权', '优先体验新功能'],
    popular: false,
    free: false,
  },
]
</script>

<template>
  <XbModal
    :visible="props.visible"
    :no-padding="true"
    width="w-[950px]"
    @close="emit('close')"
  >
    <!-- 头部渐变区域 -->
    <div class="relative px-8 pt-8 pb-6 bg-gradient-to-br from-amber-500/20 via-surface-elevated to-surface-elevated">
      <div class="flex items-center gap-3 mb-2">
        <XbIcon name="crown" :size="28" class="text-amber-400" />
        <h3 class="text-xl font-bold text-content">开通会员</h3>
      </div>
      <p class="text-sm text-content-secondary">解锁全部AI创作能力，让动画创作更高效</p>
    </div>

    <!-- 会员方案 -->
    <div class="px-8 py-6">
      <div class="grid grid-cols-4 gap-4">
        <VipPlanCard
          v-for="plan in vipPlans"
          :key="plan.name"
          :plan="plan"
          @select="emit('openPayModal', $event)"
        />
      </div>
    </div>

    <!-- 底部协议 -->
    <div class="px-8 pb-6 text-center">
      <p class="text-[10px] text-content-tertiary">开通即表示同意<a href="https://example.com/membership-agreement" target="_blank" rel="noopener noreferrer" class="text-brand hover:text-amber-400 cursor-pointer transition-colors duration-200">《会员服务协议》</a>，套餐到期后不自动续费</p>
    </div>
  </XbModal>
</template>
