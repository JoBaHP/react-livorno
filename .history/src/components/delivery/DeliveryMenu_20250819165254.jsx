import React, { useState, useEffect, useRef } from "react";
import { useApi } from "../../ApiProvider";
import MenuItem from "../MenuItem";
import { ChevronDown, ShoppingCart, Plus, Minus } from "lucide-react";

export default function DeliveryMenu({
  cart = [],
  addToCart,
  onGoToCheckout,
  updateQuantity,
  updateCartForItem,
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

  const getQuantityInCart = (menuItemId) => {
    return cart
      .filter((item) => item.id === menuItemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="headtext__cormorant">Order for Delivery</h1>
        <p
          className="p__opensans"
          style={{ color: "var(--color-grey)", marginTop: "1rem" }}
        >
          Freshly prepared and delivered to your door.
        </p>
      </div>
      {isLoading ? (
        <p className="p__opensans text-center">Loading menu...</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-black border border-golden rounded-lg overflow-hidden"
            >
              <button
                onClick={() => handleCategoryToggle(category)}
                className="w-full flex justify-between items-center p-4"
              >
                <h3
                  className="p__cormorant"
                  style={{ color: "var(--color-golden)" }}
                >
                  {category}
                </h3>
                <ChevronDown
                  className={`transition-transform duration-300 ${
                    openCategory === category ? "rotate-180" : ""
                  }`}
                  style={{ color: "var(--color-golden)" }}
                />
              </button>
              {openCategory === category && (
                <div className="p-4 border-t border-golden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menu
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <MenuItem
                          key={item.id}
                          item={item}
                          onCustomize={() => setCustomizingItem(item)}
                          onAddToCart={addToCart}
                          updateQuantity={updateQuantity}
                          quantityInCart={getQuantityInCart(item.id)}
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
          cart={cart}
          onUpdateCart={updateCartForItem}
          onClose={() => setCustomizingItem(null)}
        />
      )}
      {cartItemCount > 0 && (
        <div className="sticky bottom-4 w-full flex justify-center">
          <button
            onClick={onGoToCheckout}
            className="custom__button flex items-center gap-3"
          >
            <ShoppingCart />
            View Order ({cartItemCount} {cartItemCount > 1 ? "items" : "item"})
          </button>
        </div>
      )}
    </div>
  );
}

function CustomizationModal({ item, cart, onUpdateCart, onClose }) {
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const modalRef = useRef();

  // Sync modal state with the main cart when it opens
  useEffect(() => {
    const initialQuantities = {};
    const cartItems = cart.filter((cartItem) => cartItem.id === item.id);

    if (cartItems.length > 0) {
      // Assume all instances of an item share the same options
      setSelectedOptions(cartItems[0].selectedOptions || []);

      cartItems.forEach((cartItem) => {
        if (cartItem.size) {
          initialQuantities[cartItem.size] =
            (initialQuantities[cartItem.size] || 0) + cartItem.quantity;
        }
      });
    }
    setSelectedQuantities(initialQuantities);
  }, [item, cart]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleQuantityChange = (sizeName, amount) => {
    setSelectedQuantities((prev) => {
      const newQuantity = (prev[sizeName] || 0) + amount;
      return { ...prev, [sizeName]: Math.max(0, newQuantity) };
    });
  };

  const handleOptionToggle = (option) => {
    setSelectedOptions((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleUpdateAndClose = () => {
    onUpdateCart(item, selectedQuantities, selectedOptions);
    onClose();
  };

  // Corrected price calculation
  const optionsPrice = selectedOptions.reduce(
    (sum, opt) => sum + parseFloat(opt.price || 0),
    0
  );
  let currentPrice = 0;
  Object.entries(selectedQuantities).forEach(([sizeName, quantity]) => {
    if (quantity > 0) {
      const size = item.sizes.find((s) => s.name === sizeName);
      const itemBasePrice = parseFloat(size.price);
      currentPrice += (itemBasePrice + optionsPrice) * quantity;
    }
  });

  const paidOptions =
    item?.options?.filter((o) => parseFloat(o.price) > 0) || [];
  const freeOptions =
    item?.options?.filter((o) => parseFloat(o.price) === 0) || [];

  return (
    <div
      onClick={handleOutsideClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
    >
      <div
        ref={modalRef}
        className="bg-black border border-golden rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto"
      >
        <h2 className="headtext__cormorant mb-2">{item.name}</h2>
        <p className="p__opensans mb-4" style={{ color: "var(--color-grey)" }}>
          {item.description}
        </p>

        {item.sizes && (
          <div className="mb-4">
            <h3 className="p__cormorant mb-2">Size</h3>
            <div className="space-y-2">
              {item.sizes.map((size) => (
                <div
                  key={size.name}
                  className="flex justify-between items-center"
                >
                  <span className="p__opensans">
                    {size.name} - ${parseFloat(size.price).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(size.name, -1)}
                      className="custom__button !p-0 h-8 w-8 flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="p__cormorant text-lg w-8 text-center">
                      {selectedQuantities[size.name] || 0}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(size.name, 1)}
                      className="custom__button !p-0 h-8 w-8 flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {paidOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="p__cormorant mb-2">Extras</h3>
            <div className="grid grid-cols-2 gap-2">
              {paidOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer p__opensans"
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.some((o) => o.id === opt.id)}
                    onChange={() => handleOptionToggle(opt)}
                    className="h-4 w-4 rounded border-gray-300 text-golden-500 focus:ring-golden-500"
                  />
                  {opt.name} (+${parseFloat(opt.price).toFixed(2)})
                </label>
              ))}
            </div>
          </div>
        )}
        {freeOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="p__cormorant mb-2">Add-ons (Free)</h3>
            <div className="grid grid-cols-2 gap-2">
              {freeOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer p__opensans"
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.some((o) => o.id === opt.id)}
                    onChange={() => handleOptionToggle(opt)}
                    className="h-4 w-4 rounded border-gray-300 text-golden-500 focus:ring-golden-500"
                  />
                  {opt.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-golden">
          <span className="text-2xl font-bold text-white">
            ${currentPrice.toFixed(2)}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="custom__button bg-gray-800 text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateAndClose}
              className="custom__button flex items-center gap-2"
            >
              <Plus size={18} />
              Update Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
