import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../ApiProvider";
import MenuItem from "../MenuItem";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { getParentIcon } from "../../utils/parentIcons";
import { formatCurrency } from "../../utils/format";
import { useQuery } from "@tanstack/react-query";

export default function DeliveryMenu({
  cart = [],
  addToCart,
  onViewCart,
  updateQuantity,
  updateCartForItem,
}) {
  const { t } = useTranslation();
  const api = useApi();
  const { data: rawMenu, isLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: () => api.getMenu(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
  const { data: rawCategoriesInfo } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: () => api.getMenuCategories(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  const [cachedMenu, setCachedMenu] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("cached_delivery_menu");
      const parsed = JSON.parse(raw || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [cachedCategories, setCachedCategories] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("cached_delivery_menu_categories");
      const parsed = JSON.parse(raw || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const menu = useMemo(() => {
    if (Array.isArray(rawMenu)) return rawMenu;
    if (rawMenu && Array.isArray(rawMenu.items)) return rawMenu.items;
    if (cachedMenu.length) return cachedMenu;
    return [];
  }, [rawMenu, cachedMenu]);

  const categoriesInfo = useMemo(() => {
    if (Array.isArray(rawCategoriesInfo)) return rawCategoriesInfo;
    if (rawCategoriesInfo && Array.isArray(rawCategoriesInfo.categories)) {
      return rawCategoriesInfo.categories;
    }
    if (cachedCategories.length) return cachedCategories;
    return [];
  }, [rawCategoriesInfo, cachedCategories]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [activeCategory, setActiveCategory] = useState("__all__");
  const [customizingItem, setCustomizingItem] = useState(null);
  // Derive categories without hard-coding order.
  // Priority:
  // 1) If REACT_APP_CATEGORY_ORDER is set (comma-separated), use that.
  // 2) If items provide numeric `category_order`, sort by that.
  // 3) Otherwise, keep first-appearance order from the menu data.
  const categories = useMemo(() => {
    const firstSeenIndex = new Map();
    const numericOrder = new Map();
    const list = [];
    menu.forEach((item, idx) => {
      if (!firstSeenIndex.has(item.category)) {
        firstSeenIndex.set(item.category, idx);
        list.push(item.category);
      }
      const ord = item?.category_order;
      if (typeof ord === 'number') {
        numericOrder.set(
          item.category,
          Math.min(numericOrder.get(item.category) ?? ord, ord)
        );
      }
    });

    const env = (import.meta.env.VITE_CATEGORY_ORDER || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (env.length) {
      list.sort((a, b) => {
        const ia = env.indexOf(a);
        const ib = env.indexOf(b);
        const da = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
        const db = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
        if (da !== db) return da - db;
        return (firstSeenIndex.get(a) ?? 0) - (firstSeenIndex.get(b) ?? 0);
      });
      return list;
    }

    if (numericOrder.size) {
      list.sort((a, b) => {
        const oa = numericOrder.get(a) ?? Number.MAX_SAFE_INTEGER;
        const ob = numericOrder.get(b) ?? Number.MAX_SAFE_INTEGER;
        if (oa !== ob) return oa - ob;
        return (firstSeenIndex.get(a) ?? 0) - (firstSeenIndex.get(b) ?? 0);
      });
    }
    return list;
  }, [menu]);

  const parentKeys = useMemo(() => {
    const set = new Set();
    (categoriesInfo || []).forEach((c) => set.add(c.parentKey || "food"));
    if (set.size === 0) {
      set.add("food");
      set.add("drinks");
    }
    return Array.from(set);
  }, [categoriesInfo]);

  const categoryToParent = useMemo(() => {
    const m = new Map();
    (categoriesInfo || []).forEach((c) => m.set(c.name, c.parentKey || "food"));
    return m;
  }, [categoriesInfo]);

  const grouped = useMemo(
    () =>
      parentKeys.map((key) => ({
        key,
        label: t(
          `category_parent.${key}`,
          key.charAt(0).toUpperCase() + key.slice(1)
        ),
        categories: categories.filter(
          (cat) => (categoryToParent.get(cat) || "food") === key
        ),
      })),
    [parentKeys, categories, categoryToParent, t]
  );

  const categoriesForSelectedParent = useMemo(() => {
    if (!selectedParent) return [];
    const group = grouped.find((g) => g.key === selectedParent);
    return group?.categories || [];
  }, [grouped, selectedParent]);

  useEffect(() => {
    if (!menu.length) return;
    setCachedMenu(menu);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('cached_delivery_menu', JSON.stringify(menu));
      } catch (err) {
        console.warn('Failed to cache delivery menu', err);
      }
    }
  }, [menu]);

  useEffect(() => {
    if (!categoriesInfo.length) return;
    setCachedCategories(categoriesInfo);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('cached_delivery_menu_categories', JSON.stringify(categoriesInfo));
      } catch (err) {
        console.warn('Failed to cache delivery categories', err);
      }
    }
  }, [categoriesInfo]);

  useEffect(() => {
    if (!grouped.length) {
      setSelectedParent(null);
      return;
    }
    setSelectedParent((prev) => {
      if (prev && grouped.some((pg) => pg.key === prev)) {
        return prev;
      }
      return grouped[0].key;
    });
  }, [grouped]);

  useEffect(() => {
    if (!categoriesForSelectedParent.length) {
      setActiveCategory("__all__");
      return;
    }
    setActiveCategory((prev) => {
      if (prev === "__all__") return prev;
      return categoriesForSelectedParent.includes(prev)
        ? prev
        : categoriesForSelectedParent[0];
    });
  }, [categoriesForSelectedParent]);

  const categoriesToDisplay = useMemo(() => {
    if (!selectedParent) return [];
    if (!categoriesForSelectedParent.length) return [];
    if (activeCategory === "__all__") {
      return categoriesForSelectedParent;
    }
    return categoriesForSelectedParent.includes(activeCategory)
      ? [activeCategory]
      : categoriesForSelectedParent;
  }, [activeCategory, categoriesForSelectedParent, selectedParent]);

  const hasParentGroups = parentKeys.length > 0;

  const getQuantityInCart = (menuItemId) => {
    return cart
      .filter((item) => item.id === menuItemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="headtext__cormorant">{t("order_for_delivery")}</h1>
        <p
          className="p__opensans"
          style={{ color: "var(--color-grey)", marginTop: "1rem" }}
        >
          {t("delivery_description")}
        </p>
      </div>
      {isLoading ? (
        <p className="p__opensans text-center">{t("loading_menu")}</p>
      ) : (
        <div className="space-y-6">
          {hasParentGroups && (
            <div className="overflow-x-auto">
              <div className="flex items-center gap-3 sm:gap-4">
                {grouped.map(({ key, label }) => {
                  const isActive = selectedParent === key;
                  const Icon = getParentIcon(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedParent(key);
                        setActiveCategory("__all__");
                      }}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-wide uppercase transition-all ${
                        isActive
                          ? "bg-[var(--color-golden)] text-[#0c0c0c] border-[var(--color-golden)] shadow"
                          : "border-[rgba(220,202,135,0.35)] text-[var(--color-golden)] hover:border-[var(--color-golden)]"
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedParent && categoriesForSelectedParent.length > 0 && (
            <div className="space-y-6">
              {categoriesForSelectedParent.length > 0 && (
                <div className="overflow-x-auto">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {categoriesForSelectedParent.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setActiveCategory("__all__")}
                        className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition ${
                          activeCategory === "__all__"
                            ? "bg-white text-[#0c0c0c]"
                            : "bg-white/10 border border-[var(--color-border)] text-[var(--color-golden)] hover:bg-white/15"
                        }`}
                      >
                        {t("menu.all", "All")}
                      </button>
                    )}
                    {categoriesForSelectedParent.map((category) => {
                      const isActive = activeCategory === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition ${
                            isActive
                              ? "bg-white text-[#0c0c0c]"
                              : "bg-white/10 border border-[var(--color-border)] text-[var(--color-golden)] hover:bg-white/15"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-10">
                {categoriesToDisplay.map((category) => {
                  const itemsForCategory = menu.filter(
                    (item) => item.category === category
                  );
                  if (itemsForCategory.length === 0) return null;
                  return (
                    <section key={category} className="space-y-4">
                      <header className="flex items-baseline justify-between">
                        <h3
                          className="p__cormorant text-2xl"
                          style={{ color: "var(--color-golden)" }}
                        >
                          {category}
                        </h3>
                      </header>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {itemsForCategory.map((item) => (
                          <MenuItem
                            key={item.id}
                            item={item}
                            onCustomize={() => setCustomizingItem(item)}
                            onAddToCart={addToCart}
                            updateQuantity={updateQuantity}
                            quantityInCart={getQuantityInCart(item.id)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}

          {!hasParentGroups && (
            <div className="space-y-10">
              {categories.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  {t("no_items")}
                </p>
              ) : (
                categories.map((category) => {
                  const key = category || "__uncategorized__";
                  const label = category || t("menu.uncategorized", "Uncategorized");
                  const itemsForCategory = menu.filter((item) =>
                    category ? item.category === category : !item.category
                  );
                  if (itemsForCategory.length === 0) return null;
                  return (
                    <section key={key} className="space-y-4">
                      <h3
                        className="p__cormorant text-2xl"
                        style={{ color: "var(--color-golden)" }}
                      >
                        {label}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {itemsForCategory.map((item) => (
                          <MenuItem
                            key={item.id}
                            item={item}
                            onCustomize={() => setCustomizingItem(item)}
                            onAddToCart={addToCart}
                            updateQuantity={updateQuantity}
                            quantityInCart={getQuantityInCart(item.id)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
      {customizingItem && (
        <CustomizationModal
          item={customizingItem}
          cart={cart}
          onUpdateCart={updateCartForItem}
          onClose={() => setCustomizingItem(null)}
        />
      )}
      {cartItemCount > 0 && (
        <div className="sticky bottom-4 w-full flex justify-center">
          <button onClick={onViewCart} className="custom__button flex items-center gap-3">
            <ShoppingCart />
            {t("view_order")} ({cartItemCount} {cartItemCount > 1 ? t("items") : t("item")})
          </button>
        </div>
      )}
    </div>
  );
}

function CustomizationModal({ item, cart, onUpdateCart, onClose }) {
  const { t, i18n } = useTranslation();
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOptionQuantities, setSelectedOptionQuantities] = useState({});
  const modalRef = useRef();

  useEffect(() => {
    const initialQuantities = {};
    const initialOptionQuantities = {};
    const cartItems = cart.filter((cartItem) => cartItem.id === item.id);

    if (cartItems.length > 0) {
      setSelectedOptions(cartItems[0].selectedOptions || []);
      cartItems.forEach((cartItem) => {
        if (cartItem.size) {
          initialQuantities[cartItem.size] = (initialQuantities[cartItem.size] || 0) + cartItem.quantity;
        }
        cartItem.selectedOptions?.forEach((opt) => {
          if (opt.quantity) {
            initialOptionQuantities[opt.id] = (initialOptionQuantities[opt.id] || 0) + opt.quantity;
          }
        });
      });
    }
    setSelectedQuantities(initialQuantities);
    setSelectedOptionQuantities(initialOptionQuantities);
  }, [item, cart]);

  const handleQuantityChange = (sizeName, amount) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [sizeName]: Math.max(0, (prev[sizeName] || 0) + amount),
    }));
  };

  const handleOptionQuantityChange = (optionId, amount) => {
    setSelectedOptionQuantities((prev) => {
      const newQuantity = (prev[optionId] || 0) + amount;
      const newQuantities = { ...prev, [optionId]: Math.max(0, newQuantity) };

      const option = item.options.find((o) => o.id === optionId);
      if (parseFloat(option.price) > 0) {
        if (newQuantity > 0 && !selectedOptions.some((o) => o.id === optionId)) {
          setSelectedOptions([...selectedOptions, option]);
        } else if (newQuantity === 0) {
          setSelectedOptions(selectedOptions.filter((o) => o.id !== optionId));
        }
      }

      return newQuantities;
    });
  };

  const handleOptionToggle = (option) => {
    setSelectedOptions((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleUpdateAndClose = () => {
    const optionsWithQuantities = selectedOptions.map((opt) => {
      const isPaid = parseFloat(opt.price) > 0;
      return {
        ...opt,
        quantity: isPaid ? selectedOptionQuantities[opt.id] || 0 : 1,
      };
    });
    onUpdateCart(item, selectedQuantities, optionsWithQuantities);
    onClose();
  };

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  let currentPrice = 0;
  const optionsPrice = selectedOptions.reduce((sum, opt) => {
    const isPaid = parseFloat(opt.price) > 0;
    const quantity = isPaid ? selectedOptionQuantities[opt.id] || 0 : 1;
    return sum + parseFloat(opt.price || 0) * quantity;
  }, 0);

  Object.entries(selectedQuantities).forEach(([sizeName, quantity]) => {
    if (quantity > 0) {
      const size = item.sizes.find((s) => s.name === sizeName);
      const itemBasePrice = parseFloat(size.price);
      currentPrice += itemBasePrice * quantity;
    }
  });
  currentPrice += optionsPrice;

  const paidOptions = item?.options?.filter((o) => parseFloat(o.price) > 0) || [];
  const freeOptions = item?.options?.filter((o) => !o.price || parseFloat(o.price) === 0) || [];

  return (
    <div onClick={handleOutsideClick} className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div ref={modalRef} className="bg-black border border-golden rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
        <h2 className="headtext__cormorant mb-2">{item.name}</h2>
        <p className="p__opensans mb-4" style={{ color: "var(--color-grey)" }}>{item.description}</p>

        {item.sizes && (
          <div className="mb-4">
            <h3 className="p__cormorant mb-2">{t("customization_modal.size")}</h3>
            <div className="space-y-2">
              {item.sizes.map((size) => (
                <div key={size.name} className="flex justify-between items-center">
                  <span className="p__opensans">
                    {size.name} - {formatCurrency(parseFloat(size.price), i18n.language)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleQuantityChange(size.name, -1)} className="custom__button !p-0 h-8 w-8 flex items-center justify-center">
                      <Minus size={14} />
                    </button>
                    <span className="p__cormorant text-lg w-8 text-center">{selectedQuantities[size.name] || 0}</span>
                    <button onClick={() => handleQuantityChange(size.name, 1)} className="custom__button !p-0 h-8 w-8 flex items-center justify-center">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {paidOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="p__cormorant mb-2">{t("customization_modal.extras")}</h3>
            <div className="space-y-2">
              {paidOptions.map((opt) => (
                <div key={opt.id} className="flex justify-between items-center">
                  <span className="p__opensans">
                    {opt.name} (+{formatCurrency(parseFloat(opt.price), i18n.language)})
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOptionQuantityChange(opt.id, -1)} className="custom__button !p-0 h-8 w-8 flex items-center justify-center">
                      <Minus size={14} />
                    </button>
                    <span className="p__cormorant text-lg w-8 text-center">{selectedOptionQuantities[opt.id] || 0}</span>
                    <button onClick={() => handleOptionQuantityChange(opt.id, 1)} className="custom__button !p-0 h-8 w-8 flex items-center justify-center">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {freeOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="p__cormorant mb-2">{t("customization_modal.addons_free")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {freeOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer p__opensans">
                  <input
                    type="checkbox"
                    checked={selectedOptions.some((o) => o.id === opt.id)}
                    onChange={() => handleOptionToggle(opt)}
                    className="h-4 w-4 rounded border-gray-300 text-golden-500 focus:ring-golden-500"
                  />
                  {opt.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-golden">
          <span className="text-2xl font-bold text-white">{formatCurrency(currentPrice, i18n.language)}</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="custom__button bg-gray-800 text-white">
              {t("customization_modal.cancel")}
            </button>
            <button onClick={handleUpdateAndClose} className="custom__button flex items-center gap-2">
              <Plus size={18} />
              {t("customization_modal.update_order")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
