import React from "react";
import { Plus } from "lucide-react";

export default function MenuItem({
  item,
  onCustomize,
  onAddToCart,
  quantityInCart,
}) {
  const hasCustomizations =
    (item.options && item.options.length > 0) ||
    (item.sizes && item.sizes.length > 0);

  const handleClick = () => {
    if (hasCustomizations) {
      onCustomize();
    } else {
      onAddToCart(item, null, []);
    }
  };

  return (
    <div
      className={`bg-black border border-golden rounded-lg flex flex-col ${
        !item.available ? "opacity-60" : ""
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
              "https://placehold.co/600x400/545454/FFFFFF?text=Image+Not+Found";
          }}
        />
      )}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h4 className="p__cormorant" style={{ color: "var(--color-golden)" }}>
            {item.name}
          </h4>
          <p
            className="p__opensans text-sm mt-1"
            style={{ color: "var(--color-grey)" }}
          >
            {item.description}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="p__cormorant text-xl">
            ${parseFloat(item.price || item.sizes?.[0]?.price || 0).toFixed(2)}
          </span>
          <button
            onClick={handleClick}
            disabled={!item.available}
            className="custom__button relative"
          >
            <span className="flex items-center gap-2">
              <Plus size={16} />
              {hasCustomizations ? "Customize" : "Add"}
            </span>
            {quantityInCart > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                {quantityInCart}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
