import { create } from "zustand";
import { calculateCartTotal } from "../utils/order";

export const useCartStore = create((set, get) => ({
  tableId: null,
  items: [],
  setTable(tableId) {
    const currentTableId = get().tableId;

    if (currentTableId && currentTableId !== tableId) {
      set({ tableId, items: [] });
      return;
    }

    set({ tableId });
  },
  addItem(menuItem) {
    const items = get().items;
    const existingItem = items.find((item) => item.id === menuItem.id);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      });
      return;
    }

    set({
      items: [...items, { ...menuItem, quantity: 1 }],
    });
  },
  decrementItem(menuItemId) {
    const items = get().items;
    const target = items.find((item) => item.id === menuItemId);

    if (!target) {
      return;
    }

    if (target.quantity === 1) {
      set({
        items: items.filter((item) => item.id !== menuItemId),
      });
      return;
    }

    set({
      items: items.map((item) =>
        item.id === menuItemId
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    });
  },
  removeItem(menuItemId) {
    set({
      items: get().items.filter((item) => item.id !== menuItemId),
    });
  },
  clearCart() {
    set({ items: [] });
  },
  totalItems() {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
  totalAmount() {
    return calculateCartTotal(get().items);
  },
}));
