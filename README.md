# Sass

This is a Webflow app that provides a code editor for Sass and compiles it live to CSS, saving it in Webflow DOM Element. Also has auto-completion for Webflow class names and variables.

Built using Svelte & Svelte-Kit.

## Developing

```
$ pnpm dev
```

The above command does a few things:

- Installs dependencies
- Watches for changes in the `src/` folder and recompiles Svelte files, outputting files under the `dist/` folder
- Spins up a process that serves extension files from under `dist/`

The command outputs the URL under which your extension is being served. Use this as the “Development URL” for your app in the Webflow Designer’s Apps panel. You can then launch the extension from the same place.

## Deploying

```
$ pnpm build
```

This will take the contents of the `./dist` folder and prepare a `bundle.zip` file ready to upload as a Designer extension for your App.

*Note* - Webflow publishes extension under a randomly-generated subdirectory for every version update. So use relative page paths for navigation within the app.
