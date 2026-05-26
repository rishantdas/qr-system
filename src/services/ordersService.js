import { assertSupabase } from "../lib/supabase";
import { buildOrderPayload } from "../utils/order";

const ORDER_SELECT = `
  id,
  restaurant_order_code,
  table_id,
  restaurant_id,
  status,
  total_amount,
  bill_ready,
  bill_paid,
  bill_generated_at,
  created_at,
  restaurant_tables:restaurant_tables!orders_table_id_fkey (
    id,
    table_number,
    restaurant_id,
    current_view,
    active_order_id
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
  async createOrder({ tableId, items, clientRequestId }) {
    const supabase = assertSupabase();
    const orderPayload = buildOrderPayload({ tableId, items });

    const { data, error } = await supabase
      .rpc("create_public_order", {
        p_table_id: orderPayload.table_id,
        p_items: orderPayload.order_items,
        p_client_request_id: clientRequestId,
      })
      .single();

    if (error) {
      throw error;
    }

    return data;
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

  async showBillOnTable({ orderId, tableId }) {
    const supabase = assertSupabase();

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        bill_ready: true,
        bill_paid: false,
        bill_generated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (orderError) {
      throw orderError;
    }

    const { error: tableError } = await supabase
      .from("restaurant_tables")
      .update({
        current_view: "bill",
        active_order_id: orderId,
      })
      .eq("id", tableId);

    if (tableError) {
      throw tableError;
    }
  },

  async closeBillOnTable({ orderId, tableId }) {
    const supabase = assertSupabase();

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        bill_paid: true,
      })
      .eq("id", orderId);

    if (orderError) {
      throw orderError;
    }

    const { error: tableError } = await supabase
      .from("restaurant_tables")
      .update({
        current_view: "menu",
        active_order_id: null,
      })
      .eq("id", tableId);

    if (tableError) {
      throw tableError;
    }
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

  async removeOrderItem({ orderId, orderItemId, totalAmount }) {
    const supabase = assertSupabase();

    const { error: itemError } = await supabase
      .from("order_items")
      .delete()
      .eq("id", orderItemId)
      .eq("order_id", orderId);

    if (itemError) {
      throw itemError;
    }

    const { error: orderError } = await supabase
      .from("orders")
      .update({ total_amount: totalAmount })
      .eq("id", orderId);

    if (orderError) {
      throw orderError;
    }
  },

  async deleteOrder({ orderId, tableId, resetTableBill }) {
    const supabase = assertSupabase();

    if (resetTableBill) {
      const { error: tableError } = await supabase
        .from("restaurant_tables")
        .update({
          current_view: "menu",
          active_order_id: null,
        })
        .eq("id", tableId);

      if (tableError) {
        throw tableError;
      }
    }

    const { error } = await supabase
      .from("orders")
      .delete()
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
