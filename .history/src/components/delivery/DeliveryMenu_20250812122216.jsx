import React from "react";

// This is a placeholder component. We will build this out later.
export default function DeliveryMenu({ onGoToCheckout }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Online Ordering Menu</h2>
      <p className="mb-4">Menu items will be displayed here.</p>
      <button
        onClick={onGoToCheckout}
        className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold"
      >
        Go to Checkout
      </button>
    </div>
  );
}
