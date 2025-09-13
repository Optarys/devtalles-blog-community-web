import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

export default function TopNav() {
  return (
  <Navbar fluid rounded className="bg-[var(--color-bg)]">
  <NavbarBrand href="/">
    <img src="/assets/svg/LOGO B.svg" className="mr-3 h-6 sm:h-9" alt="Logo" />
   
  </NavbarBrand>
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
</Navbar>

  );
}
