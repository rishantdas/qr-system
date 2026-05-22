import { cn } from "../utils/cn";

const variants = {
  primary:
    "bg-brand-500 text-slate-950 hover:bg-brand-400 focus-visible:ring-brand-400",
  secondary:
    "bg-white/10 text-white hover:bg-white/15 focus-visible:ring-white/20",
  ghost:
    "bg-transparent text-slate-200 hover:bg-white/5 focus-visible:ring-white/10",
  danger:
    "bg-rose-500/90 text-white hover:bg-rose-400 focus-visible:ring-rose-300",
};

export const Button = ({
  children,
  className,
  variant = "primary",
  disabled = false,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={cn(
      "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60",
      variants[variant],
      className,
    )}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
