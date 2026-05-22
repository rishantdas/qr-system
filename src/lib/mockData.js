export const mockRestaurant = {
  id: "mock-restaurant-1",
  name: "Littlebox Bistro",
};

export const mockTables = [
  {
    id: "table-1",
    restaurant_id: mockRestaurant.id,
    table_number: 1,
  },
  {
    id: "table-2",
    restaurant_id: mockRestaurant.id,
    table_number: 2,
  },
];

export const mockMenuItems = [
  {
    id: "item-1",
    restaurant_id: mockRestaurant.id,
    name: "Truffle Fries",
    description: "Crisp fries, truffle oil, parmesan, and herb salt.",
    price: 249,
    image_url:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80",
    category: "Starters",
    is_available: true,
  },
  {
    id: "item-2",
    restaurant_id: mockRestaurant.id,
    name: "Smoky Paneer Bowl",
    description: "Charred paneer, cumin rice, greens, and mint yogurt.",
    price: 389,
    image_url:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    category: "Mains",
    is_available: true,
  },
  {
    id: "item-3",
    restaurant_id: mockRestaurant.id,
    name: "Margherita Flatbread",
    description: "Fresh mozzarella, basil, pomodoro, and olive oil.",
    price: 429,
    image_url:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    category: "Mains",
    is_available: true,
  },
  {
    id: "item-4",
    restaurant_id: mockRestaurant.id,
    name: "Cold Brew Tonic",
    description: "House cold brew finished with tonic and citrus.",
    price: 179,
    image_url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    category: "Beverages",
    is_available: true,
  },
];

export const mockOrders = [
  {
    id: "order-1001",
    table_id: "table-1",
    status: "pending",
    total_amount: 638,
    created_at: new Date().toISOString(),
    restaurant_tables: {
      id: "table-1",
      table_number: 1,
      restaurant_id: mockRestaurant.id,
    },
    order_items: [
      {
        id: "order-item-1",
        quantity: 1,
        price: 389,
        menu_items: {
          id: "item-2",
          name: "Smoky Paneer Bowl",
          category: "Mains",
          image_url: mockMenuItems[1].image_url,
        },
      },
      {
        id: "order-item-2",
        quantity: 1,
        price: 249,
        menu_items: {
          id: "item-1",
          name: "Truffle Fries",
          category: "Starters",
          image_url: mockMenuItems[0].image_url,
        },
      },
    ],
  },
];
