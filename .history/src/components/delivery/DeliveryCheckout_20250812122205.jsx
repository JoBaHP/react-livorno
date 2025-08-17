import React from "react";

// This is a placeholder component.
export default function DeliveryCheckout({ onPlaceOrder }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Checkout</h2>
      <p className="mb-4">
        Cart summary and customer details form will be here.
      </p>
      <button
        onClick={() =>
          onPlaceOrder({
            name: "Test Customer",
            phone: "123",
            address: "123 Test St",
          })
        }
        className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold"
      >
        Place Order
      </button>
    </div>
  );
}
