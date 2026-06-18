export interface FormRule {
  required?: boolean
  message: string
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string | Promise<boolean | string>
}

export interface FormFieldState {
  value: any
  error: string
  touched: boolean
}
