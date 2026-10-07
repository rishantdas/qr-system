import { assertSupabase } from "../lib/supabase";

export const menuService = {
  async getTable(tableId, restaurantId) {
    const supabase = assertSupabase();
    let query = supabase
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
      .eq("id", tableId);

    if (restaurantId) {
      query = query.eq("restaurant_id", restaurantId);
    }

    const { data, error } = await query.single();

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
              category
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
        "id, restaurant_id, name, description, price, category, is_available",
      )
      .eq("restaurant_id", restaurantId)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  async getCategoriesByRestaurant(restaurantId) {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("restaurant_menu_categories")
      .select("name")
      .eq("restaurant_id", restaurantId)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((category) => category.name);
  },

  async createMenuCategory({ restaurantId, name }) {
    const supabase = assertSupabase();
    const normalizedName = name.trim();

    if (!normalizedName || normalizedName.length > 50) {
      throw new Error("Enter a category name of 1 to 50 characters.");
    }

    const { data, error } = await supabase
      .from("restaurant_menu_categories")
      .insert({
        restaurant_id: restaurantId,
        name: normalizedName,
      })
      .select("name")
      .single();

    if (error?.code === "23505") {
      throw new Error("This category already exists for this restaurant.");
    }

    if (error) {
      throw error;
    }

    return data.name;
  },

  async createMenuItem({
    restaurantId,
    name,
    description,
    price,
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
        category: category.trim(),
        is_available: isAvailable,
      })
      .select(
        "id, restaurant_id, name, description, price, category, is_available",
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
        "id, restaurant_id, name, description, price, category, is_available",
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

  async deleteMenuItem({ itemId, restaurantId }) {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId)
      .eq("restaurant_id", restaurantId)
      .select("id");

    if (error?.code === "23503") {
      throw new Error(
        "This item appears in past orders and can't be deleted. Mark it unavailable to remove it from the menu.",
      );
    }

    if (error) {
      throw error;
    }

    if (!data?.length) {
      throw new Error("Menu item not found for this restaurant.");
    }
  },
};
