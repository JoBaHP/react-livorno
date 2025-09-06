import React from "react";
import { CheckCircle, ChefHat, Truck, XCircle } from "lucide-react";

export default function DeliveryStatus({ order, onBackToMenu }) {
  const getStatusInfo = () => {
    const waitTimeDisplay = order?.wait_time || order?.waitTime;

    switch (order?.status) {
      case "pending":
        return {
          text: "Order Placed Successfully!",
          subtext: "We've received your order and will confirm it shortly.",
          icon: <CheckCircle size={48} />,
          color: "text-green-500",
        };
      case "accepted":
        return {
          text: "Your Order is Accepted!",
          subtext: `Estimated delivery time is ${
            waitTimeDisplay || "..."
          } minutes.`,
          icon: <ChefHat size={48} />,
          color: "text-blue-500",
        };
      case "preparing":
        return {
          text: "Your Food is Being Prepared!",
          subtext: `Estimated delivery time is ${
            waitTimeDisplay || "..."
          } minutes.`,
          icon: <ChefHat size={48} />,
          color: "text-yellow-500",
        };
      case "ready": // Assuming 'ready' means it's out for delivery
        return {
          text: "Out for Delivery!",
          subtext: "Your order is on its way to you.",
          icon: <Truck size={48} />,
          color: "text-indigo-500",
        };
      case "completed":
        return {
          text: "Order Delivered!",
          subtext: "Enjoy your meal!",
          icon: <CheckCircle size={48} />,
          color: "text-green-500",
        };
      case "declined":
        return {
          text: "Order Declined",
          subtext:
            "There was an issue with your order. Please contact us for more information.",
          icon: <XCircle size={48} />,
          color: "text-red-500",
        };
      default:
        return {
          text: "Order Placed Successfully!",
          subtext: "We'll start preparing it right away.",
          icon: <CheckCircle size={48} />,
          color: "text-green-500",
        };
    }
  };

  const { text, subtext, icon, color } = getStatusInfo();

  return (
    <div className="max-w-2xl mx-auto text-center bg-black border border-golden p-8 rounded-lg">
      <div className="flex flex-col items-center gap-4 text-green-500">
        <CheckCircle size={64} className="animate-bounce" />
        <h1 className="headtext__cormorant">Order Placed!</h1>
        {order ? (
          <p className="p__opensans" style={{ color: "var(--color-grey)" }}>
            Your order ID is #{order.id}. We'll start preparing it right away.
          </p>
        ) : (
          <p className="p__opensans" style={{ color: "var(--color-grey)" }}>
            We'll start preparing your order right away.
          </p>
        )}
      </div>
      <button onClick={onBackToMenu} className="custom__button mt-8">
        Back to Menu
      </button>
    </div>
  );
}
