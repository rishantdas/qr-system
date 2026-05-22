export const calculateCartTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const buildOrderPayload = ({ tableId, items }) => ({
  table_id: tableId,
  status: "pending",
  total_amount: calculateCartTotal(items),
  order_items: items.map((item) => ({
    menu_item_id: item.id,
    quantity: item.quantity,
    price: item.price,
  })),
});
