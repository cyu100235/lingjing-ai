import type { App, Plugin } from 'vue'

// Import components
import XbButton from './XbButton/index.vue'
import XbModal from './XbModal/index.vue'
import XbConfirmModal from './XbConfirmModal/index.vue'
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
}

// Export types
export type { TabItem } from './XbTabs/index.vue'
export type { MenuItem } from './XbMenu/index.vue'
export type { FormRule, FormFieldState } from './XbForm/index.vue'
export type { SelectOption } from './XbSelect/index.vue'
export type { ModalAnimation } from './XbModal/index.vue'
