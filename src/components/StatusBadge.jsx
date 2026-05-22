import { ORDER_STATUS_META } from "../lib/constants";
import { cn } from "../utils/cn";

export const StatusBadge = ({ status }) => {
  const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
};
