import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";
import { Send, ArrowLeft } from "lucide-react";

export default function DeliveryCheckout({ cart, onPlaceOrder, onBackToMenu }) {
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    street: "",
    number: "",
    floor: "",
    flat: "",
    notes: "",
  });
  const [streetInput, setStreetInput] = useState("");
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const api = useApi();

  useEffect(() => {
    if (streetInput.length < 2) {
      setStreetSuggestions([]);
      return;
    }
    const handler = setTimeout(() => {
      api.searchStreets(streetInput).then(setStreetSuggestions);
    }, 300);
    return () => clearTimeout(handler);
  }, [streetInput, api]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleStreetInputChange = (e) => {
    setStreetInput(e.target.value);
    setCustomerDetails((prev) => ({ ...prev, street: e.target.value }));
    setIsSuggestionsVisible(true);
  };

  const handleSuggestionClick = (streetName) => {
    setStreetInput(streetName);
    setCustomerDetails((prev) => ({ ...prev, street: streetName }));
    setIsSuggestionsVisible(false);
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
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-4xl font-extrabold text-slate-800 text-center mb-8">
        Checkout
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
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
                className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400"
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
                className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-600">
                  Street
                </label>
                <input
                  type="text"
                  name="street"
                  value={streetInput}
                  onChange={handleStreetInputChange}
                  onFocus={() => setIsSuggestionsVisible(true)}
                  onBlur={() =>
                    setTimeout(() => setIsSuggestionsVisible(false), 200)
                  }
                  required
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-400"
                  placeholder="Type to search..."
                  autoComplete="off"
                />
                {isSuggestionsVisible && streetSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {streetSuggestions.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onMouseDown={() => handleSuggestionClick(s.name)}
                        className="block w-full text-left px-4 py-2 hover:bg-slate-100"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">
                  Street Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={customerDetails.number}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">
                  Floor (optional)
                </label>
                <input
                  type="text"
                  name="floor"
                  value={customerDetails.floor}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">
                  Apartment (optional)
                </label>
                <input
                  type="text"
                  name="flat"
                  value={customerDetails.flat}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600">
                Order Notes (optional)
              </label>
              <textarea
                name="notes"
                value={customerDetails.notes}
                onChange={handleInputChange}
                rows="2"
                className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400"
                placeholder="e.g., no onions, allergy info"
              ></textarea>
            </div>
            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}
            <div className="pt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={onBackToMenu}
                className="flex items-center justify-center gap-2 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                <ArrowLeft size={18} /> Back to Menu
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:bg-slate-400 disabled:shadow-inner"
              >
                <Send size={18} />{" "}
                {isLoading ? "Placing Order..." : "Confirm & Place Order"}
              </button>
            </div>
          </form>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-700 mb-4">
            Order Summary
          </h3>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.cartId} className="text-slate-600">
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {item.quantity} x {item.name}{" "}
                    {item.size && `(${item.size})`}
                  </span>
                  <span>
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
                {item.selectedOptions?.length > 0 && (
                  <ul className="text-xs text-slate-500 pl-5 list-disc mt-1">
                    {item.selectedOptions.map((opt) => (
                      <li key={opt.id}>
                        {opt.name} (+${parseFloat(opt.price).toFixed(2)})
                      </li>
                    ))}
                  </ul>
                )}
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
