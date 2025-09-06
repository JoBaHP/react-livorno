import React, { useState, useEffect } from "react";
import { useApi } from "../ApiProvider";
import DeliveryMenu from "../components/delivery/DeliveryMenu";
import DeliveryCheckout from "../components/delivery/DeliveryCheckout";
import DeliveryStatus from "../components/delivery/DeliveryStatus";
import { Navbar } from "../components";
import { Footer } from "../container";

const getInitialCart = () => {
  try {
    const storedCart = sessionStorage.getItem("deliveryCart");
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    return [];
  }
};

export default function OnlineOrderingPage() {
  const [cart, setCart] = useState(getInitialCart);
  const [order, setOrder] = useState(null);
  const [view, setView] = useState("menu");
  const api = useApi();

  useEffect(() => {
    try {
      sessionStorage.setItem("deliveryCart", JSON.stringify(cart));
    } catch (error) {
      console.error("Could not save cart to sessionStorage:", error);
    }
  }, [cart]);

  // --- NEW: This effect listens for real-time status updates ---
  useEffect(() => {
    if (!order?.id) return; // Only listen if there's an active order

    const onStatusUpdate = (updatedOrder) => {
      if (updatedOrder.id === order.id) {
        setOrder(updatedOrder); // Update the local order state
      }
    };

    api.socket.on("order_status_update", onStatusUpdate);

    return () => {
      api.socket.off("order_status_update", onStatusUpdate);
    };
  }, [order, api.socket]);

  const addToCart = (item, size, selectedOptions) => {
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
  };

  const updateQuantity = (cartId, amount) => {
    const updatedCart = cart.map((item) =>
      item.cartId === cartId
        ? { ...item, quantity: Math.max(0, item.quantity + amount) }
        : item
    );
    setCart(updatedCart.filter((item) => item.quantity > 0));
  };

  const updateOptionQuantity = (cartId, optionId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId !== cartId) return item;
        const updatedOptions = (item.selectedOptions || [])
          .map((opt) => {
            if (opt.id !== optionId) return opt;
            const isPaid = parseFloat(opt.price || 0) > 0;
            if (!isPaid) return opt;
            const newQty = Math.max(0, (opt.quantity || 0) + delta);
            return { ...opt, quantity: newQty };
          })
          .filter((opt) => !(parseFloat(opt.price || 0) > 0 && (opt.quantity || 0) === 0));
        return { ...item, selectedOptions: updatedOptions };
      })
    );
  };

  const updateCartForItem = (item, selectedQuantities, optionsWithQuantities) => {
    setCart((prev) => {
      const rest = prev.filter((ci) => ci.id !== item.id);
      const newItems = [];

      const preparedOptions = (optionsWithQuantities || []).filter(
        (o) => (parseFloat(o.price || 0) > 0 ? (o.quantity || 0) > 0 : true)
      );

      if (item.sizes?.length) {
        item.sizes.forEach((size) => {
          const qty = selectedQuantities[size.name] || 0;
          if (qty > 0) {
            const optionsId = preparedOptions
              .map((o) => `${o.id}:${o.quantity || 1}`)
              .sort()
              .join("-");
            const cartId = `${item.id}-${size.name}-${optionsId}`;
            newItems.push({
              ...item,
              cartId,
              quantity: qty,
              price: size.price,
              size: size.name,
              selectedOptions: preparedOptions,
            });
          }
        });
      } else {
        const qty = selectedQuantities.std || 0;
        if (qty > 0) {
          const optionsId = preparedOptions
            .map((o) => `${o.id}:${o.quantity || 1}`)
            .sort()
            .join("-");
          const cartId = `${item.id}-std-${optionsId}`;
          newItems.push({
            ...item,
            cartId,
            quantity: qty,
            price: item.price,
            size: null,
            selectedOptions: preparedOptions,
          });
        }
      }

      return [...rest, ...newItems];
    });
  };

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
    };
    const newOrder = await api.placeDeliveryOrder(orderData);
    if (newOrder.id) {
      setOrder(newOrder);
      setView("status");
      setCart([]);
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
      <main className="py-8 px-4">{renderView()}</main>
      <Footer />
    </div>
  );
}
