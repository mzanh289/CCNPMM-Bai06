import { useEffect, useState } from 'react';
import { notification } from 'antd';
import ShopHeader from '../components/shop/ShopHeader';
import OrderCard from '../components/shop/OrderCard';
import { fetchMyOrders } from '../util/order.api.js';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchMyOrders();
      if (res?.success) {
        setOrders(res?.data?.orders ?? []);
      } else {
        setOrders([]);
        notification.error({ message: 'Orders', description: res?.message || 'Unable to load orders.' });
      }
    } catch (error) {
      notification.error({ message: 'Orders', description: error?.message || 'Unable to load orders.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <main className="section-shell flex flex-1 flex-col gap-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Orders</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Order history</h1>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
            onClick={loadOrders}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
            ))}
          </div>
        ) : orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">No orders yet</p>
            <p className="mt-2 text-sm text-slate-500">Complete a checkout to see history here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;
