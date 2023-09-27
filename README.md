# sass

This is an example Webflow Designer extension written in TypeScript to get you started. Check out our [documentation](https://docs.developers.webflow.com/v2.0.0/docs/create-a-designer-extensions) for in-depth information about Designer Extension features and API.

## Developing

```
$ pnpm dev
```

The above command does a few things:
* Installs dependencies
* Watches for changes in the `src/` folder and recompiles your TypeScript files, outputting files under the `dist/` folder
* Spins up a process that serves your extension files from under `dist/`

The command outputs the URL under which your extension is being served. Use this as the “Development URL” for your app in the Webflow Designer’s Apps panel. You can then launch the extension from the same place.

## Deploying

```
$ pnpm build
```

This will take the contents of the `./dist` folder and prepare a `bundle.zip` file ready for you to upload as a Designer extension for your App.
