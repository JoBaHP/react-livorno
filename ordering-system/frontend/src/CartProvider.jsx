/*
  NOTE: This legacy CartProvider (React Context + useReducer) has been
  replaced by Redux Toolkit store in src/store. The file is intentionally
  commented out to avoid accidental usage while keeping history for reference.

  Previous exports:
  - CartProvider
  - useCart

  Migration:
  - Use useSelector(selectCartItems/selectCartItemCount/selectCartTotal)
  - Use useDispatch with cartSlice actions (addItem, updateQuantity, clear)
*/

export {};
