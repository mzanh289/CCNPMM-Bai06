const Cart = require('../models/Cart');
const Product = require('../models/Product');

const resolveAppliedPrice = (product) => {
  const basePrice = Number(product?.price ?? 0);
  const discountPrice = Number(product?.discountPrice);
  const hasDiscount = Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < basePrice;
  return hasDiscount ? discountPrice : basePrice;
};

const calculateTotals = async (cart) => {
  const productIds = cart.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } })
    .select('price discountPrice')
    .lean();

  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  let subtotal = 0;
  let discount = 0;

  cart.items.forEach((item) => {
    const product = productMap.get(item.productId.toString());
    const basePrice = Number(product?.price ?? item.price ?? 0);
    const appliedPrice = Number(item.price ?? 0);
    const quantity = Number(item.quantity ?? 0);

    subtotal += basePrice * quantity;
    discount += Math.max(basePrice - appliedPrice, 0) * quantity;
  });

  cart.subtotal = Number(subtotal.toFixed(2));
  cart.discount = Number(discount.toFixed(2));
  cart.total = Number((subtotal - discount).toFixed(2));

  return cart;
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const getCartByUser = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await calculateTotals(cart);
  await cart.save();
  return cart;
};

const addItemToCart = async (userId, productId, quantity) => {
  if (!productId) {
    throw new Error('PRODUCT_ID_REQUIRED');
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('INVALID_QUANTITY');
  }

  const product = await Product.findById(productId).lean();
  if (!product || product.isActive === false) {
    throw new Error('PRODUCT_NOT_FOUND');
  }

  const cart = await getOrCreateCart(userId);
  const appliedPrice = resolveAppliedPrice(product);

  const existingItem = cart.items.find((item) => item.productId.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = appliedPrice;
    existingItem.thumbnail = product.thumbnail || existingItem.thumbnail;
    existingItem.productName = product.name || existingItem.productName;
  } else {
    cart.items.push({
      productId,
      quantity,
      price: appliedPrice,
      thumbnail: product.thumbnail || '',
      productName: product.name || ''
    });
  }

  await calculateTotals(cart);
  await cart.save();
  return cart;
};

const updateCartItem = async (userId, itemId, quantity) => {
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new Error('INVALID_QUANTITY');
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) {
    throw new Error('CART_ITEM_NOT_FOUND');
  }

  if (quantity === 0) {
    item.remove();
  } else {
    const product = await Product.findById(item.productId).lean();
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    item.quantity = quantity;
    item.price = resolveAppliedPrice(product);
    item.thumbnail = product.thumbnail || item.thumbnail;
    item.productName = product.name || item.productName;
  }

  await calculateTotals(cart);
  await cart.save();
  return cart;
};

const removeCartItem = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) {
    throw new Error('CART_ITEM_NOT_FOUND');
  }

  item.remove();
  await calculateTotals(cart);
  await cart.save();
  return cart;
};

const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  cart.subtotal = 0;
  cart.discount = 0;
  cart.total = 0;
  await cart.save();
  return cart;
};

module.exports = {
  getCartByUser,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
