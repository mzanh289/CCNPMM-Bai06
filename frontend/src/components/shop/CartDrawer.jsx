import { Link } from 'react-router-dom';
import CartItem from './CartItem';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const CartDrawer = ({ open, onClose, cart, onUpdateItem, onRemoveItem, onClearCart, loading }) => {
  return (
    <div className={`fixed inset-0 z-[60] ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-slate-900/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md transform bg-white shadow-2xl transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your cart</p>
              <h2 className="text-lg font-semibold text-slate-900">Quick checkout</h2>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
                ))}
              </div>
            ) : cart?.items?.length ? (
              cart.items.map((item) => (
                <CartItem
                  key={item.id || item._id}
                  item={item}
                  compact
                  onQuantityChange={(qty) => onUpdateItem?.(item.id || item._id, qty)}
                  onRemove={() => onRemoveItem?.(item.id || item._id)}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Your cart is empty. Start adding items to continue.
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(cart?.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Discount</span>
                <span>-{formatCurrency(cart?.discount)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(cart?.total)}</span>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <Link
                to="/cart"
                onClick={onClose}
                className="rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600"
              >
                View cart
              </Link>
              <Link
                to="/checkout"
                onClick={onClose}
                className="rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Checkout
              </Link>
              {cart?.items?.length ? (
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                  onClick={onClearCart}
                >
                  Clear cart
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;
