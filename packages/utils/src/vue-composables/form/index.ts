import { UseForm } from './form'
import type {
  BaseFormElement,
  UseFormOptions,
} from './types'

/**
 * 创建表单处理对象
 * @typeParam ListItem 第一个泛型参数代表列表元素的类型，若不传，则无法推断 pagination.list 的类型
 * @param options
 * @returns 分页列表对象
 */
export function useForm<
  Form extends object = Record<string, any>,
  FormElement extends BaseFormElement = BaseFormElement,
>(options?: UseFormOptions<Form>) {
  return new UseForm<Form, FormElement>(options)
}

export { UseForm }
export * from './types'
