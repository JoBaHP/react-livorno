import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../ApiProvider";
import MenuItem from "../MenuItem";
import { ChevronDown, ShoppingCart, Plus, Minus } from "lucide-react";
import { formatCurrency } from "../../utils/format";

export default function DeliveryMenu({
  cart = [],
  addToCart,
  onGoToCheckout,
  updateQuantity,
  updateCartForItem,
}) {
  const { t } = useTranslation();
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
        <h1 className="headtext__cormorant">{t("order_for_delivery")}</h1>
        <p className="p__opensans" style={{ color: "var(--color-grey)", marginTop: "1rem" }}>
          {t("delivery_description")}
        </p>
      </div>
      {isLoading ? (
        <p className="p__opensans text-center">{t("loading_menu")}</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="bg-black border border-golden rounded-lg overflow-hidden">
              <button onClick={() => handleCategoryToggle(category)} className="w-full flex justify-between items-center p-4">
                <h3 className="p__cormorant" style={{ color: "var(--color-golden)" }}>
                  {category}
                </h3>
                <ChevronDown
                  className={`transition-transform duration-300 ${openCategory === category ? "rotate-180" : ""}`}
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
          <button onClick={onGoToCheckout} className="custom__button flex items-center gap-3">
            <ShoppingCart />
            {t("view_order")} ({cartItemCount} {cartItemCount > 1 ? t("items") : t("item")})
          </button>
        </div>
      )}
    </div>
  );
}

function CustomizationModal({ item, cart, onUpdateCart, onClose }) {
  const { t, i18n } = useTranslation();
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOptionQuantities, setSelectedOptionQuantities] = useState({});
  const modalRef = useRef();

  useEffect(() => {
    const initialQuantities = {};
    const initialOptionQuantities = {};
    const cartItems = cart.filter((cartItem) => cartItem.id === item.id);

    if (cartItems.length > 0) {
      setSelectedOptions(cartItems[0].selectedOptions || []);
      cartItems.forEach((cartItem) => {
        if (cartItem.size) {
          initialQuantities[cartItem.size] = (initialQuantities[cartItem.size] || 0) + cartItem.quantity;
        }
        cartItem.selectedOptions?.forEach((opt) => {
          if (opt.quantity) {
            initialOptionQuantities[opt.id] = (initialOptionQuantities[opt.id] || 0) + opt.quantity;
          }
        });
      });
    }
    setSelectedQuantities(initialQuantities);
    setSelectedOptionQuantities(initialOptionQuantities);
  }, [item, cart]);

  const handleQuantityChange = (sizeName, amount) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [sizeName]: Math.max(0, (prev[sizeName] || 0) + amount),
    }));
  };

  const handleOptionQuantityChange = (optionId, amount) => {
    setSelectedOptionQuantities((prev) => {
      const newQuantity = (prev[optionId] || 0) + amount;
      const newQuantities = { ...prev, [optionId]: Math.max(0, newQuantity) };

      const option = item.options.find((o) => o.id === optionId);
      if (parseFloat(option.price) > 0) {
        if (newQuantity > 0 && !selectedOptions.some((o) => o.id === optionId)) {
          setSelectedOptions([...selectedOptions, option]);
        } else if (newQuantity === 0) {
          setSelectedOptions(selectedOptions.filter((o) => o.id !== optionId));
        }
      }

      return newQuantities;
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
    const optionsWithQuantities = selectedOptions.map((opt) => {
      const isPaid = parseFloat(opt.price) > 0;
      return {
        ...opt,
        quantity: isPaid ? selectedOptionQuantities[opt.id] || 0 : 1,
      };
    });
    onUpdateCart(item, selectedQuantities, optionsWithQuantities);
    onClose();
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  let currentPrice = 0;
  const optionsPrice = selectedOptions.reduce((sum, opt) => {
    const isPaid = parseFloat(opt.price) > 0;
    const quantity = isPaid ? selectedOptionQuantities[opt.id] || 0 : 1;
    return sum + parseFloat(opt.price || 0) * quantity;
  }, 0);

  Object.entries(selectedQuantities).forEach(([sizeName, quantity]) => {
    if (quantity > 0) {
      const size = item.sizes.find((s) => s.name === sizeName);
      const itemBasePrice = parseFloat(size.price);
      currentPrice += itemBasePrice * quantity;
    }
  });
  currentPrice += optionsPrice;

  const paidOptions = item?.options?.filter((o) => parseFloat(o.price) > 0) || [];
  const freeOptions = item?.options?.filter((o) => !o.price || parseFloat(o.price) === 0) || [];

  return (
    <div onClick={handleOutsideClick} className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div ref={modalRef} className="bg-black border border-golden rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
        <h2 className="headtext__cormorant mb-2">{item.name}</h2>
        <p className="p__opensans mb-4" style={{ color: "var(--color-grey)" }}>{item.description}</p>

        {item.sizes && (
          <div className="mb-4">
            <h3 className="p__cormorant mb-2">{t("customization_modal.size")}</h3>
            <div className="space-y-2">
              {item.sizes.map((size) => (
                <div key={size.name} className="flex justify-between items-center">
                  <span className="p__opensans">
                    {size.name} - {formatCurrency(parseFloat(size.price), i18n.language)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleQuantityChange(size.name, -1)} className="custom__button !p-0 h-8 w-8 flex items-center justify-center">
                      <Minus size={14} />
                    </button>
                    <span className="p__cormorant text-lg w-8 text-center">{selectedQuantities[size.name] || 0}</span>
                    <button onClick={() => handleQuantityChange(size.name, 1)} className="custom__button !p-0 h-8 w-8 flex items-center justify-center">
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
            <h3 className="p__cormorant mb-2">{t("customization_modal.extras")}</h3>
            <div className="space-y-2">
              {paidOptions.map((opt) => (
                <div key={opt.id} className="flex justify-between items-center">
                  <span className="p__opensans">
                    {opt.name} (+{formatCurrency(parseFloat(opt.price), i18n.language)})
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOptionQuantityChange(opt.id, -1)} className="custom__button !p-0 h-8 w-8 flex items-center justify-center">
                      <Minus size={14} />
                    </button>
                    <span className="p__cormorant text-lg w-8 text-center">{selectedOptionQuantities[opt.id] || 0}</span>
                    <button onClick={() => handleOptionQuantityChange(opt.id, 1)} className="custom__button !p-0 h-8 w-8 flex items-center justify-center">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {freeOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="p__cormorant mb-2">{t("customization_modal.addons_free")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {freeOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer p__opensans">
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
          <span className="text-2xl font-bold text-white">{formatCurrency(currentPrice, i18n.language)}</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="custom__button bg-gray-800 text-white">
              {t("customization_modal.cancel")}
            </button>
            <button onClick={handleUpdateAndClose} className="custom__button flex items-center gap-2">
              <Plus size={18} />
              {t("customization_modal.update_order")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
