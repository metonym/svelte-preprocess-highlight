import hljs from "highlight.js";
import MagicString from "magic-string";
import path from "path";
import type { Options as PrettierOptions } from "prettier";
import { format } from "prettier";
import "prettier-plugin-svelte";
import { parse, walk } from "svelte/compiler";
import type { SveltePreprocessor } from "svelte/types/compiler/preprocess";
import type { AstNode } from "./types";

const languages = new Set([...hljs.listLanguages(), "svelte", "html", "auto"]);

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
  prettierOptions?: PrettierOptions;
}

export const highlight: SveltePreprocessor<"markup", HighlightOptions> = (options) => {
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
        enter(node: AstNode) {
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

            const language_value = attributes.find(({ name }) => name === "data-language")?.value;

            if (language_value === true) {
              language = "auto";
            } else {
              language = language_value?.[0]?.raw;
            }

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
            } catch (error) {
              log("Formatting error", (error as PrettierError).codeFrame);
            }

            let highlighted = formatted;

            if (language === "auto") {
              const auto_highlighted = hljs.highlightAuto(formatted);

              highlighted = auto_highlighted.value;
              language = auto_highlighted.language;
            } else {
              if (/svelte|html/.test(language)) {
                highlighted = hljs.highlightAuto(formatted, ["xml", "css", "javascript"]).value;
              } else {
                highlighted = hljs.highlight(formatted, { language }).value;
              }
            }

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
        map: s.generateMap({ source: filename, includeContent: true }),
      };
    },
  };
};
