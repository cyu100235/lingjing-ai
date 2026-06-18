export interface MenuItem {
  label: string
  value: string
  icon?: string
  disabled?: boolean
  divider?: boolean
  children?: MenuItem[]
  danger?: boolean
}
