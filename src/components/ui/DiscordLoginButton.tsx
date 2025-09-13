import { FaDiscord } from "react-icons/fa";

export default function DiscordLoginButton() {
  return (
    <button
      onClick={() => (window.location.href = "/auth/discord")}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-600 px-5 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]/80 transition"
    >
      <FaDiscord /> Iniciar con Discord
    </button>
  );
}
