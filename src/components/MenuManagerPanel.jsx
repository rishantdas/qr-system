import { Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MENU_CATEGORY_OPTIONS } from "../lib/constants";
import { menuService } from "../services/menuService";
import { formatCurrency } from "../utils/currency";
import { Button } from "./Button";
import { ErrorState } from "./ErrorState";
import { LoadingSpinner } from "./LoadingSpinner";

const INITIAL_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
  isAvailable: true,
};

export const MenuManagerPanel = ({ restaurant }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const categories = useMemo(() => {
    const values = new Set(
      [...MENU_CATEGORY_OPTIONS, ...menuItems
        .map((item) => item.category?.trim())
        .filter(Boolean)],
    );

    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [menuItems]);

  useEffect(() => {
    if (!restaurant?.id) {
      return undefined;
    }

    let mounted = true;

    const loadMenuItems = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await menuService.getMenuByRestaurant(restaurant.id);

        if (!mounted) {
          return;
        }

        setMenuItems(data);
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || "Unable to load menu items.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMenuItems();

    return () => {
      mounted = false;
    };
  }, [restaurant?.id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!restaurant?.id) {
      return;
    }

    try {
      setSubmitting(true);
      const createdItem = await menuService.createMenuItem({
        restaurantId: restaurant.id,
        name: form.name,
        description: form.description,
        price: form.price,
        imageUrl: form.imageUrl,
        category: form.category,
        isAvailable: form.isAvailable,
      });

      setMenuItems((current) =>
        [...current, createdItem].sort((left, right) => {
          const categoryComparison = left.category.localeCompare(right.category);

          if (categoryComparison !== 0) {
            return categoryComparison;
          }

          return left.name.localeCompare(right.name);
        }),
      );
      setForm(INITIAL_FORM);
      toast.success("Menu item added.");
    } catch (submitError) {
      toast.error(submitError.message || "Unable to add the menu item.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="surface-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Menu studio
            </p>
            <h3 className="mt-3 text-2xl font-extrabold text-white">
              Add dishes for {restaurant?.name ?? "your restaurant"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Publish new menu items directly to this restaurant so they appear
              in the QR menu flow.
            </p>
          </div>
          <div className="rounded-2xl bg-brand-500/15 p-3 text-brand-300">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Item name
            </span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Paneer Tikka Wrap"
              className="surface-muted w-full px-4 py-3 text-white outline-none placeholder:text-slate-500"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Category
            </span>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="surface-muted w-full px-4 py-3 text-white outline-none"
              required
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">
                Select a category
              </option>
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-slate-900 text-white"
                >
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Price
            </span>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="249"
              className="surface-muted w-full px-4 py-3 text-white outline-none placeholder:text-slate-500"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Description
            </span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Smoky, creamy, and ready fast for busy lunch rushes."
              className="surface-muted w-full resize-none px-4 py-3 text-white outline-none placeholder:text-slate-500"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Image URL
            </span>
            <input
              type="url"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/dish.jpg"
              className="surface-muted w-full px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <label className="surface-muted flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Available now</p>
              <p className="mt-1 text-xs text-slate-400">
                Customers will only see items marked available.
              </p>
            </div>
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              className="h-5 w-5 accent-orange-400"
            />
          </label>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            {submitting ? "Adding item..." : "Add menu item"}
          </Button>
        </form>
      </div>

      <div className="surface-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Current menu</p>
            <p className="mt-1 text-sm text-slate-400">
              {menuItems.length} item{menuItems.length === 1 ? "" : "s"} linked to
              this restaurant.
            </p>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="flex min-h-[18rem] items-center justify-center">
              <LoadingSpinner label="Loading menu items..." />
            </div>
          ) : error ? (
            <ErrorState message={error} />
          ) : menuItems.length ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {menuItems.map((item) => (
                <article
                  key={item.id}
                  className="surface-muted overflow-hidden"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-slate-950/60 text-sm text-slate-500">
                      No image yet
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                          {item.category}
                        </p>
                        <h4 className="mt-2 text-lg font-bold text-white">
                          {item.name}
                        </h4>
                      </div>
                      <span className="rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-200">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {item.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.is_available
                            ? "bg-emerald-500/15 text-emerald-200"
                            : "bg-rose-500/15 text-rose-200"
                        }`}
                      >
                        {item.is_available ? "Visible to customers" : "Hidden"}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 px-5 py-16 text-center">
              <p className="text-lg font-semibold text-white">
                No menu items yet
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Add your first dish on the left and it will show up here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
