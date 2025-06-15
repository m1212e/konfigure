import { Type } from "@sinclair/typebox";
import { config, defaultSources } from "../lib";

const configObject = await config({
	schema: Type.Object({
		foo: Type.String(),
		bar: Type.Optional(Type.Number()),
	}),
	sources: defaultSources,
});

// reads the foo and bar values from the environment or docker secret files
console.log(configObject);
