import React, { useState } from "react";
import { useApi } from "../ApiProvider";
import DeliveryMenu from "../components/delivery/DeliveryMenu";
import DeliveryCheckout from "../components/delivery/DeliveryCheckout";
import DeliveryStatus from "../components/delivery/DeliveryStatus";
import { Navbar } from "../components"; // Corrected: Named import for Navbar
import { Footer } from "../container"; // Corrected: Named import for Footer

export default function OnlineOrderingPage() {
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [view, setView] = useState("menu"); // 'menu', 'checkout', or 'status'
  const api = useApi();

  const addToCart = (item, size, selectedOptions) => {
    // This logic will need to be implemented, similar to your other ordering system.
    // For now, we'll just log it.
    console.log("Adding to cart:", { item, size, selectedOptions });
  };

  const placeDeliveryOrder = async (customerDetails) => {
    try {
      const newOrder = await api.placeDeliveryOrder(cart, customerDetails);
      setOrder(newOrder);
      setView("status");
      setCart([]);
    } catch (error) {
      console.error("Failed to place delivery order:", error);
      // You could show an error message to the user here.
    }
  };

  const renderView = () => {
    switch (view) {
      case "checkout":
        return (
          <DeliveryCheckout cart={cart} onPlaceOrder={placeDeliveryOrder} />
        );
      case "status":
        return <DeliveryStatus order={order} />;
      case "menu":
      default:
        // We are passing addToCart and a function to switch to the checkout view.
        return (
          <DeliveryMenu
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
