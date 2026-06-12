import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export function Button({ className, variant = "ghost", ...props }: ButtonProps) {
  const variants = {
    primary: "border-signal/45 bg-signal/10 text-signal hover:bg-signal/15",
    ghost: "border-border bg-white/[0.03] text-ink hover:border-signal/35 hover:text-signal",
    danger: "border-danger/40 bg-danger/10 text-danger hover:bg-danger/15"
  };

  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-full border px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
