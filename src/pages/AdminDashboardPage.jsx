import { Activity, CircleCheckBig, CookingPot, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
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
import { formatDateInputValue } from "../utils/date";
import { generateTableQrCode } from "../utils/qr";

const AdminDashboardPage = () => {
  const [statusFilter, setStatusFilter] = useState(DEFAULT_ORDER_FILTER);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [qrPreview, setQrPreview] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const {
    restaurant,
    loading: restaurantLoading,
    error: restaurantError,
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
                onStatusChange={handleStatusChange}
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
    </div>
  );
};

export default AdminDashboardPage;
