import React, { useState } from "react";
import { Send } from "lucide-react";

export default function DeliveryCheckout({ cart, onPlaceOrder, onBackToMenu }) {
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await onPlaceOrder(customerDetails);
    } catch (err) {
      setError(err.message || "An error occurred while placing your order.");
      setIsLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => {
    let itemTotal = parseFloat(item.price || 0);
    if (item.selectedOptions) {
      item.selectedOptions.forEach((opt) => {
        itemTotal += parseFloat(opt.price || 0);
      });
    }
    return sum + itemTotal * item.quantity;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-4xl font-extrabold text-slate-800 text-center mb-8">
        Checkout
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-slate-700 mb-4">
            Your Information
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={customerDetails.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={customerDetails.phone}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Delivery Address
              </label>
              <textarea
                name="address"
                value={customerDetails.address}
                onChange={handleInputChange}
                required
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
              ></textarea>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="pt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={onBackToMenu}
                className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold"
              >
                Back to Menu
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:bg-slate-400"
              >
                <Send size={18} />{" "}
                {isLoading ? "Placing Order..." : "Confirm & Place Order"}
              </button>
            </div>
          </form>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-slate-700 mb-4">
            Order Summary
          </h3>
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="flex justify-between text-slate-600"
              >
                <span>
                  {item.quantity} x {item.name}
                </span>
                <span>
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between font-bold text-slate-800">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Delivery fee will be calculated based on your address.
          </p>
        </div>
      </div>
    </div>
  );
}
