import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { notification } from 'antd';
import ShopHeader from '../components/shop/ShopHeader';
import CartItem from '../components/shop/CartItem';
import { CartContext } from '../components/context/cart.context.jsx';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const CartPage = () => {
  const { cart, loading, updateItem, removeItem, clearCart } = useContext(CartContext);

  const handleUpdate = async (itemId, qty) => {
    const res = await updateItem(itemId, qty);
    if (!res.ok) {
      notification.error({ message: 'Cart', description: res.message });
    }
  };

  const handleRemove = async (itemId) => {
    const res = await removeItem(itemId);
    if (!res.ok) {
      notification.error({ message: 'Cart', description: res.message });
    }
  };

  const handleClear = async () => {
    const res = await clearCart();
    if (!res.ok) {
      notification.error({ message: 'Cart', description: res.message });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <main className="section-shell flex flex-1 flex-col gap-8 py-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your cart</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Review items</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
            ))}
          </div>
        ) : cart?.items?.length ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id || item._id}
                  item={item}
                  onQuantityChange={(qty) => handleUpdate(item.id || item._id, qty)}
                  onRemove={() => handleRemove(item.id || item._id)}
                />
              ))}
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
              <div className="mt-6 grid gap-3">
                <Link
                  to="/checkout"
                  className="rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Proceed to checkout
                </Link>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                  onClick={handleClear}
                >
                  Clear cart
                </button>
              </div>
            </aside>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Your cart is empty</p>
            <p className="mt-2 text-sm text-slate-500">Browse products to add items.</p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Go shopping
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
