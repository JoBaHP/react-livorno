import React, { useState } from "react";
import { Plus } from "lucide-react";

export default function MenuItem({ item, addToCart }) {
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0] || null);

  const handleAddToCart = () => {
    if (!item.available) return;
    addToCart(item, selectedSize);
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
      {item.sizes && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {item.sizes.map((size) => (
            <button
              key={size.name}
              onClick={() => setSelectedSize(size)}
              className={`px-3 py-1 text-sm rounded-full border-2 ${
                selectedSize?.name === size.name
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-500"
              }`}
            >
              {size.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <span className="text-lg font-semibold text-gray-900">
          ${(selectedSize ? selectedSize.price : item.price || 0).toFixed(2)}
        </span>
        <button
          onClick={handleAddToCart}
          disabled={!item.available}
          className="flex items-center gap-2 bg-indigo-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          {item.available ? "Add" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
