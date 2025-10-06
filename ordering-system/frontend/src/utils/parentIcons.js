import {
  Utensils,
  CupSoda,
  Coffee,
  Fish,
  Beef,
  IceCream,
  Salad,
  Sandwich,
} from "lucide-react";

const ICONS = {
  food: Utensils,
  drinks: CupSoda,
  coffee: Coffee,
  seafood: Fish,
  grill: Beef,
  desserts: IceCream,
  salads: Salad,
  snacks: Sandwich,
};

export function getParentIcon(parentKey) {
  const key = String(parentKey || "").toLowerCase();
  return ICONS[key] || Utensils;
}

export default getParentIcon;
