import { PencilLine, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
  isAvailable: true,
};

const INITIAL_EDIT_FORM = {
  itemId: "",
  name: "",
  category: "",
  price: "",
};

const sortMenuItems = (items) => (
  [...items].sort((left, right) => {
    const categoryComparison = left.category.localeCompare(right.category);

    if (categoryComparison !== 0) {
      return categoryComparison;
    }

    return left.name.localeCompare(right.name);
  })
);

export const MenuManagerPanel = ({ restaurant }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState("");
  const [deletingItemId, setDeletingItemId] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editForm, setEditForm] = useState(INITIAL_EDIT_FORM);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    if (!restaurant?.id) {
      return undefined;
    }

    let mounted = true;

    const loadMenuItems = async () => {
      try {
        setLoading(true);
        setError("");
        const [data, restaurantCategories] = await Promise.all([
          menuService.getMenuByRestaurant(restaurant.id),
          menuService.getCategoriesByRestaurant(restaurant.id),
        ]);

        if (!mounted) {
          return;
        }

        setMenuItems(data);
        setCategories(restaurantCategories);
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

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    if (!restaurant?.id) {
      return;
    }

    const normalizedName = categoryName.trim();

    if (categories.some((category) => category.toLowerCase() === normalizedName.toLowerCase())) {
      toast.error("This category already exists for this restaurant.");
      return;
    }

    try {
      setCategorySubmitting(true);
      const createdCategory = await menuService.createMenuCategory({
        restaurantId: restaurant.id,
        name: normalizedName,
      });
      setCategories((current) => [...current, createdCategory].sort((left, right) => (
        left.localeCompare(right)
      )));
      setCategoryName("");
      toast.success("Category added to this restaurant.");
    } catch (categoryError) {
      toast.error(categoryError.message || "Unable to add the category.");
    } finally {
      setCategorySubmitting(false);
    }
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
        category: form.category,
        isAvailable: form.isAvailable,
      });

      setMenuItems((current) => sortMenuItems([...current, createdItem]));
      setForm(INITIAL_FORM);
      toast.success("Menu item added.");
    } catch (submitError) {
      toast.error(submitError.message || "Unable to add the menu item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvailabilityToggle = async (item) => {
    try {
      setUpdatingItemId(item.id);
      const nextAvailability = !item.is_available;

      await menuService.updateMenuItemAvailability({
        itemId: item.id,
        isAvailable: nextAvailability,
      });

      setMenuItems((current) =>
        current.map((entry) => (
          entry.id === item.id
            ? { ...entry, is_available: nextAvailability }
            : entry
        )),
      );
      toast.success(
        nextAvailability
          ? `${item.name} is now visible on the menu.`
          : `${item.name} is now hidden from the menu.`,
      );
    } catch (updateError) {
      toast.error(
        updateError.message || "Unable to update the item availability.",
      );
    } finally {
      setUpdatingItemId("");
    }
  };

  const handleDeleteItem = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.name}" from ${restaurant.name}'s menu? Items in past orders cannot be deleted.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingItemId(item.id);
      await menuService.deleteMenuItem({
        itemId: item.id,
        restaurantId: restaurant.id,
      });
      setMenuItems((current) => current.filter((entry) => entry.id !== item.id));
      toast.success("Menu item deleted.");
    } catch (deleteError) {
      toast.error(deleteError.message || "Unable to delete the menu item.");
    } finally {
      setDeletingItemId("");
    }
  };

  const openEditModal = (item) => {
    setEditForm({
      itemId: item.id,
      name: item.name,
      category: item.category,
      price: String(item.price),
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (editSubmitting) {
      return;
    }

    setEditModalOpen(false);
    setEditForm(INITIAL_EDIT_FORM);
  };

  const resetEditModal = () => {
    setEditModalOpen(false);
    setEditForm(INITIAL_EDIT_FORM);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    try {
      setEditSubmitting(true);
      const updatedItem = await menuService.updateMenuItem({
        itemId: editForm.itemId,
        name: editForm.name,
        category: editForm.category,
        price: editForm.price,
      });

      setMenuItems((current) => sortMenuItems(
        current.map((item) => (
          item.id === updatedItem.id ? updatedItem : item
        )),
      ));
      toast.success("Menu item updated.");
      resetEditModal();
    } catch (updateError) {
      toast.error(updateError.message || "Unable to update the menu item.");
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <>
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
          <form className="mt-6 flex items-end gap-3" onSubmit={handleCategorySubmit}>
            <label className="block min-w-0 flex-1">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Add a category for this restaurant
              </span>
              <input
                type="text"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                maxLength={50}
                placeholder="Seasonal Specials"
                className="surface-muted w-full px-4 py-3 text-white outline-none placeholder:text-slate-500"
                required
              />
            </label>
            <Button type="submit" disabled={categorySubmitting} className="gap-2">
              <Plus className="h-4 w-4" />
              {categorySubmitting ? "Adding..." : "Add category"}
            </Button>
          </form>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
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
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.is_available
                              ? "bg-emerald-500/15 text-emerald-200"
                              : "bg-rose-500/15 text-rose-200"
                          }`}
                        >
                          {item.is_available ? "Visible to customers" : "Hidden"}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            className="gap-2 px-3 py-2 text-xs"
                            disabled={deletingItemId === item.id}
                            onClick={() => openEditModal(item)}
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant={item.is_available ? "secondary" : "primary"}
                            className="px-3 py-2 text-xs"
                            disabled={
                              updatingItemId === item.id || deletingItemId === item.id
                            }
                            onClick={() => handleAvailabilityToggle(item)}
                          >
                            {updatingItemId === item.id
                              ? "Updating..."
                              : item.is_available
                                ? "Mark unavailable"
                                : "Mark available"}
                          </Button>
                          <Button
                            variant="danger"
                            className="gap-2 px-3 py-2 text-xs"
                            disabled={Boolean(deletingItemId) || updatingItemId === item.id}
                            onClick={() => handleDeleteItem(item)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingItemId === item.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
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

      {editModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
                  Menu editor
                </p>
                <h3 className="mt-3 text-2xl font-extrabold text-white">
                  Edit menu item
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Update the title, category, or price for this dish.
                </p>
              </div>
              <Button variant="ghost" className="px-3 py-2 text-xs" onClick={closeEditModal}>
                Close
              </Button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleEditSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  Title
                </span>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
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
                  value={editForm.category}
                  onChange={handleEditChange}
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
                  value={editForm.price}
                  onChange={handleEditChange}
                  min="0"
                  step="0.01"
                  placeholder="249"
                  className="surface-muted w-full px-4 py-3 text-white outline-none placeholder:text-slate-500"
                  required
                />
              </label>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  className="sm:min-w-28"
                  onClick={closeEditModal}
                  disabled={editSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="sm:min-w-36"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};
