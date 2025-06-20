import type { Source } from "./type";

/**
 * A source that reads values from the process environment.
 *
 * @returns an object with key-value pairs matching the environment variables
 *
 * @example
 * konfigure({
 *   schema: Type.Object({
 *     foo: Type.String(),
 *   }),
 *   sources: [env()],
 * })
 */
export function env(): Source {
	return {
		name: "Environment variables",
		resolver: () => process.env,
	};
}
