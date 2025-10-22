/** 区别于 type-fest 的 Promisable，使用原生 Promise 进行类型拓展 */
export type RawPromisable<T> = T | Promise<T>;

export type Func<T = any> = (...args: any[]) => T;
export type Functionable<T> = T | Func<T>;

export type NotUndefined<T> = Exclude<T, undefined>;
export type WithUndefined<T> = T | undefined;

export type NotNull<T> = Exclude<T, null>;
export type WithNull<T> = T | null;

export type NotEmpty<T> = Exclude<T, undefined | null>;
export type WithEmpty<T> = T | undefined | null;
