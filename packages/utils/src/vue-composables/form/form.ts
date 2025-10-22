import { isEqual } from 'lodash-es'
import { reactive, ref } from 'vue'
import { cloneDeep, isFunction, isObject } from '../../es'
import type {
  BaseFormElement,
  UseFormError,
  UseFormErrorCode,
  UseFormOptions,
  UseFormSubmitHandler,
  UseFormSubmitOptions,
  ValidateFieldCallback,
} from './types'

export class UseForm<
  Form extends object = Record<string, any>,
  FormElement extends BaseFormElement = BaseFormElement,
> {
  static defaultOptions<Form extends object = Record<string, any>>(): Required<UseFormOptions<Form>> {
    return {
      form: {} as Form,
      checkModified: (a, b) => !isEqual(a, b),
      onNotModified: () => {},
      onInvalid: () => {},
    }
  }

  static error(code: UseFormErrorCode, message: string) {
    const error = new Error(message) as UseFormError
    error.code = code
    return error
  }

  private _options: Required<UseFormOptions<Form>>

  /** 检查表单数据是否修改的对比目标 */
  private _originForm: Form

  /** 检查表单数据是否修改的对比目标，对外只读 */
  get originForm() {
    return this._originForm
  }

  /** 表单数据 */
  form: Form

  /** 表单元素 */
  formEl = ref<FormElement>()

  /** 表单提交 loading 状态 */
  loading = ref(false)

  constructor(options?: UseFormOptions<Form>) {
    this._options = {
      ...UseForm.defaultOptions(),
      ...options,
    }

    this.form = reactive(cloneDeep(this._options.form)) as Form
    this._originForm = this._options.form
  }

  /**
   * 设置表单对象
   * @param form 表单设置项。若设置项为空，则设置为选项中的初始表单
   * @param sync 是否同步更新原始对比表单
   */
  set(form?: Partial<Form> | null, sync: boolean = false) {
    if (!form) {
      if (sync)
        Object.assign(this._originForm, this._options.form)
      Object.assign(this.form, cloneDeep(this._options.form))
    }
    else {
      if (sync)
        Object.assign(this._originForm, form)
      Object.assign(this.form, cloneDeep(form))
    }
  }

  setOptions(options: Omit<UseFormOptions<Form>, 'form'>) {
    Object.assign(this._options, options)
  }

  /** 以当前的表单数据，同步原始对比表单 */
  sync() {
    Object.assign(this._originForm, cloneDeep(this.form))
  }

  /**
   * 重置表单的值为初始设定值
   * @param sync 是否同步重置原始对比表单
   */
  reset(sync: boolean = false) {
    this.set(undefined, sync)
  }

  /** 重置表单的值为原始对比表单 */
  resetOrigin() {
    this.set(this._originForm)
  }

  hasModified() {
    return this._options.checkModified(this.form, this._originForm)
  }

  async submit(config: UseFormSubmitOptions<Form, FormElement> | UseFormSubmitHandler | null = null) {
    const options = isObject(config) && !isFunction(config) ? config : {}
    const {
      modified = true,
      validate = true,
      validateFields = [],
      el = this.formEl,
      checkModified,
    } = options
    const handler = !isObject(config) ? config : options.handler

    const hasModified = !isFunction(checkModified) ?
      this.hasModified.bind(this) :
        () => checkModified(this.form, this._originForm)

    const invalidHandler: ValidateFieldCallback = (isValid, fields) => {
      if (!isValid)
        this._options.onInvalid(fields)
    }

    if (validate) {
      this.loading.value = true
      if (!el.value) {
        return Promise.reject(UseForm.error(
          'ERROR',
          'Form element is not ready!',
        ))
      }

      let res: boolean
      if (validateFields.length === 0 || !validateFields)
        res = await el.value.validate(invalidHandler).then(res => res).catch(() => false)
      else
        res = await el.value.validateField(validateFields as string[], invalidHandler).then(res => res).catch(() => false)

      if (!res) {
        this.loading.value = false
        return Promise.reject(UseForm.error(
          'INVALID',
          'Form validate failed!',
        ))
      }
    }

    if (modified && !hasModified()) {
      this._options.onNotModified()
      return Promise.reject(UseForm.error(
        'NOT_MODIFIED',
        'Form has not been modified!',
      ))
    }

    if (!isFunction(handler))
      return

    this.loading.value = true
    try {
      await handler()
    }
    catch (err) {
      return Promise.reject(err)
    }
    finally {
      this.loading.value = false
    }
  }
}
