import React from "react";
import { Plus } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/format';

export default function MenuItem({ item, onCustomize, onAddToCart }) {
  const { t } = useTranslation();
  const hasSizes = Array.isArray(item?.sizes) && item.sizes.length > 0;
  const hasOptions = Array.isArray(item?.options) && item.options.length > 0;
  const hasCustomizations = hasSizes || hasOptions;

  const primaryPrice = formatCurrency(
    parseFloat(item?.price ?? item?.sizes?.[0]?.price ?? 0)
  );

  const handleClick = () => {
    if (!item.available) return;
    if (hasCustomizations) {
      onCustomize();
    } else {
      onAddToCart(item, null, []);
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#12171d] to-[#151b22] rounded-2xl border border-[var(--color-border)] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] ${
        !item.available ? "opacity-60" : ""
      }`}
    >
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-44 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(t('image_not_found'))}`;
          }}
        />
      )}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <h4 className="text-2xl text-[var(--color-golden)]">{item.name}</h4>
          <p className="text-sm text-[var(--color-muted)] mt-1">{item.description}</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-[var(--color-golden)]">
            {primaryPrice}
          </span>
          <button
            onClick={handleClick}
            disabled={!item.available}
            className="ml-auto flex items-center gap-2 bg-[var(--color-golden)] text-[#0c0c0c] px-4 py-2 rounded-lg font-semibold hover:bg-[#f5efdb] transition-colors disabled:bg-slate-500/50 disabled:text-slate-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            {hasCustomizations ? t('customize') : t('add')}
          </button>
        </div>
      </div>
    </div>
  );
}
