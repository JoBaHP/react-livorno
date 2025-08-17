import React from "react";

// This is a placeholder component.
export default function DeliveryStatus({ order }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Order Status</h2>
      {order ? (
        <p>Your order #{order.id} has been placed!</p>
      ) : (
        <p>Loading order status...</p>
      )}
    </div>
  );
}
