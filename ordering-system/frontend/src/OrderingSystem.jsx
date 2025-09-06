import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ApiProvider } from "./ApiProvider";
import { AuthProvider } from "./AuthProvider";
import CustomerView from "./views/CustomerView";
import { UtensilsCrossed } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function OrderingSystem() {
  const { t } = useTranslation();
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
    <ApiProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 font-sans">
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-amber-400 p-2 rounded-full">
                  <UtensilsCrossed className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{t('app_title')}</h1>
              </div>
              <div className="flex items-center gap-2">
                <LangButton code="en" label="EN" />
                <LangButton code="sr" label="SR" />
              </div>
            </nav>
          </header>
          <main className="container mx-auto p-4 sm:px-6 lg:px-8">
            <CustomerView tableId={tableId} />
          </main>
        </div>
      </AuthProvider>
    </ApiProvider>
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
