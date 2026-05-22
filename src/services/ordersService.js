import { assertSupabase } from "../lib/supabase";
import { buildOrderPayload } from "../utils/order";

const ORDER_SELECT = `
  id,
  table_id,
  status,
  total_amount,
  created_at,
  restaurant_tables!inner (
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
`;

export const ordersService = {
  async createOrder({ tableId, items }) {
    const supabase = assertSupabase();
    const orderPayload = buildOrderPayload({ tableId, items });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        table_id: orderPayload.table_id,
        status: orderPayload.status,
        total_amount: orderPayload.total_amount,
      })
      .select("id")
      .single();

    if (orderError) {
      throw orderError;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      orderPayload.order_items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
      })),
    );

    if (itemsError) {
      throw itemsError;
    }

    return order;
  },

  async getOrdersByRestaurant(
    restaurantId,
    { status = "all", startDate, endDate } = {},
  ) {
    const supabase = assertSupabase();
    let query = supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("restaurant_tables.restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("created_at", `${startDate}T00:00:00`);
    }

    if (endDate) {
      query = query.lt("created_at", `${endDate}T23:59:59.999`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  async updateStatus(orderId, status) {
    const supabase = assertSupabase();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      throw error;
    }
  },

  subscribeToOrders({ restaurantId, onChange }) {
    const supabase = assertSupabase();
    const channelName = `orders:restaurant:${restaurantId}:${crypto.randomUUID()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        onChange,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
        },
        onChange,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
