<script setup lang="ts">
import { watch, ref } from 'vue'


export type ModalAnimation =
  | 'fade'
  | 'scale'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'
  | 'bounce'
  | 'flip'
  | 'rotate'
  | 'blur'
  | 'elastic'
  | 'wobble'
  | 'tada'
  | 'jello'
  | 'roll-in'
  | 'drop'

const ALL_ANIMATIONS: ModalAnimation[] = [
  'fade', 'scale', 'slide-up', 'slide-down', 'slide-left', 'slide-right',
  'zoom', 'bounce', 'flip', 'rotate', 'blur',
  'elastic', 'wobble', 'tada', 'jello', 'roll-in', 'drop',
]

const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  subtitle?: string
  width?: string
  showClose?: boolean
  closeOnOverlay?: boolean
  persistent?: boolean
  noPadding?: boolean
  animation?: ModalAnimation
}>(), {
  title: '',
  subtitle: '',
  width: 'w-[440px]',
  showClose: true,
  closeOnOverlay: false,
  persistent: false,
  noPadding: false,
  animation: undefined,
})

const activeAnimation = ref<ModalAnimation>('scale')

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

function handleClose() {
  emit('update:visible', false)
  emit('close')
}

function handleOverlayClick() {
  if (props.closeOnOverlay && !props.persistent) {
    handleClose()
  }
}

// Esc key support
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !props.persistent) {
    handleClose()
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    activeAnimation.value = props.animation
      || ALL_ANIMATIONS[Math.floor(Math.random() * ALL_ANIMATIONS.length)]
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  }
}, { immediate: true })
</script>

<template>
  <Teleport to="body">
    <Transition name="xb-modal">
      <div v-if="visible" class="xb-modal-overlay" @click.self="handleOverlayClick">
        <div class="xb-modal-content relative" :class="[width, noPadding ? 'xb-modal-content--no-padding' : '', `xb-modal-anim-${activeAnimation}`]">
          <!-- Close button -->
          <button
            v-if="showClose"
            class="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-surface-overlay transition-colors"
            @click="handleClose"
          >
            <XbIcon name="x" :size="18" />
          </button>

          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-center justify-between mb-4 pr-10" :class="noPadding ? 'px-6 pt-4' : ''">
            <slot name="header">
              <div>
                <h3 class="text-base font-semibold text-content">{{ title }}</h3>
                <p v-if="subtitle" class="text-sm text-content-secondary mt-1">{{ subtitle }}</p>
              </div>
            </slot>
          </div>

          <!-- Body -->
          <div class="xb-modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="mt-6">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.xb-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(0 0% 0% / 0.6);
  backdrop-filter: blur(4px);
}

.xb-modal-content {
  border-radius: 1rem;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--surface-elevated));
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  max-height: 85vh;
  overflow-y: auto;
}

.xb-modal-content--no-padding {
  padding: 0;
  max-height: none;
  overflow-y: visible;
  overflow: hidden;
}

.xb-modal-body {
  overflow-y: auto;
}

