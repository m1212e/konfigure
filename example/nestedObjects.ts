import { Type } from "@sinclair/typebox";
import { konfigure, sources } from "../lib";

const configObject = await konfigure({
	schema: Type.Object({
		foo: Type.Object({
			bar: Type.String(),
			baz: Type.String(),
		}),
	}),
	sources: [
		sources.env(),
		sources.object({
			foo_bar: "fallback",
			foo_baz: "values",
		}),
	],
});

// reads the foo and bar values from the environment or falls back to the
// provided static object
// then resolves nested objects by the default delimeter "_" (configurable)
console.log(configObject);
