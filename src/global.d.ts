import type { PreprocessorGroup } from "svelte/types/compiler/preprocess";

declare global {
  type PreprocessorType = keyof PreprocessorGroup;

  interface SveltePreprocessor<PreprocessorType, Options = any> {
    (options?: Options): Required<Pick<PreprocessorGroup, PreprocessorType>>;
  }

  interface AstNode {
    start: number;
    end: number;
    name: string;
    attributes: Array<{
      name: string;
      value: true | [{ raw: string }];
    }>;
    children: [
      | undefined
      | {
          type: "MustacheTag";
          expression?: {
            value?: string;
            quasis?: [
              {
                value: {
                  raw: string;
                };
              }
            ];
          };
        }
    ];
  }
}
