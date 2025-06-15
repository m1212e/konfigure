import { readFile, readdir } from "node:fs/promises";
import type { Source } from "./type";

export function dockerSecrets(): Source {
	return async () => {
		const secrets = await readdir("/run/secrets");
		const result: Record<string, string> = {};
		for (const secret of secrets) {
			const value = await readFile(`/run/secrets/${secret}`, "utf-8");
			result[secret] = value;
		}
		return result;
	};
}
