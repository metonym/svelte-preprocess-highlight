import path from "path";
import { parse, walk } from "svelte/compiler";
import type { PreprocessorGroup } from "svelte/types/compiler/preprocess";
import MagicString from "magic-string";
import hljs from "highlight.js";
import { format } from "prettier";
import type { Options } from "prettier";
import "prettier-plugin-svelte";

const languages = new Set([...hljs.listLanguages(), "svelte", "html"]);

interface HighlightOptions {
  /**
   * @default
   * (filename) => /(node_modules|.svelte-kit)/.test(filename)
   * @example
   * highlight({
   *  ignorePath: (filename) => /demo/.test(filename),
   * })
   */
  ignorePath?: (filename: string) => boolean;

  /**
   * Code is formatted by Prettier before it's highlighted.
   * By default, the language is used as the parser.
   * @example
   * highlight({
   *  prettierOptions: {
   *    printWidth: 100,
   *  },
   * })
   */
  prettierOptions?: Options;
}

type Highlight = (options?: HighlightOptions) => Pick<PreprocessorGroup, "markup">;

export const highlight: Highlight = (options) => {
  const ignorePath =
    options?.ignorePath || ((filename) => /(node_modules|.svelte-kit)/.test(filename));
  const prettierOptions = options?.prettierOptions;

  return {
    markup({ content, filename }) {
      if (!filename) return;
      if (ignorePath(filename)) return;
      if (!content) return;

      const s = new MagicString(content);
      const log = (...message: unknown[]) => {
        const file = path.relative(process.cwd(), filename);
        console.log(`[${file}]`, ...message);
      };

      walk(parse(content), {
        enter(node: Node) {
          if (node.name === "pre") {
            let code = "";
            let language: undefined | string;

            const { attributes, children } = node;
            const expression = children.find((child) => child?.type === "MustacheTag")?.expression;

            if (expression?.value) {
              /**
               * @example
               * <pre data-language="typescript">
               *   {'const a = (b: number) => 4'}
               * </pre>
               */
              code = expression.value;
            } else if (expression?.quasis) {
              /**
               * @example
               * <pre data-language="typescript">
               *   {\`const a = (b: number) => 4\`}
               * </pre>
               */
              code = expression.quasis[0]?.value.raw;
            }

            language = attributes.find(({ name }) => name === "data-language")?.value[0].raw;

            /**
             * Assume normal usage of the `<pre>` element
             * if no `data-language="<language>"` is provided.
             */
            if (!language) return;

            if (!code) return log("No code provided");

            if (!languages.has(language)) return log(`Invalid language "${language}"`);

            let formatted = code;

            try {
              formatted = format(code, { parser: language, ...prettierOptions });
            } catch (error: unknown) {
              if (error && typeof error === "object") {
                log("Formatting error", (error as { codeFrame: string }).codeFrame);
              }
            }

            const { value: highlighted } = /svelte|html/.test(language)
              ? hljs.highlightAuto(formatted, ["xml", "css", "javascript"])
              : hljs.highlight(formatted, { language });

            s.overwrite(
              node.start,
              node.end,
              `<pre><code class="hljs">{@html \`${highlighted}\`}</code></pre>`
            );
          }
        },
      });

      return {
        code: s.toString(),
        map: s.generateMap({ file: filename, includeContent: true }),
      };
    },
  };
};
