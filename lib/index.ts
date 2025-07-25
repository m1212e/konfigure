import { dockerSecrets } from "./sources/dockerSecrets";
import { env } from "./sources/env";
import { jsonFile } from "./sources/jsonFile";
import { object } from "./sources/object";
import { tomlFile } from "./sources/tomlFile";
import { yamlFile } from "./sources/yamlFile";

export { konfigure } from "./konfigure";

/**
 * Uses first env, then docker secrets
 */
export const defaultSources = [env(), dockerSecrets()];

/**
 * All available sources
 */
export const sources = {
	env,
	object,
	dockerSecrets,
	jsonFile,
	yamlFile,
	tomlFile,
};
