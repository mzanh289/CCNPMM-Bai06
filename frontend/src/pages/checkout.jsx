import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import ShopHeader from '../components/shop/ShopHeader';
import CheckoutForm from '../components/shop/CheckoutForm';
import CartItem from '../components/shop/CartItem';
import { CartContext } from '../components/context/cart.context.jsx';
import { checkoutApi } from '../util/order.api.js';
import { AuthContext } from '../components/context/auth.context.jsx';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { cart, updateItem, removeItem, refreshCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [auth?.isAuthenticated, navigate]);

  const handleSubmit = async (shippingAddress) => {
    if (!cart?.items?.length) {
      notification.warning({ message: 'Checkout', description: 'Your cart is empty.' });
      return;
    }

    setLoading(true);
    try {
      const res = await checkoutApi({ shippingAddress });
      if (res?.success) {
        notification.success({ message: 'Checkout', description: 'Order placed successfully.' });
        await refreshCart();
        navigate('/orders', { replace: true });
      } else {
        notification.error({ message: 'Checkout', description: res?.message || 'Unable to checkout.' });
      }
    } catch (error) {
      notification.error({ message: 'Checkout', description: error?.message || 'Unable to checkout.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <main className="section-shell flex flex-1 flex-col gap-8 py-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Checkout</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Cash on delivery</h1>
        </div>

        {!cart?.items?.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Your cart is empty</p>
            <p className="mt-2 text-sm text-slate-500">Add items before checking out.</p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Go shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">Shipping details</h2>
                <p className="mt-1 text-sm text-slate-500">Fill in your address for COD delivery.</p>
                <div className="mt-6">
                  <CheckoutForm onSubmit={handleSubmit} loading={loading} />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">Review items</h2>
                <div className="mt-4 space-y-4">
                  {cart.items.map((item) => (
                    <CartItem
                      key={item.id || item._id}
                      item={item}
                      onQuantityChange={(qty) => updateItem(item.id || item._id, qty)}
                      onRemove={() => removeItem(item.id || item._id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Summary</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cart?.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(cart?.discount)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(cart?.total)}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400">Payment method: Cash on delivery</p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckoutPage;
