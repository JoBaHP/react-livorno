import React, { useState, useEffect } from "react";
import { useApi } from "../../ApiProvider";

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const api = useApi();

  useEffect(() => {
    api.getTables().then(setTables);
  }, [api]);

  const getQRCodeUrl = (tableId) => {
    // --- FIX ---
    // Construct the URL using the correct '/order' path instead of the current path.
    const baseUrl = `${window.location.origin}/order`;
    const fullUrl = `${baseUrl}?table=${tableId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      fullUrl
    )}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Table QR Codes</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables.map((table) => (
          <div key={table.id} className="text-center p-4 border rounded-lg">
            <h4 className="font-bold text-lg mb-2">Table {table.number}</h4>
            <img
              src={getQRCodeUrl(table.id)}
              alt={`QR Code for Table ${table.number}`}
              className="mx-auto"
            />
            <button
              onClick={() => window.print()}
              className="mt-4 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md"
            >
              Print
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
