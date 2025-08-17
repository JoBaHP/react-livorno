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
      className={`bg-white rounded-lg shadow transition-shadow hover:shadow-lg flex flex-col ${
        !item.available ? "bg-gray-50 opacity-60" : ""
      }`}
    >
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-40 object-cover rounded-t-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/600x400/CCCCCC/FFFFFF?text=Image+Not+Found";
          }}
        />
      )}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-semibold text-gray-900">
            ${parseFloat(item.price || item.sizes?.[0]?.price || 0).toFixed(2)}
          </span>
          <button
            onClick={handleClick}
            disabled={!item.available}
            className="flex items-center gap-2 bg-indigo-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            {hasCustomizations ? "Customize" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
