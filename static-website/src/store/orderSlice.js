import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  current: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrder(state, action) {
      state.current = action.payload;
    },
    clearOrder(state) {
      state.current = null;
    },
    updateOrder(state, action) {
      const updated = action.payload;
      if (state.current && updated && updated.id === state.current.id) {
        state.current = { ...state.current, ...updated };
      }
    },
  },
});

export const { setOrder, clearOrder, updateOrder } = orderSlice.actions;
export default orderSlice.reducer;

