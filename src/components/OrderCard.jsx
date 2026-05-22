import { Clock3, UtensilsCrossed } from "lucide-react";
import { ORDER_STATUSES } from "../lib/constants";
import { formatCurrency } from "../utils/currency";
import { formatDateTime } from "../utils/date";
import { Button } from "./Button";
import { StatusBadge } from "./StatusBadge";

export const OrderCard = ({ order, onStatusChange, updating }) => (
  <article className="surface-panel p-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <p className="text-lg font-semibold text-white">
            Table {order.restaurant_tables?.table_number ?? "N/A"}
          </p>
          <StatusBadge status={order.status} />
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {formatDateTime(order.created_at)}
          </span>
          <span className="inline-flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Order #{order.id.slice(0, 8)}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-400">Order total</p>
        <p className="text-xl font-bold text-white">
          {formatCurrency(order.total_amount)}
        </p>
      </div>
    </div>

    <div className="mt-5 space-y-3">
      {order.order_items?.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
        >
          <div>
            <p className="font-medium text-white">
              {item.quantity}x {item.menu_items?.name ?? "Menu item"}
            </p>
            <p className="text-sm text-slate-400">
              {item.menu_items?.category ?? "Uncategorized"}
            </p>
          </div>
          <span className="font-semibold text-white">
            {formatCurrency(item.quantity * item.price)}
          </span>
        </div>
      ))}
    </div>

    <div className="mt-5 flex flex-wrap gap-3">
      {ORDER_STATUSES.map((status) => (
        <Button
          key={status}
          variant={order.status === status ? "primary" : "secondary"}
          disabled={order.status === status || updating}
          onClick={() => onStatusChange(order.id, status)}
        >
          Mark {status}
        </Button>
      ))}
    </div>
  </article>
);
