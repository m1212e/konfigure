import { readFile, readdir } from "node:fs/promises";
import type { Source } from "./type";

/**
 * A source that reads values from docker secrets.
 *
 * @returns an object with key-value pairs where the keys are the names of the
 * secrets and the values are the contents of the files.
 *
 * @example
 * konfigure({
 *   schema: Type.Object({
 *     foo: Type.String(),
 *   }),
 *   sources: [dockerSecrets()],
 * })
 */
export function dockerSecrets(): Source {
	return async () => {
		const secrets = await readdir("/run/secrets");
		const result: Record<string, string> = {};
		for (const secret of secrets) {
			const value = await readFile(`/run/secrets/${secret}`, "utf-8");
			result[secret] = value;
		}
		return result;
	};
}
