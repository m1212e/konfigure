import z from "zod";
import { konfigure } from "../lib";
import { object } from "../lib/sources/object";

const configObject = await konfigure({
	// instead of typebox you can use zod or valibot
	schema: z.object({
		foo: z.string(),
		bar: z.number().optional(),
	}),
	sources: [
		object({
			foo: "fallback",
			bar: "3",
		}),
	],
});

// reads the foo and bar values from the environment or docker secret files
console.log(configObject);
