import type { App, Plugin } from 'vue'

// Import components
import XbButton from './XbButton/index.vue'
import XbModal from './XbModal/index.vue'
import XbConfirmModal from './XbConfirmModal/index.vue'
import { XbConfirm } from './XbConfirmModal/method'
export type { ConfirmModalOptions } from './XbConfirmModal/method'
import XbCard from './XbCard/index.vue'
import XbTabs from './XbTabs/index.vue'
import XbMenu from './XbMenu/index.vue'
import XbInput from './XbInput/index.vue'
import XbForm from './XbForm/index.vue'
import XbFormItem from './XbFormItem/index.vue'
import XbPagination from './XbPagination/index.vue'
import XbEmpty from './XbEmpty/index.vue'
import XbIcon from './XbIcon/index.vue'
import XbTextarea from './XbTextarea/index.vue'
import XbSelect from './XbSelect/index.vue'
import XbTag from './XbTag/index.vue'
import XbRadioButton from './XbRadioButton/index.vue'
import XbRadioGroup from './XbRadioGroup/index.vue'
import XbCheckedButton from './XbCheckedButton/index.vue'
import XbSteps from './XbSteps/index.vue'
import XbTooltip from './XbTooltip/index.vue'
import XbVideoPlayer from './XbVideoPlayer/index.vue'
import { XbMessage } from './XbMessage/method'

// All components
const components: Record<string, any> = {
  XbButton,
  XbModal,
  XbConfirmModal,
  XbCard,
  XbTabs,
  XbMenu,
  XbInput,
  XbForm,
  XbFormItem,
  XbPagination,
  XbEmpty,
  XbIcon,
  XbTextarea,
  XbSelect,
  XbTag,
  XbRadioButton,
  XbRadioGroup,
  XbCheckedButton,
  XbSteps,
  XbTooltip,
  XbVideoPlayer,
}
// Vue plugin
const xbUi: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
  },
}

// Export plugin
export default xbUi

// Export components individually
export {
  XbButton,
  XbVideoPlayer,
  XbModal,
  XbConfirmModal,
  XbCard,
  XbTabs,
  XbMenu,
  XbInput,
  XbForm,
  XbFormItem,
  XbPagination,
  XbEmpty,
  XbIcon,
  XbTextarea,
  XbSelect,
  XbTag,
  XbRadioButton,
  XbRadioGroup,
  XbCheckedButton,
  XbSteps,
  XbTooltip,
  XbMessage,
  XbConfirm,
}

// Export types
export type { TabItem } from './XbTabs/types'
export type { MenuItem } from './XbMenu/types'
export type { FormRule, FormFieldState } from './XbForm/types'
export type { SelectOption } from './XbSelect/types'
export type { ModalAnimation } from './XbConfirmModal/method'
export type { StepItem } from './XbSteps/types'
export type { MessageOptions } from './XbMessage/method'
