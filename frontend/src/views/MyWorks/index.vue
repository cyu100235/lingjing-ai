<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWorksStore, type AspectRatio } from '@/stores/projects'
import WorksCard from './components/WorksCard.vue'
import WorksFormModal from './components/WorksFormModal.vue'
import WorksHeader from './components/WorksHeader.vue'
import CreationCards from './components/CreationCards.vue'

const router = useRouter()
const store = useWorksStore()

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const showComingSoonModal = ref(false)
const worksToDelete = ref<string | null>(null)
const worksToEdit = ref<string | null>(null)
const editFormData = ref<{ title: string; cover: string; aspectRatio: AspectRatio }>({
  title: '',
  cover: '',
  aspectRatio: '16:9',
})
const filterType = ref<'all' | 'draft' | 'published'>('all')
const sortBy = ref<'update' | 'create' | 'hot'>('update')

const filteredWorks = computed(() => {
  let result = [...store.works]
  if (filterType.value !== 'all') {
    result = result.filter(p => p.status === filterType.value)
  }
  return result
})

// 分页
const pageSize = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(filteredWorks.value.length / pageSize))
const paginatedWorks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredWorks.value.slice(start, start + pageSize)
})

// 当总页数减少时自动修正当前页
watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = Math.max(1, newTotal)
  }
})

function createWorks(payload: { title: string; cover: string; aspectRatio: AspectRatio }) {
  const works = store.addWorks(payload.title, payload.aspectRatio)
  if (payload.cover) {
    store.updateWorks(works.id, { cover: payload.cover })
  }
  showCreateModal.value = false
  router.push(`/works/${works.id}/episodes`)
}

function confirmDelete(id: string) {
  worksToDelete.value = id
  showDeleteModal.value = true
}

function deleteWorks() {
  if (worksToDelete.value) {
    store.deleteWorks(worksToDelete.value)
    worksToDelete.value = null
    showDeleteModal.value = false
  }
}

function openEditWorks(id: string, currentTitle: string, currentCover: string) {
  worksToEdit.value = id
  const works = store.works.find(p => p.id === id)
  editFormData.value = {
    title: currentTitle,
    cover: currentCover,
    aspectRatio: works?.aspectRatio || '16:9',
  }
  showEditModal.value = true
}

function saveWorks(payload: { title: string; cover: string; aspectRatio: AspectRatio }) {
  if (worksToEdit.value) {
    store.updateWorks(worksToEdit.value, { title: payload.title, cover: payload.cover })
    worksToEdit.value = null
    showEditModal.value = false
  }
}

function openEpisodes(id: string) {
  router.push(`/works/${id}/episodes`)
}

function showComingSoon() {
  showComingSoonModal.value = true
}
</script>

<template>
  <div class="animate-fade-in">
    <!-- Creation Cards -->
    <CreationCards @create="showComingSoon" />

    <!-- Header -->
    <WorksHeader
      :total="filteredWorks.length"
      v-model:filter-type="filterType"
      v-model:sort-by="sortBy"
    />

    <!-- Works Grid -->
    <div class="grid grid-cols-5 gap-4">
      <!-- Create New Card -->
      <button
        class="card-base flex flex-col items-center justify-center aspect-[4/3] border-dashed border-2 border-border hover:border-brand/50 group"
        @click="showCreateModal = true"
      >
        <div class="w-12 h-12 rounded-full bg-surface-overlay flex items-center justify-center mb-3 group-hover:bg-brand/20 transition-colors">
          <XbIcon name="plus" :size="24" class="text-content-secondary group-hover:text-brand transition-colors" />
        </div>
        <span class="text-sm text-content-secondary group-hover:text-content transition-colors">创建作品</span>
      </button>

      <!-- Works Cards -->
      <WorksCard
        v-for="works in paginatedWorks"
        :key="works.id"
        :works="works"
        @click="openEpisodes(works.id)"
        @edit="openEditWorks"
        @delete="confirmDelete"
      />
    </div>

    <XbPagination
      v-model:currentPage="currentPage"
      :total-pages="totalPages"
    />

    <!-- Create Modal -->
    <WorksFormModal
      v-model:visible="showCreateModal"
      mode="create"
      @confirm="createWorks"
    />

    <!-- Edit Modal -->
    <WorksFormModal
      v-model:visible="showEditModal"
      mode="edit"
      :initial-data="editFormData"
      @confirm="saveWorks"
    />

    <!-- Delete Modal -->
    <XbConfirmModal
      v-model:visible="showDeleteModal"
      title="删除作品"
      confirm-text="删除"
      confirm-type="danger"
      message="确定要删除这个作品吗？此操作不可撤销。"
      @confirm="deleteWorks"
    />

    <!-- Coming Soon Modal -->
    <XbConfirmModal
      v-model:visible="showComingSoonModal"
      title="提示"
      confirm-text="知道了"
      :show-cancel="false"
      message="该功能即将上线，敬请期待！"
    />
  </div>
</template>
