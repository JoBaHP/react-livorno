import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ApiProvider } from "./ApiProvider";
import { AuthProvider } from "./AuthProvider";
import CustomerView from "./views/CustomerView";
import { UtensilsCrossed } from "lucide-react";

export default function OrderingSystem() {
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
        <div className="min-h-screen bg-brand-blue font-sans">
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-amber-400 p-2 rounded-full">
                  <UtensilsCrossed className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Ristorante
                </h1>
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
