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
];
let users = [
  { id: 1, username: "admin", role: "admin", password: "adminpassword" },
  { id: 2, username: "waiter1", role: "waiter", password: "waiterpassword" },
];
let orders = [];

module.exports = { menu, tables, users, orders };
