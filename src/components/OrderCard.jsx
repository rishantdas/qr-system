import { Clock3, PencilLine, Trash2, UtensilsCrossed } from "lucide-react";
import { ORDER_STATUSES } from "../lib/constants";
import { formatCurrency } from "../utils/currency";
import { formatDateTime } from "../utils/date";
import { Button } from "./Button";
import { StatusBadge } from "./StatusBadge";

export const OrderCard = ({
  order,
  onStatusChange,
  updating,
  onShowBill,
  onCloseBill,
  billUpdating,
  onEditOrder,
  onDeleteOrder,
  deleting,
}) => {
  const orderReference = order.restaurant_order_code ?? order.id.slice(0, 8);
  const isBillLiveForTable =
    order.restaurant_tables?.current_view === "bill"
    && order.restaurant_tables?.active_order_id === order.id;

  return (
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
            Order #{orderReference}
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
          disabled={order.status === status || updating || deleting}
          onClick={() => onStatusChange(order.id, status)}
        >
          Mark {status}
        </Button>
      ))}
      <Button
        variant={isBillLiveForTable ? "secondary" : "primary"}
        disabled={billUpdating || deleting}
        onClick={() => onShowBill(order)}
      >
        {billUpdating
          ? "Updating bill..."
          : isBillLiveForTable
            ? "Bill live on QR"
            : "Show bill on QR"}
      </Button>
      {isBillLiveForTable ? (
        <Button
          variant="ghost"
          disabled={billUpdating || deleting}
          onClick={() => onCloseBill(order)}
        >
          Close bill
        </Button>
      ) : null}
      <Button
        variant="ghost"
        className="gap-2"
        disabled={deleting}
        onClick={() => onEditOrder(order)}
      >
        <PencilLine className="h-4 w-4" />
        Edit order
      </Button>
      <Button
        variant="danger"
        className="gap-2"
        disabled={deleting || updating || billUpdating}
        onClick={() => onDeleteOrder(order)}
      >
        <Trash2 className="h-4 w-4" />
        {deleting ? "Deleting..." : "Delete order"}
      </Button>
    </div>
  </article>
  );
};
