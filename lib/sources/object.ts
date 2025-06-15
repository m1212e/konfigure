import type { Source } from "./type";

/**
 * A source that reads values from a provided object
 *
 * @returns the provided object
 *
 * @example
 * konfigure({
 *   schema: Type.Object({
 *     foo: Type.String(),
 *   }),
 *   sources: [dockerSecrets()],
 * })
 */
export function object(object: Record<string, unknown>): Source {
	return () => object;
}
