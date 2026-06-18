<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useWorksStore } from '@/stores/projects'
import EpisodeHeader from './components/EpisodeHeader.vue'
import EpisodeGrid from './components/EpisodeGrid.vue'
import EditEpisodeModal from './components/EditEpisodeModal.vue'

const route = useRoute()
const router = useRouter()
const store = useWorksStore()

const worksId = route.query.work_id as string
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const episodeToDelete = ref<string | null>(null)
const episodeToEdit = ref<string | null>(null)
const editTitle = ref('')
const editCover = ref('')

onMounted(() => {
  store.setCurrentWorks(worksId)
})

const works = computed(() => store.currentWorks)

// Pagination
const pageSize = 8
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(store.episodes.length / pageSize))
const paginatedEpisodes = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return store.episodes.slice(start, start + pageSize)
})

// 当总页数减少时自动修正当前页
watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = Math.max(1, newTotal)
  }
})

function goBack() {
  router.push('/works')
}

function openEditor(episodeId: string) {
  router.push(`/works/episodes/create?work_id=${worksId}&episode=${episodeId}`)
}

function openEditEpisode(id: string, currentTitle: string, currentCover: string) {
  episodeToEdit.value = id
  editTitle.value = currentTitle
  editCover.value = currentCover
  showEditModal.value = true
}

function saveEpisode(id: string, data: { title: string; cover: string }) {
  store.updateEpisode(id, data)
  episodeToEdit.value = null
}

function confirmDelete(id: string) {
  episodeToDelete.value = id
  showDeleteModal.value = true
}

function deleteEpisode() {
  if (episodeToDelete.value) {
    store.episodes = store.episodes.filter(ep => ep.id !== episodeToDelete.value)
    episodeToDelete.value = null
    showDeleteModal.value = false
  }
}
</script>

<template>
  <div class="animate-fade-in">
    <EpisodeHeader
      :title="works?.title"
      :episode-count="store.episodes.length"
      @back="goBack"
      @create="router.push(`/works/episodes/create?work_id=${worksId}`)"
    />

    <EpisodeGrid
      :episodes="paginatedEpisodes"
      @open-editor="openEditor"
      @edit="openEditEpisode"
      @delete="confirmDelete"
    />

    <XbPagination
      v-model:currentPage="currentPage"
      :total-pages="totalPages"
    />

    <XbConfirmModal
      v-model:visible="showDeleteModal"
      title="确认删除"
      confirm-text="删除"
      confirm-type="danger"
      message="确定要删除这一集吗？此操作不可撤销。"
      @confirm="deleteEpisode"
    />

    <EditEpisodeModal
      v-model:visible="showEditModal"
      :episode-id="episodeToEdit"
      :initial-title="editTitle"
      :initial-cover="editCover"
      @save="saveEpisode"
    />
  </div>
</template>
