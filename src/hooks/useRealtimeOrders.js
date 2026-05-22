import { useEffect, useState } from "react";
import { ordersService } from "../services/ordersService";

export const useRealtimeOrders = ({
  restaurantId,
  statusFilter,
  startDate,
  endDate,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!restaurantId) {
      return undefined;
    }

    let mounted = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await ordersService.getOrdersByRestaurant(restaurantId, {
          status: statusFilter,
          startDate,
          endDate,
        });

        if (mounted) {
          setOrders(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load orders.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    const unsubscribe = ordersService.subscribeToOrders({
      restaurantId,
      onChange: () => {
        loadOrders();
      },
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [endDate, restaurantId, startDate, statusFilter]);

  return {
    orders,
    loading,
    error,
    refreshOrders: async () => {
      if (!restaurantId) {
        return;
      }

      const data = await ordersService.getOrdersByRestaurant(restaurantId, {
        status: statusFilter,
        startDate,
        endDate,
      });
      setOrders(data);
    },
  };
};
