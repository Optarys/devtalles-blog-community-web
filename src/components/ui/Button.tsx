import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type BaseProps = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
};

type ButtonAsAnchor = BaseProps & {
  href: string;
  type?: never;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

type ButtonAsButton = BaseProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: ButtonAsAnchor | ButtonAsButton) {
  const isAnchor = "href" in props && props.href;
  const {
    children,
    icon,
    variant = "solid",
    size = "md",
    fullWidth,
    className = "",
    ...rest
  } = props as (ButtonAsAnchor | ButtonAsButton);

  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2 text-base", lg: "px-6 py-3 text-lg" };
  const variants = {
    solid: "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[#B786F4]",
    outline:
      "border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]",
    ghost: "text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10",
  };
  const width = fullWidth ? "w-full" : "";
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${width} ${className}`;

  if ("href" in props && props.href) {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} href={props.href} className={classes}>
        {icon}
        {children}
      </a>
    );
  }

  const type = (props as ButtonAsButton).type ?? "button";
  return (
    <button {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} type={type} className={classes}>
      {icon}
      {children}
    </button>
  );
}
