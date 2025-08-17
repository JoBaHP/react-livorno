import React from "react";
import { Plus } from "lucide-react";

export default function MenuItem({ item, onCustomize }) {
  const handleClick = () => {
    // This button's only job is to call the onCustomize function,
    // which tells CustomerView to open the modal.
    onCustomize();
  };

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow transition-shadow hover:shadow-lg flex flex-col justify-between ${
        !item.available ? "bg-gray-50 opacity-60" : ""
      }`}
    >
      <div>
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
          {(item.options && item.options.length > 0) ||
          (item.sizes && item.sizes.length > 0)
            ? "Customize"
            : "Add"}
        </button>
      </div>
    </div>
  );
}
