import React from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/format";

export default function MenuItem({ item, onCustomize, onAddToCart }) {
  const { t } = useTranslation();
  const hasSizes = Array.isArray(item?.sizes) && item.sizes.length > 0;
  const hasOptions = Array.isArray(item?.options) && item.options.length > 0;
  const hasCustomizations = hasSizes || hasOptions;

  const handleClick = () => {
    if (!item.available) return;
    if (hasCustomizations) {
      onCustomize();
    } else {
      onAddToCart(item, null, []);
    }
  };

  const primaryPrice = formatCurrency(
    parseFloat(item?.price ?? item?.sizes?.[0]?.price ?? 0)
  );

  const sizeLabel = hasCustomizations ? t("customize") : t("add");

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!item.available}
      className={`group relative isolate flex flex-col md:flex-row items-center md:items-stretch gap-5 bg-white border border-slate-200 rounded-[28px] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] text-left disabled:cursor-not-allowed ${
        !item.available ? "opacity-50" : ""
      }`}
    >
      <div className="flex-1 w-full px-5 py-5 md:px-7 md:py-6">
        <h4 className="text-lg md:text-xl font-semibold text-slate-900">
          {item.name}
        </h4>
        {item.description && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-3">
            {item.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-base md:text-lg font-semibold text-sky-600">
            {primaryPrice}
          </span>
        </div>
      </div>

      <div className="md:pr-7 md:pl-0 px-5 pb-5 md:pb-0 md:py-6 flex items-center gap-5">
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-slate-50 shadow-inner overflow-hidden flex items-center justify-center">
            <img
              src={
                item.image_url ||
                "https://placehold.co/200x200/eff6ff/bcd0f7?text=Menu"
              }
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/200x200/eff6ff/bcd0f7?text=Menu";
              }}
            />
          </div>
          <span
            className="pointer-events-none absolute -bottom-2 -right-2 md:-top-2 md:-right-2 rounded-full bg-sky-500 text-white shadow-lg group-hover:bg-sky-600 transition-colors w-12 h-12 md:w-14 md:h-14 flex items-center justify-center"
          >
            <Plus size={20} />
            <span className="sr-only">{sizeLabel}</span>
          </span>
        </div>
      </div>
    </button>
  );
}
