# DevTalles Blog — Frontend (Astro + React + TailwindCSS + Flowbite React)

Un **frontend** rápido, accesible y moderno para el **blog de la comunidad DevTalles**.  
Este repositorio contiene únicamente la **aplicación web** (UI/UX); las pantallas de administración están **maquetadas** y listas para conectarse a una API cuando se requiera.

> **Stack:** Astro (con islas de React), TailwindCSS, Flowbite React, TypeScript  
> **Diseño:** tokens de color (CSS variables), componentes reutilizables y layout responsive.

---

## 🎯 Objetivo del frontend

- Ofrecer una **experiencia cuidada** para listar y leer artículos (rendimiento, accesibilidad, claridad visual).
- Implementar **UI reusable** (botones, inputs, tarjetas, secciones) y **tematización por tokens**.
- Dejar un **panel administrativo de UI** funcional a nivel de interfaz para un futuro CRUD real.

---

## 🧠 ¿Por qué Astro para este reto?

- **Islas de Interactividad (Partial Hydration):** solo se hidratan los componentes React necesarios (navbar, reacciones, comentarios), manteniendo bajo el JS enviado al cliente.
- **Performance por defecto:** páginas estáticas rápidas y posibilidad de SSR si se requiere. Objetivo de **Lighthouse ≥ 90** en Performance/Best Practices.
- **Contenido primero:** **Content Collections** con MD/MDX para posts, esquema tipado y DX sólida (`npx astro sync`).
- **SEO y Accesibilidad:** HTML semántico, control del `<head>`, metadatos por layout y render estático por defecto.
- **Escalabilidad:** fácil de integrar con APIs REST/GraphQL y desplegar en edge/serverless.

---

## 🔗 Referencias de diseño

- 🎨 **Figma**: _(mockups y componentes)_  
  https://www.figma.com/design/UX4HwSBck2NOO36krAuzad/OPTARYS--DEVTALLES?node-id=2-33&t=DMUJ9IYllcsXAstD-1

> Si existe un board de Jira, puede enlazarse desde el README raíz del monorepo o desde la documentación del proyecto. Este README es **solo del frontend**.

---

## ✅ Requisitos

- **Node.js** ≥ 18.17 (recomendado 20.x)
- **npm** ≥ 9 (o pnpm/yarn, si el equipo lo prefiere)

---

## ▶️ Instalación y ejecución

Desde la carpeta del proyecto (por ejemplo `.../devtalles-blog-community-web/`):

```bash
# Instalar dependencias
npm install

# Sincronizar tipos si cambiaste el schema de contenido
npx astro sync

# Ejecutar en desarrollo
npm run dev
# Abre http://localhost:4321
```

### Scripts útiles

```bash
npm run build     # Build de producción (estático por defecto)
npm run preview   # Servir el build de producción localmente
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
 │   │   ├─ login.astro       # UI (maqueta)
 │   │   └─ register.astro    # UI (maqueta)
 │   └─ admin/
 │       ├─ index.astro
 │       └─ posts/
 │           ├─ index.astro
 │           ├─ new.astro
 │           └─ [id]/edit.astro
 │
 ├─ content/
 │   ├─ config.ts              # schema tipado de colecciones
 │   └─ posts/                 # artículos en MD/MDX
 │       ├─ astro-setup.md
 │       └─ ...
 │
 ├─ styles/
 │   └─ global.css             # tokens de color y utilidades globales
 │
 └─ lib/
     ├─ formatDate.ts
     └─ adminStore.ts          # mock store para panel (solo UI)
```

---

## 🎨 Temas y tokens de diseño

Los colores principales viven en `src/styles/global.css` como **CSS variables** y se consumen desde Tailwind con **arbitrary values**:

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

/* Patrón de fondo sutil */
.bg-grid {
  background:
    linear-gradient(to right, color-mix(in oklab, var(--color-title), transparent 90%) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklab, var(--color-title), transparent 90%) 1px, transparent 1px);
  background-size: 14px 24px;
  mask-image: radial-gradient(ellipse at 50% -20%, rgba(0,0,0,0.25), transparent 60%);
}
```

Uso en componentes:

```html
<div class="bg-[var(--color-bg)] text-[var(--color-text)]">
  <h1 class="text-[var(--color-title)]">Título</h1>
  <a class="text-[var(--color-accent)] hover:opacity-80">Link</a>
</div>
```

---

## 📚 Contenido (posts) con Content Collections

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

**Nuevo post** — `src/content/posts/mi-post.md`:

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
```

> Si cambias el schema, ejecuta `npx astro sync` para actualizar tipos.

---

## 🧭 Rutas principales

- `/` — Landing (Hero, últimos artículos, features, mascota, CTA)  
- `/blog/` — Listado de artículos (buscador/paginación en preparación)  
- `/blog/[slug]/` — Detalle del artículo (cover, contenido, reacciones, comentarios, prev/next)  
- `/auth/login` y `/auth/register` — Pantallas de autenticación (UI)  
- `/admin` y `/admin/posts` — Panel de administración (UI)

---

## ♿ Accesibilidad y SEO

- Estructura semántica: `header`, `nav`, `main`, `footer`, `section`, `article`.
- Inputs con `label`/`for`, foco visible y contrastes AA.
- Metadatos básicos via `RootLayout` (`<title>`, `description`).
- Imágenes con `alt`, `loading` y `decoding` apropiados.
- Componentes **Flowbite React** para tablas/formularios accesibles cuando se hidratan en cliente.

---

## 🔧 Configuración opcional (.env)

> No es obligatorio para la demo estática. Si quieres apuntar a una API, expón las variables necesarias con prefijo `PUBLIC_` para el cliente.

```env
PUBLIC_API_BASE_URL=http://localhost:3000
PUBLIC_DISCORD_LOGIN_URL=http://localhost:3000/auth/discord
```

---

## 📦 Build y despliegue

- `npm run build` genera un **sitio estático** en `dist/` (por defecto).  
- Puede desplegarse en cualquier hosting estático (Netlify, Vercel, GitHub Pages, etc.).  
- Si se necesita SSR, Astro permite adaptadores para Node/Vercel/Cloudflare.

---

## 📄 Licencia

**MIT** — uso, modificación y distribución permitidos con atribución.
