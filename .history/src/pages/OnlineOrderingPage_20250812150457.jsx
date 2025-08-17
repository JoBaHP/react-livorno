import React, { useState } from "react";
import { useApi } from "../ApiProvider";
import DeliveryMenu from "../components/delivery/DeliveryMenu";
import DeliveryCheckout from "../components/delivery/DeliveryCheckout";
import DeliveryStatus from "../components/delivery/DeliveryStatus";
import { Navbar } from "../components";
import { Footer } from "../container";

export default function OnlineOrderingPage() {
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [view, setView] = useState("menu");
  const api = useApi();

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

  const placeDeliveryOrder = async (customerDetails) => {
    const orderData = {
      cart,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: customerDetails.address,
      paymentMethod: "cash", // This can be updated later
      notes: "", // This can be updated later
    };
    const newOrder = await api.placeDeliveryOrder(orderData);
    if (newOrder.id) {
      setOrder(newOrder);
      setView("status");
      setCart([]);
    } else {
      // This will pass the error message to the checkout component
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
          />
        );
    }
  };

  return (
    <div>
      <Navbar />
      <main className="container mx-auto py-8 px-4">{renderView()}</main>
      <Footer />
    </div>
  );
}
