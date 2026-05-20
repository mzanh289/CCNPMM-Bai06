import { Link } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const OrderCard = ({ order }) => {
  const itemsCount = order?.items?.reduce((total, item) => total + (Number(item.quantity) || 0), 0) || 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order</p>
          <h3 className="text-lg font-semibold text-slate-900">#{order?.id?.slice(-6) || '---'}</h3>
        </div>
        <OrderStatusBadge status={order?.orderStatus} />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Items</p>
          <p className="font-semibold text-slate-900">{itemsCount}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
          <p className="font-semibold text-slate-900">{formatCurrency(order?.totalPrice)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ordered</p>
          <p className="font-semibold text-slate-900">
            {order?.orderedAt ? new Date(order.orderedAt).toLocaleString() : '--'}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          to={`/orders/${order?.id}`}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          View details
        </Link>
        <Link
          to="/"
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
