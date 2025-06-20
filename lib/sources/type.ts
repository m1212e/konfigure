export type MaybePromise<T> = T | Promise<T>;
export type Source = {
	name: string;
	resolver: () => MaybePromise<Record<string, any>>;
};
