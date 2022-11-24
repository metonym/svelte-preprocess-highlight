import type { Processed } from "svelte/types/compiler/preprocess";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as API from "../src";

describe("svelte-preprocess-highlight", () => {
  const consoleLog = vi.spyOn(console, "log");

  afterEach(() => {
    consoleLog.mockReset();
  });

  test("API", () => {
    expect(Object.keys(API)).toMatchInlineSnapshot(`
      [
        "highlight",
      ]
    `);
  });

  const p = (
    content: string,
    filename: string = "App.svelte",
    options?: Parameters<typeof API.highlight>[0]
  ) => (API.highlight(options).markup?.({ content, filename }) as undefined | Processed)?.code;

  const TYPESCRIPT_MESSY = `<pre data-language="typescript">{'const a= (b:number) =>4'}</pre>`;
  const TYPESCRIPT_STRING = `<pre data-language="typescript">{'const a = (b: number) => 4'}</pre>`;
  const TYPESCRIPT_QUASIS = `<pre data-language="typescript">{\`const a = (b: number) => 4\`}</pre>`;
  const TYPESCRIPT_QUASIS_LINE_BREAKS = `<pre data-language="typescript">
  
  {\`const a = (b: number) => 4\`}
  </pre>`;
  const TYPESCRIPT_NO_CODE = `<pre data-language="typescript" />`;
  const TYPESCRIPT_NO_LANGUAGE = `<pre>{'const a = (b: number) => 4'}</pre>`;
  const TYPESCRIPT_FORMATTING_ERROR = `<pre data-language="typescript">{'const a= b:number) =>4'}</pre>`;
  const INVALID_LANG = `<pre data-language="hypescript">{'hype'}</pre>`;
  const SVELTE = `<pre data-language="svelte">{\`
  <script>
    let count = 0;
  <\/script>
  
  {@html count}
  \`}
  </pre>`;
  const HTML = `<pre data-language="html">{\`
  <script>
    let count = 0;
  <\/script>
  
  {@html count}
  \`}
  </pre>`;
  const TRIM_LINE_BREAKS = `<pre data-language="typescript">{\`
  const a = (b: number) => 4
  
  
  \`}</pre>`;
  const SVELTE_MULTILINE = `<pre data-language="svelte">{\`
  <script>
    import Highlight from "svelte-highlight";
    import typescript from "svelte-highlight/languages/typescript";
    import atomOneDark from "svelte-highlight/styles/atom-one-dark";
  
    const code = "const add = (a: number, b: number) => a + b;";
  </script>
  
  <svelte:head>
    {@html atomOneDark}
  </svelte:head>
  
  <Highlight language={typescript} {code} />\`}</pre>`;

  const AUTO_HIGHLIGHT = `<pre data-language>{\`body { color: red; }\`}</pre>`;

  const AUTO_HIGHLIGHT_EXPLICIT = `<pre data-language="auto">{\`body { color: red; }\`}</pre>`;

  test("filter – no file name", () => {
    expect(p("content", "")).toEqual(undefined);
  });

  test("filter – skipped file", () => {
    expect(p("content", "/node_modules/App.svelte")).toEqual(undefined);
    expect(p("content", "/.svelte-kit/App.svelte")).toEqual(undefined);
  });

  test("filter – no content", () => {
    expect(p("")).toEqual(undefined);
  });

  test("filter – custom ignore path", () => {
    const options: Parameters<typeof p>[2] = {
      ignorePath: (filename) => /demo/.test(filename),
    };

    expect(p("content", "/node_modules/App.svelte", options)).toEqual("content");
    expect(p("content", "/.svelte-kit/App.svelte", options)).toEqual("content");
    expect(p("content", "/demo/App.svelte", options)).toEqual(undefined);
  });

  test("typescript – mustache tag (string, formatted)", () => {
    expect(p(TYPESCRIPT_MESSY)).toEqual(p(TYPESCRIPT_STRING));
  });

  test("typescript – mustache tag (string)", () => {
    expect(p(TYPESCRIPT_STRING)).toMatchSnapshot();
  });

  test("typescript – mustache tag (quasis)", () => {
    expect(p(TYPESCRIPT_QUASIS)).toMatchSnapshot();
  });

  test("typescript – mustache tag (quasis with line breaks)", () => {
    expect(p(TYPESCRIPT_QUASIS_LINE_BREAKS)).toMatchSnapshot();
    expect(p(TYPESCRIPT_QUASIS_LINE_BREAKS)).toEqual(p(TYPESCRIPT_QUASIS));
  });

  test("typescript – no code", () => {
    expect(p(TYPESCRIPT_NO_CODE)).toMatchSnapshot();
    expect(consoleLog).toBeCalledWith("[App.svelte]", "No code provided");
  });

  test("typescript – no language", () => {
    expect(p(TYPESCRIPT_NO_LANGUAGE)).toMatchSnapshot();
  });

  test("typescript – formatting error", () => {
    expect(p(TYPESCRIPT_FORMATTING_ERROR)).toMatchSnapshot();
    expect(consoleLog).toBeCalledTimes(1);
  });

  test("invalid language", () => {
    expect(p(INVALID_LANG)).toMatchSnapshot();
    expect(consoleLog).toBeCalledWith("[App.svelte]", 'Invalid language "hypescript"');
  });

  test("svelte", () => {
    expect(p(SVELTE)).toMatchSnapshot();
  });

  test("svelte is an alias for html", () => {
    expect(p(SVELTE)).toEqual(p(HTML)!.replace(/"html"/, "svelte"));
  });

  test("trim line breaks", () => {
    expect(p(TRIM_LINE_BREAKS)).toEqual(p(TYPESCRIPT_QUASIS));
  });

  test("multiple", () => {
    expect(p(TYPESCRIPT_MESSY + "\n\n" + TYPESCRIPT_STRING)).toMatchSnapshot();
  });

  test("svelte - multiline", () => {
    expect(p(SVELTE_MULTILINE)).toMatchSnapshot();
  });

  test("auto-highlight", () => {
    expect(p(AUTO_HIGHLIGHT)).toMatchSnapshot();
    expect(p(AUTO_HIGHLIGHT)).toEqual(p(AUTO_HIGHLIGHT_EXPLICIT));
  });
});
