import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { highlight } from "svelte-preprocess-highlight";

export default defineConfig({
  plugins: [
    svelte({
      preprocess: [highlight()],
    }),
  ],
});
