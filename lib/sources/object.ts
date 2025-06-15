import type { Source } from "./type";

export function object(object: Record<string, unknown>): Source {
	return () => object;
}
