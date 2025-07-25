import { join } from "node:path";
import { Type } from "@sinclair/typebox";
import { konfigure } from "../lib";
import { jsonFile } from "../lib/sources/jsonFile";

const configObject = await konfigure({
	schema: Type.Object({
		foo: Type.String(),
		bar: Type.Optional(Type.Number()),
	}),
	sources: [jsonFile(join(import.meta.dir, "example.json"))],
});

// reads the foo and bar values from the provided json file
console.log(configObject);
