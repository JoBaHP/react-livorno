import React, { useState, useEffect } from "react";
import { useApi } from "../ApiProvider";
import MenuItem from "../components/MenuItem";
import CartView from "../components/CartView";
import OrderStatusDisplay from "../components/OrderStatusDisplay";
import { ChevronDown, Plus } from "lucide-react";
import { playNotificationSound } from "../audio";

export default function CustomerView({ tableId }) {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
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

  useEffect(() => {
    if (!orderStatus?.id) return;
    const onStatusUpdate = (updatedOrder) => {
      if (updatedOrder.id === orderStatus.id) setOrderStatus(updatedOrder);
    };
    api.socket.on("order_status_update", onStatusUpdate);
    return () => api.socket.off("order_status_update", onStatusUpdate);
  }, [orderStatus, api.socket]);

  const addToCart = (item, size, selectedOptions) => {
    if (!item.available) return;

    const optionsId = selectedOptions
      .map((o) => o.id)
      .sort()
      .join("-");
    const cartId = `${item.id}-${size?.name || "std"}-${optionsId}`;

    const existingItem = cart.find((ci) => ci.cartId === cartId);
    if (existingItem) {
      setCart(
        cart.map((ci) =>
          ci.cartId === cartId ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      const newItem = {
        ...item,
        cartId,
        quantity: 1,
        price: size ? size.price : item.price,
        size: size ? size.name : null,
        selectedOptions,
      };
      setCart([...cart, newItem]);
    }
    setCustomizingItem(null);
  };

  const updateQuantity = (cartId, amount) => {
    const updatedCart = cart.map((item) =>
      item.cartId === cartId
        ? { ...item, quantity: Math.max(0, item.quantity + amount) }
        : item
    );
    setCart(updatedCart.filter((item) => item.quantity > 0));
  };

  const placeOrder = async (notes, paymentMethod) => {
    if (cart.length === 0 || !tableId) return;
    playNotificationSound();
    setIsLoading(true);
    const newOrder = await api.placeOrder(cart, tableId, notes, paymentMethod);
    setOrderStatus(newOrder);
    setCart([]);
    setIsLoading(false);
  };

  const handleCategoryToggle = (category) => {
    setOpenCategory((prevOpenCategory) =>
      prevOpenCategory === category ? null : category
    );
  };

  if (!tableId)
    return (
      <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          No Table Selected
        </h2>
        <p className="text-slate-600">
          Please scan a QR code on your table to start ordering.
        </p>
        <p className="text-slate-500 text-sm mt-4">
          To simulate, add `?table=1` to the URL.
        </p>
      </div>
    );
  if (orderStatus)
    return (
      <OrderStatusDisplay order={orderStatus} setOrderStatus={setOrderStatus} />
    );

  let total = 0;
  cart.forEach((item) => {
    let itemTotal = parseFloat(item.price || 0);
    if (item.selectedOptions) {
      item.selectedOptions.forEach((opt) => {
        itemTotal += parseFloat(opt.price || 0);
      });
    }
    total += itemTotal * item.quantity;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <div className="text-center lg:text-left">
          <h2 className="text-4xl font-extrabold text-slate-800">Our Menu</h2>
          <p className="mt-2 text-lg text-slate-600">
            Enjoy your meal at Table {tableId}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <CartView
            cart={cart}
            updateQuantity={updateQuantity}
            total={total}
            placeOrder={placeOrder}
            isLoading={isLoading}
          />
        </div>
      </div>
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          onAddToCart={addToCart}
          onClose={() => setCustomizingItem(null)}
        />
      )}
    </div>
  );
}

function CustomizationModal({ item, onAddToCart, onClose }) {
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] || null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionToggle = (option) => {
    setSelectedOptions((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleAddToCart = () => {
    onAddToCart(item, selectedSize, selectedOptions);
  };

  let currentPrice = selectedSize
    ? parseFloat(selectedSize.price)
    : parseFloat(item.price || 0);
  selectedOptions.forEach(
    (opt) => (currentPrice += parseFloat(opt.price || 0))
  );

  const paidOptions =
    item?.options?.filter((o) => parseFloat(o.price) > 0) || [];
  const freeOptions =
    item?.options?.filter((o) => parseFloat(o.price) === 0) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{item.name}</h2>
        <p className="text-slate-600 mb-4">{item.description}</p>

        {item.sizes && (
          <div className="mb-4">
            <h3 className="font-semibold text-slate-700 mb-2">Size</h3>
            <div className="flex gap-2 flex-wrap">
              {item.sizes.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 text-sm rounded-full border-2 ${
                    selectedSize?.name === size.name
                      ? "bg-amber-400 text-white border-amber-400"
                      : "bg-white text-slate-700 border-slate-300 hover:border-amber-400"
                  }`}
                >
                  {size.name} - ${parseFloat(size.price).toFixed(2)}
                </button>
              ))}
            </div>
          </div>
        )}

        {paidOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-slate-700 mb-2">Extras</h3>
            <div className="grid grid-cols-2 gap-2">
              {paidOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    onChange={() => handleOptionToggle(opt)}
                    className="h-4 w-4 rounded border-slate-300 text-amber-400 focus:ring-amber-400"
                  />
                  {opt.name} (+${parseFloat(opt.price).toFixed(2)})
                </label>
              ))}
            </div>
          </div>
        )}

        {freeOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-slate-700 mb-2">
              Add-ons (Free)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {freeOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    onChange={() => handleOptionToggle(opt)}
                    className="h-4 w-4 rounded border-slate-300 text-amber-400 focus:ring-amber-400"
                  />
                  {opt.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
          <span className="text-2xl font-bold text-slate-900">
            ${currentPrice.toFixed(2)}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Plus size={18} />
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
