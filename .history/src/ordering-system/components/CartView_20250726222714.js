import React from "react";
import { Plus, Minus, ShoppingCart, Send } from "lucide-react";

export default function CartView({
  cart,
  updateQuantity,
  total,
  placeOrder,
  isLoading,
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <ShoppingCart className="text-indigo-600" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Your Order</h3>
      </div>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.cartId}
              className="flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {item.name}{" "}
                  {item.size && (
                    <span className="text-sm text-gray-500">({item.size})</span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  ${parseFloat(item.price || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
          <div className="pt-4 border-t mt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={placeOrder}
            disabled={isLoading || cart.length === 0}
            className="w-full mt-4 bg-green-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            <Send size={20} />
            {isLoading ? "Sending..." : "Send Order to Kitchen"}
          </button>
        </div>
      )}
    </div>
  );
}
