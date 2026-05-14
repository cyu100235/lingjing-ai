<script setup lang="ts">
const modelValue = defineModel<string[]>({ required: true })

const allTags = ['主角', '配角', '古风', '武侠', '萌宠', '搞笑', '室内', '室外', '自然', '宏伟', '正面', '负面', '夸张', '可爱', '武器', '道具', '生活', '装饰', '节日']

function toggleTag(tag: string) {
  const idx = modelValue.value.indexOf(tag)
  if (idx !== -1) {
    modelValue.value.splice(idx, 1)
  } else {
    modelValue.value.push(tag)
  }
}
</script>

<template>
  <div>
    <label class="text-xs text-content-secondary mb-2 block">选择标签（可多选）</label>
    <div class="flex flex-wrap gap-1.5">
      <XbTag
        v-for="tag in allTags"
        :key="tag"
        :type="modelValue.includes(tag) ? 'brand' : 'default'"
        round
        @click="toggleTag(tag)"
      >
        {{ tag }}
      </XbTag>
    </div>
  </div>
</template>
