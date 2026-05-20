import axios from './axios.customize';

const API_PREFIX = '/api/orders';

export const checkoutApi = (payload) => axios.post(`${API_PREFIX}/checkout`, payload);

export const fetchMyOrders = () => axios.get(`${API_PREFIX}/my-orders`);

export const fetchOrderDetail = (orderId) => axios.get(`${API_PREFIX}/${orderId}`);

export const cancelOrderApi = (orderId) => axios.patch(`${API_PREFIX}/${orderId}/cancel`);
