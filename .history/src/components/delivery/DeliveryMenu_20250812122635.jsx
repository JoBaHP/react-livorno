import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";
import MenuItem from "../../ordering-system/components/MenuItem"; // Reusing the existing MenuItem component
import { ChevronDown, Plus } from "lucide-react";

export default function DeliveryMenu({
  addToCart,
  onGoToCheckout,
  cartItemCount,
}) {
  const [menu, setMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState(null);
  const [customizingItem, setCustomizingItem] = useState(null);
  const api = useApi();

  const categoryOrder = ["Pizzas", "Pasta", "Salads", "Desserts", "Drinks"];
  const categories = [...new Set(menu.map((item) => item.category))].sort(
    (a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    }
  );

  useEffect(() => {
    api.getMenu().then((data) => {
      setMenu(data);
      setIsLoading(false);
    });
  }, [api]);

  const handleCategoryToggle = (category) => {
    setOpenCategory((prevOpenCategory) =>
      prevOpenCategory === category ? null : category
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-slate-800">
          Order for Delivery
        </h2>
        <p className="mt-2 text-lg text-slate-600">
          Freshly prepared and delivered to your door.
        </p>
      </div>
      {isLoading ? (
        <p>Loading menu...</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => handleCategoryToggle(category)}
                className="w-full flex justify-between items-center p-4 hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-2xl font-bold text-slate-700">
                  {category}
                </h3>
                <ChevronDown
                  className={`text-slate-500 transform transition-transform duration-300 ${
                    openCategory === category ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openCategory === category && (
                <div className="p-4 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menu
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <MenuItem
                          key={item.id}
                          item={item}
                          onCustomize={() => setCustomizingItem(item)}
                          onAddToCart={addToCart}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          onAddToCart={addToCart}
          onClose={() => setCustomizingItem(null)}
        />
      )}
      {cartItemCount > 0 && (
        <div className="sticky bottom-4 w-full flex justify-center">
          <button
            onClick={onGoToCheckout}
            className="bg-amber-500 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-amber-600 transition-transform transform hover:scale-105"
          >
            View Order & Checkout ({cartItemCount}{" "}
            {cartItemCount > 1 ? "items" : "item"})
          </button>
        </div>
      )}
    </div>
  );
}
