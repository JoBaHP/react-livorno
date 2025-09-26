import React, { useState, useEffect, useRef } from "react";
import { useApi } from "../ApiProvider";
import MenuItem from "../components/MenuItem";
import CartView from "../components/CartView";
import OrderStatusDisplay from "../components/OrderStatusDisplay";
import {
  ChevronDown,
  Plus,
  Minus,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/format";
import { playNotificationSound } from "../audio";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  addItem as addCartItem,
  updateQuantity as updateCartQty,
  clear as clearCart,
} from "../store/cartSlice";
import { selectCartItems, selectCartTotal, selectCurrentOrder } from "../store";
import {
  setOrder,
  clearOrder,
  updateOrder as updateOrderAction,
} from "../store/orderSlice";

export default function CustomerView({ tableId }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const orderStatus = useSelector(selectCurrentOrder);
  const [openCategory, setOpenCategory] = useState(null);
  const [customizingItem, setCustomizingItem] = useState(null);
  const api = useApi();
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (message) => {
    setToast({ id: Date.now(), message });
  };

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

  const { data: menu = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: () => api.getMenu(),
  });
  const [isPlacing, setIsPlacing] = useState(false);
  const total = useSelector(selectCartTotal);

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

  // Menu is now loaded via React Query

  useEffect(() => {
    if (!orderStatus?.id) return;
    const onStatusUpdate = (updatedOrder) => {
      if (updatedOrder.id === orderStatus.id) {
        dispatch(updateOrderAction(updatedOrder));
      }
    };
    api.socket.on("order_status_update", onStatusUpdate);
    return () => api.socket.off("order_status_update", onStatusUpdate);
  }, [orderStatus, api.socket, dispatch]);

  const handleAddToCart = (item, size, selectedOptions, quantity = 1, optionsOnce = false) => {
    if (!item.available) return;
    dispatch(addCartItem({ item, size, selectedOptions, quantity, optionsOnce }));
    setCustomizingItem(null);
    const sizeLabel = size?.name ? ` (${size.name})` : "";
    showToast(t("toast.added", { name: item.name, size: sizeLabel }));
  };

  const placeOrder = async (notes, paymentMethod) => {
    if (cart.length === 0 || !tableId) return;
    playNotificationSound();
    setIsPlacing(true);
    const newOrder = await api.placeOrder(cart, tableId, notes, paymentMethod);
    dispatch(setOrder(newOrder));
    dispatch(clearCart());
    showToast(t("toast.placed"));
    setIsPlacing(false);
  };

  const handleCategoryToggle = (category) => {
    setOpenCategory((prevOpenCategory) =>
      prevOpenCategory === category ? null : category
    );
  };

  const handleQuantityChange = (cartItem, amount) => {
    dispatch(updateCartQty({ cartId: cartItem.cartId, amount }));
    if (amount > 0) {
      showToast(t("toast.increment", { name: cartItem.name }));
    } else {
      showToast(t("toast.decrement", { name: cartItem.name }));
    }
  };

  if (!tableId)
    return (
      <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          {t("no_table_selected")}
        </h2>
        <p className="text-slate-600">{t("scan_qr_prompt")}</p>
        <p className="text-slate-500 text-sm mt-4">
          {t("simulate_table_hint")}
        </p>
      </div>
    );
  if (orderStatus)
    return (
      <OrderStatusDisplay
        order={orderStatus}
        setOrderStatus={() => dispatch(clearOrder())}
      />
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-[var(--color-golden)] text-[#0c0c0c] px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-semibold tracking-wide">
            <Plus size={18} className="opacity-70" />
            <span className="text-sm uppercase">{toast.message}</span>
          </div>
        </div>
      )}
      <div className="lg:col-span-2 space-y-6">
        <div className="text-center lg:text-left">
          <h2 className="text-[46px] leading-[1.1] text-[var(--color-golden)]">
            {t("menu_title")}
          </h2>
          <p className="mt-2 text-base text-[var(--color-muted)]">
            {t("menu_table_text", { tableId })}
          </p>
        </div>
        {isMenuLoading ? (
          <p>{t("loading_menu")}</p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category}
                className="bg-[var(--color-panel)]/80 rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-xl shadow-black/20"
              >
                <button
                  onClick={() => handleCategoryToggle(category)}
                  className="w-full flex justify-between items-center p-5 hover:bg-white/5 transition-colors"
                >
                  <h3 className="text-[32px] text-[var(--color-golden)]">
                    {category}
                  </h3>
                  <ChevronDown
                    className={`text-[var(--color-golden)]/70 transform transition-transform duration-300 ${
                      openCategory === category ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openCategory === category && (
                  <div className="p-6 border-t border-[var(--color-border)] bg-black/20 backdrop-blur">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {menu
                        .filter((item) => item.category === category)
                        .map((item) => (
                          <MenuItem
                            key={item.id}
                            item={item}
                            onCustomize={() => setCustomizingItem(item)}
                            onAddToCart={handleAddToCart}
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
      <div className="lg:col-span-1" id="cart-panel">
        <div className="sticky top-28">
          <CartView
            cart={cart}
            updateQuantity={handleQuantityChange}
            total={total}
            placeOrder={placeOrder}
            isLoading={isPlacing}
          />
        </div>
      </div>
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          onAddToCart={handleAddToCart}
          onClose={() => setCustomizingItem(null)}
        />
      )}
    </div>
  );
}

function CustomizationModal({ item, onAddToCart, onClose }) {
  const { t, i18n } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const hasSizes = Array.isArray(item?.sizes) && item.sizes.length > 0;

  const sizeKey = (s, i) => (s?.id ?? s?.name ?? `size_${i}`);

  // Track quantity per size; start at 0 for all
  const initialQuantities = React.useMemo(() => {
    const map = {};
    (item.sizes || []).forEach((s, i) => {
      map[sizeKey(s, i)] = 0;
    });
    return map;
  }, [item.sizes]);
  const [sizeQuantities, setSizeQuantities] = useState(initialQuantities);
  const [baseQuantity, setBaseQuantity] = useState(1);

  const handleOptionToggle = (opt) => {
    setSelectedOptions((prev) =>
      prev.find((o) => o.id === opt.id)
        ? prev.filter((o) => o.id !== opt.id)
        : [...prev, opt]
    );
  };

  const incSize = (size, idx) => {
    const key = sizeKey(size, idx);
    setSizeQuantities((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };
  const decSize = (size, idx) => {
    const key = sizeKey(size, idx);
    setSizeQuantities((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) - 1),
    }));
  };

  // Calculate total
  const optionsSum = selectedOptions.reduce(
    (acc, o) => acc + parseFloat(o.price || 0),
    0
  );
  const sizesSubtotal = hasSizes
    ? (item.sizes || []).reduce((acc, s, i) => {
        const key = sizeKey(s, i);
        const qty = sizeQuantities[key] || 0;
        return acc + qty * parseFloat(s.price || 0);
      }, 0)
    : (baseQuantity || 0) * parseFloat(item.price || 0);
  const anyQtySelected = hasSizes
    ? (item.sizes || []).some((s, i) => (sizeQuantities[sizeKey(s, i)] || 0) > 0)
    : (baseQuantity || 0) > 0;
  const total = sizesSubtotal + (anyQtySelected ? optionsSum : 0);

  const handleAdd = () => {
    let optionsApplied = false;
    if (hasSizes) {
      (item.sizes || []).forEach((s, idx) => {
        const key = sizeKey(s, idx);
        const qty = sizeQuantities[key] || 0;
        if (qty > 0) {
          const opts = !optionsApplied ? selectedOptions : [];
          const optionsOnce = !optionsApplied && selectedOptions.length > 0;
          onAddToCart(item, s, opts, qty, optionsOnce);
          if (optionsOnce) optionsApplied = true;
        }
      });
    } else {
      const count = Math.max(0, baseQuantity);
      if (count > 0) {
        onAddToCart(item, null, selectedOptions, count, selectedOptions.length > 0);
      }
    }
  };

  const paidOptions =
    item?.options?.filter((o) => parseFloat(o.price) > 0) || [];
  const freeOptions =
    item?.options?.filter((o) => parseFloat(o.price) === 0) || [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur flex justify-center items-center z-50 p-4">
      <div className="bg-[#0f1318] border border-[var(--color-border)] rounded-3xl shadow-2xl p-7 w-full max-w-xl max-h-full overflow-y-auto text-white">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-[34px] text-[var(--color-golden)] leading-tight">
              {item.name}
            </h2>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              {item.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-golden)] hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {hasSizes && (
          <div className="mb-5">
            <h3 className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)] mb-3">
              {t("customization.size")}
            </h3>
            <div className="space-y-2">
              {item.sizes.map((size, idx) => {
                const key =
                  sizeKey(size, idx);
                const qty = sizeQuantities[key] || 0;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white/5 px-3 py-2 text-sm text-[var(--color-muted)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white">{size.name}</span>
                      <span className="text-xs">
                        {formatCurrency(
                          parseFloat(size.price || 0),
                          i18n.language
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decSize(size, idx)}
                        className="p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-golden)] hover:border-[var(--color-golden)]"
                        aria-label={t("cart.decrease")}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-[var(--color-golden)]">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => incSize(size, idx)}
                        className="p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-golden)] hover:border-[var(--color-golden)]"
                        aria-label={t("cart.increase")}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(paidOptions.length > 0 || freeOptions.length > 0) && (
          <div className="mb-5">
            <h3 className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)] mb-3">
              {t("customize")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[...paidOptions, ...freeOptions].map((opt) => {
                const checked = !!selectedOptions.find((o) => o.id === opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleOptionToggle(opt)}
                      className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-golden)] focus:ring-[var(--color-golden)] bg-transparent"
                    />
                    <span className="flex-1 text-white">{opt.name}</span>
                    {parseFloat(opt.price) > 0 && (
                      <span className="text-xs text-[var(--color-muted)]">
                        +
                        {formatCurrency(
                          parseFloat(opt.price || 0),
                          i18n.language
                        )}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {!hasSizes && (
          <div className="mb-5">
            <h3 className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)] mb-3">
              {t('quantity')}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBaseQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-golden)] hover:border-[var(--color-golden)]"
                aria-label={t('cart.decrease')}
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-bold text-[var(--color-golden)]">{baseQuantity}</span>
              <button
                type="button"
                onClick={() => setBaseQuantity((q) => q + 1)}
                className="p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-golden)] hover:border-[var(--color-golden)]"
                aria-label={t('cart.increase')}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div />
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
              {t("total")}
            </p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(total, i18n.language)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-white/10"
          >
            {t("customization.cancel")}
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-lg bg-[var(--color-golden)] text-[#0c0c0c] font-semibold flex items-center gap-2 hover:bg-[#f5efdb]"
          >
            <Check size={16} />
            {t("customization.add_to_order")}
          </button>
        </div>
      </div>
    </div>
  );
}
