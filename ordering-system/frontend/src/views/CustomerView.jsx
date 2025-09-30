import React, { useState, useEffect, useRef } from "react";
import { useApi } from "../ApiProvider";
import MenuItem from "../components/MenuItem";
import CartView from "../components/CartView";
import OrderStatusDisplay from "../components/OrderStatusDisplay";
import { ChevronDown, Plus, Minus, Check, SlidersHorizontal } from "lucide-react";
import { getParentIcon } from "../utils/parentIcons";
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
// Parent groups are dynamic via backend categories; we only localize labels here.
import {
  setOrder,
  updateOrder as updateOrderAction,
} from "../store/orderSlice";

export default function CustomerView({
  tableId,
  showStatus = true,
  onHideStatus,
  onShowStatus,
  activeOrders = [],
  onActiveOrderUpdate,
  onActiveOrderClear,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const orderStatusFromStore = useSelector(selectCurrentOrder);
  const [openParent, setOpenParent] = useState(null);
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
  const { data: categoriesInfo = [] } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: () => api.getMenuCategories(),
  });
  const [isPlacing, setIsPlacing] = useState(false);
  const total = useSelector(selectCartTotal);
  const hasActiveOrders = activeOrders.length > 0;
  const primaryOrder = hasActiveOrders ? activeOrders[0] : orderStatusFromStore;

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

  // Derive parent groups dynamically from server categories
  const parentKeys = React.useMemo(() => {
    const set = new Set();
    (categoriesInfo || []).forEach((c) => set.add(c.parentKey || "food"));
    if (set.size === 0) {
      set.add("food");
      set.add("drinks");
    }
    return Array.from(set);
  }, [categoriesInfo]);
  const parentGroupsFromServer = parentKeys.map((k) => ({
    key: k,
    label: t(`category_parent.${k}`, k.charAt(0).toUpperCase() + k.slice(1)),
  }));
  const categoryToParent = new Map(
    (categoriesInfo || []).map((c) => [c.name, c.parentKey || "food"])
  );
  const groupedCategories = parentGroupsFromServer.map((pg) => ({
    key: pg.key,
    label: pg.label,
    categories: categories.filter(
      (cat) => (categoryToParent.get(cat) || "food") === pg.key
    ),
  }));

  // Menu is now loaded via React Query

  useEffect(() => {
    const handleStatusUpdate = (updatedOrder) => {
      if (!updatedOrder?.id) return;
      if (
        orderStatusFromStore?.id &&
        updatedOrder.id === orderStatusFromStore.id
      ) {
        dispatch(updateOrderAction(updatedOrder));
      }
      if (typeof onActiveOrderUpdate === "function") {
        onActiveOrderUpdate(updatedOrder);
      }
    };
    api.socket.on("order_status_update", handleStatusUpdate);
    return () => api.socket.off("order_status_update", handleStatusUpdate);
  }, [api.socket, dispatch, onActiveOrderUpdate, orderStatusFromStore?.id]);

  const handleAddToCart = (
    item,
    size,
    selectedOptions,
    quantity = 1,
    optionsOnce = false
  ) => {
    if (!item.available) return;
    dispatch(
      addCartItem({ item, size, selectedOptions, quantity, optionsOnce })
    );
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
    if (typeof onActiveOrderUpdate === "function") {
      onActiveOrderUpdate(newOrder);
    }
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
  if (showStatus && hasActiveOrders)
    return (
      <div className="space-y-8">
        {activeOrders.map((order) => (
          <OrderStatusDisplay
            key={order.id}
            order={order}
            setOrderStatus={() => {
              if (typeof onActiveOrderClear === "function") {
                onActiveOrderClear(order.id);
              }
            }}
            onBackToMenu={onHideStatus}
            onFeedbackSubmitted={(id) => {
              if (typeof onActiveOrderClear === "function") {
                onActiveOrderClear(id);
              }
            }}
          />
        ))}
      </div>
    );
  if (showStatus && primaryOrder)
    return (
      <OrderStatusDisplay
        order={primaryOrder}
        setOrderStatus={() => {
          if (typeof onActiveOrderClear === "function" && primaryOrder?.id) {
            onActiveOrderClear(primaryOrder.id);
          }
        }}
        onBackToMenu={onHideStatus}
        onFeedbackSubmitted={(id) => {
          if (typeof onActiveOrderClear === "function") {
            onActiveOrderClear(id);
          }
        }}
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
        {primaryOrder && !showStatus && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg">
            <span className="text-sm font-semibold">
              {t('status.waiting')} – {t('order_id', { id: primaryOrder.id })}
            </span>
            <button
              type="button"
              onClick={() => {
                if (onShowStatus) onShowStatus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1 text-xs font-bold rounded-md bg-amber-500 text-white shadow hover:bg-amber-600"
            >
              {t('view_order', 'View status')}
            </button>
          </div>
        )}
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {groupedCategories.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setOpenParent((prev) => (prev === key ? null : key));
                    setOpenCategory(null);
                  }}
                  className={`flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors ${
                    openParent === key ? 'ring-1 ring-[var(--color-golden)]' : ''
                  }`}
                >
                  <span className="flex items-center gap-2 text-[var(--color-golden)] font-semibold">
                    {(() => { const Icon = getParentIcon(key); return <Icon size={18} />; })()}
                    {label}
                  </span>
                  <ChevronDown
                    className={`text-[var(--color-golden)]/80 transform transition-transform duration-300 ${
                      openParent === key ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ))}
            </div>

            {openParent && (
              <div className="mt-2 space-y-3">
                {(groupedCategories.find((g) => g.key === openParent)?.categories || []).length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)]">{t('no_items')}</p>
                ) : (
                  groupedCategories
                    .find((g) => g.key === openParent)
                    .categories.map((category) => (
                      <div
                        key={category}
                        className="bg-black/10 rounded-xl border border-[var(--color-border)] overflow-hidden"
                      >
                        <button
                          onClick={() => handleCategoryToggle(category)}
                          className="w-full flex justify-between items-center p-4 hover:bg-white/5 transition-colors"
                        >
                          <h3 className="text-[20px] text-[var(--color-golden)]">{category}</h3>
                          <ChevronDown
                            className={`text-[var(--color-golden)]/70 transform transition-transform duration-300 ${
                              openCategory === category ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {openCategory === category && (
                          <div className="p-4 border-t border-[var(--color-border)]">
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
                    ))
                )}
              </div>
            )}
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

  const sizeKey = (s, i) => s?.id ?? s?.name ?? `size_${i}`;

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
    ? (item.sizes || []).some(
        (s, i) => (sizeQuantities[sizeKey(s, i)] || 0) > 0
      )
    : (baseQuantity || 0) > 0;
  const total = sizesSubtotal + (anyQtySelected ? optionsSum : 0);

  const handleAdd = () => {
    let optionsApplied = false;
    if (hasSizes) {
      (item.sizes || []).forEach((s, idx) => {
        const key = sizeKey(s, idx);
        const qty = sizeQuantities[key] || 0;
        if (qty > 0) {
          const applyOptions = !optionsApplied ? selectedOptions : [];
          const optionsOnce = !optionsApplied && selectedOptions.length > 0;
          // If options should be applied once for this size selection,
          // encode option.quantity so backend totals it once across the whole line.
          const optsWithQty = (applyOptions || []).map((opt) => ({
            ...opt,
            quantity: optionsOnce && qty > 0 ? 1 / qty : 1,
          }));
          onAddToCart(item, s, optsWithQty, qty, optionsOnce);
          if (optionsOnce) optionsApplied = true;
        }
      });
    } else {
      const count = Math.max(0, baseQuantity);
      if (count > 0) {
        const optionsOnce = selectedOptions.length > 0;
        const optsWithQty = (selectedOptions || []).map((opt) => ({
          ...opt,
          quantity: optionsOnce && count > 0 ? 1 / count : 1,
        }));
        onAddToCart(item, null, optsWithQty, count, optionsOnce);
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
                const key = sizeKey(size, idx);
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
              {t("quantity")}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBaseQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-golden)] hover:border-[var(--color-golden)]"
                aria-label={t("cart.decrease")}
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-bold text-[var(--color-golden)]">
                {baseQuantity}
              </span>
              <button
                type="button"
                onClick={() => setBaseQuantity((q) => q + 1)}
                className="p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-golden)] hover:border-[var(--color-golden)]"
                aria-label={t("cart.increase")}
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
