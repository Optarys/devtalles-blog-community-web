// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/astro";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://devtalles.community", 
  integrations: [
    react(),
    flowbiteReact(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
