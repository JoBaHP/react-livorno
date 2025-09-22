import React, { useState, useEffect, useRef } from "react";
import { useApi } from "../ApiProvider";
import MenuItem from "../components/MenuItem";
import CartView from "../components/CartView";
import OrderStatusDisplay from "../components/OrderStatusDisplay";
import { ChevronDown, Plus } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/format';
import { playNotificationSound } from "../audio";
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { addItem as addCartItem, updateQuantity as updateCartQty, clear as clearCart } from '../store/cartSlice';
import { selectCartItems, selectCartTotal, selectCurrentOrder } from '../store';
import { setOrder, clearOrder, updateOrder as updateOrderAction } from '../store/orderSlice';

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
    queryKey: ['menu'],
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

  const handleAddToCart = (item, size, selectedOptions) => {
    if (!item.available) return;
    dispatch(addCartItem({ item, size, selectedOptions }));
    setCustomizingItem(null);
    const sizeLabel = size?.name ? ` (${size.name})` : '';
    showToast(t('toast.added', { name: item.name, size: sizeLabel }));
  };

  const placeOrder = async (notes, paymentMethod) => {
    if (cart.length === 0 || !tableId) return;
    playNotificationSound();
    setIsPlacing(true);
    const newOrder = await api.placeOrder(cart, tableId, notes, paymentMethod);
    dispatch(setOrder(newOrder));
    dispatch(clearCart());
    showToast(t('toast.placed'));
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
      showToast(t('toast.increment', { name: cartItem.name }));
    } else {
      showToast(t('toast.decrement', { name: cartItem.name }));
    }
  };

  if (!tableId)
    return (
      <div className="text-center bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-red-600 mb-4">
          {t('no_table_selected')}
        </h2>
        <p className="text-slate-600">
          {t('scan_qr_prompt')}
        </p>
        <p className="text-slate-500 text-sm mt-4">
          {t('simulate_table_hint')}
        </p>
      </div>
    );
  if (orderStatus)
    return (
      <OrderStatusDisplay order={orderStatus} setOrderStatus={() => dispatch(clearOrder())} />
    );


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Plus size={16} className="opacity-80" />
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}
      <div className="lg:col-span-2 space-y-6">
        <div className="text-center lg:text-left">
          <h2 className="text-4xl font-extrabold text-slate-800">{t('menu_title')}</h2>
          <p className="mt-2 text-lg text-slate-600">
            {t('menu_table_text', { tableId })}
          </p>
        </div>
        {isMenuLoading ? (
          <p>{t('loading_menu')}</p>
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
        <div className="sticky top-24">
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
            <h3 className="font-semibold text-slate-700 mb-2">{t('customization.size')}</h3>
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
                  {size.name} - {formatCurrency(parseFloat(size.price), i18n.language)}
                </button>
              ))}
            </div>
          </div>
        )}

        {paidOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-slate-700 mb-2">{t('customization.extras')}</h3>
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
                  {opt.name} (+{formatCurrency(parseFloat(opt.price), i18n.language)})
                </label>
              ))}
            </div>
          </div>
        )}

        {freeOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-slate-700 mb-2">{t('customization.addons_free')}</h3>
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
          <span className="text-2xl font-bold text-slate-900">{formatCurrency(currentPrice, i18n.language)}</span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
            >
              {t('customization.cancel')}
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Plus size={18} />
              {t('customization.add_to_order')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
