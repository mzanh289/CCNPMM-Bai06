import axios from './axios.customize';

const API_PREFIX = '/api/cart';

export const fetchCart = () => axios.get(API_PREFIX);

export const addToCartApi = (payload) => axios.post(`${API_PREFIX}/add`, payload);

export const updateCartItemApi = (itemId, payload) =>
  axios.put(`${API_PREFIX}/item/${itemId}`, payload);

export const removeCartItemApi = (itemId) =>
  axios.delete(`${API_PREFIX}/item/${itemId}`);

export const clearCartApi = () => axios.delete(`${API_PREFIX}/clear`);
