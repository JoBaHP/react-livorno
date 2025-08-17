import React, { useState } from "react";
import {
  Plus,
  Minus,
  ShoppingCart,
  Send,
  StickyNote,
  CreditCard,
  DollarSign,
} from "lucide-react";

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
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <ShoppingCart className="text-amber-500" size={28} />
        <h3 className="text-2xl font-bold text-slate-800">Your Order</h3>
      </div>
      {cart.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 -mr-2">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="flex justify-between items-start"
              >
                <div className="flex-grow">
                  <p className="font-bold text-slate-800">
                    {item.name}{" "}
                    {item.size && (
                      <span className="text-sm text-slate-500 font-normal">
                        ({item.size})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600">
                    ${parseFloat(item.price || 0).toFixed(2)}
                  </p>
                  {item.selectedOptions?.length > 0 && (
                    <ul className="text-xs text-slate-500 pl-4 list-disc mt-1">
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
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartId, 1)}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t mt-4">
            <div className="flex justify-between items-center text-xl font-bold text-slate-800">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                <StickyNote size={16} /> Order Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., no onions, allergy info"
                className="w-full p-2 border border-slate-300 rounded-lg h-20 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Method
              </label>
              <div className="flex gap-2">
                <PaymentButton
                  selected={paymentMethod === "cash"}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <DollarSign size={16} /> Cash
                </PaymentButton>
                <PaymentButton
                  selected={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCard size={16} /> Card
                </PaymentButton>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isLoading || cart.length === 0}
            className="w-full mt-6 bg-green-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:shadow-inner shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Send size={20} />
            {isLoading ? "Sending..." : "Place Order"}
          </button>
        </>
      )}
    </div>
  );
}

const PaymentButton = ({ selected, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 p-2 border-2 rounded-lg transition-colors ${
      selected
        ? "bg-amber-100 border-amber-400 text-amber-800 font-semibold"
        : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
    }`}
  >
    {children}
  </button>
);
