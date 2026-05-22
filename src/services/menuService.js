import { assertSupabase } from "../lib/supabase";

export const menuService = {
  async getTable(tableId) {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("id, table_number, restaurant_id")
      .eq("id", tableId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getMenuByRestaurant(restaurantId) {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("menu_items")
      .select(
        "id, restaurant_id, name, description, price, image_url, category, is_available",
      )
      .eq("restaurant_id", restaurantId)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  async createMenuItem({
    restaurantId,
    name,
    description,
    price,
    imageUrl,
    category,
    isAvailable,
  }) {
    const supabase = assertSupabase();
    const normalizedPrice = Number(price);

    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      throw new Error("Enter a valid price.");
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        restaurant_id: restaurantId,
        name: name.trim(),
        description: description.trim(),
        price: normalizedPrice,
        image_url: imageUrl.trim() || null,
        category: category.trim(),
        is_available: isAvailable,
      })
      .select(
        "id, restaurant_id, name, description, price, image_url, category, is_available",
      )
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
