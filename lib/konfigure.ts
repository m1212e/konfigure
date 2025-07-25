import { Value } from "@sinclair/typebox/value";
import type { Static } from "@sinclair/typemap";
import { IsTypeBox, IsValibot, IsZod } from "@sinclair/typemap/guard";
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
	let convertedSchema: any;

	const importErrors = [];

	if (IsTypeBox(schema)) {
		convertedSchema = schema;
	}

	if (!convertedSchema && IsZod(schema)) {
		try {
			const { TypeBoxFromZod } = await import("@sinclair/typemap/typebox");
			convertedSchema = TypeBoxFromZod(schema as any);
		} catch (error: any) {
			importErrors.push(error);
		}
	}
	if (!convertedSchema && IsValibot(schema)) {
		try {
			const { TypeBoxFromValibot } = await import("@sinclair/typemap/typebox");
			// @ts-ignore
			convertedSchema = TypeBoxFromValibot(schema as any);
			console.log("called2");
		} catch (error: any) {
			importErrors.push(error);
		}
	}

	if (!convertedSchema) {
		throw new Error(`Failed to import typebox from zod, valibot or typebox.
Please install one of the validators.

${importErrors.map((e) => JSON.stringify(e, null, 2)).join("\n")}`);
	}

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
		delimiter === "disabled" ? values : convertWithDelimiter(values, delimiter);

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
 * const output = convertWithDelimiter(input, ".");
 *
 * // output is {
 * // 	foo: {
 * // 		bar: "baz",
 * // 		baz: "qux",
 * // 	},
 * // };
 */
function convertWithDelimiter(object: Record<string, any>, delimiter: string) {
	const result: any = {};

	for (const [key, value] of Object.entries(object)) {
		const keys = key.split(delimiter);
		let curr = result;

		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (i === keys.length - 1) {
				curr[k] = value;
			} else {
				// Always create a new object if one doesn't exist (or is not a plain object)
				if (
					!(k in curr) ||
					typeof curr[k] !== "object" ||
					curr[k] === null ||
					Object.isFrozen(curr[k])
				) {
					curr[k] = {};
				}
				curr = curr[k];
			}
		}
	}
	return result;
}
