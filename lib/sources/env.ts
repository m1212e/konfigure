import type { Source } from "./type";

export function env(): Source {
	return () => process.env;
}
