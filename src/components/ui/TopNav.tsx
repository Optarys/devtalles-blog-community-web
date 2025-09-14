import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa";

type Props = { currentPath?: string };

export default function TopNav({ currentPath }: Props) {
  const [path, setPath] = useState(currentPath ?? "/");
  useEffect(() => {
    if (!currentPath) setPath(window.location.pathname);
  }, [currentPath]);

  const isActive = (href: string) => {
    if (href === "/") return path === "/";
    // Marca activo para rutas anidadas (/blog/ y /blog/slug)
    return path === href || path.startsWith(href);
  };

  return (
    <Navbar
      fluid
      rounded
      className="
        sticky top-0 z-50
        border-b border-white/10
        bg-[var(--color-bg)]/80 backdrop-blur
        supports-[backdrop-filter]:bg-[var(--color-bg)]/60
      "
    >
      <NavbarBrand href="/">
        <img src="/assets/svg/LOGO B.svg" className="mr-3 h-6 sm:h-9" alt="Logo" />
      </NavbarBrand>

      <NavbarToggle />
      <NavbarCollapse>
        <NavbarLink href="/"        active={isActive("/")}        className="text-[var(--color-text)]">Inicio</NavbarLink>
        <NavbarLink href="/blog/"   active={isActive("/blog/")}   className="text-[var(--color-text)]">Blog</NavbarLink>
        <NavbarLink href="/about/"  active={isActive("/about/")}  className="text-[var(--color-text)]">About</NavbarLink>
      </NavbarCollapse>

      <Button
        color="purple"
        size="sm"
        className="ml-4 flex items-center gap-2"
        onClick={() => (window.location.href = "/auth/login")}
      >
        <FaDiscord className="text-lg" />
        Login
      </Button>
    </Navbar>
  );
}
