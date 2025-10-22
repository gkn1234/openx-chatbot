import type { DefineComponent, UnwrapRef } from 'vue'

type NativeType = null | number | string | boolean | symbol | Function
type InferDefault<P, T> = ((props: P) => T & object) | (T extends NativeType ? T : never)

export type InferVueDefaults<T> = {
  [K in keyof T]?: InferDefault<T, T[K]>;
}

export type ComponentProps<T> = T extends new () => { $props: infer P } ? NonNullable<P> :
  T extends (props: infer P, ...args: any) => any ? P : Record<string, never>

export type ComponentSlots<T> = T extends new () => { $slots: infer S } ? NonNullable<S> :
  T extends (props: any, ctx: { slots: infer S, attrs: any, emit: any }, ...args: any) => any ? NonNullable<S> : Record<string, never>

export type ComponentEmit<T> = T extends new () => { $emit: infer E } ? NonNullable<E> :
  T extends (props: any, ctx: { slots: any, attrs: any, emit: infer E }, ...args: any) => any ? NonNullable<E> : Record<string, never>

export type ComponentExposed<T> = T extends new () => infer E ? E :
  T extends (props: any, ctx: any, expose: (exposed: infer E) => any, ...args: any) => any ? NonNullable<E> : Record<string, never>

/**
 * 解决泛型组件无法正确获取组件实例类型的问题，用于在这种情况下替代 InstanceType
 *
 * 参考：https://github.com/vuejs/language-tools/issues/3206
 */
export type GenericInstanceType<T> = T extends new (...args: any[]) => infer R
  ? R
  : T extends (...args: any[]) => infer R
    ? R extends { __ctx?: infer K }
      ? Exclude<K, void> extends { expose: (...args: infer L) => void }
        ? UnwrapRef<L[0]> & InstanceType<DefineComponent>
        : any
      : any
    : any
