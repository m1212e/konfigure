import {
	exists,
	mkdir,
	readdir,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { build } from "tsup";
import packagejson from "./package.json";

//TODO: Add proper TS typechecks to builds

const projectDir = import.meta.dir;
const outDir = join(projectDir, "out");
const libIndex = join(projectDir, "lib", "index.ts");
const sourcesDir = join(projectDir, "lib", "sources");
const allSourceModules = (await readdir(sourcesDir)).map((f) =>
	join(sourcesDir, f),
);

if (await exists(outDir)) {
	console.info("Cleaning outDir...");
	await rm(outDir, { recursive: true, force: true });
	console.info("Cleaned outDir!");
}
console.info("Creating outDir...");
await mkdir(outDir, { recursive: true });
console.info("Created outDir!");

await build({
	entry: [libIndex, ...allSourceModules],
	format: ["cjs", "esm"],
	target: ["node20", "es2020"],
	minify: true,
	dts: true,
	outDir,
	sourcemap: true,
	treeshake: true,
	globalName: "konfigure",
	splitting: true,
	external: [
		...Object.keys(packagejson.dependencies),
		...Object.keys(packagejson.peerDependencies),
	],
});

// ==============================
//      Create package.json
// ==============================

console.info("Creating package.json...");
const finalPackageJson = { ...packagejson };
finalPackageJson.scripts = undefined as any;
finalPackageJson.devDependencies = undefined as any;

(finalPackageJson.dependencies as any) = Object.entries(
	finalPackageJson.dependencies,
).reduce(
	(acc, [key, value]) => {
		acc[key] = value;
		return acc;
	},
	{} as Record<string, string>,
);

(finalPackageJson.peerDependencies as any) = Object.entries(
	finalPackageJson.peerDependencies,
).reduce(
	(acc, [key, value]) => {
		acc[key] = value;
		return acc;
	},
	{} as Record<string, string>,
);

(finalPackageJson as any).version =
	process.env.REF_NAME ?? (packagejson as any).version ?? "0.0.1";

(finalPackageJson as any).exports = {
	"./package.json": "./package.json",
	".": {
		require: "./index.cjs",
		import: "./index.js",
		node: "./index.cjs",
		default: "./index.cjs",
	},
	"./source/*": "./sources/*",
};

await writeFile(
	join(outDir, "package.json"),
	JSON.stringify(finalPackageJson),
	{ encoding: "utf-8" },
);
console.info("Created package.json!");

// ==============================
//       Copy README.md
// ==============================

console.info("Copying README.md...");
const readme = await readFile(join(projectDir, "README.md"), {
	encoding: "utf-8",
});
await writeFile(join(outDir, "README.md"), readme, { encoding: "utf-8" });
console.info("Copied README.md!");

// ==============================
//       Copy LICENSE
// ==============================

console.info("Copying LICENSE...");
const license = await readFile(join(projectDir, "LICENSE"), {
	encoding: "utf-8",
});
await writeFile(join(outDir, "LICENSE"), license, { encoding: "utf-8" });
console.info("Copied LICENSE!");

console.info("Done!");
process.exit(0);
