# DevTalles Blog — Frontend

Bienvenido al **blog de la comunidad DevTalles** ✨  
Un sitio rápido, accesible y moderno para **aprender, compartir y crecer** con artículos de frontend, backend, arquitectura y mejores prácticas.

> Stack: **Astro + React + Flowbite React + TailwindCSS**  
> Diseño basado en **tokens de color** y componentes **reutilizables**.

---

## 🗂️ Contenidos

- [Objetivo](#-objetivo)
- [Demo](#-demo)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación y scripts](#-instalación-y-scripts)
- [Estructura de carpetas](#-estructura-de-carpetas)
- [Temas y diseño (tokens)](#-temas-y-diseño-tokens)
- [Componentes reutilizables](#-componentes-reutilizables)
- [Contenido (Posts)](#-contenido-posts)
- [Rutas principales](#-rutas-principales)
- [Panel de administración (UI)](#-panel-de-administración-ui)
- [Accesibilidad y SEO](#-accesibilidad-y-seo)
- [Guía de código](#-guía-de-código)
- [Roadmap](#-roadmap)
- [Problemas comunes / Troubleshooting](#-problemas-comunes--troubleshooting)
- [Licencia](#-licencia)

---

## 🎯 Objetivo

Crear un **frontend** robusto y escalable para el blog de DevTalles que:

- Ofrezca una **experiencia cuidada** (UI/UX) y **accesible**.
- Permita **listar, leer y navegar** publicaciones de forma clara y rápida.
- Escale hacia módulos como **autenticación**, **reacciones** y **comentarios**.
- Integre un **panel UI** para el CRUD (diseño listo para conectar a un backend).

---

## 🔗 Demo

- Desarrollo local: http://localhost:4321  
- **(opcional)** Agrega aquí el link del deploy cuando esté listo.

---

## 🧰 Tecnologías

- **Astro** (routing, content collections, performance)  
- **React** + **Flowbite React** (componentes accesibles)  
- **TailwindCSS** (estilos utilitarios + temas por CSS variables)  
- **React Icons** (iconografía)  
- **Markdown (MD/MDX)** para el contenido de posts

---

## ✅ Requisitos

- Node.js **>= 18.17**  
- npm **>= 9**

---

## ⚙️ Instalación y scripts

```bash
# 1) Instalar dependencias
npm install

# 2) Sincronizar tipos de content collections (cuando agregues/edites esquemas)
npx astro sync

# 3) Correr en desarrollo
npm run dev
# abre: http://localhost:4321

# 4) Build de producción (estático)
npm run build

# 5) Previsualizar build
npm run preview
```

---

## 📂 Estructura de carpetas

```plaintext
src/
 ├─ components/
 │   ├─ blog/
 │   │   ├─ PostCard.astro
 │   │   ├─ Reactions.tsx
 │   │   └─ Comments.tsx
 │   ├─ sections/
 │   │   ├─ Hero.astro
 │   │   ├─ PostList.astro
 │   │   ├─ Features.astro
 │   │   ├─ Mascot.astro
 │   │   └─ CTA.astro
 │   └─ ui/
 │       ├─ Button.tsx
 │       ├─ InputField.astro
 │       ├─ TopNav.tsx
 │       └─ FooterSimple.tsx
 │
 ├─ layouts/
 │   ├─ RootLayout.astro
 │   └─ AdminLayout.astro
 │
 ├─ pages/
 │   ├─ index.astro
 │   ├─ blog/
 │   │   ├─ index.astro
 │   │   └─ [slug].astro
 │   ├─ auth/
 │   │   ├─ login.astro
 │   │   └─ register.astro
 │   └─ admin/
 │       ├─ index.astro
 │       └─ posts/
 │           ├─ index.astro
 │           ├─ new.astro
 │           └─ [id]/
 │               └─ edit.astro
 │
 ├─ content/
 │   ├─ config.ts              # schema de colecciones
 │   └─ posts/                 # artículos en MD/MDX
 │       ├─ astro-setup.md
 │       └─ ...
 │
 ├─ styles/
 │   └─ global.css
 │
 └─ lib/
     ├─ formatDate.ts
     └─ adminStore.ts          # mock store para panel (UI)
```

---

## 🎨 Temas y diseño (tokens)

Colores principales (definidos en `src/styles/global.css`):

```css
:root {
  --color-bg: #21183b;
  --color-accent: #c397f6;
  --color-title: #f3efff;
  --color-text: #f1f5f9;
  --color-contrast: #111827;
  --color-accent-foreground: #111827;

  /* Superficies (admin / secciones) */
  --surface-0: var(--color-bg);
  --surface-1: #1a1431;
  --surface-2: #2a2145;
}
```

Uso en Tailwind (arbitrary values):

```html
<div class="bg-[var(--color-bg)] text-[var(--color-text)]">
  <h1 class="text-[var(--color-title)]">Título</h1>
  <a class="text-[var(--color-accent)] hover:opacity-80">Link</a>
</div>
```

**Patrón global de fondo** (habilitado en `RootLayout.astro` con la clase `bg-grid`):

```css
/* global.css */
.bg-grid {
  background:
    linear-gradient(to right, color-mix(in oklab, var(--color-title), transparent 90%) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklab, var(--color-title), transparent 90%) 1px, transparent 1px);
  background-size: 14px 24px;
  mask-image: radial-gradient(ellipse at 50% -20%, rgba(0,0,0,0.25), transparent 60%);
}
```

---

## 🧱 Componentes reutilizables

- **`Button.tsx`**  
  Variantes: `solid | outline | ghost` • Tamaños: `sm | md | lg` • `fullWidth` • `icon` • soporta `href` y `onClick`.

- **`InputField.astro`**  
  Campo accesible con `label`, `id`, `name`, `type`, `placeholder`, `required`, `autocomplete`.

- **`TopNav.tsx`**  
  Navbar (Flowbite React) con botón de **Login**, sticky y responsive.

- **`FooterSimple.tsx`**  
  Footer claro (tema blanco) que contrasta con el layout, enlaces útiles y redes.

> Usa `client:load` en componentes React cuando deban hidratarse (ej. `TopNav`, `FooterSimple`, tablas del panel).

---

## ✍️ Contenido (Posts)

**Schema** — `src/content/config.ts`:

```ts
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),               // ISO recomendado: "2025-09-13"
    tags: z.array(z.string()).optional(),
    cover: z.string().optional(),
    excerpt: z.string().optional(),
    published: z.boolean().optional(),
  }),
});

export const collections = { posts };
```

**Nuevo post** — crea `src/content/posts/mi-post.md`:

```md
---
title: "Mi primer post con Astro"
date: "2025-09-13"
tags: ["astro", "react"]
cover: "/assets/png/DEVI NORMAL.png"
excerpt: "Guía rápida para iniciar con Astro + React + Tailwind."
published: true
---

Aquí va el contenido en **Markdown**.  
Puedes usar _código_, listas, imágenes, etc.
```

Sincroniza tipos cuando edites el schema:

```bash
npx astro sync
```

---

## 🧭 Rutas principales

- `/` — Landing (Hero, últimos artículos, features, mascota, CTA)  
- `/blog/` — Listado de artículos (+ buscador/paginación futura)  
- `/blog/[slug]/` — Detalle del artículo (cover, contenido, **reacciones**, **comentarios**, prev/next)  
- `/auth/login` y `/auth/register` — Pantallas de autenticación (UI)  
- `/admin` y `/admin/posts` — Panel de administración (UI, mockeado para diseño)

---

## 🛠️ Panel de administración (UI)

- Lista de publicaciones, crear/editar, cambiar estado (Publicado/Borrador), eliminar.  
- Componentes: `Table` de Flowbite, `Button` reutilizable, badges y formularios.  
- **Nota:** el panel es una **maqueta de UI** lista para conectar a un backend.

---

## ♿ Accesibilidad y SEO

- Elementos semánticos: `header`, `nav`, `main`, `footer`, `section`, `article`.  
- Inputs con `label`/`for`, foco visible y contrastes del tema.  
- Metadatos vía `RootLayout` (`title`, `description`).  
- Imágenes con `alt`, `loading="eager|lazy"` y `decoding="async"`.

---

## 🧭 Guía de código

- Componentiza bloques repetidos (botones, inputs, tarjetas).  
- Tipado estricto sin `any` implícito.  
- Accesibilidad como regla: labels, roles, texto alternativo.  
- Estilos: Tailwind + tokens (`var(--color-...)`).  
- Páginas delgadas: delega en secciones y componentes de UI.  
- Imports limpios con alias `@/*` (ver `tsconfig.json`).

**Sugerencias a futuro**: ESLint + Prettier + Husky (pre-commit), tests con Vitest/Playwright.

---

## 🗺️ Roadmap

- [ ] Buscador y filtros por tags  
- [ ] Paginación en `/blog/`  
- [ ] Conexión real de **auth** (email/Discord) con guardas de ruta  
- [ ] Integración CRUD a backend / CMS  
- [ ] Página de autor/es y categorías  
- [ ] Tests de UI

---

## 🆘 Problemas comunes / Troubleshooting

**1) “Argument of type 'posts' is not assignable to never”**  
- Verifica `src/content/config.ts` con `type: "content"`.  
- Ejecuta `npx astro sync` y reinicia el servidor.  
- En VSCode: “TypeScript: Restart TS Server”.

**2) “Variable 'data' is used before being assigned”**  
- Asigna `const { Content } = await entry.render(); const data = entry.data;` **antes** de usar `data`.

**3) Componentes de Flowbite React en SSR**  
- Usa la jerarquía correcta (`Table > Table.Head > Table.Body > Table.Row > Table.Cell`).  
- Hidrata con `client:load` si necesitas comportamiento en cliente.

---

## 📄 Licencia

**MIT** — siéntete libre de usar, modificar y compartir.  
© Comunidad DevTalles.
