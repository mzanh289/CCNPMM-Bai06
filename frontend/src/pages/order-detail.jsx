import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { notification } from 'antd';
import ShopHeader from '../components/shop/ShopHeader';
import OrderStatusBadge from '../components/shop/OrderStatusBadge';
import OrderTimeline from '../components/shop/OrderTimeline';
import { cancelOrderApi, fetchOrderDetail } from '../util/order.api.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await fetchOrderDetail(id);
      if (res?.success) {
        setOrder(res?.data?.order ?? null);
      } else {
        setOrder(null);
        notification.error({ message: 'Order', description: res?.message || 'Unable to load order.' });
      }
    } catch (error) {
      notification.error({ message: 'Order', description: error?.message || 'Unable to load order.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const res = await cancelOrderApi(id);
      if (res?.success) {
        notification.success({ message: 'Order', description: res?.message || 'Cancel requested.' });
        setOrder(res?.data?.order ?? order);
      } else {
        notification.error({ message: 'Order', description: res?.message || 'Unable to cancel.' });
      }
    } catch (error) {
      notification.error({ message: 'Order', description: error?.message || 'Unable to cancel.' });
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />
      <main className="section-shell flex flex-1 flex-col gap-8 py-10">
        {loading ? (
          <div className="h-40 animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
        ) : !order ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Order not found</p>
            <Link to="/orders" className="mt-4 inline-flex text-sm font-semibold text-slate-600">
              Back to orders
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order detail</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">#{order.id?.slice(-6)}</h1>
              </div>
              <OrderStatusBadge status={order.orderStatus} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-semibold text-slate-900">Items</h2>
                  <div className="mt-4 space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id || item.productId} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-slate-900">{item.productName}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h2 className="text-lg font-semibold text-slate-900">Shipping address</h2>
                  <div className="mt-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{order.shippingAddress?.fullName}</p>
                    <p>{order.shippingAddress?.phone}</p>
                    <p>{order.shippingAddress?.addressLine1}</p>
                    {order.shippingAddress?.addressLine2 ? <p>{order.shippingAddress.addressLine2}</p> : null}
                    <p>
                      {order.shippingAddress?.city}
                      {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''}
                    </p>
                    <p>{order.shippingAddress?.country}</p>
                  </div>
                </div>

                <OrderTimeline status={order.orderStatus} />
              </div>

              <aside className="h-fit space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Summary</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Discount</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-base font-semibold text-slate-900">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalPrice)}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-slate-400">Payment: COD</p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Actions</p>
                  {['shipping', 'delivered', 'cancelled', 'cancel_requested'].includes(order.orderStatus) && (
                    <p className="mt-3 text-xs text-slate-400">
                      This order can no longer be cancelled.
                    </p>
                  )}
                  <button
                    type="button"
                    className="mt-4 w-full rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 disabled:opacity-50"
                    onClick={handleCancel}
                    disabled={['shipping', 'delivered', 'cancelled', 'cancel_requested'].includes(order.orderStatus)}
                  >
                    Request cancellation
                  </button>
                  <Link
                    to="/orders"
                    className="mt-3 flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                  >
                    Back to orders
                  </Link>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default OrderDetailPage;
