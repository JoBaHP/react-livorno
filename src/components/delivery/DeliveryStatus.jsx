import React, { useEffect, useRef } from "react";
import { CheckCircle, ChefHat, Truck, XCircle } from "lucide-react";
import { playNotificationSound } from "../../audio";

export default function DeliveryStatus({ order, onBackToMenu }) {
  const prevStatusRef = useRef();

  useEffect(() => {
    if (prevStatusRef.current && prevStatusRef.current !== order.status) {
      playNotificationSound();
    }
    prevStatusRef.current = order.status;
  }, [order.status]);

  const getStatusInfo = () => {
    const waitTimeDisplay = order?.wait_time || order?.waitTime;

    switch (order?.status) {
      case "pending":
        return {
          text: "Order Placed!",
          subtext: "We'll confirm it shortly.",
          icon: <CheckCircle size={64} />,
          color: "var(--color-golden)",
        };
      case "accepted":
        return {
          text: "Order Accepted!",
          subtext: `Estimated delivery: ${waitTimeDisplay || "..."} mins.`,
          icon: <ChefHat size={64} />,
          color: "var(--color-golden)",
        };
      case "preparing":
        return {
          text: "In the Kitchen!",
          subtext: `Estimated delivery: ${waitTimeDisplay || "..."} mins.`,
          icon: <ChefHat size={64} />,
          color: "var(--color-golden)",
        };
      case "ready":
        return {
          text: "Out for Delivery!",
          subtext: "Your order is on its way.",
          icon: <Truck size={64} />,
          color: "var(--color-golden)",
        };
      case "completed":
        return {
          text: "Order Delivered!",
          subtext: "Enjoy your meal!",
          icon: <CheckCircle size={64} />,
          color: "var(--color-golden)",
        };
      case "declined":
        return {
          text: "Order Declined",
          subtext: "Please contact us for details.",
          icon: <XCircle size={64} />,
          color: "#D0021B",
        }; // Using a distinct red for declined
      default:
        return {
          text: "Order Placed!",
          subtext: "We'll start preparing it right away.",
          icon: <CheckCircle size={64} />,
          color: "var(--color-golden)",
        };
    }
  };

  const { text, subtext, icon, color } = getStatusInfo();

  return (
    <div className="max-w-2xl mx-auto text-center bg-black border border-golden p-8 rounded-lg">
      <div className="flex flex-col items-center gap-4" style={{ color }}>
        <div className="animate-pulse">{icon}</div>
        <h1 className="headtext__cormorant">{text}</h1>
        <p className="p__opensans" style={{ color: "var(--color-grey)" }}>
          {subtext}
        </p>
        {order && (
          <p
            className="p__opensans text-sm"
            style={{ color: "var(--color-grey)" }}
          >
            Your order ID is #{order.id}
          </p>
        )}
      </div>
      <button onClick={onBackToMenu} className="custom__button mt-8">
        Back to Menu
      </button>
    </div>
  );
}
