import React from "react";
import { CheckCircle, ChefHat, Truck, XCircle } from "lucide-react";

export default function DeliveryStatus({ order }) {
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
    <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-2xl shadow-xl animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className={`${color} animate-pulse`}>{icon}</div>
        <h2 className="text-3xl font-bold text-slate-800">{text}</h2>
        <p className="text-lg text-slate-600">{subtext}</p>
        {order && (
          <p className="text-sm text-slate-500 mt-4">
            Your order ID is #{order.id}
          </p>
        )}
      </div>
    </div>
  );
}
