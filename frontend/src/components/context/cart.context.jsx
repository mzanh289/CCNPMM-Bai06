import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth.context.jsx';
import {
  addToCartApi,
  clearCartApi,
  fetchCart,
  removeCartItemApi,
  updateCartItemApi
} from '../../util/cart.api.js';

const emptyCart = {
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0
};

export const CartContext = createContext({
  cart: emptyCart,
  loading: false,
  error: '',
  itemCount: 0,
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  refreshCart: () => {},
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: async () => {}
});

export const CartProvider = ({ children }) => {
  const { auth } = useContext(AuthContext);
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const itemCount = useMemo(
    () => cart.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
    [cart.items]
  );

  const refreshCart = useCallback(async () => {
    if (!auth?.isAuthenticated) {
      setCart(emptyCart);
      setError('');
      return null;
    }

    setLoading(true);
    try {
      const res = await fetchCart();
      if (res?.success) {
        setCart(res?.data?.cart ?? emptyCart);
        setError('');
        return res?.data?.cart ?? emptyCart;
      }
      setError(res?.message || 'Unable to load cart.');
      return null;
    } catch (err) {
      setError(err?.message || 'Unable to load cart.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [auth?.isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async ({ productId, quantity = 1 }) => {
    if (!auth?.isAuthenticated) {
      return { ok: false, message: 'Please login to continue.' };
    }

    try {
      const res = await addToCartApi({ productId, quantity });
      if (res?.success) {
        setCart(res?.data?.cart ?? emptyCart);
        return { ok: true, message: res?.message || 'Added to cart.' };
      }
      return { ok: false, message: res?.message || 'Unable to add to cart.' };
    } catch (err) {
      return { ok: false, message: err?.message || 'Unable to add to cart.' };
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const res = await updateCartItemApi(itemId, { quantity });
      if (res?.success) {
        setCart(res?.data?.cart ?? emptyCart);
        return { ok: true, message: res?.message || 'Cart updated.' };
      }
      return { ok: false, message: res?.message || 'Unable to update cart.' };
    } catch (err) {
      return { ok: false, message: err?.message || 'Unable to update cart.' };
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await removeCartItemApi(itemId);
      if (res?.success) {
        setCart(res?.data?.cart ?? emptyCart);
        return { ok: true, message: res?.message || 'Removed item.' };
      }
      return { ok: false, message: res?.message || 'Unable to remove item.' };
    } catch (err) {
      return { ok: false, message: err?.message || 'Unable to remove item.' };
    }
  };

  const clearCart = async () => {
    try {
      const res = await clearCartApi();
      if (res?.success) {
        setCart(res?.data?.cart ?? emptyCart);
        return { ok: true, message: res?.message || 'Cart cleared.' };
      }
      return { ok: false, message: res?.message || 'Unable to clear cart.' };
    } catch (err) {
      return { ok: false, message: err?.message || 'Unable to clear cart.' };
    }
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        itemCount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        refreshCart,
        addItem,
        updateItem,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
