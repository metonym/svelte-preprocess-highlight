export interface AstNode {
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