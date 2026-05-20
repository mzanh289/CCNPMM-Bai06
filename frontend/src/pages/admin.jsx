import { useEffect, useMemo, useState } from 'react';
import { notification } from 'antd';
import OrderStatusBadge from '../components/shop/OrderStatusBadge';
import OrderTimeline from '../components/shop/OrderTimeline';
import { fetchAdminOrders, updateAdminOrderStatus } from '../util/order.api.js';

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'preparing',
  'shipping',
  'delivered',
  'cancelled',
  'cancel_requested'
];

const NEXT_STATUS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipping'],
  shipping: ['delivered'],
  cancel_requested: ['cancelled'],
  delivered: [],
  cancelled: []
};

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });

  const loadOrders = async (nextPage = page, nextStatus = statusFilter) => {
    setLoading(true);
    try {
      const res = await fetchAdminOrders({
        status: nextStatus || undefined,
        page: nextPage,
        limit: pagination.limit
      });

      if (res?.success) {
        setOrders(res?.data?.orders ?? []);
        setPagination(res?.data?.pagination ?? pagination);
      } else {
        notification.error({ message: 'Admin Orders', description: res?.message || 'Unable to load orders.' });
        setOrders([]);
      }
    } catch (error) {
      notification.error({ message: 'Admin Orders', description: error?.message || 'Unable to load orders.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(1, statusFilter);
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    try {
      const res = await updateAdminOrderStatus(orderId, { status: nextStatus });
      if (res?.success) {
        notification.success({ message: 'Admin Orders', description: 'Order status updated.' });
        setOrders((prev) => prev.map((order) => (order.id === orderId ? res.data.order : order)));
      } else {
        notification.error({ message: 'Admin Orders', description: res?.message || 'Unable to update order.' });
      }
    } catch (error) {
      notification.error({ message: 'Admin Orders', description: error?.message || 'Unable to update order.' });
    }
  };

  const totalPages = pagination.totalPages || 1;
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  return (
    <div className="section-shell py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Order management</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value);
            }}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
            onClick={() => loadOrders(1, statusFilter)}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      ) : orders.length ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const nextOptions = NEXT_STATUS[order.orderStatus] || [];
            return (
              <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order</p>
                    <h3 className="text-lg font-semibold text-slate-900">#{order.id?.slice(-6)}</h3>
                  </div>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>

                <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-4">
                    <div className="text-sm text-slate-600">
                      <p className="font-semibold text-slate-900">Items: {order.items?.length || 0}</p>
                      <p>Ordered: {order.orderedAt ? new Date(order.orderedAt).toLocaleString() : '--'}</p>
                      <p>Total: ${order.totalPrice?.toFixed?.(2) ?? order.totalPrice}</p>
                    </div>
                    <OrderTimeline status={order.orderStatus} />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Update status</p>
                    {nextOptions.length ? (
                      <div className="flex flex-wrap gap-2">
                        {nextOptions.map((next) => (
                          <button
                            key={next}
                            type="button"
                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                            onClick={() => handleStatusUpdate(order.id, next)}
                          >
                            {next.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No further actions available.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">No orders found</p>
          <p className="mt-2 text-sm text-slate-500">Try a different status filter.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Page {pagination.page} of {pagination.totalPages} • {pagination.total} orders
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 disabled:opacity-50"
            disabled={pagination.page <= 1}
            onClick={() => {
              const nextPage = Math.max(pagination.page - 1, 1);
              setPage(nextPage);
              loadOrders(nextPage, statusFilter);
            }}
          >
            Prev
          </button>
          {pages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                pageNumber === pagination.page
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 text-slate-600'
              }`}
              onClick={() => {
                setPage(pageNumber);
                loadOrders(pageNumber, statusFilter);
              }}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 disabled:opacity-50"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => {
              const nextPage = Math.min(pagination.page + 1, pagination.totalPages);
              setPage(nextPage);
              loadOrders(nextPage, statusFilter);
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;