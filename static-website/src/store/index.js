import { configureStore, createSelector } from '@reduxjs/toolkit';
import cartReducer, { initFromStorage } from './cartSlice';
import orderReducer from './orderSlice';
import authReducer from './authSlice';

function loadState() {
  try {
    const raw = sessionStorage.getItem('deliveryCart');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
      return { cart: parsed };
    }
  } catch {}
  return undefined;
}

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    order: orderReducer,
    auth: authReducer,
  },
  preloadedState: loadState(),
  devTools: true,
});

store.subscribe(() => {
  try {
    const state = store.getState();
    sessionStorage.setItem('deliveryCart', JSON.stringify(state.cart));
  } catch {}
});

const preloaded = loadState();
if (preloaded?.cart) {
  store.dispatch(initFromStorage(preloaded.cart));
}

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = createSelector([selectCartItems], (items) =>
  (items || []).reduce((sum, item) => {
    const base = parseFloat(item.price || 0) * (item.quantity || 0);
    const optionsTotal = (item.selectedOptions || []).reduce((acc, opt) => {
      const price = parseFloat(opt.price || 0);
      const qty = opt.quantity || (price > 0 ? 0 : 1);
      return acc + price * qty;
    }, 0);
    return sum + base + optionsTotal;
  }, 0)
);
export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  (items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
);
export const selectCurrentOrder = (state) => state.order.current;
