import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

function cartIdFor(item, size, selectedOptions) {
  const optionsId = (selectedOptions || [])
    .map((o) => o.id)
    .sort()
    .join('-');
  return `${item.id}-${size?.name || 'std'}-${optionsId}`;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
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
            ? { ...it, quantity: Math.max(0, it.quantity + amount) }
            : it
        )
        .filter((it) => it.quantity > 0);
    },
    clear(state) {
      state.items = [];
    },
    initFromStorage(state, action) {
      return action.payload || state;
    },
  },
});

export const { addItem, updateQuantity, clear, initFromStorage } = cartSlice.actions;
export default cartSlice.reducer;

