import { readFile } from "node:fs/promises";
import type { Source } from "./type";

/**
 * A source that reads values from a json file.
 *
 * @returns the content of the json file
 *
 * @example
 * konfigure({
 *   schema: Type.Object({
 *     foo: Type.String(),
 *   }),
 *   sources: [jsonFile("./example.json")],
 * })
 */
export function jsonFile(filepath: string): Source {
	return async () => {
		try {
			const data = await readFile(filepath, "utf-8");
			return JSON.parse(data);
		} catch (error) {
			console.error(`Failed to read json file: ${filepath}, error: ${error}`);
			return {};
		}
	};
}
