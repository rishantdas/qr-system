import { useEffect, useState } from "react";
import { menuService } from "../services/menuService";
import { useCartStore } from "../store/cartStore";

export const useMenu = (tableId) => {
  const setTable = useCartStore((state) => state.setTable);
  const [table, setTableData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [billOrder, setBillOrder] = useState(null);
  const [currentView, setCurrentView] = useState("menu");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadMenu = async () => {
      try {
        setLoading(true);
        setError("");
        setBillOrder(null);

        const tableData = await menuService.getTable(tableId);

        if (!mounted) {
          return;
        }

        setTable(tableData.id);
        setTableData(tableData);

        if (tableData.current_view === "bill" && tableData.active_order_id) {
          const bill = await menuService.getPublicBill(tableData.active_order_id);

          if (!mounted) {
            return;
          }

          setCurrentView("bill");
          setBillOrder(bill);
          setMenuItems([]);
          return;
        }

        const items = await menuService.getMenuByRestaurant(
          tableData.restaurant_id,
        );

        if (!mounted) {
          return;
        }

        setCurrentView("menu");
        setMenuItems(items.filter((item) => item.is_available));
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load the menu.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMenu();

    return () => {
      mounted = false;
    };
  }, [setTable, tableId]);

  return {
    table,
    menuItems,
    billOrder,
    currentView,
    loading,
    error,
  };
};
