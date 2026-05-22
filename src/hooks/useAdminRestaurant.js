import { useEffect, useState } from "react";
import { restaurantService } from "../services/restaurantService";

export const useAdminRestaurant = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadRestaurant = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await restaurantService.getAdminRestaurant();

        if (!mounted) {
          return;
        }

        setRestaurant(data?.restaurants ?? null);
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError.message ||
              "Unable to determine which restaurant this admin belongs to.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRestaurant();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    restaurant,
    loading,
    error,
  };
};
