import { readFile } from "node:fs/promises";
import type { Source } from "./type";

export function jsonFile(filepath: string): Source {
	return async () => {
		const data = await readFile(filepath, "utf-8");
		return JSON.parse(data);
	};
}
