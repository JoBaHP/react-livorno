import React, { useState, useEffect } from "react";
import { useApi } from "../ApiProvider";
import MenuItem from "../components/MenuItem";
import CartView from "../components/CartView";
import OrderStatusDisplay from "../components/OrderStatusDisplay";
import { ChevronDown } from "lucide-react";
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

  const addToCart = (item, size = null) => {
    if (!item.available) return;
    const cartId = size ? `${item.id}-${size.name}` : String(item.id);
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
      };
      setCart([...cart, newItem]);
    }
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
    const newOrder = await api.placeOrder(cart, tableId);
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
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          No Table Selected
        </h2>
        <p className="text-gray-600">
          Please scan a QR code on your table to start ordering.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          To simulate, add `?table=1` to the URL.
        </p>
      </div>
    );
  if (orderStatus)
    return (
      <OrderStatusDisplay order={orderStatus} setOrderStatus={setOrderStatus} />
    );

  const total = cart.reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * item.quantity,
    0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Menu (Table {tableId})
        </h2>
        {isLoading ? (
          <p>Loading menu...</p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="bg-white rounded-lg shadow">
                <button
                  onClick={() => handleCategoryToggle(category)}
                  className="w-full flex justify-between items-center p-4"
                >
                  <h3 className="text-2xl font-semibold text-indigo-600">
                    {category}
                  </h3>
                  <ChevronDown
                    className={`transform transition-transform duration-200 ${
                      openCategory === category ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openCategory === category && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {menu
                        .filter((item) => item.category === category)
                        .map((item) => (
                          <MenuItem
                            key={item.id}
                            item={item}
                            addToCart={addToCart}
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
    </div>
  );
}
