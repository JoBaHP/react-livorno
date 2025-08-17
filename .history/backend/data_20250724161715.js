// Helper dates for realistic sample data
const now = new Date();

const today = new Date(now);
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);

const lastWeekDate = new Date(now);
lastWeekDate.setDate(now.getDate() - 7);

const thisMonthDate = new Date(now);
thisMonthDate.setDate(now.getDate() - 15); // A date within the current month

const lastMonthDate = new Date(now);
lastMonthDate.setMonth(now.getMonth() - 1);

const thisYearDate = new Date(now);
thisYearDate.setMonth(now.getMonth() - 3); // A date within the current year

const lastYearDate = new Date(now);
lastYearDate.setFullYear(now.getFullYear() - 1);

let menu = [
  {
    id: 1,
    name: "Margherita Pizza",
    category: "Pizzas",
    description: "Classic cheese and tomato",
    available: true,
    sizes: [
      { name: "Medium", price: 12.5 },
      { name: "Large", price: 15.0 },
    ],
  },
  {
    id: 2,
    name: "Pepperoni Pizza",
    category: "Pizzas",
    description: "Spicy pepperoni slices",
    available: true,
    sizes: [
      { name: "Medium", price: 14.0 },
      { name: "Large", price: 16.5 },
    ],
  },
  {
    id: 3,
    name: "Carbonara",
    category: "Pasta",
    price: 11.0,
    description: "Creamy sauce with bacon",
    available: true,
  },
  {
    id: 4,
    name: "Spaghetti Bolognese",
    category: "Pasta",
    price: 10.5,
    description: "Rich meat sauce",
    available: false,
  },
  {
    id: 5,
    name: "Caesar Salad",
    category: "Salads",
    price: 9.0,
    description: "Fresh lettuce with Caesar dressing",
    available: true,
  },
  {
    id: 6,
    name: "Tiramisu",
    category: "Desserts",
    price: 6.5,
    description: "Coffee-flavoured Italian dessert",
    available: true,
  },
  {
    id: 7,
    name: "Coca-Cola",
    category: "Drinks",
    price: 2.5,
    description: "330ml can",
    available: true,
  },
  {
    id: 8,
    name: "Still Water",
    category: "Drinks",
    price: 2.0,
    description: "500ml bottle",
    available: true,
  },
];
let tables = [
  { id: 1, number: 1 },
  { id: 2, number: 2 },
  { id: 3, number: 3 },
  { id: 4, number: 4 },
  { id: 5, number: 5 },
  { id: 6, number: 6 },
  { id: 7, number: 7 },
  { id: 8, number: 8 },
  { id: 9, number: 9 },
  { id: 10, number: 10 },
  { id: 11, number: 11 },
  { id: 12, number: 12 },
  { id: 13, number: 13 },
  { id: 14, number: 14 },
  { id: 15, number: 15 },
  { id: 16, number: 16 },
  { id: 17, number: 17 },
  { id: 18, number: 18 },
  { id: 19, number: 19 },
  { id: 20, number: 20 },
];
let users = [
  { id: 1, username: "admin", role: "admin", password: "adminpassword" },
  { id: 2, username: "waiter1", role: "waiter", password: "waiterpassword" },
];

