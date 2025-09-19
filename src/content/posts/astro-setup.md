---
title: "Configurar Astro correctamente"
date: 2025-09-10
excerpt: "Guía breve para empezar con Astro."
tags: ["astro", "setup"]
cover: "/assets/png/DEVI NORMAL.png"
published: true
---

Contenido del artículo…
lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.

## Instalación

Para empezar con Astro, primero necesitas tener Node.js instalado en tu máquina. Luego, puedes crear un nuevo proyecto Astro usando el siguiente comando:

```bash
npm create astro@latest
```

Sigue las instrucciones en pantalla para configurar tu proyecto.

## Estructura del proyecto

Una vez creado el proyecto, verás una estructura de carpetas similar a esta:

```
my-astro-project/
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── content/
├── astro.config.mjs
├── package.json
└── tsconfig.json

        └──
        README.md
        .gitignore
        .env
        README.md
        .gitignore
        .env
        README.md
        .gitignore
        .env
```

La carpeta `src` es donde vivirán tus componentes, páginas y contenido. La carpeta `public` es para archivos estáticos como imágenes y fuentes.

## Configuración de Tailwind CSS

Para agregar Tailwind CSS a tu proyecto Astro, sigue estos pasos:

1. Instala Tailwind CSS y sus dependencias:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. Configura el archivo `tailwind.config.cjs` para que Astro pueda procesar tus archivos:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

3.  Crea un archivo CSS (por ejemplo, `src/styles/global.css`) e importa
    Tailwind:
        ```css
    @tailwind base;
    @tailwind components;  
    @tailwind utilities;
