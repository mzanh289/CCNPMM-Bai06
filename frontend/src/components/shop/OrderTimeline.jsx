const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered'];

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  shipping: 'Shipping',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  cancel_requested: 'Cancel requested'
};

const OrderTimeline = ({ status }) => {
  if (status === 'cancelled' || status === 'cancel_requested') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">{STATUS_LABELS[status]}</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          {status === 'cancel_requested'
            ? 'Cancellation requested. Waiting for admin confirmation.'
            : 'Order cancelled successfully.'}
        </p>
      </div>
    );
  }

  const activeIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="space-y-4">
        {STATUS_ORDER.map((step, index) => {
          const isActive = index === activeIndex;
          const isComplete =
            index < activeIndex || (status === 'delivered' && index === activeIndex);
          return (
            <div key={step} className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  isComplete
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{STATUS_LABELS[step]}</p>
                <p className="text-xs text-slate-500">
                  {isComplete ? 'Completed' : isActive ? 'In progress' : 'Pending'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
