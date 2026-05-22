import { ChevronRight, ShoppingBag, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/currency";

export const CartSheet = ({
  items,
  totalAmount,
  totalItems,
  onAdd,
  onDecrement,
  onRemove,
  onPlaceOrder,
  placingOrder,
  tableNumber,
  compact = false,
}) => (
  <div
    className={`space-y-4 rounded-[1.75rem] border border-[#3a4760] bg-[#2a3952] text-[#dfe8f8] shadow-[0_18px_36px_rgba(0,0,0,0.22)] ${
      compact ? "p-4" : "p-4"
    }`}
  >
    {!compact ? <div className="mx-auto h-1.5 w-14 rounded-full bg-[#6d7890]" /> : null}
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[#41506a] p-2.5 text-[#ffb76b]">
          <ShoppingBag className="h-4 w-4" />
        </div>
        <div>
          <h3
            className={`font-extrabold tracking-[-0.03em] text-[#eff4ff] ${
              compact ? "text-[1.05rem]" : "text-[1.9rem]"
            }`}
          >
            Your order
          </h3>
          <p className={`text-[#98a6bd] ${compact ? "text-sm" : "text-sm text-[#d7c6b4]"}`}>
            {totalItems} item{totalItems === 1 ? "" : "s"}
            {tableNumber && !compact
              ? ` • Table ${String(tableNumber).padStart(2, "0")}`
              : compact
                ? " selected"
                : ""}
          </p>
        </div>
      </div>
      {compact ? (
        <span className="text-[1.05rem] font-black text-[#f6efe7]">
          {formatCurrency(totalAmount)}
        </span>
      ) : (
        <div className="rounded-full bg-[#44526d] px-4 py-2 text-sm font-semibold text-[#efe0cf]">
          Review
        </div>
      )}
    </div>

    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`rounded-[1.7rem] border border-[#3a4760] bg-[#1f2c42] ${
            compact ? "p-4" : "p-3"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <img
                src={
                  item.image_url ||
                  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80"
                }
                alt={item.name}
                className={`${compact ? "h-0 w-0 overflow-hidden opacity-0" : "h-14 w-14 rounded-[1.15rem] object-cover"}`}
              />
              <div>
                <h4
                  className={`font-semibold leading-tight text-[#f0f5ff] ${
                    compact ? "text-[1.1rem]" : "text-[1.05rem]"
                  }`}
                >
                  {item.name}
                </h4>
                <p
                  className={`mt-1 ${compact ? "text-[0.95rem] text-[#9da9bf]" : "text-[0.95rem] font-black text-[#ffb76b]"}`}
                >
                  {compact ? `${formatCurrency(item.price)} each` : formatCurrency(item.price)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div
              className={`flex items-center gap-3 rounded-[1.35rem] bg-[#55617d] ${
                compact ? "px-3 py-2" : "px-3 py-2"
              }`}
            >
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#707997] text-lg font-bold text-[#dbe3f4]"
                onClick={() => onDecrement(item.id)}
              >
                -
              </button>
              <span className="min-w-6 text-center text-lg font-bold text-white">
                {item.quantity}
              </span>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff9f1f] text-lg font-bold text-[#08111f]"
                onClick={() => onAdd(item)}
              >
                +
              </button>
            </div>
            <span className={`${compact ? "text-[1rem]" : "text-[0.95rem]"} font-semibold text-white`}>
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        </div>
      ))}
    </div>

    {!compact ? (
      <div className="space-y-3 border-t border-[#3a4760] pt-4 text-[#f1dfca]">
        <div className="flex items-center justify-between text-[0.95rem]">
          <span>Subtotal</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-[0.95rem]">
          <span>Taxes & Service</span>
          <span>{formatCurrency(0)}</span>
        </div>
        <div className="flex items-center justify-between text-[2.2rem] font-black leading-none tracking-[-0.03em] text-[#f6efe7]">
          <span>Order Total</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    ) : null}

    <button
      type="button"
      className={`flex w-full items-center rounded-[1.25rem] bg-[#ff9f1f] text-[#101827] transition hover:bg-[#ffb34c] disabled:cursor-not-allowed disabled:opacity-60 ${
        compact
          ? "justify-center px-5 py-4"
          : "justify-between px-5 py-4 text-left"
      }`}
      onClick={onPlaceOrder}
      disabled={placingOrder}
    >
      {compact ? (
        <span className="text-[1.15rem] font-black">
          {placingOrder ? "Placing order..." : "Place order"}
        </span>
      ) : (
        <>
          <span className="text-[1.55rem] font-black">
            {placingOrder ? "Placing order..." : "Place Order"}
          </span>
          <span className="flex items-center gap-2 text-[1.55rem] font-black">
            {formatCurrency(totalAmount)}
            <ChevronRight className="h-5 w-5" />
          </span>
        </>
      )}
    </button>
  </div>
);
