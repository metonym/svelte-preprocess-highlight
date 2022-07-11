interface Node {
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

interface PrettierError {
  codeFrame: string;
}

declare module "prettier-plugin-svelte";
