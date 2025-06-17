import { Type } from "@sinclair/typebox";
import { konfigure } from "../lib";
import { env } from "../lib/sources/env";
import { object } from "../lib/sources/object";

const configObject = await konfigure({
	schema: Type.Object({
		foo: Type.String(),
		bar: Type.Optional(Type.Number()),
	}),
	sources: [
		env,
		object({
			foo: "fallback",
			baz: "values",
			bar: 3,
		}),
	],
});

// reads the foo and bar values from the environment or falls back to the
// provided static object
console.log(configObject);
