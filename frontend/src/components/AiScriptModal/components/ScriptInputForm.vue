<script setup lang="ts">
const scriptContent = defineModel<string>({ required: true })

const emit = defineEmits<{
  submit: []
}>()
</script>

<template>
  <div class="space-y-4">
    <div>
      <XbTextarea
        v-model="scriptContent"
        label="剧本内容"
        rows="12"
        resize="none"
        placeholder="请输入剧本内容，AI 将根据内容自动拆分为多个分镜。&#10;每段文字将生成一个分镜，包含描述词、角色、表情、道具、场景和时长。&#10;示例：&#10;深夜的古镇巷子里，一个戴斗笠的侠客缓缓走来，手中握着一封信。&#10;客栈大厅里，侠客推门而入，掌柜抬头望去，面露惊色。"
      />
    </div>
    <p class="text-xs text-content-tertiary">
      提示：用空行分隔不同场景，AI 会自动为每段内容生成对应的分镜信息
    </p>
  </div>
</template>
