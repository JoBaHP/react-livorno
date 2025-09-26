import { configureStore, createSelector } from '@reduxjs/toolkit';
import cartReducer, { initFromStorage } from './cartSlice';
import orderReducer from './orderSlice';
import authReducer from './authSlice';

function loadState() {
  try {
    const raw = localStorage.getItem('cart_state');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    // Basic shape guard
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

// Persist cart slice on changes
store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem('cart_state', JSON.stringify(state.cart));
  } catch {}
});

// If there was no preloadedState but localStorage has data, ensure slice gets it
const preloaded = loadState();
if (preloaded?.cart) {
  store.dispatch(initFromStorage(preloaded.cart));
}

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = createSelector([selectCartItems], (items) =>
  (items || []).reduce((sum, item) => {
    const qty = parseFloat(item.quantity || 0);
    const base = parseFloat(item.price || 0);
    const optionsTotal = (item.selectedOptions || []).reduce(
      (acc, opt) => acc + parseFloat(opt.price || 0),
      0
    );
    const baseSubtotal = base * qty;
    const optionsSubtotal = (item.optionsOnce ? optionsTotal : optionsTotal * qty);
    return sum + baseSubtotal + optionsSubtotal;
  }, 0)
);
export const selectCurrentOrder = (state) => state.order.current;
export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  (items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
);
export const selectCartUniqueCount = createSelector([selectCartItems], (items) =>
  (items || []).length
);
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
