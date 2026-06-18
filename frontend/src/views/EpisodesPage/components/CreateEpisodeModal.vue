<script setup lang="ts">

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  create: [title: string]
}>()

const title = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    title.value = ''
  }
})

function handleClose() {
  emit('update:visible', false)
}

function handleCreate() {
  if (title.value.trim()) {
    emit('create', title.value.trim())
    title.value = ''
    handleClose()
  }
}
</script>

<template>
  <XbModal
    :visible="visible"
    title="新建分集"
    width="w-96"
    @update:visible="emit('update:visible', $event)"
  >
    <XbInput
      v-model="title"
      placeholder="输入分集名称，如：第1集"
      @keydown.enter="handleCreate"
      autofocus
    />

    <template #footer>
      <div class="flex justify-end gap-2">
        <XbButton type="secondary" size="sm" @click="handleClose">取消</XbButton>
        <XbButton size="sm" @click="handleCreate">创建</XbButton>
      </div>
    </template>
  </XbModal>
</template>
