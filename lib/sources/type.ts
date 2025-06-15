export type MaybePromise<T> = T | Promise<T>;
export type Source = () => MaybePromise<Record<string, any>>;
