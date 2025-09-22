import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CustomerView from "./views/CustomerView";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectCartItemCount, selectCurrentOrder } from './store';

export default function OrderingSystem() {
  const { t } = useTranslation();
  const cartCount = useSelector(selectCartItemCount);
  const currentOrder = useSelector(selectCurrentOrder);
  const [tableId, setTableId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const table = urlParams.get("table");
    if (table) {
      setTableId(parseInt(table, 10));
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/livorno-logo.png"
              alt={t('app_title')}
              className="h-10 w-auto"
            />
            <span className="sr-only">{t('app_title')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LangButton code="en" label="EN" />
            <LangButton code="sr" label="SR" />
            {!currentOrder && <CartBadge count={cartCount} />}
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-4 sm:px-6 lg:px-8">
        <CustomerView tableId={tableId} />
      </main>
    </div>
  );
}

function LangButton({ code, label }) {
  const { i18n } = useTranslation();
  const active = i18n.language?.startsWith(code);
  return (
    <button
      onClick={() => i18n.changeLanguage(code)}
      className={`px-2 py-1 rounded-md border ${active ? 'bg-amber-400 text-white border-amber-400' : 'border-slate-400 text-slate-700'}`}
      aria-label={`Switch to ${label}`}
    >
      {label}
    </button>
  );
}

function CartBadge({ count }) {
  if (!count) return null;
  return (
    <div
      className="relative cursor-pointer select-none"
      aria-label={`Items in cart: ${count}`}
      role="button"
      onClick={() => {
        const el = document.getElementById('cart-panel');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
    >
      <ShoppingCart size={22} className="text-slate-700" />
      <span
        className="absolute -top-2 -right-2 min-w-5 h-5 px-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-amber-500 text-white"
      >
        {count}
      </span>
    </div>
  );
}
