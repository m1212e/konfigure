import { readFile } from "node:fs/promises";
import { parse } from "toml";
import type { Source } from "./type";

/**
 * A source that reads values from a toml file.
 *
 * @returns the content of the toml file
 *
 * @example
 * konfigure({
 *   schema: Type.Object({
 *     foo: Type.String(),
 *   }),
 *   sources: [tomlFile("./example.toml")],
 * })
 */
export function tomlFile(filepath: string): Source {
	return {
		name: `TOML file at ${filepath}`,
		resolver: async () => {
			const data = await readFile(filepath, "utf-8");
			return parse(data);
		},
	};
}
