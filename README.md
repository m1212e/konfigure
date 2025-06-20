# konfigure
konfigure allows you to easily define a schema for your application config and provides flexible sources and proper helpful errors without the need to manually use and check for any env or config file!

## Usage
Add the dependency
```
npm i @m1212e/konfigure
bun add @m1212e/konfigure
```

Then define a schema with either [TypeBox](https://github.com/sinclairzx81/typebox), [Zod](https://github.com/colinhacks/zod) or [Valibot](https://github.com/fabian-hiller/valibot).

```ts
import { Type } from "@sinclair/typebox";

const appConfigSchema = Type.Object({
  foo: Type.String(),
  bar: Type.Optional(Type.Number()),
})
```

Afterwards, decide on which sources you would like to read for your config and in which order. Oftentimes, you'd have some mix of env vars and config file. Docker secrets are also supported. The available sources are exported from konfigure under the `sources` object.

```ts
import { sources } from "@m1212e/konfigure";

const appConfigSources = [
  sources.env(),
  sources.dockerSecrets(),
  sources.jsonFile(join(import.meta.dir, "example.json"))
  sources.object({
    foo: "fallback",
    bar: 3,
  })
]
```
> Notice how we put the static object in the last place in the array. This results in the fallback values having the lowest priority and therefore beeing overwritten whenever a higher order source has the value present.

Finally, we put together our schema and sources in the `konfigure` call to read our config.

```ts
import { konfigure } from "@m1212e/konfigure";
const configObject = await konfigure({
  schema: appConfigSchema,
  sources: appConfigSources,
});
```
This outputs a strongly typed object according to the schema we defined, populated by the sources we decided on.

If you would like to see some more elaborate examples, see the [examples](./example/) directory.

## Path delimeter
In some cases we have some form of nested objects in our config. Say we want to group the db credentials and the host settings together in an object each. In cases like these you can use a delimeter ('_' per default) to set nested values in e.g. env vars or other sources which do not support nested data structures out of the box. Our `konfigure` call might look like this.

```ts
const configObject = await konfigure({
  // delimeter: "_", // optionally, you can change the delimeter
  schema: Type.Object({
    db: Type.Object({
      username: Type.String(),
      password: Type.String(),
      port: Type.String(),
      host: Type.String(),
    }),
    application: Type.Object({
      port: Type.String(),
      host: Type.String(),
    }),
  }),
  sources: [
    /*
      While our env vars are set like this:
      db_username: "username",
      db_password: "123",
      db_port: "8822",
      db_host: "localhost",
      application_port: "3000",
      application_host: "0.0.0.0",
    */
    sources.env(),
  ],
});
```