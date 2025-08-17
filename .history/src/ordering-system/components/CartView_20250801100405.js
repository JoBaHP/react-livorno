import React, { useState } from "react";
import { Plus, Minus, ShoppingCart, Send } from "lucide-react";

export default function CartView({
  cart,
  updateQuantity,
  total,
  placeOrder,
  isLoading,
}) {
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handlePlaceOrder = () => {
    placeOrder(notes, paymentMethod);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <ShoppingCart className="text-indigo-600" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Your Order</h3>
      </div>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="flex justify-between items-start"
              >
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">
                    {item.name}{" "}
                    {item.size && (
                      <span className="text-sm text-gray-500">
                        ({item.size})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${parseFloat(item.price || 0).toFixed(2)}
                  </p>
                  {item.selectedOptions?.length > 0 && (
                    <ul className="text-xs text-gray-500 pl-4 list-disc mt-1">
                      {item.selectedOptions.map((opt) => (
                        <li key={opt.id}>
                          {opt.name} (+${parseFloat(opt.price).toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <button
                    onClick={() => updateQuantity(item.cartId, -1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartId, 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t mt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., no onions, allergy info"
              className="w-full p-2 border rounded-md h-20 text-sm"
            ></textarea>
          </div>
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded-md bg-white"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isLoading || cart.length === 0}
            className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            <Send size={20} />
            {isLoading ? "Sending..." : "Send Order to Kitchen"}
          </button>
        </>
      )}
    </div>
  );
}
