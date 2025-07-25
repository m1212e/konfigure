import { Type } from "@sinclair/typebox";
import { konfigure } from "../lib";
import { env } from "../lib/sources/env";
import { object } from "../lib/sources/object";

const configObject = await konfigure({
	schema: Type.Object({
		foo: Type.Object({
			bar: Type.String(),
			baz: Type.String(),
		}),
	}),
	sources: [
		env(),
		object({
			foo_bar: "fallback",
			foo_baz: "values",
		}),
	],
});

// reads the foo and bar values from the environment or falls back to the
// provided static object
// then resolves nested objects by the default delimiter "_" (configurable)
console.log(configObject);
