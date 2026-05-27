import { assertSupabase } from "../lib/supabase";

export const menuService = {
  async getTable(tableId) {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select(`
        id,
        table_number,
        restaurant_id,
        current_view,
        active_order_id,
        restaurants (
          id,
          name,
          google_review_url
        )
      `)
      .eq("id", tableId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getPublicBill(orderId) {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
          id,
          restaurant_order_code,
          table_id,
          status,
          total_amount,
          bill_ready,
          bill_paid,
          bill_generated_at,
          created_at,
          restaurant_tables:restaurant_tables!orders_table_id_fkey (
            id,
            table_number,
            restaurant_id
          ),
          order_items (
            id,
            quantity,
            price,
            menu_items (
              id,
              name,
              category,
              image_url
            )
          )
        `,
      )
      .eq("id", orderId)
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

  async updateMenuItem({ itemId, name, category, price }) {
    const supabase = assertSupabase();
    const normalizedPrice = Number(price);

    if (!name.trim()) {
      throw new Error("Enter a menu item title.");
    }

    if (!category.trim()) {
      throw new Error("Select a category.");
    }

    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      throw new Error("Enter a valid price.");
    }

    const { data, error } = await supabase
      .from("menu_items")
      .update({
        name: name.trim(),
        category: category.trim(),
        price: normalizedPrice,
      })
      .eq("id", itemId)
      .select(
        "id, restaurant_id, name, description, price, image_url, category, is_available",
      )
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async updateMenuItemAvailability({ itemId, isAvailable }) {
    const supabase = assertSupabase();
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: isAvailable })
      .eq("id", itemId);

    if (error) {
      throw error;
    }
  },
};
