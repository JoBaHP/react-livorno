import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { useApi } from "../ApiProvider";
import DeliveryMenu from "../components/delivery/DeliveryMenu";
import DeliveryCheckout from "../components/delivery/DeliveryCheckout";
import DeliveryStatus from "../components/delivery/DeliveryStatus";
import { Navbar } from "../components";
import { Plus, Minus } from "lucide-react";
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
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const order = useSelector(selectCurrentOrder);
  const authUser = useSelector((state) => state.auth.user);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
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
  const [activeView, setActiveView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("view");
    if (initialView === "status" || v === "status") return "status";
    if (v === "checkout" || v === "cart") return "checkout";
    return "menu";
  });
  const api = useApi();
  const [banner, setBanner] = useState(null);

  const navigateToView = useCallback((target) => {
    if (!target) return;
    setActiveView(target);
  }, []);

  const showToast = useCallback((message, variant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  useEffect(() => {
    if (!toast) return () => {};
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2200);
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [toast]);

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

  const addToCart = useCallback(
    (item, size, selectedOptions) => {
      dispatch(addItem({ item, size, selectedOptions }));
      const sizeLabel = size?.name ? ` (${size.name})` : "";
      showToast(
        t("delivery.toast_added", {
          defaultValue: "Added to cart: {{name}}",
          name: `${item.name}${sizeLabel}`,
        }),
        "add"
      );
    },
    [dispatch, showToast, t]
  );

  const updateQuantity = useCallback(
    (cartId, amount) => {
      const entry = cart.find((c) => c.cartId === cartId);
      dispatch(updateQuantityAction({ cartId, amount }));
      if (!entry || amount === 0) return;
      if (amount > 0) {
        showToast(
          t("delivery.toast_increment", {
            defaultValue: "Added one {{name}}",
            name: entry.name,
          }),
          "add"
        );
      } else {
        const nextQty = (entry.quantity || 0) + amount;
        const key = nextQty <= 0 ? "delivery.toast_removed" : "delivery.toast_decrement";
        showToast(
          t(key, {
            defaultValue: nextQty <= 0 ? "Removed {{name}}" : "Removed one {{name}}",
            name: entry.name,
          }),
          nextQty <= 0 ? "remove" : "decrement"
        );
      }
    },
    [cart, dispatch, showToast, t]
  );

  const updateOptionQuantity = useCallback(
    (cartId, optionId, delta) => {
      dispatch(updateOptionQuantityAction({ cartId, optionId, delta }));
    },
    [dispatch]
  );

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
    showToast(
      t("delivery.toast_updated", {
        defaultValue: "Updated cart for {{name}}",
        name: item.name,
      }),
      "info"
    );
  };

  useEffect(() => {
    if (activeView === "status" && !order && activeOrders.length === 0) {
      navigateToView("menu");
    }
  }, [order, activeOrders.length, activeView, navigateToView]);

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
      navigateToView("status");
      dispatch(clear());
      setActiveOrders((prev) => [{ ...newOrder }, ...prev]);
      showToast(
        t("delivery.toast_placed", { defaultValue: "Order placed!" }),
        "add"
      );
    } else {
      throw new Error(newOrder.message || "An unknown error occurred.");
    }
  };

  // On entry, if there are active orders saved, show status view
  useEffect(() => {
    if (activeOrders.length > 0) {
      navigateToView("status");
    }
  }, [activeOrders.length, navigateToView]);

  // React to URL changes (e.g., clicking navbar pill to /delivery?view=status)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get('view');
    if (location.pathname.endsWith('/status') || v === 'status') navigateToView('status');
    else if (v === 'checkout' || v === 'cart') navigateToView('checkout');
    else if (!v) navigateToView('menu');
  }, [location.search, location.pathname, navigateToView]);

  let content;
  if (activeView === "status") {
    if (activeOrders.length > 0) {
      content = (
        <div className="space-y-8">
          {activeOrders.map((o) => (
            <DeliveryStatus key={o.id} order={o} />
          ))}
        </div>
      );
    } else if (order) {
      content = <DeliveryStatus order={order} />;
    } else {
      content = (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 text-center">
          <h3 className="headtext__cormorant text-3xl mb-2 text-dark">
            {t("delivery_status.no_active", "No active deliveries right now")}
          </h3>
          <p className="p__opensans text-slate-600 mb-4">
            {t("delivery_status.start_order", "Browse the menu to start a new order.")}
          </p>
          <button
            type="button"
            onClick={() => navigateToView("menu")}
            className="custom__button"
          >
            {t("delivery_status.back_to_menu", "Back to menu")}
          </button>
        </div>
      );
    }
  } else if (activeView === "checkout") {
    content = (
      <DeliveryCheckout
        cart={cart}
        onPlaceOrder={placeDeliveryOrder}
        onBackToMenu={() => navigateToView("menu")}
        updateQuantity={updateQuantity}
        updateOptionQuantity={updateOptionQuantity}
      />
    );
  } else {
    content = (
      <DeliveryMenu
        cart={cart}
        addToCart={addToCart}
        onViewCart={() => navigateToView("checkout")}
        updateQuantity={updateQuantity}
        updateCartForItem={updateCartForItem}
      />
    );
  }

  const toastElement =
    toast && (
      <div className="fixed top-6 right-6 z-50">
        <div className="bg-[var(--color-golden)] text-[#0c0c0c] px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-semibold tracking-wide">
          {toast.variant === "remove" || toast.variant === "decrement" ? (
            <Minus size={18} className="opacity-70" />
          ) : (
            <Plus size={18} className="opacity-70" />
          )}
          <span className="text-sm uppercase">{toast.message}</span>
        </div>
      </div>
    );

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <main className="py-8 px-4">
        {toastElement}
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
        {content}
      </main>
    </div>
  );
}
