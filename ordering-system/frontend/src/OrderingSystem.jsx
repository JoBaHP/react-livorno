import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import CustomerView from "./views/CustomerView";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectCartItemCount, selectCurrentOrder } from "./store";
import {
  setOrder as setOrderAction,
  clearOrder as clearOrderAction,
} from "./store/orderSlice";

const ACTIVE_ORDERS_KEY = "active_table_orders";
const LEGACY_ACTIVE_ORDER_KEY = "active_table_order";

const isTrackableOrder = (order) =>
  !!(
    order &&
    typeof order === "object" &&
    order.id &&
    order.status &&
    order.status !== "declined"
  );

const sanitiseActiveOrders = (orders = []) => {
  const seen = new Set();
  const result = [];
  orders.forEach((entry) => {
    if (!isTrackableOrder(entry)) return;
    if (seen.has(entry.id)) return;
    seen.add(entry.id);
    result.push({ ...entry });
  });
  return result;
};

function loadPersistedOrders() {
  try {
    const rawList = localStorage.getItem(ACTIVE_ORDERS_KEY);
    if (rawList) {
      const parsed = JSON.parse(rawList);
      if (Array.isArray(parsed)) {
        const sanitised = sanitiseActiveOrders(parsed);
        if (sanitised.length > 0) {
          return sanitised;
        }
      }
    }
  } catch (err) {
    console.warn("Unable to load active_table_orders", err);
  }

  try {
    const legacyRaw = localStorage.getItem(LEGACY_ACTIVE_ORDER_KEY);
    if (!legacyRaw) return [];
    const legacy = JSON.parse(legacyRaw);
    return isTrackableOrder(legacy) ? [{ ...legacy }] : [];
  } catch (err) {
    console.warn("Unable to load legacy active_table_order", err);
    return [];
  }
}

