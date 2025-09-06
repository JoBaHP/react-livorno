import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";
import { Send, ArrowLeft } from "lucide-react";

export default function DeliveryCheckout({
  cart,
  onPlaceOrder,
  onBackToMenu,
  updateQuantity,
}) {
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
      setError(err.message || "An error occurred.");
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
      <h1 className="headtext__cormorant text-center mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-black border border-golden p-6 rounded-lg">
          <h3
            className="p__cormorant text-2xl mb-4"
            style={{ color: "var(--color-golden)" }}
          >
            Your Information
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              value={customerDetails.name}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={customerDetails.phone}
              onChange={handleInputChange}
              required
            />
            <div className="relative">
              <FormInput
                label="Street"
                name="street"
                value={streetInput}
                onChange={handleStreetInputChange}
                onFocus={() => setIsSuggestionsVisible(true)}
                onBlur={() =>
                  setTimeout(() => setIsSuggestionsVisible(false), 200)
                }
                required
                placeholder="Type to search..."
                autoComplete="off"
              />
              {isSuggestionsVisible && streetSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-black border border-golden rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {streetSuggestions.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onMouseDown={() => handleSuggestionClick(s.name)}
                      className="block w-full text-left px-4 py-2 p__opensans hover:bg-gray-800"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <FormInput
              label="Street Number"
              name="number"
              value={customerDetails.number}
              onChange={handleInputChange}
              required
            />
            <FormInput
              label="Floor (optional)"
              name="floor"
              value={customerDetails.floor}
              onChange={handleInputChange}
            />
            <FormInput
              label="Apartment (optional)"
              name="flat"
              value={customerDetails.flat}
              onChange={handleInputChange}
            />
            <FormTextarea
              label="Order Notes (optional)"
              name="notes"
              value={customerDetails.notes}
              onChange={handleInputChange}
            />
            {error && (
              <p className="text-red-500 text-sm p-3 rounded-lg">{error}</p>
            )}
            <div className="pt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={onBackToMenu}
                className="custom__button bg-gray-800 text-white flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back to Menu
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="custom__button flex-1 flex items-center justify-center gap-2"
              >
                {isLoading ? "Placing Order..." : "Confirm & Place Order"}
              </button>
            </div>
          </form>
        </div>
        <div className="bg-black border border-golden p-6 rounded-lg">
          <h3
            className="p__cormorant text-2xl mb-4"
            style={{ color: "var(--color-golden)" }}
          >
            Order Summary
          </h3>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.cartId} className="p__opensans">
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
                  <ul
                    className="text-xs pl-5 list-disc mt-1"
                    style={{ color: "var(--color-grey)" }}
                  >
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
          <div className="mt-4 pt-4 border-t border-golden flex justify-between font-bold p__cormorant">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <p
            className="text-sm p__opensans mt-2"
            style={{ color: "var(--color-grey)" }}
          >
            Delivery fee will be calculated based on your address.
          </p>
        </div>
      </div>
    </div>
  );
}

const FormInput = ({ label, ...props }) => (
  <div>
    <label
      className="block text-sm font-medium p__opensans mb-1"
      style={{ color: "var(--color-grey)" }}
    >
      {label}
    </label>
    <input
      {...props}
      className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-golden rounded-md text-white p__opensans"
    />
  </div>
);

const FormTextarea = ({ label, ...props }) => (
  <div>
    <label
      className="block text-sm font-medium p__opensans mb-1"
      style={{ color: "var(--color-grey)" }}
    >
      {label}
    </label>
    <textarea
      {...props}
      rows="2"
      className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-golden rounded-md text-white p__opensans"
    ></textarea>
  </div>
);
