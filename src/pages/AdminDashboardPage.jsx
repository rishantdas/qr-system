import { Activity, CircleCheckBig, CookingPot, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAdminRestaurant } from "../hooks/useAdminRestaurant";
import { OrderCard } from "../components/OrderCard";
import { DEFAULT_ORDER_FILTER } from "../lib/constants";
import { useRealtimeOrders } from "../hooks/useRealtimeOrders";
import { ordersService } from "../services/ordersService";
import { restaurantService } from "../services/restaurantService";
import { formatCurrency } from "../utils/currency";
import { formatDateInputValue } from "../utils/date";
import { generateTableQrCode } from "../utils/qr";
import { normalizeExternalUrl } from "../utils/url";

const AdminDashboardPage = () => {
  const [statusFilter, setStatusFilter] = useState(DEFAULT_ORDER_FILTER);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [billActionOrderId, setBillActionOrderId] = useState("");
  const [deletingOrderId, setDeletingOrderId] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);
  const [removingItemId, setRemovingItemId] = useState("");
  const [qrPreview, setQrPreview] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [savingReviewUrl, setSavingReviewUrl] = useState(false);
  const {
    restaurant,
    loading: restaurantLoading,
    error: restaurantError,
    setRestaurant,
  } = useAdminRestaurant();
  const defaultStartDate = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 1);
    return formatDateInputValue(start);
  }, []);
  const defaultEndDate = useMemo(() => formatDateInputValue(new Date()), []);
  const effectiveStartDate = startDate || defaultStartDate;
  const effectiveEndDate = endDate || defaultEndDate;

  useEffect(() => {
    setGoogleReviewUrl(restaurant?.google_review_url ?? "");
  }, [restaurant?.google_review_url]);

  const { orders, loading, error, refreshOrders } = useRealtimeOrders({
    restaurantId: restaurant?.id,
    statusFilter,
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
  });

  const analytics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((order) => order.status === "pending").length;
    const preparing = orders.filter(
      (order) => order.status === "preparing",
    ).length;
    const completed = orders.filter(
      (order) => order.status === "completed",
    ).length;

    return { total, pending, preparing, completed };
  }, [orders]);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await ordersService.updateStatus(orderId, status);
      toast.success(`Order updated to ${status}.`);
      await refreshOrders();
    } catch (updateError) {
      toast.error(updateError.message || "Unable to update order status.");
    } finally {
      setUpdatingOrderId("");
    }
  };

  const handleGenerateQr = async () => {
    const tableNumber = prompt("Enter a table number to generate its QR code:");

    if (!tableNumber || !restaurant?.id) {
      return;
    }

    try {
      const table = await restaurantService.getRestaurantTableByNumber({
        restaurantId: restaurant.id,
        tableNumber,
      });
      const qrCode = await generateTableQrCode(table.id);
      setQrPreview(qrCode);
    } catch (generationError) {
      toast.error(
        generationError.message || "Unable to generate QR code for that table.",
      );
    }
  };

  const handleShowBill = async (order) => {
    try {
      setBillActionOrderId(order.id);
      await ordersService.showBillOnTable({
        orderId: order.id,
        tableId: order.table_id,
      });
      toast.success("Bill is now live on the table QR.");
      await refreshOrders();
    } catch (billError) {
      toast.error(billError.message || "Unable to show the bill on the table QR.");
    } finally {
      setBillActionOrderId("");
    }
  };

  const handleCloseBill = async (order) => {
    try {
      setBillActionOrderId(order.id);
      await ordersService.closeBillOnTable({
        orderId: order.id,
        tableId: order.table_id,
      });
      toast.success("Bill closed. The table QR is back on the menu.");
      await refreshOrders();
    } catch (billError) {
      toast.error(billError.message || "Unable to close the bill.");
    } finally {
      setBillActionOrderId("");
    }
  };

  const handleOpenEditOrder = (order) => {
    setEditingOrder(order);
  };

  const handleSaveGoogleReviewUrl = async (event) => {
    event.preventDefault();

    if (!restaurant?.id) {
      return;
    }

    try {
      setSavingReviewUrl(true);
      const normalizedUrl = googleReviewUrl
        ? normalizeExternalUrl(googleReviewUrl)
        : "";
      const updatedRestaurant = await restaurantService.updateAdminRestaurant({
        restaurantId: restaurant.id,
        googleReviewUrl: normalizedUrl,
      });
      setRestaurant(updatedRestaurant);
      setGoogleReviewUrl(updatedRestaurant.google_review_url ?? "");
      toast.success(
        normalizedUrl
          ? "Google review link saved."
          : "Google review link removed.",
      );
    } catch (saveError) {
      toast.error(saveError.message || "Unable to save the Google review link.");
    } finally {
      setSavingReviewUrl(false);
    }
  };

  const handleCloseEditOrder = () => {
    if (removingItemId) {
      return;
    }

    setEditingOrder(null);
  };

  const handleRemoveOrderItem = async (order, orderItemId) => {
    const nextItems = order.order_items?.filter((item) => item.id !== orderItemId) ?? [];

    if (!nextItems.length) {
      toast.error("This is the last item. Use delete order instead.");
      return;
    }

    const nextTotalAmount = nextItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    try {
      setRemovingItemId(orderItemId);
      await ordersService.removeOrderItem({
        orderId: order.id,
        orderItemId,
        totalAmount: nextTotalAmount,
      });
      toast.success("Order item removed.");
      await refreshOrders();
      setEditingOrder((current) => (
        current?.id === order.id
          ? {
            ...current,
            total_amount: nextTotalAmount,
            order_items: nextItems,
          }
          : current
      ));
    } catch (removeError) {
      toast.error(removeError.message || "Unable to remove the order item.");
    } finally {
      setRemovingItemId("");
    }
  };

  const handleDeleteOrder = async (order) => {
    const orderReference = order.restaurant_order_code ?? order.id.slice(0, 8);
    const confirmed = window.confirm(
      `Delete order #${orderReference} for table ${order.restaurant_tables?.table_number ?? "N/A"}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingOrderId(order.id);
      await ordersService.deleteOrder({
        orderId: order.id,
        tableId: order.table_id,
        resetTableBill:
          order.restaurant_tables?.current_view === "bill"
          && order.restaurant_tables?.active_order_id === order.id,
      });
      if (editingOrder?.id === order.id) {
        setEditingOrder(null);
      }
      toast.success("Order deleted.");
      await refreshOrders();
    } catch (deleteError) {
      toast.error(deleteError.message || "Unable to delete the order.");
    } finally {
      setDeletingOrderId("");
    }
  };

  if (restaurantLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label="Loading dashboard..." />
      </div>
    );
  }

  if (restaurantError) {
    return <ErrorState message={restaurantError} />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
            {restaurant?.name ?? "Restaurant"}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white">
            Order tracking
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Track every incoming QR order in realtime, update kitchen progress,
            and keep table turnover moving smoothly.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="surface-muted p-4">
              <div className="flex items-center gap-3 text-brand-300">
                <Activity className="h-5 w-5" />
                <span className="text-sm font-semibold">All orders</span>
              </div>
              <p className="mt-3 text-3xl font-black text-white">
                {analytics.total}
              </p>
            </div>
            <div className="surface-muted p-4">
              <div className="flex items-center gap-3 text-amber-300">
                <LoaderCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">Pending</span>
              </div>
              <p className="mt-3 text-3xl font-black text-white">
                {analytics.pending}
              </p>
            </div>
            <div className="surface-muted p-4">
              <div className="flex items-center gap-3 text-sky-300">
                <CookingPot className="h-5 w-5" />
                <span className="text-sm font-semibold">Preparing</span>
              </div>
              <p className="mt-3 text-3xl font-black text-white">
                {analytics.preparing}
              </p>
            </div>
            <div className="surface-muted p-4">
              <div className="flex items-center gap-3 text-emerald-300">
                <CircleCheckBig className="h-5 w-5" />
                <span className="text-sm font-semibold">Completed</span>
              </div>
              <p className="mt-3 text-3xl font-black text-white">
                {analytics.completed}
              </p>
            </div>
          </div>
        </div>

        <div className="surface-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">QR generator</p>
              <p className="mt-1 text-sm text-slate-400">
                Generate a table QR for printing or testing.
              </p>
            </div>
            <Button onClick={handleGenerateQr}>Generate</Button>
          </div>
          {qrPreview ? (
            <div className="mt-5 rounded-3xl bg-white p-4">
              <img src={qrPreview} alt="Generated table QR code" />
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-slate-400">
              Generate a QR code to preview a printable table link.
            </div>
          )}
        </div>
      </section>

      <section className="surface-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
          Growth tools
        </p>
        <h3 className="mt-3 text-2xl font-extrabold text-white">
          Google review link
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Add your Google Maps or Google review URL. Guests will see a review
          button after ordering and while viewing the table bill.
        </p>

        <form
          className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"
          onSubmit={handleSaveGoogleReviewUrl}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Google review URL
            </span>
            <input
              type="url"
              value={googleReviewUrl}
              onChange={(event) => setGoogleReviewUrl(event.target.value)}
              placeholder="https://g.page/r/your-review-link/review"
              className="surface-muted w-full px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </label>
          <div className="flex items-end">
            <Button
              className="w-full lg:w-auto"
              type="submit"
              disabled={savingReviewUrl}
            >
              {savingReviewUrl ? "Saving..." : "Save review link"}
            </Button>
          </div>
        </form>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        {["all", "pending", "preparing", "completed"].map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? "primary" : "secondary"}
            onClick={() => setStatusFilter(filter)}
          >
            {filter === "all"
              ? "All statuses"
              : `${filter[0].toUpperCase()}${filter.slice(1)}`}
          </Button>
        ))}
        <label className="surface-muted ml-auto flex items-center gap-3 px-4 py-3">
          <span className="text-sm font-medium text-slate-300">Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="bg-transparent text-sm text-white outline-none"
          />
        </label>
        <label className="surface-muted flex items-center gap-3 px-4 py-3">
          <span className="text-sm font-medium text-slate-300">End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="bg-transparent text-sm text-white outline-none"
          />
        </label>
        {startDate || endDate ? (
          <Button
            variant="ghost"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Clear range
          </Button>
        ) : null}
      </section>

      <section>
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <LoadingSpinner label="Loading realtime orders..." />
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : orders.length ? (
          <div className="grid gap-5">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                updating={updatingOrderId === order.id}
                billUpdating={billActionOrderId === order.id}
                deleting={deletingOrderId === order.id}
                onStatusChange={handleStatusChange}
                onShowBill={handleShowBill}
                onCloseBill={handleCloseBill}
                onEditOrder={handleOpenEditOrder}
                onDeleteOrder={handleDeleteOrder}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching orders"
            description={
              startDate || endDate
                ? "No orders were found for the selected date range and status."
                : "Only the last 2 days of orders are shown here right now."
            }
          />
        )}
      </section>

      {editingOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-2xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                  Order editor
                </p>
                <h3 className="mt-3 text-2xl font-extrabold text-white">
                  Edit order #{editingOrder.restaurant_order_code ?? editingOrder.id.slice(0, 8)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Remove items from this order before the kitchen continues.
                </p>
              </div>
              <Button
                variant="ghost"
                className="px-3 py-2 text-xs"
                onClick={handleCloseEditOrder}
                disabled={Boolean(removingItemId)}
              >
                Close
              </Button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Table</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {editingOrder.restaurant_tables?.table_number ?? "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Updated total</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {formatCurrency(editingOrder.total_amount)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {editingOrder.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {item.quantity}x {item.menu_items?.name ?? "Menu item"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {item.menu_items?.category ?? "Uncategorized"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">
                        {formatCurrency(item.quantity * item.price)}
                      </span>
                      <Button
                        variant="danger"
                        className="px-3 py-2 text-xs"
                        disabled={removingItemId === item.id}
                        onClick={() => handleRemoveOrderItem(editingOrder, item.id)}
                      >
                        {removingItemId === item.id ? "Removing..." : "Remove item"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {editingOrder.order_items?.length === 1 ? (
                <p className="mt-4 text-sm text-amber-300">
                  The last remaining item cannot be removed here. Use delete order if
                  this full order should be cancelled.
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={handleCloseEditOrder}
                disabled={Boolean(removingItemId)}
              >
                Done
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteOrder(editingOrder)}
                disabled={Boolean(removingItemId) || deletingOrderId === editingOrder.id}
              >
                {deletingOrderId === editingOrder.id ? "Deleting..." : "Delete order"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboardPage;
