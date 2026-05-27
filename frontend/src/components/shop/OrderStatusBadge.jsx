const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-indigo-100 text-indigo-700',
  shipping: 'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  received: 'bg-emerald-200 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-700',
  cancel_requested: 'bg-orange-100 text-orange-700'
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  shipping: 'Shipping',
  delivered: 'Delivered',
  received: 'Received',
  cancelled: 'Cancelled',
  cancel_requested: 'Cancel requested'
};

const OrderStatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
        STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
};

export default OrderStatusBadge;
