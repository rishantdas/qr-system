import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { MenuManagerPanel } from "../components/MenuManagerPanel";
import { useAdminRestaurant } from "../hooks/useAdminRestaurant";

const AdminMenuPage = () => {
  const {
    restaurant,
    loading: restaurantLoading,
    error: restaurantError,
  } = useAdminRestaurant();

  if (restaurantLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label="Loading menu workspace..." />
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
          Menu management
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Add dishes, organize categories, and control what guests can see from
          the QR menu for this restaurant.
        </p>
      </section>

      <MenuManagerPanel restaurant={restaurant} />
    </div>
  );
};

export default AdminMenuPage;
