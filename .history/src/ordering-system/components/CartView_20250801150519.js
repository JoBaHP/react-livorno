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
function CustomizationModal({ item, onAddToCart, onClose }) {
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] || null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionToggle = (option) => {
    setSelectedOptions((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleAddToCart = () => {
    onAddToCart(item, selectedSize, selectedOptions);
  };

  let currentPrice = selectedSize
    ? parseFloat(selectedSize.price)
    : parseFloat(item.price || 0);
  selectedOptions.forEach(
    (opt) => (currentPrice += parseFloat(opt.price || 0))
  );

  const paidOptions = item.options.filter((o) => parseFloat(o.price) > 0);
  const freeOptions = item.options.filter((o) => parseFloat(o.price) === 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
        <p className="text-gray-600 mb-4">{item.description}</p>

        {item.sizes && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Size</h3>
            <div className="flex gap-2 flex-wrap">
              {item.sizes.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 text-sm rounded-full border-2 ${
                    selectedSize?.name === size.name
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-500"
                  }`}
                >
                  {size.name} - ${parseFloat(size.price).toFixed(2)}
                </button>
              ))}
            </div>
          </div>
        )}

        {paidOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Extras</h3>
            <div className="grid grid-cols-2 gap-2">
              {paidOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    onChange={() => handleOptionToggle(opt)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {opt.name} (+${parseFloat(opt.price).toFixed(2)})
                </label>
              ))}
            </div>
          </div>
        )}

        {freeOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Add-ons (Free)</h3>
            <div className="grid grid-cols-2 gap-2">
              {freeOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    onChange={() => handleOptionToggle(opt)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  {opt.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 flex items-center gap-2"
            >
              <Plus size={18} />
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
