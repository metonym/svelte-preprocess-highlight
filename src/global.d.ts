declare module "svelte/compiler" {
  import type { Ast, Element } from "svelte/types/compiler/interfaces";

  export function walk(
    ast: Ast,
    options: {
      enter: (node: Element, parentNode: Element) => void;
    }
  ): void;
}

declare module "prettier-plugin-svelte" {
  export interface PrettierError {
    codeFrame: string;
  }
}
