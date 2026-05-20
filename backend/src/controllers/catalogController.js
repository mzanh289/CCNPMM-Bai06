const catalogService = require('../services/catalogService');
const productImageService = require('../services/productImageService');

const logControllerError = (operation, error) => {
  console.error(`[catalogController:${operation}]`, {
    message: error.message,
    stack: error.stack
  });
};

const buildBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

const withBaseUrl = (url, baseUrl) => {
  if (!url) {
    return url;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }

  return `${baseUrl}/${url}`;
};

const normalizeProductImages = (product, req) => {
  if (!product || typeof product !== 'object') {
    return product;
  }

  const baseUrl = buildBaseUrl(req);
  const imageUrls = Array.isArray(product.imageUrls)
    ? product.imageUrls.map((url) => withBaseUrl(url, baseUrl))
    : product.imageUrls;
  const images = Array.isArray(product.images)
    ? product.images.map((url) => withBaseUrl(url, baseUrl))
    : product.images;
  const thumbnail = product.thumbnail ? withBaseUrl(product.thumbnail, baseUrl) : product.thumbnail;

  return {
    ...product,
    imageUrls,
    images,
    thumbnail
  };
};

const withDiscountMeta = (product) => {
  if (!product || typeof product !== 'object') {
    return product;
  }

  const price = Number(product.price) || 0;
  const discountPrice = Number(product.discountPrice);
  const hasDiscount = Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount && price > 0
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  return {
    ...product,
    discountPercent
  };
};

const getCategories = async (_req, res) => {
  try {
    const categories = await catalogService.getCategories();
    return res.status(200).json({ categories });
  } catch (error) {
    logControllerError('getCategories', error);
    return res.status(500).json({
      message: `Failed to load categories: ${error.message}`,
      operation: 'getCategories'
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const result = await catalogService.getProducts(req.query || {});
    const products = Array.isArray(result.products)
      ? result.products.map((product) => normalizeProductImages(product, req))
      : result.products;
    return res.status(200).json({ ...result, products });
  } catch (error) {
    logControllerError('getProducts', error);
    return res.status(500).json({
      message: `Failed to load products: ${error.message}`,
      operation: 'getProducts'
    });
  }
};

const getLatestProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 8);
    const items = await catalogService.getLatestProducts(limit);
    return res.status(200).json({
      items: items.map((product) => normalizeProductImages(product, req))
    });
  } catch (error) {
    logControllerError('getLatestProducts', error);
    return res.status(500).json({
      message: `Failed to load latest products: ${error.message}`,
      operation: 'getLatestProducts'
    });
  }
};

const getBestSellingProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 8);
    const items = await catalogService.getBestSellingProducts(limit);
    return res.status(200).json({
      items: items.map((product) => normalizeProductImages(product, req))
    });
  } catch (error) {
    logControllerError('getBestSellingProducts', error);
    return res.status(500).json({
      message: `Failed to load best sellers: ${error.message}`,
      operation: 'getBestSellingProducts'
    });
  }
};

const getPromotionProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 8);
    const items = await catalogService.getPromotionProducts(limit);
    return res.status(200).json({
      items: items.map((product) => normalizeProductImages(product, req))
    });
  } catch (error) {
    logControllerError('getPromotionProducts', error);
    return res.status(500).json({
      message: `Failed to load promotions: ${error.message}`,
      operation: 'getPromotionProducts'
    });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const products = await catalogService.getTopSellingProducts(limit);
    return res.status(200).json({
      products: products.map((product) => normalizeProductImages(product, req))
    });
  } catch (error) {
    logControllerError('getTopSellingProducts', error);
    return res.status(500).json({
      message: `Failed to load top-selling products: ${error.message}`,
      operation: 'getTopSellingProducts'
    });
  }
};

const getTopViewedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const products = await catalogService.getTopViewedProducts(limit);
    return res.status(200).json({
      products: products.map((product) => normalizeProductImages(product, req))
    });
  } catch (error) {
    logControllerError('getTopViewedProducts', error);
    return res.status(500).json({
      message: `Failed to load top-viewed products: ${error.message}`,
      operation: 'getTopViewedProducts'
    });
  }
};

const getBestSellers = async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const products = await catalogService.getBestSellerProducts(limit);
    return res.status(200).json({
      products: products
        .map((product) => normalizeProductImages(product, req))
        .map(withDiscountMeta)
    });
  } catch (error) {
    logControllerError('getBestSellers', error);
    return res.status(500).json({
      message: `Failed to load best sellers: ${error.message}`,
      operation: 'getBestSellers'
    });
  }
};

const getPromotions = async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const products = await catalogService.getPromotionProductsByDiscount(limit);
    return res.status(200).json({
      products: products
        .map((product) => normalizeProductImages(product, req))
        .map(withDiscountMeta)
    });
  } catch (error) {
    logControllerError('getPromotions', error);
    return res.status(500).json({
      message: `Failed to load promotions: ${error.message}`,
      operation: 'getPromotions'
    });
  }
};

const getMostViewed = async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const products = await catalogService.getMostViewedProducts(limit);
    return res.status(200).json({
      products: products
        .map((product) => normalizeProductImages(product, req))
        .map(withDiscountMeta)
    });
  } catch (error) {
    logControllerError('getMostViewed', error);
    return res.status(500).json({
      message: `Failed to load most viewed products: ${error.message}`,
      operation: 'getMostViewed'
    });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await catalogService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const related = await catalogService.getRelatedProducts(productId, product.category?.id);
    return res.status(200).json({
      product: normalizeProductImages(product, req),
      related: related.map((item) => normalizeProductImages(item, req))
    });
  } catch (error) {
    logControllerError('getProductDetail', error);
    return res.status(500).json({
      message: `Failed to load product: ${error.message}`,
      operation: 'getProductDetail'
    });
  }
};

const uploadProductImages = async (req, res) => {
  try {
    const product = await productImageService.replaceProductImages({
      productId: req.params.id,
      files: req.files ?? [],
      req
    });

    return res.status(200).json({
      message: 'Product images updated successfully.',
      product: normalizeProductImages(product, req)
    });
  } catch (error) {
    logControllerError('uploadProductImages', error);
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Failed to update product images.',
      operation: 'uploadProductImages'
    });
  }
};

module.exports = {
  getCategories,
  getProducts,
  getLatestProducts,
  getBestSellingProducts,
  getPromotionProducts,
  getTopSellingProducts,
  getTopViewedProducts,
  getBestSellers,
  getPromotions,
  getMostViewed,
  getProductDetail,
  uploadProductImages
};