// --- EXPANDED SEEDED ORDER DATA ---
let orders = [
  // --- Today's Orders ---
  {
    id: 1001,
    tableId: 1,
    items: [
      {
        id: 1,
        cartId: "1-M",
        name: "Margherita Pizza",
        quantity: 1,
        price: 12.5,
      },
    ],
    status: "pending",
    total: 12.5,
    createdAt: today.toISOString(),
    waitTime: null,
  },
  {
    id: 1002,
    tableId: 2,
    items: [{ id: 7, cartId: "7", name: "Coca-Cola", quantity: 2, price: 2.5 }],
    status: "accepted",
    total: 5.0,
    createdAt: today.toISOString(),
    waitTime: 10,
  },
  {
    id: 1003,
    tableId: 3,
    items: [
      { id: 5, cartId: "5", name: "Caesar Salad", quantity: 1, price: 9.0 },
    ],
    status: "preparing",
    total: 9.0,
    createdAt: today.toISOString(),
    waitTime: 15,
  },
  {
    id: 1004,
    tableId: 4,
    items: [{ id: 6, cartId: "6", name: "Tiramisu", quantity: 1, price: 6.5 }],
    status: "completed",
    total: 6.5,
    createdAt: today.toISOString(),
    waitTime: 10,
  },

  // --- Yesterday's Orders ---
  {
    id: 1005,
    tableId: 5,
    items: [
      { id: 3, cartId: "3", name: "Carbonara", quantity: 2, price: 11.0 },
    ],
    status: "completed",
    total: 22.0,
    createdAt: yesterday.toISOString(),
    waitTime: 20,
  },
  {
    id: 1006,
    tableId: 1,
    items: [
      { id: 8, cartId: "8", name: "Still Water", quantity: 3, price: 2.0 },
    ],
    status: "completed",
    total: 6.0,
    createdAt: yesterday.toISOString(),
    waitTime: 5,
  },

  // --- Last Week's Orders ---
  {
    id: 1007,
    tableId: 2,
    items: [
      {
        id: 2,
        cartId: "2-L",
        name: "Pepperoni Pizza",
        size: "Large",
        quantity: 1,
        price: 16.5,
      },
    ],
    status: "completed",
    total: 16.5,
    createdAt: lastWeekDate.toISOString(),
    waitTime: 15,
  },
  {
    id: 1008,
    tableId: 3,
    items: [
      {
        id: 4,
        cartId: "4",
        name: "Spaghetti Bolognese",
        quantity: 1,
        price: 10.5,
      },
    ],
    status: "completed",
    total: 10.5,
    createdAt: lastWeekDate.toISOString(),
    waitTime: 15,
  },

  // --- This Month's Orders ---
  {
    id: 1009,
    tableId: 4,
    items: [
      {
        id: 1,
        cartId: "1-L",
        name: "Margherita Pizza",
        size: "Large",
        quantity: 1,
        price: 15.0,
      },
    ],
    status: "completed",
    total: 15.0,
    createdAt: thisMonthDate.toISOString(),
    waitTime: 15,
  },
  {
    id: 1010,
    tableId: 5,
    items: [
      { id: 3, cartId: "3", name: "Carbonara", quantity: 1, price: 11.0 },
    ],
    status: "completed",
    total: 11.0,
    createdAt: thisMonthDate.toISOString(),
    waitTime: 20,
  },

  // --- Last Month's Orders ---
  {
    id: 1011,
    tableId: 1,
    items: [
      { id: 5, cartId: "5", name: "Caesar Salad", quantity: 2, price: 9.0 },
    ],
    status: "completed",
    total: 18.0,
    createdAt: lastMonthDate.toISOString(),
    waitTime: 10,
  },
  {
    id: 1012,
    tableId: 2,
    items: [{ id: 7, cartId: "7", name: "Coca-Cola", quantity: 4, price: 2.5 }],
    status: "completed",
    total: 10.0,
    createdAt: lastMonthDate.toISOString(),
    waitTime: 5,
  },

  // --- This Year's Orders ---
  {
    id: 1013,
    tableId: 3,
    items: [
      {
        id: 2,
        cartId: "2-M",
        name: "Pepperoni Pizza",
        size: "Medium",
        quantity: 1,
        price: 14.0,
      },
    ],
    status: "completed",
    total: 14.0,
    createdAt: thisYearDate.toISOString(),
    waitTime: 15,
  },
  {
    id: 1014,
    tableId: 4,
    items: [{ id: 6, cartId: "6", name: "Tiramisu", quantity: 3, price: 6.5 }],
    status: "completed",
    total: 19.5,
    createdAt: thisYearDate.toISOString(),
    waitTime: 10,
  },

  // --- Last Year's Orders ---
  {
    id: 1015,
    tableId: 5,
    items: [
      {
        id: 1,
        cartId: "1-L",
        name: "Margherita Pizza",
        size: "Large",
        quantity: 2,
        price: 15.0,
      },
    ],
    status: "completed",
    total: 30.0,
    createdAt: lastYearDate.toISOString(),
    waitTime: 15,
  },
];

module.exports = { menu, tables, users, orders };
