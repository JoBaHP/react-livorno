import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../ApiProvider";
import { formatCurrency } from "../../utils/format";
import { ArrowLeft, Plus, Minus } from "lucide-react";

// Helper function to load the address from localStorage
const getInitialDetails = () => {
  try {
    const storedDetails = localStorage.getItem("deliveryDetails");
    if (storedDetails) {
      return JSON.parse(storedDetails);
    }
  } catch (error) {
    console.error("Failed to parse delivery details from localStorage", error);
  }
  // Default empty state
  return {
    name: "",
    phone: "",
    street: "",
    number: "",
    floor: "",
    flat: "",
    notes: "",
  };
};

export default function DeliveryCheckout({ cart, onPlaceOrder, onBackToMenu, updateQuantity, updateOptionQuantity }) {
  const { t, i18n } = useTranslation();
  const [customerDetails, setCustomerDetails] = useState(getInitialDetails);
  const [streetInput, setStreetInput] = useState(customerDetails.street || "");
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const api = useApi();

  // Save customer details to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("deliveryDetails", JSON.stringify(customerDetails));
    } catch (error) {
      console.error("Could not save delivery details to localStorage:", error);
    }
  }, [customerDetails]);

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
      setError(err.message || t("place_order_error"));
      setIsLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => {
    const baseItemTotal = parseFloat(item.price || 0) * (item.quantity || 0);
    const optionsTotal = item.selectedOptions
      ? item.selectedOptions.reduce((optionSum, opt) => {
          const optionPrice = parseFloat(opt.price || 0);
          const optionQuantity = opt.quantity || 0;
          return optionSum + optionPrice * optionQuantity;
        }, 0)
      : 0;
    return sum + baseItemTotal + optionsTotal;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="headtext__cormorant text-center mb-8">{t("checkout")}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-black border border-golden p-6 rounded-lg">
          <h3 className="p__cormorant text-2xl mb-4" style={{ color: "var(--color-golden)" }}>
            {t("your_information")}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label={t("full_name")} name="name" value={customerDetails.name} onChange={handleInputChange} required />
            <FormInput label={t("phone_number")} name="phone" type="tel" value={customerDetails.phone} onChange={handleInputChange} required />
            <div className="relative">
              <FormInput
                label={t("street")}
                name="street"
                value={streetInput}
                onChange={handleStreetInputChange}
                onFocus={() => setIsSuggestionsVisible(true)}
                onBlur={() => setTimeout(() => setIsSuggestionsVisible(false), 200)}
                required
                placeholder={t("street_search_placeholder")}
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
            <FormInput label={t("street_number")} name="number" value={customerDetails.number} onChange={handleInputChange} required />
            <FormInput label={t("floor")} name="floor" value={customerDetails.floor} onChange={handleInputChange} />
            <FormInput label={t("apartment")} name="flat" value={customerDetails.flat} onChange={handleInputChange} />
            <FormTextarea label={t("order_notes")} name="notes" value={customerDetails.notes} onChange={handleInputChange} placeholder={t("order_notes_placeholder")} />
            {error && <p className="text-red-500 text-sm p-3 rounded-lg">{error}</p>}
            <div className="pt-4 flex items-center gap-4">
              <button type="button" onClick={onBackToMenu} className="custom__button bg-gray-800 text-white flex items-center gap-2">
                <ArrowLeft size={18} /> {t("back_to_menu")}
              </button>
              <button type="submit" disabled={isLoading} className="custom__button flex-1 flex items-center justify-center gap-2">
                {isLoading ? t("placing_order") : t("confirm_order")}
              </button>
            </div>
          </form>
        </div>
        <div className="bg-black border border-golden p-6 rounded-lg">
          <h3 className="p__cormorant text-2xl mb-4" style={{ color: "var(--color-golden)" }}>
            {t("order_summary")}
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.cartId} className="flex justify-between items-start p__opensans">
                <div className="flex-grow">
                  <p className="font-semibold">
                    {item.quantity} x {item.name} {item.size && `(${item.size})`}
                  </p>
                  {item.selectedOptions?.length > 0 && (
                    <ul className="text-xs pl-5 mt-1 space-y-1" style={{ color: "var(--color-grey)" }}>
                      {item.selectedOptions.map((opt) => (
                        <li key={opt.id} className="flex justify-between items-center">
                          <span>
                            {opt.name} {parseFloat(opt.price) > 0 && `( +${formatCurrency(parseFloat(opt.price), i18n.language)} )`}
                          </span>
                          {parseFloat(opt.price) > 0 && updateOptionQuantity && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateOptionQuantity(item.cartId, opt.id, -1)} className="custom__button !p-0 h-5 w-5 flex items-center justify-center">
                                <Minus size={10} />
                              </button>
                              <span className="p__cormorant text-sm w-5 text-center">{opt.quantity || 0}</span>
                              <button onClick={() => updateOptionQuantity(item.cartId, opt.id, 1)} className="custom__button !p-0 h-5 w-5 flex items-center justify-center">
                                <Plus size={10} />
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {updateQuantity && (
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <button onClick={() => updateQuantity(item.cartId, -1)} className="custom__button !p-0 h-8 w-8 flex items-center justify-center">
                      <Minus size={14} />
                    </button>
                    <span className="p__cormorant text-lg w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartId, 1)} className="custom__button !p-0 h-8 w-8 flex items-center justify-center">
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-golden flex justify-between font-bold p__cormorant">
            <span>{t("subtotal")}</span>
            <span>{formatCurrency(subtotal, i18n.language)}</span>
          </div>
          <p className="text-sm p__opensans mt-2" style={{ color: "var(--color-grey)" }}>
            {t("delivery_fee_info")}
          </p>
        </div>
      </div>
    </div>
  );
}

const FormInput = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium p__opensans mb-1" style={{ color: "var(--color-grey)" }}>
      {label}
    </label>
    <input {...props} className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-golden rounded-md text-white p__opensans" />
  </div>
);

const FormTextarea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium p__opensans mb-1" style={{ color: "var(--color-grey)" }}>
      {label}
    </label>
    <textarea {...props} rows="2" className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-golden rounded-md text-white p__opensans"></textarea>
  </div>
);
