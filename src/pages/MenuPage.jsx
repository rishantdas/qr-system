import { Search, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryFilter } from "../components/CategoryFilter";
import { CartSheet } from "../components/CartSheet";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { MenuItemCard } from "../components/MenuItemCard";
import { MobileCartBar } from "../components/MobileCartBar";
import { SearchBar } from "../components/SearchBar";
import { SheetModal } from "../components/SheetModal";
import { useMenu } from "../hooks/useMenu";
import { ordersService } from "../services/ordersService";
import { useCartStore } from "../store/cartStore";

const MenuPage = () => {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const { table, menuItems, loading, error } = useMenu(tableId);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalItems = useCartStore((state) => state.totalItems());
  const totalAmount = useCartStore((state) => state.totalAmount());

  const categories = useMemo(() => {
    const values = new Set(menuItems.map((item) => item.category));
    return ["All", ...values];
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const query = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, menuItems, searchTerm]);

  const quantityByItemId = useMemo(
    () =>
      items.reduce((accumulator, item) => {
        accumulator[item.id] = item.quantity;
        return accumulator;
      }, {}),
    [items],
  );

  const handlePlaceOrder = async () => {
    if (!items.length || !table?.id) {
      return;
    }

    try {
      setPlacingOrder(true);
      const order = await ordersService.createOrder({
        tableId: table.id,
        items,
      });

      clearCart();
      toast.success("Order placed successfully.");
      navigate(`/order-success/${order.id}`, {
        state: {
          tableNumber: table.table_number,
          tableId: table.id,
        },
      });
    } catch (err) {
      toast.error(err.message || "Unable to place order.");
    } finally {
      setPlacingOrder(false);
      setIsCartOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <LoadingSpinner label="Loading menu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4">
        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="menu-canvas pb-32 md:pb-10">
      <section className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-3 text-[#f4efe8]">
          <UtensilsCrossed className="h-5 w-5 text-[#f2b46d]" />
          <div>
            <p className="text-[2rem] font-semibold leading-none tracking-[-0.03em]">
              Digital Menu - Table {String(table?.table_number ?? "").padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div>
            <div className="overflow-hidden rounded-[2rem] border border-[#9f7244] bg-[#07192d] shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
              <div className="border-b border-[#314259] px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="h-5 w-5 text-[#ffb76b]" />
                    <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-[#ffb76b]">
                      Table {String(table?.table_number ?? "").padStart(2, "0")}
                    </h1>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-2 text-[#f0d8bf] transition hover:bg-white/5"
                    aria-label="Search menu"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="border-b border-[#314259] bg-[#223148] px-5 py-4 sm:px-6">
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onSelect={setActiveCategory}
                />
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0bb7e]">
                      Category
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#f3f7ff]">
                      {activeCategory}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-[#223148] px-4 py-3 text-center text-sm font-semibold text-[#dce5f7]">
                    {filteredMenuItems.length} dishes available
                  </div>
                </div>

                <div className="mt-5">
                  <SearchBar value={searchTerm} onChange={setSearchTerm} />
                </div>
              </div>
            </div>

            <div className="mt-8">
              {filteredMenuItems.length ? (
                <div className="grid gap-5 xl:grid-cols-2">
                  {filteredMenuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      quantity={quantityByItemId[item.id] ?? 0}
                      onAdd={addItem}
                      onDecrement={decrementItem}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No dishes match your current filters"
                  description="Try a different search term or switch categories to explore the full menu."
                />
              )}
            </div>
          </div>

          <aside className="hidden lg:block">
            {items.length ? (
              <CartSheet
                items={items}
                totalItems={totalItems}
                totalAmount={totalAmount}
                tableNumber={table?.table_number}
                onAdd={addItem}
                onDecrement={decrementItem}
                onRemove={removeItem}
                onPlaceOrder={handlePlaceOrder}
                placingOrder={placingOrder}
              />
            ) : (
              <div className="surface-panel sticky top-6 p-6">
                <EmptyState
                  title="Your cart is empty"
                  description="Add items from the menu to start building your order."
                />
              </div>
            )}
          </aside>
        </div>
      </section>

      {items.length ? (
        <>
          <MobileCartBar
            totalItems={totalItems}
            totalAmount={totalAmount}
            onClick={() => setIsCartOpen(true)}
          />
          <SheetModal
            open={isCartOpen}
            title="Review your order"
            onClose={() => setIsCartOpen(false)}
          >
            <CartSheet
              items={items}
              totalItems={totalItems}
              totalAmount={totalAmount}
              tableNumber={table?.table_number}
              compact
              onAdd={addItem}
              onDecrement={decrementItem}
              onRemove={removeItem}
              onPlaceOrder={handlePlaceOrder}
              placingOrder={placingOrder}
            />
          </SheetModal>
        </>
      ) : null}
    </div>
  );
};

export default MenuPage;
