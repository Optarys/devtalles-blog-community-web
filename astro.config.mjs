import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/astro";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://devtalles.community",
  output: "server",
  adapter: node({ mode: "standalone" }), // necesario para Render Web Service
  integrations: [react(), flowbiteReact(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: "https://optarys-devtalles-blog-api.onrender.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  },
});