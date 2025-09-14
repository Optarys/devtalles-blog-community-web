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
        role: "Full-stack / Coordinación",
        avatar: "/assets/avatars/johanssen.png",
        bio: "Enlace entre front, back y despliegues. Foco en calidad y performance.",
        links: [{ label: "GitHub", href: "https://github.com/johs7" }],
    },
    {
        name: "Joseph Pineda",
        role: "Frontend",
        avatar: "/assets/avatars/joseph.jpg",
        bio: "Componentes UI, accesibilidad y experiencia de lectura.",
        links: [{ label: "GitHub", href: "https://github.com/Joris2206" }],
    },
    {
        name: "Kevin Ortiz",
        role: "Backend",
        avatar: "/assets/avatars/kevin.jpg",
        bio: "APIs, autenticación y pipeline de publicación.",
        links: [{ label: "GitHub", href: "https://github.com/..." }],
    },
];
