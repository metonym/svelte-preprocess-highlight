<!-- Expected error: No code provided -->
<pre data-language="typescript" />

<!-- Expected error: Invalid language "typescript2" -->
<pre data-language="typescript2">{"const a= (b:number) =>4"}</pre>

<!-- Expected error: Formatting error > 1 | const a= b:number) =>4 -->
<pre data-language="typescript">{"const a= b:number) =>4"}</pre>

<pre data-language="typescript">{"const a= (b:number) =>4"}</pre>

<pre data-language="typescript">
{`
  const sum = (a: number, b: number) => a + b;
`}
</pre>

<pre data-language="svelte">{`
<script>
  import Highlight from "svelte-highlight";
    import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

    const code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<Highlight language={typescript} {code} />`}</pre>

<pre data-language="typescript">
{`
// helpers.js
  
  export function multiply(a: number, b: number) {
    return a * b;
  }
  
  export function divide(a: number, b: number) {
    return a / b;
  }
  
  export function add(a: number, b: number) {
    return a + b;
  }
  
  export function subtract(a: number, b: number) {
    return a - b;
  }
`}
</pre>

<pre data-language="css">
  {`
  body {
    color: red;
  }
  `}
</pre>
