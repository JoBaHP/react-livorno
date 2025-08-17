import React, { useState } from "react";
import { useApi } from "../../ordering-system/frontend/src/ApiProvider"; // Assuming ApiProvider is accessible
import DeliveryMenu from "../components/delivery/DeliveryMenu";
import DeliveryCheckout from "../components/delivery/DeliveryCheckout";
import DeliveryStatus from "../components/delivery/DeliveryStatus";
import { Navbar } from "../components";
import { Footer } from "../container";

export default function OnlineOrderingPage() {
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [view, setView] = useState("menu"); // 'menu', 'checkout', or 'status'
  const api = useApi();

  const addToCart = (item, size, selectedOptions) => {
    // ... (logic to add items to cart, similar to CustomerView)
  };

  const placeDeliveryOrder = async (customerDetails) => {
    const newOrder = await api.placeDeliveryOrder(cart, customerDetails);
    setOrder(newOrder);
    setView("status");
    setCart([]);
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
      <main className="container mx-auto py-8">{renderView()}</main>
      <Footer />
    </div>
  );
}
