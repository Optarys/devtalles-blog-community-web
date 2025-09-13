import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { FaDiscord } from "react-icons/fa";

export default function TopNav() {
  return (
    <Navbar fluid rounded className="bg-[var(--color-bg)]">
      {/* LOGO */}
      <NavbarBrand href="/">
        <img src="/assets/svg/LOGO B.svg" className="mr-3 h-6 sm:h-9" alt="Logo" />
      </NavbarBrand>

      {/* MENÚ */}
      <NavbarToggle />
      <NavbarCollapse>
        <NavbarLink href="/" active className="text-[var(--color-text)]">
          Inicio
        </NavbarLink>
        <NavbarLink href="/blog/" className="text-[var(--color-text)]">
          Blog
        </NavbarLink>
        <NavbarLink href="/about/" className="text-[var(--color-text)]">
          About
        </NavbarLink>
      </NavbarCollapse>

      {/* BOTÓN LOGIN */}
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
