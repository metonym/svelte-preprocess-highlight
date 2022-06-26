interface Node {
  start: number;
  end: number;
  name: string;
  attributes: Array<{
    name: string;
    value: [{ raw: string }];
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

declare module "prettier-plugin-svelte";
