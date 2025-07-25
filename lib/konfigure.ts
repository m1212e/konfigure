import { Value } from "@sinclair/typebox/value";
import { type Static, TypeBox } from "@sinclair/typemap";
import type { Source } from "./sources/type";

/**
 * Configures and decodes values based on the provided schema and sources.
 *
 * @template Schema - The schema type used for decoding.
 * @param {Schema} params.schema - The schema definition for validation and decoding.
 * @param {Source[]} params.sources - An array of sources to retrieve key-value pairs.
 * @param {string} [params.delimiter="_"] - The delimiter used to convert keys into nested objects. Use "disabled" to disable object mapping.
 * @returns - The decoded and transformed values according to the schema.
 */

export async function konfigure<Schema extends object | string>({
	schema,
	sources,
	delimiter = "_",
}: {
	schema: Schema;
	sources: Source[];
	delimiter?: string | "disabled";
}) {
	const convertedSchema = TypeBox(schema);

	const values = {};
	const resolverErrors = [];

	for (const source of [...sources].reverse()) {
		try {
			const newRead = await source.resolver();
			for (const [key, value] of Object.entries(newRead)) {
				(values as any)[key] = value;
			}
		} catch (error: any) {
			resolverErrors.push(error);
		}
	}
	let processedValues =
		delimiter === "disabled" ? values : convertFromdelimiter(values, delimiter);
	Value.Clean(convertedSchema, processedValues);
	processedValues = Value.Convert(convertedSchema, processedValues) as any;
	Value.Default(convertedSchema, processedValues);
	try {
		return Value.Decode(convertedSchema, processedValues) as Static<Schema>;
	} catch (error: any) {
		throw new Error(`

Failed to read configuration values: ${error}

Please make sure that you have the correct values set and the right sources defined.
Available sources in applied hierarchy: ${sources.map((s) => s.name).join(", ")}

See the validation error for more details:

${JSON.stringify(error, null, 2)}

Errors from resolver sources:

${resolverErrors.map((e) => JSON.stringify(e, null, 2)).join("\n")}

`);
	}
}

/**
 * Given an object with keys that are delimiter-separated strings, returns a new
 * object with the same values but with nested objects instead of delimiter-separated
 * strings as keys.
 *
 * @example
 * const input = {
 * 	"foo.bar": "baz",
 * 	"foo.baz": "qux",
 * };
 *
 * const output = convertFromdelimiter(input, ".");
 *
 * // output is {
 * // 	foo: {
 * // 		bar: "baz",
 * // 		baz: "qux",
 * // 	},
 * // };
 */
function convertFromdelimiter(object: Record<string, any>, delimiter: string) {
	const result: Record<string, any> = {};

	for (const [key, value] of Object.entries(object)) {
		const pathSegments = key.split(delimiter);

		if (pathSegments.length === 1) {
			result[pathSegments[0]!] = value;
			continue;
		}

		let current = result;
		for (const segment of pathSegments.slice(0, -1)) {
			if (!current[segment]) {
				current[segment] = {};
				current = { ...current[segment] };
			} else {
				current = { ...current[segment] };
			}
		}
		current[pathSegments[pathSegments.length - 1]!] = value;
	}
	return result;
}
