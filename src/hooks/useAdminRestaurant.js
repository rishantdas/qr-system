import { useCallback, useEffect, useState } from "react";
import { restaurantService } from "../services/restaurantService";

export const useAdminRestaurant = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRestaurant = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await restaurantService.getAdminRestaurant();
      setRestaurant(data?.restaurants ?? null);
    } catch (loadError) {
      setError(
        loadError.message ||
          "Unable to determine which restaurant this admin belongs to.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  return {
    restaurant,
    loading,
    error,
    setRestaurant,
    refreshRestaurant: loadRestaurant,
  };
};
