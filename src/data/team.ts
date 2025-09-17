// src/data/team.ts
export type TeamMember = {
    name: string;
    role: string;
    avatar?: string;
    bio?: string;
    links?: { label: string; href: string }[];
};

export const TEAM: TeamMember[] = [
    {
        name: "Johanssen Roque",
        role: "Líder Frontend / Coordinación General",
        avatar: "/assets/avatars/johanssen3.jpeg",
        bio: "Responsable de la arquitectura de la interfaz, la integración del diseño con la lógica de la aplicación y la coordinación general del proyecto.",
        links: [{ label: "GitHub", href: "https://github.com/johs7" }],
    },
    {
        name: "Joseph Pineda",
        role: "Líder Frontend / Experiencia de Usuario",
        avatar: "/assets/avatars/joseph.jpg",
        bio: "Encargado de los componentes UI, accesibilidad y optimización de la experiencia de lectura en el blog.",
        links: [{ label: "GitHub", href: "https://github.com/Joris2206" }],
    },
    {
        name: "Kevin Ortiz",
        role: "Líder Backend / Infraestructura y APIs",
        avatar: "/assets/avatars/kevin.jpg",
        bio: "Encargado del diseño de APIs, la autenticación y la gestión de la infraestructura necesaria para el despliegue del proyecto.",
        links: [{ label: "GitHub", href: "https://github.com/..." }],
    },
];
