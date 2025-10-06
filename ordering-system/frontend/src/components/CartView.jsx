import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/format";
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
  const { t } = useTranslation();
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const handlePlaceOrder = () => {
    placeOrder(notes, paymentMethod);
  };

  return (
    <div className="bg-[var(--color-panel)]/85 border border-[var(--color-border)] rounded-3xl shadow-xl shadow-black/30 p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="text-[var(--color-golden)]" size={26} />
        <h3 className="text-3xl text-[var(--color-golden)]">
          {t("your_order")}
        </h3>
      </div>
      {cart.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] text-center py-8 uppercase tracking-[0.3em]">
          {t("empty_cart")}
        </p>
      ) : (
        <>
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="flex justify-between items-start bg-white/5 border border-[var(--color-border)] rounded-2xl px-4 py-3"
              >
                <div className="flex-grow">
                  <p className="font-bold text-slate-300">
                    {item.name}{" "}
                    {item.size && (
                      <span className="text-sm text-slate-500 font-normal">
                        ({item.size})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {formatCurrency(parseFloat(item.price || 0))}
                  </p>
                  {item.selectedOptions?.length > 0 && (
                    <ul className="text-xs text-[var(--color-muted)] pl-4 list-disc mt-1">
                      {item.selectedOptions.map((opt) => (
                        <li key={opt.id}>
                          {opt.name} (+{formatCurrency(parseFloat(opt.price))})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button
                    onClick={() => updateQuantity(item, -1)}
                    className="p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-golden)] hover:bg-white/10"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-[var(--color-golden)] text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item, 1)}
                    className="p-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-golden)] hover:bg-white/10"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-[var(--color-border)] mt-5">
            <div className="flex justify-between items-center text-xl font-bold text-[var(--color-golden)]">
              <span className="font-heading">{t("total")}</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-[var(--color-border)] space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-golden)] mb-1">
                <StickyNote size={16} /> {t("order_notes")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("notes_placeholder")}
                className="w-full p-3 border border-[var(--color-border)] rounded-xl h-20 text-sm bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-golden)]"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-golden)] mb-1">
                {t("payment_method")}
              </label>
              <div className="flex gap-2">
                <PaymentButton
                  selected={paymentMethod === "cash"}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <DollarSign size={16} /> {t("cash")}
                </PaymentButton>
                <PaymentButton
                  selected={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCard size={16} /> {t("card")}
                </PaymentButton>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isLoading || cart.length === 0}
            className="w-full mt-6 bg-[var(--color-golden)] text-[#0c0c0c] py-3 rounded-xl font-bold text-lg tracking-wide hover:bg-[#f5efdb] transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-slate-500/60 disabled:text-slate-300 disabled:shadow-inner shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            <Send size={20} />
            {isLoading ? t("sending") : t("place_order")}
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
        ? "bg-[var(--color-golden)] border-[var(--color-golden)] text-[#0c0c0c] font-semibold"
        : "bg-transparent border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-golden)]"
    }`}
  >
    {children}
  </button>
);
