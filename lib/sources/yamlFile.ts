import { readFile } from "node:fs/promises";
import { load } from "js-yaml";
import type { Source } from "./type";

/**
 * A source that reads values from a yaml file.
 *
 * @returns the content of the toml file
 *
 * @example
 * konfigure({
 *   schema: Type.Object({
 *     foo: Type.String(),
 *   }),
 *   sources: [yamlFile("./example.yaml")],
 * })
 */
export function yamlFile(filepath: string): Source {
	return {
		name: `YAML file at ${filepath}`,
		resolver: async () => {
			const data = await readFile(filepath, "utf-8");
			return load(data);
		},
	};
}
