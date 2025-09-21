import React, { useState, useEffect } from "react";
// import { useLocation } from 'react-router-dom';
import { useApi } from "../ApiProvider";
import DeliveryMenu from "../components/delivery/DeliveryMenu";
import DeliveryCheckout from "../components/delivery/DeliveryCheckout";
import DeliveryStatus from "../components/delivery/DeliveryStatus";
import { Navbar } from "../components";
import { Footer } from "../container";
import { useDispatch, useSelector } from 'react-redux';
import { addItem, updateQuantity as updateQuantityAction, updateOptionQuantity as updateOptionQuantityAction, replaceItemsForProduct, clear } from '../store/cartSlice';
import { setOrder, updateOrder as updateOrderAction } from '../store/orderSlice';
import { selectCartItems, selectCurrentOrder } from '../store';

export default function OnlineOrderingPage() {
  // const location = useLocation();
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const order = useSelector(selectCurrentOrder);
  const authUser = useSelector((state) => state.auth.user);
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    return v === 'checkout' ? 'checkout' : 'menu';
  });
  const api = useApi();
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('reorderMsg');
      if (!raw) return;
      const data = JSON.parse(raw);
      sessionStorage.removeItem('reorderMsg');
      if (data && data.ok) {
        if ((data.warnings || []).length) {
          setBanner({ type: 'warn', text: data.warnings.join(' ') });
        } else {
          setBanner({ type: 'ok', text: 'Cart updated from previous order.' });
        }
      }
    } catch {}
  }, []);

  // --- NEW: This effect listens for real-time status updates ---
  useEffect(() => {
    if (!order?.id) return; // Only listen if there's an active order

    const onStatusUpdate = (updatedOrder) => {
      if (updatedOrder.id === order.id) {
        dispatch(updateOrderAction(updatedOrder));
      }
    };

    api.socket.on("order_status_update", onStatusUpdate);

    return () => {
      api.socket.off("order_status_update", onStatusUpdate);
    };
  }, [order, api.socket, dispatch]);

  const addToCart = (item, size, selectedOptions) => {
    dispatch(addItem({ item, size, selectedOptions }));
  };

  const updateQuantity = (cartId, amount) => {
    dispatch(updateQuantityAction({ cartId, amount }));
  };

  const updateOptionQuantity = (cartId, optionId, delta) => {
    dispatch(updateOptionQuantityAction({ cartId, optionId, delta }));
  };

  const updateCartForItem = (item, selectedQuantities, optionsWithQuantities) => {
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

    const unitOptions = units.map(() =>
      freeOptions.map((opt) => ({ ...opt }))
    );

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
        .join('-');

      const cartId = `${item.id}-${unit.size || 'std'}-${optionsKey}`;
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
    if (!order && view === 'status') {
      setView('menu');
    }
  }, [order, view]);

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
    } else {
      throw new Error(newOrder.message || "An unknown error occurred.");
    }
  };

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
        return <DeliveryStatus order={order} />;
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
          <div className="mb-4 p-3 rounded-md" style={{
            background: banner.type === 'warn' ? '#3b2f00' : '#0a2f0a',
            border: '1px solid var(--color-golden)'
          }}>
            <p className="p__opensans" style={{ color: '#fff' }}>{banner.text}</p>
          </div>
        )}
        {renderView()}
      </main>
      <Footer />
    </div>
  );
}
