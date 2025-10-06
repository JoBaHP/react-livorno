export const PARENT_GROUPS = [
  { key: "food", labelKey: "category_parent.food", fallback: "Hrana" },
  { key: "drinks", labelKey: "category_parent.drinks", fallback: "Piće" },
];

export const CATEGORY_TO_PARENT = {
  // Food examples
  Pizzas: "food",
  Pasta: "food",
  Salads: "food",
  Desserts: "food",

  // Drinks examples
  Drinks: "drinks",
};

export function getParentForCategory(category) {
  return CATEGORY_TO_PARENT[category] || "food";
}
