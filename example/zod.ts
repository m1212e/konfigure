import z from "zod";
import { defaultSources, konfigure } from "../lib";

const configObject = await konfigure({
	// instead of typebox you can use zod or valibot
	schema: z.object({
		foo: z.string(),
		bar: z.number().optional(),
	}),
	sources: defaultSources,
});

// reads the foo and bar values from the environment or docker secret files
console.log(configObject);
