import { Value } from "@sinclair/typebox/value";
import { type Static, TypeBox } from "@sinclair/typemap";
import type { Source } from "./sources/type";

/**
 * Configures and decodes values based on the provided schema and sources.
 *
 * @template Schema - The schema type used for decoding.
 * @param {Schema} params.schema - The schema definition for validation and decoding.
 * @param {Source[]} params.sources - An array of sources to retrieve key-value pairs.
 * @param {string} [params.delimeter="_"] - The delimiter used to convert keys into nested objects.
 * @returns - The decoded and transformed values according to the schema.
 */

export async function konfigure<Schema extends object | string>({
	schema,
	sources,
	delimeter = "_",
}: {
	schema: Schema;
	sources: Source[];
	delimeter?: string;
}) {
	const convertedSchema = TypeBox(schema);

	const values = {};

	for (const source of sources.reverse()) {
		const newRead = await source();
		for (const [key, value] of Object.entries(newRead)) {
			(values as any)[key] = value;
		}
	}
	const convertedValues = convertFromDelimeter(values, delimeter);
	const cleanedValues = Value.Clean(convertedSchema, convertedValues);
	return Value.Decode(convertedSchema, cleanedValues) as Static<Schema>;
}

/**
 * Given an object with keys that are delimeter-separated strings, returns a new
 * object with the same values but with nested objects instead of delimeter-separated
 * strings as keys.
 *
 * @example
 * const input = {
 * 	"foo.bar": "baz",
 * 	"foo.baz": "qux",
 * };
 *
 * const output = convertFromDelimeter(input, ".");
 *
 * // output is {
 * // 	foo: {
 * // 		bar: "baz",
 * // 		baz: "qux",
 * // 	},
 * // };
 */
function convertFromDelimeter(object: Record<string, any>, delimeter: string) {
	const result: Record<string, any> = {};

	for (const [key, value] of Object.entries(object)) {
		const pathSegments = key.split(delimeter);

		if (pathSegments.length === 1) {
			result[pathSegments[0]!] = value;
			continue;
		}

		let current = result;
		for (const segment of pathSegments.slice(0, -1)) {
			if (!current[segment]) {
				current[segment] = {};
				current = current[segment];
			} else {
				current = current[segment];
			}
		}
		current[pathSegments[pathSegments.length - 1]!] = value;
	}
	return result;
}
