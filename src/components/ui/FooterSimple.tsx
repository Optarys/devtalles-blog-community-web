// src/components/ui/FooterSimple.tsx
import {
  Footer,
  FooterCopyright,
  FooterDivider,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
  FooterIcon,
} from "flowbite-react";
import { FiGithub, FiTwitter, FiYoutube } from "react-icons/fi";
import { SiDiscord } from "react-icons/si";

export default function FooterSimple() {
  return (
  <Footer
  container
  className="
    border-t border-[rgba(17,24,39,0.15)]
    bg-[#111827] text-[#F9FAFB]
  "
>

      <div className="w-full">
        {/* Grid principal */}
        <div className="grid w-full grid-cols-1 gap-8 py-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <img
                src="/assets/svg/LOGO%20B.svg"
                alt="DevTalles"
                className="h-8 w-auto"
              />
            </div>
      
          </div>

          {/* Contenido */}
          <div>
            <FooterTitle title="Contenido" />
            <FooterLinkGroup col>
              <FooterLink className="hover:text-[var(--color-accent)]" href="/">Inicio</FooterLink>
              <FooterLink className="hover:text-[var(--color-accent)]" href="/blog/">Blog</FooterLink>
              <FooterLink className="hover:text-[var(--color-accent)]" href="/about/">About</FooterLink>
              <FooterLink className="hover:text-[var(--color-accent)]" href="/subscribe/">Suscripción</FooterLink>
            </FooterLinkGroup>
          </div>

          {/* Recursos */}
          <div>
            <FooterTitle title="Recursos" />
            <FooterLinkGroup col>
              <FooterLink
                className="hover:text-[var(--color-accent)]"
                href="https://cursos.devtalles.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cursos DevTalles
              </FooterLink>
              <FooterLink
                className="hover:text-[var(--color-accent)]"
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Repositorios (GitHub)
              </FooterLink>
              <FooterLink className="hover:text-[var(--color-accent)]" href="/guia-estilo/">
                Guía de estilo
              </FooterLink>
              <FooterLink className="hover:text-[var(--color-accent)]" href="/roadmap/">
                Roadmap
              </FooterLink>
            </FooterLinkGroup>
          </div>

          {/* Comunidad / Legal */}
          <div>
            <FooterTitle title="Comunidad" />
            <FooterLinkGroup col>
              <FooterLink className="hover:text-[var(--color-accent)]" href="/auth/login">
                Iniciar sesión
              </FooterLink>
              <FooterLink className="hover:text-[var(--color-accent)]" href="/auth/register">
                Crear cuenta
              </FooterLink>
              <FooterLink className="hover:text-[var(--color-accent)]" href="mailto:contacto@devtalles.com">
                Contacto
              </FooterLink>
              <FooterLink className="hover:text-[var(--color-accent)]" href="/privacy/">
                Privacidad
              </FooterLink>
              <FooterLink className="hover:text-[var(--color-accent)]" href="/terms/">
                Términos
              </FooterLink>
            </FooterLinkGroup>
          </div>
        </div>

        <FooterDivider className="border-[rgba(17,24,39,0.15)]" />

        {/* Copyright + Social */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <FooterCopyright
            href="/"
            by="DevTalles Blog"
            year={new Date().getFullYear()}
            className="opacity-80"
          />

          <div className="flex items-center gap-3">
            <FooterIcon
              href="https://github.com/"
              icon={FiGithub}
              aria-label="GitHub"
              className="transition-colors hover:text-[var(--color-accent)]"
            />
            <FooterIcon
              href="https://twitter.com/"
              icon={FiTwitter}
              aria-label="Twitter/X"
              className="transition-colors hover:text-[var(--color-accent)]"
            />
            <FooterIcon
              href="https://youtube.com/"
              icon={FiYoutube}
              aria-label="YouTube"
              className="transition-colors hover:text-[var(--color-accent)]"
            />
            <FooterIcon
              href="/auth/discord"
              icon={SiDiscord}
              aria-label="Discord"
              className="transition-colors hover:text-[var(--color-accent)]"
            />
          </div>
        </div>
      </div>
    </Footer>
  );
}
