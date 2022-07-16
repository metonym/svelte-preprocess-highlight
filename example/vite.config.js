import { svelte } from "@sveltejs/vite-plugin-svelte";
import { highlight } from "svelte-preprocess-highlight";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    svelte({
      preprocess: [highlight()],
    }),
  ],
};
