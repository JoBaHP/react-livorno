import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ApiProvider } from "./ordering-system/ApiProvider";
import { AuthProvider } from "./ordering-system/AuthProvider";
import CustomerView from "./ordering-system/views/CustomerView";
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
        <div className="min-h-screen bg-gray-100 font-sans">
          <header className="bg-white shadow-md sticky top-0 z-40">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="text-indigo-600" size={28} />
                <h1 className="text-2xl font-bold text-gray-800">TableOrder</h1>
              </div>
            </nav>
          </header>
          <main className="container mx-auto p-4 md:p-6">
            <CustomerView tableId={tableId} />
          </main>
        </div>
      </AuthProvider>
    </ApiProvider>
  );
}
