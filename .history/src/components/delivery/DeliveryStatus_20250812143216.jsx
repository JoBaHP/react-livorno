import React from "react";
import { CheckCircle } from "lucide-react";

export default function DeliveryStatus({ order }) {
  return (
    <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-2xl shadow-xl animate-fade-in">
      <div className="flex flex-col items-center gap-4 text-green-500">
        <CheckCircle size={64} className="animate-bounce" />
        <h2 className="text-3xl font-bold text-slate-800">
          Order Placed Successfully!
        </h2>
        {order ? (
          <p className="text-lg text-slate-600">
            Your order ID is #{order.id}. We'll start preparing it right away.
          </p>
        ) : (
          <p className="text-lg text-slate-600">
            We'll start preparing your order right away.
          </p>
        )}
      </div>
    </div>
  );
}
