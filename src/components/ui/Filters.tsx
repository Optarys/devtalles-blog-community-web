import { Dropdown, DropdownItem } from "flowbite-react";

export default function Filters() {
  return (
    <Dropdown label="Tags">
      <DropdownItem>Astro</DropdownItem>
      <DropdownItem>React</DropdownItem>
      <DropdownItem>Tailwind</DropdownItem>
    </Dropdown>
  );
}
