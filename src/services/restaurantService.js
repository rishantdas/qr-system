import { assertSupabase } from "../lib/supabase";

export const restaurantService = {
  async getAdminRestaurant() {
    const supabase = assertSupabase();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    const { data, error } = await supabase
      .from("restaurant_admins")
      .select("restaurant_id, restaurants(id, name)")
      .eq("user_id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getRestaurantTableByNumber({ restaurantId, tableNumber }) {
    const supabase = assertSupabase();
    const normalizedTableNumber = Number(tableNumber);

    if (!Number.isInteger(normalizedTableNumber) || normalizedTableNumber <= 0) {
      throw new Error("Enter a valid table number.");
    }

    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("id, table_number, restaurant_id")
      .eq("restaurant_id", restaurantId)
      .eq("table_number", normalizedTableNumber)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
