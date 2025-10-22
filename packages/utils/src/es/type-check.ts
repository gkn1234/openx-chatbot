import {
  isFunction,
} from 'lodash-es'

/** 获取一个变量的类型字符串 */
export function toTypeString(value: unknown) {
  return Object.prototype.toString.call(value).slice(8, -1)
}

/** 判断一个对象是否为数组 */
export const { isArray } = Array

/** 判断是否为对象，包括数组 */
export function isObjectLike(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}

/** 判断是否为纯对象 */
export function isPlainObject(val: unknown): val is Record<any, any> {
  return toTypeString(val) === 'Object'
}

/** 判断是否为引用类型，不包括数组 */
export function isObject(val: unknown): val is Record<any, any> {
  return isObjectLike(val) && !isArray(val)
}

/** 判断一个值是否为 Promise 对象 */
export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

/** 判断一个值是否为有具体值的数字，不包括 NaN 和 Infinity */
export function isNum(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val) && Math.abs(val) !== Number.POSITIVE_INFINITY
}

/** 判断一个字符串是否为数字字符串，该字符串必须为具体值，不包括 NaN 和 Infinity */
export function isNumStr(val: string): val is `${number}` {
  return val !== '' && val !== null && isNum(Number(val))
}

export {
  isDate,
  isFunction,
  isMap,
  isSet,
} from 'lodash-es'
