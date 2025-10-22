import type { Ref } from 'vue'

export interface UseFormOptions<Form extends object = Record<string, any>> {
  /** 表单对象初始化 */
  form: Form

  /**
   * 如何校验表单是否发生改变
   *
   * @returns 返回 true 代表表单发生了改变
   * @default (form, oldForm) => !lodash.isEqual(form, oldForm)
   */
  checkModified?: (form: Form, oldForm: Form) => boolean

  /** 表单提交时，经过对比发现表单完全没有修改时触发的钩子 */
  onNotModified?: () => void

  /** 表单校验失败时触发的钩子 */
  onInvalid?: (invalidFields?: Record<string, ValidateError[]>) => void
}

export type UseFormSubmitHandler = () => Promise<any>

/** 表单提交配置选项 */
export interface UseFormSubmitOptions<
  Form extends object = Record<string, any>,
  FormElement extends BaseFormElement = BaseFormElement,
> extends Pick<UseFormOptions<Form>, 'checkModified'> {
  /** 表单提交行为，异步函数 */
  handler?: UseFormSubmitHandler

  /**
   * 是否检查表单项的修改行为。若为 true，未修改表单将导致校验失败
   * @default true
   */
  modified?: boolean

  /**
   * 是否校验表单项
   * @default true
   */
  validate?: boolean

  /** 若不为空，校验行为仅对表单的部分字段进行校验；为空时校验全部表单项 */
  validateFields?: (keyof Form)[]

  /**
   * 提交表单时相关联的表单校验对象。
   *
   * 此参数建议在一个表单 hooks 对应多个 <el-form> 对象时使用
   *
   * 默认为 this.formEl
   *
   * 这个对象为 ref(undefined) 或 ref(null) 时会跳过表单校验
   */
  el?: Ref<FormElement | undefined | null>
}

export interface ValidateError {
  message?: string
  fieldValue?: any
  field?: string
}

export interface ValidateFieldCallback {
  /**
   * The callback to tell the field validation result
   *
   * @param errorMessage The error message. It will be empty if there is no error
   */
  (isValid: boolean, invalidFields?: Record<string, ValidateError[]>): void
}

export interface BaseFormElement {
  /** 表单元素提供校验方法接口，类似 element */
  validate(callback?: ValidateFieldCallback): Promise<boolean>

  /**
   * Validate certain form items
   *
   * @param props The property of `model` or array of prop which is going to validate
   * @param callback A callback to tell the field validation result
   */
  validateField (props?: string | string[], callback?: ValidateFieldCallback): Promise<boolean>

  /** clear validation message for certain fields */
  clearValidate (props?: string | string[]): void

  /** 滚动到某个表单项 */
  scrollToField (props: string): void

  /** 重置某个表单项为初始值，并移除校验结果 */
  resetFields (props?: string | string[]): void
}

/**
 * 表单错误类型
 * - NOT_MODIFIED - 表单未修改
 * - INVALID - 表单校验非法
 * - ERROR - 其他错误
 */
export type UseFormErrorCode = 'NOT_MODIFIED' | 'INVALID' | 'ERROR'

/** 表单验证专属错误 */
export interface UseFormError extends Error {
  code: UseFormErrorCode
}
