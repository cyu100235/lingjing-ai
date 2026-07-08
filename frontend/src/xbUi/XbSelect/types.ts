export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  [key: string]: any
}

export type SelectSize = 'sm' | 'md' | 'lg'
