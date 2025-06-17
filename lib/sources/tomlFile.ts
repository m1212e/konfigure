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
	return async () => {
		try {
			const data = await readFile(filepath, "utf-8");
			return parse(data);
		} catch (error) {
			console.error(`Failed to read toml file: ${filepath}, error: ${error}`);
			return {};
		}
	};
}