/* Transition: overlay fade (shared) */
.xb-modal-enter-active {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from,
.xb-modal-leave-to {
  opacity: 0;
}

/******************************
 *  Animation: fade
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-fade,
.xb-modal-leave-active .xb-modal-content.xb-modal-anim-fade {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-fade,
.xb-modal-leave-to .xb-modal-content.xb-modal-anim-fade {
  opacity: 0;
}

/******************************
 *  Animation: scale
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-scale {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-scale {
  transition: transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-scale {
  opacity: 0;
  transform: scale(0.75);
}

.xb-modal-leave-to .xb-modal-content.xb-modal-anim-scale {
  opacity: 0;
  transform: scale(0.75);
}

/******************************
 *  Animation: slide-up
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-slide-up {
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-slide-up {
  transition: transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-slide-up {
  opacity: 0;
  transform: translateY(80px);
}

.xb-modal-leave-to .xb-modal-content.xb-modal-anim-slide-up {
  opacity: 0;
  transform: translateY(80px);
}

/******************************
 *  Animation: slide-down
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-slide-down {
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-slide-down {
  transition: transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-slide-down {
  opacity: 0;
  transform: translateY(-80px);
}

.xb-modal-leave-to .xb-modal-content.xb-modal-anim-slide-down {
  opacity: 0;
  transform: translateY(-80px);
}

/******************************
 *  Animation: slide-left
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-slide-left {
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-slide-left {
  transition: transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-slide-left {
  opacity: 0;
  transform: translateX(120px);
}

.xb-modal-leave-to .xb-modal-content.xb-modal-anim-slide-left {
  opacity: 0;
  transform: translateX(120px);
}

/******************************
 *  Animation: slide-right
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-slide-right {
  transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-slide-right {
  transition: transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-slide-right {
  opacity: 0;
  transform: translateX(-120px);
}

.xb-modal-leave-to .xb-modal-content.xb-modal-anim-slide-right {
  opacity: 0;
  transform: translateX(-120px);
}

/******************************
 *  Animation: zoom
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-zoom {
  transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-zoom {
  transition: transform 0.35s cubic-bezier(0.4, 0, 1, 1), opacity 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-zoom {
  opacity: 0;
  transform: scale(0.15);
}

.xb-modal-leave-to .xb-modal-content.xb-modal-anim-zoom {
  opacity: 0;
  transform: scale(0.15);
}

/******************************
 *  Animation: bounce
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-bounce {
  transition: transform 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-bounce {
  transition: transform 0.45s cubic-bezier(0.4, 0, 1, 1), opacity 0.35s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-bounce {
  opacity: 0;
  transform: scale(0.35) translateY(-100px);
}

.xb-modal-leave-to .xb-modal-content.xb-modal-anim-bounce {
  opacity: 0;
  transform: scale(0.35) translateY(-100px);
}

/******************************
 *  Animation: flip
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-flip {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-flip {
  transition: transform 0.4s cubic-bezier(0.4, 0, 1, 1), opacity 0.35s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-flip {
  opacity: 0;
  transform: perspective(600px) rotateX(-60deg);
}

.xb-modal-leave-to .xb-modal-content.xb-modal-anim-flip {
  opacity: 0;
  transform: perspective(600px) rotateX(60deg);
}

/******************************
 *  Animation: rotate
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-rotate {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-rotate {
  transition: transform 0.4s cubic-bezier(0.4, 0, 1, 1), opacity 0.35s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-rotate {
  opacity: 0;
  transform: rotate(-180deg) scale(0.3);
}

.xb-modal-leave-to .xb-modal-content.xb-modal-anim-rotate {
  opacity: 0;
  transform: rotate(180deg) scale(0.3);
}

/******************************
 *  Animation: blur
 ******************************/
.xb-modal-enter-active .xb-modal-content.xb-modal-anim-blur {
  transition: filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-blur {
  transition: filter 0.4s cubic-bezier(0.4, 0, 1, 1), opacity 0.35s cubic-bezier(0.4, 0, 1, 1);
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-blur {
  opacity: 0;
  filter: blur(20px);
}

.xb-modal-leave-to .xb-modal-content.xb-modal-anim-blur {
  opacity: 0;
  filter: blur(20px);
}

.xb-modal-enter-to .xb-modal-content.xb-modal-anim-blur,
.xb-modal-leave-from .xb-modal-content.xb-modal-anim-blur {
  filter: blur(0px);
}

/******************************
 *  Animation: elastic
 ******************************/
@keyframes xb-modal-elastic-in {
  0%   { transform: scale(0); opacity: 0; }
  50%  { transform: scale(1.25); }
  70%  { transform: scale(0.92); }
  85%  { transform: scale(1.06); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes xb-modal-elastic-out {
  0%   { transform: scale(1); opacity: 1; }
  40%  { transform: scale(1.12); }
  100% { transform: scale(0); opacity: 0; }
}

.xb-modal-enter-active .xb-modal-content.xb-modal-anim-elastic {
  animation: xb-modal-elastic-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-elastic {
  animation: xb-modal-elastic-out 0.35s cubic-bezier(0.4, 0, 1, 1) forwards;
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-elastic,
.xb-modal-leave-to .xb-modal-content.xb-modal-anim-elastic {
  opacity: 0;
}

/******************************
 *  Animation: wobble
 ******************************/
@keyframes xb-modal-wobble-in {
  0%   { transform: translateX(-120%) rotate(-6deg); opacity: 0; }
  20%  { transform: translateX(12%) rotate(5deg); }
  40%  { transform: translateX(-8%) rotate(-4deg); }
  60%  { transform: translateX(5%) rotate(3deg); }
  80%  { transform: translateX(-2%) rotate(-1deg); }
  100% { transform: translateX(0) rotate(0); opacity: 1; }
}

@keyframes xb-modal-wobble-out {
  0%   { transform: translateX(0) rotate(0); opacity: 1; }
  30%  { transform: translateX(-15%) rotate(-4deg); }
  100% { transform: translateX(120%) rotate(6deg); opacity: 0; }
}

.xb-modal-enter-active .xb-modal-content.xb-modal-anim-wobble {
  animation: xb-modal-wobble-in 0.7s ease forwards;
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-wobble {
  animation: xb-modal-wobble-out 0.35s ease forwards;
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-wobble,
.xb-modal-leave-to .xb-modal-content.xb-modal-anim-wobble {
  opacity: 0;
}

/******************************
 *  Animation: tada
 ******************************/
@keyframes xb-modal-tada-in {
  0%   { transform: scale(0.2) rotate(-18deg); opacity: 0; }
  45%  { transform: scale(1.15) rotate(6deg); }
  70%  { transform: scale(0.95) rotate(-3deg); }
  85%  { transform: scale(1.03) rotate(2deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

@keyframes xb-modal-tada-out {
  0%   { transform: scale(1) rotate(0); opacity: 1; }
  40%  { transform: scale(1.15) rotate(-5deg); }
  100% { transform: scale(0.2) rotate(10deg); opacity: 0; }
}

.xb-modal-enter-active .xb-modal-content.xb-modal-anim-tada {
  animation: xb-modal-tada-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-tada {
  animation: xb-modal-tada-out 0.35s cubic-bezier(0.4, 0, 1, 1) forwards;
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-tada,
.xb-modal-leave-to .xb-modal-content.xb-modal-anim-tada {
  opacity: 0;
}

/******************************
 *  Animation: jello
 ******************************/
@keyframes xb-modal-jello-in {
  0%   { transform: scale(0, 0); opacity: 0; }
  20%  { transform: scale(1.2, 0.8); }
  40%  { transform: scale(0.85, 1.15); }
  60%  { transform: scale(1.08, 0.92); }
  80%  { transform: scale(0.96, 1.04); }
  100% { transform: scale(1, 1); opacity: 1; }
}

@keyframes xb-modal-jello-out {
  0%   { transform: scale(1, 1); opacity: 1; }
  30%  { transform: scale(1.2, 0.8); }
  100% { transform: scale(0, 0); opacity: 0; }
}

.xb-modal-enter-active .xb-modal-content.xb-modal-anim-jello {
  animation: xb-modal-jello-in 0.65s ease forwards;
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-jello {
  animation: xb-modal-jello-out 0.35s ease forwards;
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-jello,
.xb-modal-leave-to .xb-modal-content.xb-modal-anim-jello {
  opacity: 0;
}

/******************************
 *  Animation: roll-in
 ******************************/
@keyframes xb-modal-roll-in {
  0%   { transform: translateX(-200%) rotate(-540deg); opacity: 0; }
  100% { transform: translateX(0) rotate(0); opacity: 1; }
}

@keyframes xb-modal-roll-out {
  0%   { transform: translateX(0) rotate(0); opacity: 1; }
  100% { transform: translateX(200%) rotate(540deg); opacity: 0; }
}

.xb-modal-enter-active .xb-modal-content.xb-modal-anim-roll-in {
  animation: xb-modal-roll-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-roll-in {
  animation: xb-modal-roll-out 0.4s cubic-bezier(0.4, 0, 1, 1) forwards;
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-roll-in,
.xb-modal-leave-to .xb-modal-content.xb-modal-anim-roll-in {
  opacity: 0;
}

/******************************
 *  Animation: drop
 ******************************/
@keyframes xb-modal-drop-in {
  0%   { transform: translateY(-400px); opacity: 0; }
  55%  { transform: translateY(30px); }
  70%  { transform: translateY(-12px); }
  85%  { transform: translateY(6px); }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes xb-modal-drop-out {
  0%   { transform: translateY(0); opacity: 1; }
  40%  { transform: translateY(30px); }
  100% { transform: translateY(-300px); opacity: 0; }
}

.xb-modal-enter-active .xb-modal-content.xb-modal-anim-drop {
  animation: xb-modal-drop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.xb-modal-leave-active .xb-modal-content.xb-modal-anim-drop {
  animation: xb-modal-drop-out 0.35s cubic-bezier(0.4, 0, 1, 1) forwards;
}

.xb-modal-enter-from .xb-modal-content.xb-modal-anim-drop,
.xb-modal-leave-to .xb-modal-content.xb-modal-anim-drop {
  opacity: 0;
}
</style>
