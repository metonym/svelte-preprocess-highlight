# svelte-preprocess-highlight

> Svelte preprocessor that syntax highlights code using [highlight.js](https://github.com/highlightjs/highlight.js)

This preprocessor uses `highlight.js` to syntax highlight and [Prettier](https://github.com/prettier/prettier) to format the text. This approach can greatly decrease the amount of client-side JavaScript because the transformations are done at compile time.

Bundle sizes:

```diff
highlight.js@11.5.1
- 896 kB (minified)

prettier@2.7.1
- 423.2 kB (minified)
```

**Original**

```svelte
<pre data-language="typescript">
{`
  const sum = (a: number, b: number) => a + b;
`}
</pre>
```

**Processed**

<!-- prettier-ignore-start -->
```svelte
<pre><code class="hljs"><span class="hljs-keyword">const</span> <span class="hljs-title function_">sum</span> = (<span class="hljs-params">a: <span class="hljs-built_in">number</span>, b: <span class="hljs-built_in">number</span></span>) =&gt; a + b;
</code></pre>
```
<!-- prettier-ignore-end -->

## Limitations

The preprocessor only works for static text; the result must be deterministic. For dynamic use cases, you must include `highlight.js` and Prettier on the client-side.

For example, the following will not work because the code must be re-highlighted when it changes.

```svelte
<pre>
  {toggleFunctionCode
    ? "const sum = (a: number, b: number) => a + b;"
    : "const difference = (a: number, b: number) => a - b;"}
</pre>
```

## Installation

```bash
# Yarn
yarn add -D svelte-preprocess-highlight

# NPM
npm i -D svelte-preprocess-highlight

# pnpm
pnpm i -D svelte-preprocess-highlight
```

## Set-up

Add `highlight` to the list of Svelte preprocessors.

### SvelteKit

```js
// svelte.config.js
import { highlight } from "svelte-preprocess-highlight";

const config = {
  preprocess: [highlight()],
};

export default config;
```

### Vite

```js
// vite.config.js
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { highlight } from "svelte-preprocess-highlight";

export default defineConfig({
  plugins: [
    svelte({
      preprocess: [highlight()],
    }),
  ],
});
```

## Usage

Use a `pre` element with a `data-language` attribute to denote what to highlight. The code to highlight should be placed inside of the `pre` element.

**Single Line**

```svelte
<pre data-language="typescript">{"const sum = (a: number, b: number) => a + b;"}</pre>
```

**Multi-line**

```svelte
<pre data-language="typescript">
{`
  const sum = (a: number, b: number) => a + b;

  const difference = (a: number, b: number) => a - b;
`}
</pre>
```

## Options

### `ignorePath`

By default, the preprocessor will ignore files in `node_modules` and auto-generated files by SvelteKit (located in `.svelte-kit`).

Use the `ignorePath` option to customize files to ignore.

```js
highlight({
  ignorePath: (filename) => {
    // Ignore file names that do not end with `.svelte`
    if (!/\.(svelte)$/.test(filename)) return true;

    // Ignore file names that do not contain "demo"
    return !/demo/.test(filename);
  },
});
```

### `prettierOptions`

The text is formatted by Prettier before being highlighted.

Pass custom [Prettier options](https://prettier.io/docs/en/options.html) to `prettierOptions`.

```js
highlight({
  prettierOptions: {
    printWidth: 100,
    svelteStrictMode: true,
  },
});
```

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## License

[MIT](LICENSE)
