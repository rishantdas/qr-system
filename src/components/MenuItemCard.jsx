import { Minus, Plus } from "lucide-react";
import { Button } from "./Button";
import { formatCurrency } from "../utils/currency";

export const MenuItemCard = ({
  item,
  quantity = 0,
  onAdd,
  onDecrement,
}) => (
  <article className="surface-panel overflow-hidden">
    <div className="aspect-[4/3] bg-slate-800">
      <img
        src={
          item.image_url ||
          "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
        }
        alt={item.name}
        className="h-full w-full object-cover"
      />
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
            {item.category}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{item.name}</h3>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-white">
          {formatCurrency(item.price)}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-300">
        {item.description}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3">
        {quantity > 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <button
              type="button"
              onClick={() => onDecrement(item.id)}
              className="rounded-full bg-white/10 p-1 text-white transition hover:bg-white/20"
              aria-label={`Decrease ${item.name}`}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-6 text-center font-semibold text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onAdd(item)}
              className="rounded-full bg-brand-500 p-1 text-slate-950 transition hover:bg-brand-400"
              aria-label={`Increase ${item.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button onClick={() => onAdd(item)}>Add to cart</Button>
        )}
        {!item.is_available ? (
          <span className="text-sm font-medium text-rose-300">Unavailable</span>
        ) : null}
      </div>
    </div>
  </article>
);
