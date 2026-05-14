<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'


export interface MenuItem {
  label: string
  value: string
  icon?: string
  disabled?: boolean
  divider?: boolean
  children?: MenuItem[]
  danger?: boolean
}

const props = withDefaults(defineProps<{
  visible: boolean
  items: MenuItem[]
  trigger?: 'click' | 'hover'
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
}>(), {
  trigger: 'click',
  placement: 'bottom-start',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  select: [value: string]
}>()

const menuRef = ref<HTMLElement | null>(null)
const submenuOpen = ref<string | null>(null)
const submenuTimer = ref<ReturnType<typeof setTimeout> | null>(null)

function handleSelect(item: MenuItem) {
  if (item.disabled) return
  if (item.children?.length) return
  emit('select', item.value)
  emit('update:visible', false)
}

function handleSubmenuHover(item: MenuItem, open: boolean) {
  if (props.trigger !== 'hover') return
  if (submenuTimer.value) clearTimeout(submenuTimer.value)
  if (open && item.children?.length) {
    submenuOpen.value = item.value
  } else {
    submenuTimer.value = setTimeout(() => {
      submenuOpen.value = null
    }, 150)
  }
}

function handleSubmenuClick(item: MenuItem) {
  if (!item.children?.length) return
  submenuOpen.value = submenuOpen.value === item.value ? null : item.value
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('update:visible', false)
    submenuOpen.value = null
  }
}

watch(() => props.visible, (val) => {
  if (!val) {
    submenuOpen.value = null
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
})

const placementClasses: Record<string, string> = {
  'bottom-start': 'top-full left-0 mt-1',
  'bottom-end': 'top-full right-0 mt-1',
  'top-start': 'bottom-full left-0 mb-1',
  'top-end': 'bottom-full right-0 mb-1',
}
</script>

<template>
  <div ref="menuRef" class="xb-menu relative inline-block">
    <!-- Trigger -->
    <div
      @click="trigger === 'click' ? emit('update:visible', !visible) : undefined"
      @mouseenter="trigger === 'hover' ? emit('update:visible', true) : undefined"
      @mouseleave="trigger === 'hover' ? emit('update:visible', false) : undefined"
    >
      <slot name="trigger" />
    </div>

    <!-- Dropdown -->
    <Transition name="xb-menu">
      <div
        v-if="visible"
        class="xb-menu-dropdown absolute z-50 min-w-[160px] py-1 rounded-lg border border-border bg-surface-elevated shadow-lg"
        :class="placementClasses[placement]"
      >
        <template v-for="item in items" :key="item.value">
          <!-- Divider -->
          <div v-if="item.divider" class="my-1 h-px bg-border" />

          <!-- Menu Item -->
          <div
            class="relative"
            @mouseenter="handleSubmenuHover(item, true)"
            @mouseleave="handleSubmenuHover(item, false)"
          >
            <button
              class="xb-menu-item w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
              :class="[
                item.disabled
                  ? 'text-content-tertiary cursor-not-allowed opacity-50'
                  : item.danger
                    ? 'text-danger hover:bg-danger/10 cursor-pointer'
                    : 'text-content-secondary hover:text-content hover:bg-surface-overlay cursor-pointer',
              ]"
              @click="item.children?.length ? handleSubmenuClick(item) : handleSelect(item)"
            >
              <XbIcon v-if="item.icon" :name="item.icon" :size="14" class="shrink-0" />
              <span class="flex-1 text-left">{{ item.label }}</span>
              <XbIcon
                v-if="item.children?.length"
                name="chevron-right"
                :size="12"
                class="shrink-0 text-content-tertiary"
              />
            </button>

            <!-- Submenu -->
            <Transition name="xb-menu">
              <div
                v-if="item.children?.length && submenuOpen === item.value"
                class="absolute left-full top-0 ml-1 min-w-[140px] py-1 rounded-lg border border-border bg-surface-elevated shadow-lg z-50"
              >
                <template v-for="child in item.children" :key="child.value">
                  <div v-if="child.divider" class="my-1 h-px bg-border" />
                  <button
                    v-else
                    class="xb-menu-item w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                    :class="[
                      child.disabled
                        ? 'text-content-tertiary cursor-not-allowed opacity-50'
                        : child.danger
                          ? 'text-danger hover:bg-danger/10 cursor-pointer'
                          : 'text-content-secondary hover:text-content hover:bg-surface-overlay cursor-pointer',
                    ]"
                    @click="handleSelect(child)"
                  >
                    <XbIcon v-if="child.icon" :name="child.icon" :size="14" class="shrink-0" />
                    <span class="flex-1 text-left">{{ child.label }}</span>
                  </button>
                </template>
              </div>
            </Transition>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.xb-menu-enter-active,
.xb-menu-leave-active {
  transition: all 0.15s ease;
}
.xb-menu-enter-from,
.xb-menu-leave-to {
  opacity: 0;
  transform: scaleY(0.9) translateY(-4px);
  transform-origin: top;
}
</style>
