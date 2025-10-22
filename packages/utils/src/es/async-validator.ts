import type { RuleItem } from 'async-validator';

/**
 * - change - 响应 change 值修改事件。
 * - blur - 响应表单失焦事件。
 */
type TriggerType = 'change' | 'blur';

export interface AsyncValidatorItem extends RuleItem {
  /** 在 ui 中的触发方式  */
  trigger: TriggerType
}

/** 生成非空的表单校验规则 */
export function notEmptyRules(message: string, trigger: TriggerType = 'blur'): AsyncValidatorItem[] {
  return [{ required: true, message, trigger }];
}

/** 选项输入必须为 true 的校验规则，多用于 switch、checkbox */
export function mustCheckRules(message: string): AsyncValidatorItem[] {
  return [{
    required: true,
    type: 'enum',
    enum: ['true'],
    transform: (value: any) => String(value),
    message,
    trigger: 'change',
  }];
}

export interface TextInputRuleOptions {
  /** 是否必填 */
  required?: boolean

  /** 长度最小限制 */
  min?: number

  /** 长度最大限制 */
  max?: number
}

/** 文字输入框通用校验规则 */
export function textInputRules(name: string, options?: TextInputRuleOptions, trigger: TriggerType = 'blur'): AsyncValidatorItem[] {
  const {
    required = true,
    min,
    max,
  } = options || {};

  const result: AsyncValidatorItem[] = [];
  if (required)
    result.push(...notEmptyRules(`${name}不得为空`, trigger));

  if (typeof min === 'number' && min > 0) {
    result.push({
      validator: (_rule, value: string, callback) => {
        if (value.length < min)
          callback(`${name}不得少于 ${min} 个字符`);
        else
          callback();
      },
      trigger,
    });
  }

  if (typeof max === 'number') {
    result.push({
      validator: (_rule, value: string, callback) => {
        if (value.length > max)
          callback(`${name}不得超过 ${max} 个字符`);
        else
          callback();
      },
      trigger,
    });
  }
  return result;
}