export default function OrderingSystem() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartItemCount);
  const currentOrder = useSelector(selectCurrentOrder);
  const currentOrderId = currentOrder?.id || null;
  const [tableId, setTableId] = useState(null);
  const location = useLocation();
  const [activeOrders, setActiveOrders] = useState(() => loadPersistedOrders());
  const [showActiveBanner, setShowActiveBanner] = useState(() => {
    try {
      const raw = sessionStorage.getItem('active_order_banner_dismissed');
      return raw !== 'true';
    } catch (err) {
      console.warn('Unable to read active order banner state', err);
      return true;
    }
  });
  const [showStatus, setShowStatus] = useState(() => activeOrders.length > 0);
  const prevOrderIdRef = useRef(activeOrders[0]?.id || null);

  const mergeActiveOrder = useCallback(
    (incoming) => {
      if (!incoming || !incoming.id) return;
      setActiveOrders((prev) => {
        const filtered = (prev || []).filter(
          (entry) => entry && entry.id !== incoming.id && isTrackableOrder(entry)
        );
        if (!isTrackableOrder(incoming)) {
          return filtered;
        }
        const existing = (prev || []).find((entry) => entry?.id === incoming.id) || {};
        const merged = { ...existing, ...incoming };
        return sanitiseActiveOrders([merged, ...filtered]);
      });
      if (!isTrackableOrder(incoming) && currentOrderId === incoming.id) {
        dispatch(clearOrderAction());
      }
    },
    [currentOrderId, dispatch]
  );

  const clearActiveOrderById = useCallback(
    (orderId) => {
      if (!orderId) return;
      setActiveOrders((prev) => prev.filter((entry) => entry?.id !== orderId));
      if (currentOrderId === orderId) {
        dispatch(clearOrderAction());
      }
    },
    [currentOrderId, dispatch]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const table = urlParams.get("table");
    if (table) {
      setTableId(parseInt(table, 10));
    }
  }, [location.search]);

  useEffect(() => {
    if (!currentOrder) return;
    mergeActiveOrder(currentOrder);
  }, [currentOrder, mergeActiveOrder]);

  useEffect(() => {
    if (currentOrder) return;
    if (activeOrders.length > 0) {
      dispatch(setOrderAction(activeOrders[0]));
    }
  }, [activeOrders, currentOrder, dispatch]);

  useEffect(() => {
    try {
      if (activeOrders.length > 0) {
        localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(activeOrders));
        localStorage.setItem(
          LEGACY_ACTIVE_ORDER_KEY,
          JSON.stringify(activeOrders[0])
        );
      } else {
        localStorage.removeItem(ACTIVE_ORDERS_KEY);
        localStorage.removeItem(LEGACY_ACTIVE_ORDER_KEY);
      }
    } catch (err) {
      console.warn('Unable to persist table active orders', err);
    }
  }, [activeOrders]);

  useEffect(() => {
    const currentId = activeOrders[0]?.id || null;
    const prevId = prevOrderIdRef.current;
    if (currentId && currentId !== prevId) {
      setShowStatus(true);
      setShowActiveBanner(true);
      try {
        sessionStorage.removeItem('active_order_banner_dismissed');
      } catch (error) {
        console.debug('Ignoring banner dismissal storage error', error);
      }
    }
    if (!currentId) {
      setShowStatus(false);
      setShowActiveBanner(false);
    }
    prevOrderIdRef.current = currentId;
  }, [activeOrders]);

  const handleViewStatus = useCallback(() => {
    setShowStatus(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const primaryOrder = activeOrders[0] || null;

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-40 bg-[#0c0c0c]/95 backdrop-blur border-b border-[rgba(220,202,135,0.15)]">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/livorno-logo.png"
              alt={t("app_title")}
              className="h-12 w-auto drop-shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <LangButton code="en" label="EN" />
            <LangButton code="sr" label="SR" />
            {activeOrders.length > 0 ? (
              <ActiveOrderBadge
                count={activeOrders.length}
                onClick={handleViewStatus}
              />
            ) : (
              <CartBadge count={cartCount} />
            )}
          </div>
        </nav>
        {primaryOrder && showActiveBanner && (
          <div className="bg-[var(--color-golden)]/10 border-t border-[var(--color-golden)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-[var(--color-golden)]">
              <span className="text-sm font-semibold">You have an active order in progress.</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleViewStatus}
                  className="px-3 py-1 text-xs font-bold rounded-md bg-[var(--color-golden)] text-[#0c0c0c]"
                >
                  View status
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.setItem('active_order_banner_dismissed', 'true');
                    } catch (err) {
                      console.warn('Unable to persist banner dismissal', err);
                    }
                    setShowActiveBanner(false);
                  }}
                  className="px-2 py-1 text-xs font-semibold border border-[var(--color-golden)] rounded-md"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CustomerView
          tableId={tableId}
          showStatus={showStatus}
          onHideStatus={() => setShowStatus(false)}
          onShowStatus={handleViewStatus}
          activeOrders={activeOrders}
          onActiveOrderUpdate={mergeActiveOrder}
          onActiveOrderClear={clearActiveOrderById}
        />
      </main>
    </div>
  );
}

function LangButton({ code, label }) {
  const { i18n } = useTranslation();
  const active = i18n.language?.startsWith(code);
  return (
    <button
      onClick={() => i18n.changeLanguage(code)}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase transition-all ${
        active
          ? "bg-[var(--color-golden)] text-[#0c0c0c]"
          : "border border-[rgba(220,202,135,0.35)] text-[var(--color-golden)] hover:border-[var(--color-golden)]"
      }`}
      aria-label={`Switch to ${label}`}
    >
      {label}
    </button>
  );
}

function CartBadge({ count }) {
  if (!count) return null;
  return (
    <div
      className="relative cursor-pointer select-none"
      aria-label={`Items in cart: ${count}`}
      role="button"
      onClick={() => {
        const el = document.getElementById("cart-panel");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      <ShoppingCart size={22} className="text-[var(--color-golden)]" />
      <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-[var(--color-golden)] text-[#0c0c0c]">
        {count}
      </span>
    </div>
  );
}

function ActiveOrderBadge({ onClick, count }) {
  const label = count > 1 ? `Active Orders (${count})` : "Active Order";
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-[var(--color-golden)] text-[#0c0c0c] shadow"
      aria-label="View active order status"
    >
      {label}
    </button>
  );
}
