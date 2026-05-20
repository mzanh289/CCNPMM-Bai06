import { Link } from 'react-router-dom';

const FALLBACK_IMAGE = 'https://placehold.co/200x200?text=Image+Unavailable';

const buildImageUrl = (url) => {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const baseUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
  if (!baseUrl) {
    return url;
  }

  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const CartItem = ({ item, onQuantityChange, onRemove, compact = false }) => {
  const productId = item?.productId || item?.product?._id || item?.product?.id;
  const quantity = Number(item?.quantity ?? 0);

  return (
    <div className={`flex gap-4 ${compact ? 'items-center' : 'items-start'} rounded-2xl border border-slate-200 bg-white p-4`}>
      <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={buildImageUrl(item?.thumbnail) || FALLBACK_IMAGE}
          alt={item?.productName || 'Cart item'}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {productId ? (
          <Link to={`/products/${productId}`} className="text-sm font-semibold text-slate-900 hover:text-slate-700">
            {item?.productName || 'Product'}
          </Link>
        ) : (
          <p className="text-sm font-semibold text-slate-900">{item?.productName || 'Product'}</p>
        )}
        <p className="text-xs text-slate-500">{formatCurrency(item?.price)}</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1">
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-slate-200 text-slate-600"
              onClick={() => onQuantityChange?.(Math.max(quantity - 1, 1))}
            >
              -
            </button>
            <span className="min-w-[24px] text-center text-sm font-semibold text-slate-900">{quantity}</span>
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-slate-200 text-slate-600"
              onClick={() => onQuantityChange?.(quantity + 1)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 hover:text-red-500"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>
      <div className="ml-auto text-sm font-semibold text-slate-900">
        {formatCurrency((item?.price || 0) * quantity)}
      </div>
    </div>
  );
};

export default CartItem;
