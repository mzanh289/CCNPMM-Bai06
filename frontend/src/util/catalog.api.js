import axios from './axios.customize';

const API_PREFIX = '/api/catalog';

const normalizeDetailResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return { product: null, related: [] };
  }

  const payload = response.data && typeof response.data === 'object' && !Array.isArray(response.data)
    ? response.data
    : response;

  return {
    product: payload?.product ?? null,
    related: Array.isArray(payload?.related) ? payload.related : [],
    status: payload?.status ?? response.status
  };
};

export const fetchCategories = () => axios.get(`${API_PREFIX}/categories`);

export const fetchProducts = (params = {}) => {
  const normalized = { ...params };
  if (normalized.categoryId && !normalized.category) {
    normalized.category = normalized.categoryId;
  }
  if (normalized.search && !normalized.keyword) {
    normalized.keyword = normalized.search;
  }
  return axios.get(`${API_PREFIX}/products`, { params: normalized });
};

export const fetchLatestProducts = (limit = 8) =>
  axios.get(`${API_PREFIX}/products/latest`, { params: { limit } });

export const fetchBestSellingProducts = (limit = 8) =>
  axios.get(`${API_PREFIX}/products/best-sellers`, { params: { limit } });

export const fetchPromotionProducts = (limit = 8) =>
  axios.get(`/api/products/promotions`, { params: { limit } });

export const fetchTopSellingProducts = (limit = 10) =>
  axios.get(`/api/products/best-sellers`, { params: { limit } });

export const fetchTopViewedProducts = (limit = 10) =>
  axios.get(`/api/products/most-viewed`, { params: { limit } });

export const fetchProductDetail = async (id) => {
  const response = await axios.get(`${API_PREFIX}/products/${id}`);
  return normalizeDetailResponse(response);
};
