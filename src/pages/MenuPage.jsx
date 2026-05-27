import { Search, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
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
import { formatCurrency } from "../utils/currency";
import { formatDateTime } from "../utils/date";
import { normalizeExternalUrl } from "../utils/url";

const downloadBillPng = ({ order, table }) => {
  const orderReference = order.restaurant_order_code ?? order.id.slice(0, 8);
  const items = order.order_items ?? [];
  const width = 1200;
  const height = Math.max(920, 330 + items.length * 110);
  const scale = 2;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create the bill image.");
  }

  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.scale(scale, scale);

  const left = 72;
  const right = width - 72;
  let y = 92;

  const drawText = (text, x, currentY, options = {}) => {
    const {
      align = "left",
      color = "#111827",
      font = "500 28px Arial",
    } = options;

    context.fillStyle = color;
    context.font = font;
    context.textAlign = align;
    context.fillText(text, x, currentY);
  };

  context.fillStyle = "#f8fafc";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#ffffff";
  context.fillRect(28, 28, width - 56, height - 56);

  context.fillStyle = "#111827";
  context.font = "700 46px Arial";
  context.textAlign = "left";
  context.fillText("Restaurant Bill", left, y);

  y += 52;
  drawText(
    `Table ${String(table?.table_number ?? "").padStart(2, "0")}`,
    left,
    y,
    { font: "600 24px Arial", color: "#475569" },
  );

  y += 38;
  drawText(
    `Order #${orderReference} • ${formatDateTime(order.created_at)}`,
    left,
    y,
    { font: "500 22px Arial", color: "#64748b" },
  );

  y += 58;
  context.strokeStyle = "#cbd5e1";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(left, y);
  context.lineTo(right, y);
  context.stroke();

  y += 44;
  drawText("Item", left, y, { font: "700 22px Arial" });
  drawText("Qty", width - 350, y, { font: "700 22px Arial", align: "center" });
  drawText("Price", width - 220, y, { font: "700 22px Arial", align: "right" });
  drawText("Total", right, y, { font: "700 22px Arial", align: "right" });

  y += 22;
  context.strokeStyle = "#e2e8f0";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(left, y);
  context.lineTo(right, y);
  context.stroke();

  items.forEach((item) => {
    y += 44;

    drawText(item.menu_items?.name ?? "Menu item", left, y, {
      font: "600 24px Arial",
    });
    drawText(String(item.quantity), width - 350, y, {
      font: "500 22px Arial",
      align: "center",
      color: "#334155",
    });
    drawText(formatCurrency(item.price), width - 220, y, {
      font: "500 22px Arial",
      align: "right",
      color: "#334155",
    });
    drawText(formatCurrency(item.quantity * item.price), right, y, {
      font: "600 22px Arial",
      align: "right",
    });

    y += 34;
    drawText(item.menu_items?.category ?? "Uncategorized", left, y, {
      font: "500 18px Arial",
      color: "#64748b",
    });

    y += 28;
    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(right, y);
    context.stroke();
  });

  y += 60;
  drawText("Subtotal", width - 240, y, {
    font: "500 24px Arial",
    align: "right",
    color: "#475569",
  });
  drawText(formatCurrency(order.total_amount), right, y, {
    font: "600 24px Arial",
    align: "right",
  });

  y += 42;
  drawText("Taxes & Service", width - 240, y, {
    font: "500 24px Arial",
    align: "right",
    color: "#475569",
  });
  drawText(formatCurrency(0), right, y, {
    font: "600 24px Arial",
    align: "right",
  });

  y += 58;
  context.strokeStyle = "#cbd5e1";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(width - 360, y - 26);
  context.lineTo(right, y - 26);
  context.stroke();

  drawText("Order Total", width - 240, y, {
    font: "700 32px Arial",
    align: "right",
  });
  drawText(formatCurrency(order.total_amount), right, y, {
    font: "700 32px Arial",
    align: "right",
  });

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = `bill-table-${String(table?.table_number ?? "00").padStart(2, "0")}-order-${orderReference}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const MenuPage = () => {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const { table, menuItems, billOrder, currentView, loading, error } = useMenu(tableId);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

    const requestId = pendingRequestId || crypto.randomUUID();

    try {
      setPlacingOrder(true);
      setPendingRequestId(requestId);
      const order = await ordersService.createOrder({
        tableId: table.id,
        items,
        clientRequestId: requestId,
      });

      clearCart();
      setPendingRequestId("");
      toast.success("Order placed successfully.");
      navigate(`/order-success/${order.id}`, {
        state: {
          restaurantOrderCode: order.restaurant_order_code,
          tableNumber: table.table_number,
          tableId: table.id,
          restaurantName: table.restaurants?.name ?? "",
          googleReviewUrl: table.restaurants?.google_review_url ?? "",
        },
      });
    } catch (err) {
      const message = err instanceof TypeError && err.message === "Load failed"
        ? "Network issue while sending the order. Retry once; duplicate protection is enabled."
        : (err.message || "Unable to place order.");
      toast.error(message);
    } finally {
      setPlacingOrder(false);
      setIsCartOpen(false);
      setIsConfirmOpen(false);
    }
  };

  const handleOpenConfirmation = () => {
    if (!items.length || !table?.id) {
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleLeaveReview = () => {
    try {
      const reviewUrl = normalizeExternalUrl(
        table?.restaurants?.google_review_url ?? "",
      );

      if (!reviewUrl) {
        return;
      }

      window.open(reviewUrl, "_blank", "noopener,noreferrer");
    } catch (reviewError) {
      toast.error(reviewError.message || "Unable to open the review page.");
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

  if (currentView === "bill" && billOrder) {
    return (
      <div className="menu-canvas min-h-screen px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="surface-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-300">
              Bill ready
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-white">
              Table {String(table?.table_number ?? "").padStart(2, "0")} bill
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This QR is currently showing the latest bill prepared by the restaurant
              team for this table.
            </p>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Order</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    #{billOrder.restaurant_order_code ?? billOrder.id.slice(0, 8)}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {formatDateTime(billOrder.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Order total</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {formatCurrency(billOrder.total_amount)}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {billOrder.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
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

              <div className="mt-6 space-y-3 border-t border-white/10 pt-4 text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(billOrder.total_amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxes & Service</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex items-center justify-between text-2xl font-black text-white">
                  <span>Total payable</span>
                  <span>{formatCurrency(billOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                className="w-full sm:w-auto"
                onClick={() => downloadBillPng({ order: billOrder, table })}
              >
                Download bill
              </Button>
              {table?.restaurants?.google_review_url ? (
                <Button
                  className="w-full sm:w-auto"
                  variant="secondary"
                  onClick={handleLeaveReview}
                >
                  Leave a Google review
                </Button>
              ) : null}
            </div>
          </div>
        </div>
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
                onPlaceOrder={handleOpenConfirmation}
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
              onPlaceOrder={handleOpenConfirmation}
              placingOrder={placingOrder}
            />
          </SheetModal>
        </>
      ) : null}

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050b18]/78 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0d1627] p-6 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
              Confirm order
            </p>
            <h3 className="mt-3 text-2xl font-extrabold text-white">
              Place this order now?
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              You are about to place {totalItems} item{totalItems === 1 ? "" : "s"} for
              {" "}Table {String(table?.table_number ?? "").padStart(2, "0")}.
            </p>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                <span>Table</span>
                <span>{String(table?.table_number ?? "").padStart(2, "0")}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xl font-black text-white">
                <span>Total</span>
                <span>{totalAmount.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 2,
                })}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsConfirmOpen(false)}
                disabled={placingOrder}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? "Placing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MenuPage;
