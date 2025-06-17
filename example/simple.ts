import { Type } from "@sinclair/typebox";
import { defaultSources, konfigure } from "../lib";

const configObject = await konfigure({
	schema: Type.Object({
		foo: Type.String(),
		bar: Type.Optional(Type.Number()),
	}),
	sources: defaultSources,
});

// reads the foo and bar values from the environment or docker secret files
console.log(configObject);
