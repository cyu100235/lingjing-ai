import { ref } from 'vue'

// Global modal stack — only the topmost modal responds to keyboard shortcuts
const stack = ref<string[]>([])

let idCounter = 0

/** Generate a unique modal ID */
export function createModalId(): string {
  return `xb-modal-${++idCounter}`
}

/** Push a modal onto the stack (call when visible becomes true) */
export function pushModal(id: string): void {
  if (!stack.value.includes(id)) {
    stack.value.push(id)
  }
}

/** Remove a modal from the stack (call when visible becomes false) */
export function removeModal(id: string): void {
  stack.value = stack.value.filter(item => item !== id)
}

/** Check whether the given modal is the topmost (last opened) one */
export function isTopModal(id: string): boolean {
  if (stack.value.length === 0) return false
  return stack.value[stack.value.length - 1] === id
}