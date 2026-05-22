export const ORDER_STATUSES = ["pending", "preparing", "completed"];

export const ORDER_STATUS_META = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20",
  },
  preparing: {
    label: "Preparing",
    className: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20",
  },
};

export const DEFAULT_ORDER_FILTER = "all";

export const MENU_CATEGORY_OPTIONS = [
  "Starters",
  "Main Course",
  "Burgers",
  "Pizza",
  "Pasta",
  "Sides",
  "Desserts",
  "Drinks",
  "Beverages",
  "Combos",
];
