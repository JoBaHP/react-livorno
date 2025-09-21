import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

function cartIdFor(item, size, selectedOptions) {
  const optionsId = (selectedOptions || [])
    .map((o) => (o.quantity ? `${o.id}:${o.quantity}` : `${o.id}`))
    .sort()
    .join('-');
  return `${item.id}-${size?.name || 'std'}-${optionsId}`;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initFromStorage(state, action) {
      return action.payload || state;
    },
    setAll(state, action) {
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
    addItem(state, action) {
      const { item, size, selectedOptions } = action.payload;
      const id = cartIdFor(item, size, selectedOptions);
      const existing = state.items.find((it) => it.cartId === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          ...item,
          cartId: id,
          quantity: 1,
          price: size ? size.price : item.price,
          size: size ? size.name : null,
          selectedOptions: selectedOptions || [],
        });
      }
    },
    updateQuantity(state, action) {
      const { cartId, amount } = action.payload;
      state.items = state.items
        .map((it) =>
          it.cartId === cartId
            ? { ...it, quantity: Math.max(0, (it.quantity || 0) + amount) }
            : it
        )
        .filter((it) => (it.quantity || 0) > 0);
    },
    updateOptionQuantity(state, action) {
      const { cartId, optionId, delta } = action.payload;
      const it = state.items.find((x) => x.cartId === cartId);
      if (!it) return;
      const opts = Array.isArray(it.selectedOptions) ? [...it.selectedOptions] : [];
      const idx = opts.findIndex((o) => o.id === optionId);
      if (idx === -1) return; // only adjust if exists and is paid
      const option = { ...opts[idx] };
      const price = parseFloat(option.price || 0);
      if (price <= 0) return; // free options don't track quantities
      const newQty = Math.max(0, (option.quantity || 0) + delta);
      if (newQty === 0) {
        opts.splice(idx, 1);
      } else {
        option.quantity = newQty;
        opts[idx] = option;
      }
      it.selectedOptions = opts;
    },
    replaceItemsForProduct(state, action) {
      const { productId, items } = action.payload; // items are fully formed cart rows
      state.items = state.items.filter((ci) => ci.id !== productId).concat(items);
    },
    clear(state) {
      state.items = [];
    },
  },
});

export const { addItem, updateQuantity, updateOptionQuantity, replaceItemsForProduct, clear, initFromStorage } = cartSlice.actions;
export const { setAll } = cartSlice.actions;
export default cartSlice.reducer;
