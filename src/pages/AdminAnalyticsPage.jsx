import { BarChart3, CalendarDays, Receipt, Trophy } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAdminRestaurant } from "../hooks/useAdminRestaurant";
import { useRealtimeOrders } from "../hooks/useRealtimeOrders";
import { formatCurrency } from "../utils/currency";

const isWithinDays = (value, days) => {
  const targetDate = new Date(value);
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return targetDate >= start && targetDate <= now;
};

const isToday = (value) => {
  const targetDate = new Date(value);
  const today = new Date();

  return (
    targetDate.getFullYear() === today.getFullYear()
    && targetDate.getMonth() === today.getMonth()
    && targetDate.getDate() === today.getDate()
  );
};

const sumOrderValue = (orders) =>
  orders.reduce((total, order) => total + Number(order.total_amount || 0), 0);

const buildTopItems = (orders) => {
  const itemsMap = new Map();

  orders.forEach((order) => {
    order.order_items?.forEach((orderItem) => {
      const menuItem = orderItem.menu_items;

      if (!menuItem?.id) {
        return;
      }

      const current = itemsMap.get(menuItem.id) || {
        id: menuItem.id,
        name: menuItem.name || "Unnamed item",
        category: menuItem.category || "Uncategorized",
        quantity: 0,
        revenue: 0,
      };

      current.quantity += Number(orderItem.quantity || 0);
      current.revenue += Number(orderItem.price || 0) * Number(orderItem.quantity || 0);
      itemsMap.set(menuItem.id, current);
    });
  });

  return Array.from(itemsMap.values())
    .sort((left, right) => {
      if (right.quantity !== left.quantity) {
        return right.quantity - left.quantity;
      }

      return right.revenue - left.revenue;
    })
    .slice(0, 3);
};

const MetricCard = ({ icon: Icon, label, value, helper, tone = "brand" }) => {
  const toneStyles = {
    brand: "text-brand-300",
    amber: "text-amber-300",
    sky: "text-sky-300",
    emerald: "text-emerald-300",
  };

  return (
    <div className="surface-muted p-5">
      <div className={`flex items-center gap-3 ${toneStyles[tone]}`}>
        <Icon className="h-5 w-5" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
};

const AdminAnalyticsPage = () => {
  const {
    restaurant,
    loading: restaurantLoading,
    error: restaurantError,
  } = useAdminRestaurant();
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
  } = useRealtimeOrders({
    restaurantId: restaurant?.id,
    statusFilter: "all",
  });

  const analytics = useMemo(() => {
    const todayOrders = orders.filter((order) => isToday(order.created_at));
    const weeklyOrders = orders.filter((order) => isWithinDays(order.created_at, 7));

    return {
      todayOrders,
      weeklyOrders,
      todayCount: todayOrders.length,
      todayRevenue: sumOrderValue(todayOrders),
      weeklyCount: weeklyOrders.length,
      weeklyRevenue: sumOrderValue(weeklyOrders),
      topItems: buildTopItems(weeklyOrders),
    };
  }, [orders]);

  if (restaurantLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label="Loading analytics..." />
      </div>
    );
  }

  if (restaurantError) {
    return <ErrorState message={restaurantError} />;
  }

  return (
    <div className="space-y-8">
      <section className="surface-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
          {restaurant?.name ?? "Restaurant"}
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-white">
          Sales analytics
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Track orders placed today, review the last 7 days of sales, and spot
          the most popular items from the last week.
        </p>
      </section>

      {ordersLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <LoadingSpinner label="Refreshing analytics..." />
        </div>
      ) : ordersError ? (
        <ErrorState message={ordersError} />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={CalendarDays}
              label="Orders today"
              value={analytics.todayCount}
              helper="Number of orders placed today"
              tone="brand"
            />
            <MetricCard
              icon={Receipt}
              label="Today revenue"
              value={formatCurrency(analytics.todayRevenue)}
              helper="Total value of orders placed today"
              tone="amber"
            />
            <MetricCard
              icon={BarChart3}
              label="Last 7 days orders"
              value={analytics.weeklyCount}
              helper="Total orders placed in the last week"
              tone="sky"
            />
            <MetricCard
              icon={Receipt}
              label="Last 7 days revenue"
              value={formatCurrency(analytics.weeklyRevenue)}
              helper="Total order value generated in the last week"
              tone="emerald"
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="surface-panel p-6">
              <div className="flex items-center gap-3 text-brand-300">
                <CalendarDays className="h-5 w-5" />
                <p className="text-sm font-semibold">Range snapshots</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="surface-muted p-5">
                  <p className="text-sm font-semibold text-white">Today</p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {analytics.todayCount} orders
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Revenue: {formatCurrency(analytics.todayRevenue)}
                  </p>
                </div>
                <div className="surface-muted p-5">
                  <p className="text-sm font-semibold text-white">Last 7 days</p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {analytics.weeklyCount} orders
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Revenue: {formatCurrency(analytics.weeklyRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-panel p-6">
              <div className="flex items-center gap-3 text-brand-300">
                <Trophy className="h-5 w-5" />
                <p className="text-sm font-semibold">Top 3 items this week</p>
              </div>

              <div className="mt-5">
                {analytics.topItems.length ? (
                  <div className="space-y-3">
                    {analytics.topItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="surface-muted flex items-center justify-between gap-4 p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/20 text-sm font-black text-brand-300">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-sm text-slate-400">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {item.quantity} ordered
                          </p>
                          <p className="text-sm text-slate-400">
                            {formatCurrency(item.revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No weekly item data yet"
                    description="Top items will appear here once customers place orders this week."
                  />
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
