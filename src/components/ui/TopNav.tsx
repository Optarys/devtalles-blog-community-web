import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

export default function TopNav() {
  return (
    <Navbar fluid rounded>
      <NavbarBrand href="/">
        <img src="/logo.svg" className="mr-3 h-6 sm:h-9" alt="Logo" />
        <span className="self-center whitespace-nowrap text-xl font-semibold">
          DevTalles Blog
        </span>
      </NavbarBrand>

      <NavbarToggle />

      <NavbarCollapse>
        <NavbarLink href="/" active>
          Inicio
        </NavbarLink>
        <NavbarLink href="/blog/">Blog</NavbarLink>
        <NavbarLink href="/about/">About</NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}
