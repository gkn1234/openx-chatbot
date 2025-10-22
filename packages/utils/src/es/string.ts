/**
 * 字符串转换为正则表达式，将 + \ ? * . 等特殊字符转义
 * @param str 待转换字符串
 * @param flags 正则标识
 * @returns 转换后的正则对象
 */
export function strToReg(str: string, flags?: string) {
  const regStr = str.replace(/([+|.*?\\:{|}()[\]<>^$])/g, '\\$1');
  return new RegExp(regStr, flags);
}

export {
  camelCase,
  kebabCase,
  snakeCase,
  template,
} from 'lodash-es';
