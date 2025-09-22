import React from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/format';

export default function MenuItem({ item, onCustomize, onAddToCart }) {
  const { t } = useTranslation();
  const hasSizes = Array.isArray(item?.sizes) && item.sizes.length > 0;
  const hasOptions = Array.isArray(item?.options) && item.options.length > 0;
  const canQuickAddSize = hasSizes && !hasOptions;

  const primaryPrice = hasSizes
    ? formatCurrency(parseFloat(item.sizes?.[0]?.price || 0))
    : formatCurrency(parseFloat(item.price || 0));

  const handlePrimaryClick = () => {
    if (!item.available) return;
    if (hasOptions || (hasSizes && !canQuickAddSize)) {
      onCustomize();
    } else {
      onAddToCart(item, null, []);
    }
  };

  const handleQuickAdd = (size) => {
    if (!item.available) return;
    onAddToCart(item, size, []);
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
        {hasSizes && (
          <div className="mt-4">
            {canQuickAddSize ? (
              <div className="flex flex-wrap gap-2">
                {item.sizes.map((size) => {
                  const label = size?.name || t('customization.size');
                  return (
                    <button
                      key={`${label}-${size?.price}`}
                      type="button"
                      onClick={() => handleQuickAdd(size)}
                      disabled={!item.available}
                      className="flex items-center gap-2 rounded-full border border-[rgba(220,202,135,0.35)] px-3 py-1.5 text-sm font-semibold text-[var(--color-golden)] hover:border-[var(--color-golden)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{label}</span>
                      <span className="text-xs text-slate-500">
                        {formatCurrency(parseFloat(size?.price || 0))}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {item.sizes.map((size) => (
                  <div
                    key={`${size?.name}-${size?.price}`}
                    className="flex items-center justify-between rounded-lg border border-[rgba(220,202,135,0.15)] bg-white/5 px-3 py-2 text-sm text-[var(--color-muted)]"
                  >
                    <span>{size?.name || t('customization.size')}</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(size?.price || 0))}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {canQuickAddSize && (
              <button
                type="button"
                onClick={() => {
                  if (!item.available) return;
                  onCustomize();
                }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-golden)] hover:text-white"
              >
                <SlidersHorizontal size={14} /> {t('customize')}
              </button>
            )}
          </div>
        )}
        {(!hasSizes || hasOptions || !canQuickAddSize) && (
          <div className="flex justify-between items-center mt-4">
            {!hasSizes && (
              <span className="text-xl font-bold text-[var(--color-golden)]">
                {primaryPrice}
              </span>
            )}
            {(hasOptions || !canQuickAddSize) && (
              <button
                onClick={handlePrimaryClick}
                disabled={!item.available}
                className="ml-auto flex items-center gap-2 bg-[var(--color-golden)] text-[#0c0c0c] px-4 py-2 rounded-lg font-semibold hover:bg-[#f5efdb] transition-colors disabled:bg-slate-500/50 disabled:text-slate-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                {hasOptions || hasSizes ? t('customize') : t('add')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
