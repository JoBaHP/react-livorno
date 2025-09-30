import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useApi } from "../ApiProvider";
import DeliveryMenu from "../components/delivery/DeliveryMenu";
import DeliveryCheckout from "../components/delivery/DeliveryCheckout";
import DeliveryStatus from "../components/delivery/DeliveryStatus";
import { Navbar } from "../components";
import { useDispatch, useSelector } from "react-redux";
import {
  addItem,
  updateQuantity as updateQuantityAction,
  updateOptionQuantity as updateOptionQuantityAction,
  replaceItemsForProduct,
  clear,
} from "../store/cartSlice";
import {
  setOrder,
  updateOrder as updateOrderAction,
} from "../store/orderSlice";
import { selectCartItems, selectCurrentOrder } from "../store";

export default function OnlineOrderingPage({ initialView }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const order = useSelector(selectCurrentOrder);
  const authUser = useSelector((state) => state.auth.user);
  const [activeOrders, setActiveOrders] = useState(() => {
    try {
      const raw = localStorage.getItem("active_delivery_orders");
      const parsed = JSON.parse(raw || "[]");
      const list = Array.isArray(parsed) ? parsed : [];
      return list.filter((o) => o && o.status !== 'completed' && o.status !== 'declined');
    } catch {
      return [];
    }
  });
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("view");
    if (initialView === 'status') return 'status';
    if (v === "checkout") return "checkout";
    if (v === "status") return "status";
    return "menu";
  });
  const api = useApi();
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("reorderMsg");
      if (!raw) return;
      const data = JSON.parse(raw);
      sessionStorage.removeItem("reorderMsg");
      if (data && data.ok) {
        if ((data.warnings || []).length) {
          setBanner({ type: "warn", text: data.warnings.join(" ") });
        } else {
          setBanner({ type: "ok", text: "Cart updated from previous order." });
        }
      }
    } catch {}
  }, []);

  // Persist active orders list to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("active_delivery_orders", JSON.stringify(activeOrders));
    } catch {}
    // Notify other components (e.g., Navbar) within this tab
    try { window.dispatchEvent(new CustomEvent('active-delivery-orders-updated')); } catch {}
  }, [activeOrders]);

  // If user is authenticated, hydrate active orders from server history (recent, non-completed)
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const result = await api.getUserOrders();
        const open = Array.isArray(result?.orders)
          ? result.orders.filter((o) => o.order_type === 'delivery' && o.status !== 'completed' && o.status !== 'declined')
          : [];
        if (cancelled) return;
        if (open.length) {
          setActiveOrders((prev) => {
            const map = new Map(prev.map((o) => [o.id, o]));
            open.forEach((o) => map.set(o.id, o));
            return Array.from(map.values());
          });
        }
      } catch {
        // ignore
      }
    };
    hydrate();
    return () => { cancelled = true; };
  }, [api, authUser?.id]);

  // --- NEW: This effect listens for real-time status updates ---
  useEffect(() => {
    const onStatusUpdate = (updatedOrder) => {
      // Update singleton order in store if it matches
      if (order?.id && updatedOrder.id === order.id) {
        dispatch(updateOrderAction(updatedOrder));
      }
      // Update in local active list (support multiple orders)
      setActiveOrders((prev) => {
        const idx = prev.findIndex((o) => o.id === updatedOrder.id);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], ...updatedOrder };
        // Remove completed or declined orders automatically
        return next.filter((o) => o.status !== "completed" && o.status !== 'declined');
      });
    };
    api.socket.on("order_status_update", onStatusUpdate);
    return () => api.socket.off("order_status_update", onStatusUpdate);
  }, [order?.id, api.socket, dispatch]);

  const addToCart = (item, size, selectedOptions) => {
    dispatch(addItem({ item, size, selectedOptions }));
  };

  const updateQuantity = (cartId, amount) => {
    dispatch(updateQuantityAction({ cartId, amount }));
  };

  const updateOptionQuantity = (cartId, optionId, delta) => {
    dispatch(updateOptionQuantityAction({ cartId, optionId, delta }));
  };

  const updateCartForItem = (
    item,
    selectedQuantities,
    optionsWithQuantities
  ) => {
    const filteredOptions = (optionsWithQuantities || []).filter((o) =>
      parseFloat(o.price || 0) > 0 ? (o.quantity || 0) > 0 : true
    );

    const freeOptions = filteredOptions
      .filter((opt) => parseFloat(opt.price || 0) <= 0)
      .map((opt) => ({ ...opt, quantity: opt.quantity || 1 }));

    const paidOptions = filteredOptions.filter(
      (opt) => parseFloat(opt.price || 0) > 0
    );

    const units = [];
    if (item.sizes?.length) {
      item.sizes.forEach((size) => {
        const qty = selectedQuantities[size.name] || 0;
        for (let i = 0; i < qty; i += 1) {
          units.push({ size: size.name, price: size.price });
        }
      });
    } else {
      const qty = selectedQuantities.std || 0;
      for (let i = 0; i < qty; i += 1) {
        units.push({ size: null, price: item.price });
      }
    }

    const unitOptions = units.map(() => freeOptions.map((opt) => ({ ...opt })));

    paidOptions.forEach((opt) => {
      let remaining = Math.max(0, opt.quantity || 0);
      if (units.length === 0 || remaining === 0) return;

      let idx = 0;
      while (remaining > 0 && idx < unitOptions.length) {
        const target = unitOptions[idx];
        const existing = target.find((o) => o.id === opt.id);
        if (existing) {
          existing.quantity = (existing.quantity || 0) + 1;
        } else {
          target.push({ ...opt, quantity: 1 });
        }
        remaining -= 1;
        idx += 1;
      }

      if (remaining > 0) {
        const target = unitOptions[unitOptions.length - 1];
        const existing = target.find((o) => o.id === opt.id);
        if (existing) {
          existing.quantity = (existing.quantity || 0) + remaining;
        } else {
          target.push({ ...opt, quantity: remaining });
        }
      }
    });

    const grouped = new Map();

    units.forEach((unit, index) => {
      const options = (unitOptions[index] || [])
        .filter((opt) => {
          const price = parseFloat(opt.price || 0);
          return price > 0 ? (opt.quantity || 0) > 0 : true;
        })
        .map((opt) => ({ ...opt }));

      const optionsKey = options
        .map((opt) => {
          const price = parseFloat(opt.price || 0);
          if (price > 0) {
            return `${opt.id}:${opt.quantity || 1}`;
          }
          return `${opt.id}`;
        })
        .sort()
        .join("-");

      const cartId = `${item.id}-${unit.size || "std"}-${optionsKey}`;
      if (!grouped.has(cartId)) {
        grouped.set(cartId, {
          ...item,
          cartId,
          quantity: 0,
          price: unit.price,
          size: unit.size,
          selectedOptions: options,
        });
      }
      const entry = grouped.get(cartId);
      entry.quantity += 1;
    });

    const newItems = Array.from(grouped.values());
    dispatch(replaceItemsForProduct({ productId: item.id, items: newItems }));
  };

  useEffect(() => {
    if (view === "status" && !order && activeOrders.length === 0) {
      setView("menu");
    }
  }, [order, activeOrders.length, view]);

  const placeDeliveryOrder = async (customerDetails) => {
    let fullAddress = `${customerDetails.street} ${customerDetails.number}`;
    if (customerDetails.floor)
      fullAddress += `, Floor ${customerDetails.floor}`;
    if (customerDetails.flat)
      fullAddress += `, Apartment ${customerDetails.flat}`;
    const orderData = {
      cart,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: fullAddress,
      paymentMethod: "cash",
      notes: customerDetails.notes,
      customerEmail: authUser?.email || null,
      customerExternalId: authUser?.id || null,
      customerAvatar: authUser?.picture || null,
    };
    const newOrder = await api.placeDeliveryOrder(orderData);
    if (newOrder.id) {
      dispatch(setOrder(newOrder));
      setView("status");
      dispatch(clear());
      setActiveOrders((prev) => [{ ...newOrder }, ...prev]);
    } else {
      throw new Error(newOrder.message || "An unknown error occurred.");
    }
  };

  // On entry, if there are active orders saved, show status view
  useEffect(() => {
    if (activeOrders.length > 0) {
      setView("status");
    }
  }, [activeOrders.length]);

  // React to URL changes (e.g., clicking navbar pill to /delivery?view=status)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get('view');
    if (location.pathname.endsWith('/status') || v === 'status') setView('status');
    else if (v === 'checkout') setView('checkout');
    else if (!v) setView('menu');
  }, [location.search, location.pathname]);

  const renderView = () => {
    switch (view) {
      case "checkout":
        return (
          <DeliveryCheckout
            cart={cart}
            onPlaceOrder={placeDeliveryOrder}
            onBackToMenu={() => setView("menu")}
            updateQuantity={updateQuantity}
            updateOptionQuantity={updateOptionQuantity}
          />
        );
      case "status":
        return (
          <div className="space-y-8">
            {activeOrders.length === 0 && order && (
              <DeliveryStatus order={order} />
            )}
            {activeOrders.map((o) => (
              <DeliveryStatus key={o.id} order={o} />
            ))}
          </div>
        );
      case "menu":
      default:
        return (
          <DeliveryMenu
            cart={cart}
            addToCart={addToCart}
            onGoToCheckout={() => setView("checkout")}
            updateQuantity={updateQuantity}
            updateCartForItem={updateCartForItem}
          />
        );
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <main className="py-8 px-4">
        {banner && (
          <div
            className="mb-4 p-3 rounded-md"
            style={{
              background: banner.type === "warn" ? "#3b2f00" : "#0a2f0a",
              border: "1px solid var(--color-golden)",
            }}
          >
            <p className="p__opensans" style={{ color: "#fff" }}>
              {banner.text}
            </p>
          </div>
        )}
        {renderView()}
      </main>
    </div>
  );
}
