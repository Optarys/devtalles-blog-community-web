import { Footer, FooterCopyright } from "flowbite-react";

export default function FooterSimple() {
  return (
    <Footer container className="bg-[var(--color-bg)] border-t border-white/10">
      <div className="w-full text-center">
        <FooterCopyright href="/" by="DevTalles Blog" year={new Date().getFullYear()} />
      </div>
    </Footer>
  );
}
