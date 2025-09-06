import React from "react";
import { Plus } from "lucide-react";

export default function MenuItem({ item, onCustomize, onAddToCart }) {
  const hasCustomizations =
    item?.options?.length > 0 || item?.sizes?.length > 0;

  const handleClick = () => {
    if (hasCustomizations) {
      onCustomize();
    } else {
      onAddToCart(item, null, []);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg ${
        !item.available ? "opacity-60" : ""
      }`}
    >
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-40 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image+Not+Found";
          }}
        />
      )}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h4 className="text-lg font-bold text-slate-800">{item.name}</h4>
          <p className="text-sm text-slate-600 mt-1">{item.description}</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-extrabold text-slate-900">
            ${parseFloat(item.price || item.sizes?.[0]?.price || 0).toFixed(2)}
          </span>
          <button
            onClick={handleClick}
            disabled={!item.available}
            className="flex items-center gap-2 bg-amber-400 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-500 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            {hasCustomizations ? "Customize" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
