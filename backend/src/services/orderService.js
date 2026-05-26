const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

const ORDER_CONFIRM_MINUTES = 30;

const normalizeOrder = (order) => {
  if (!order) {
    return order;
  }

  if (order.id) {
    return order;
  }

  return {
    ...order,
    id: order._id?.toString?.() || order._id
  };
};

const resolveAppliedPrice = (product) => {
  const basePrice = Number(product?.price ?? 0);
  const discountPrice = Number(product?.discountPrice);
  const hasDiscount = Number.isFinite(discountPrice) && discountPrice > 0 && discountPrice < basePrice;
  return hasDiscount ? discountPrice : basePrice;
};

const autoConfirmPendingOrders = async (query = {}) => {
  const cutoff = new Date(Date.now() - ORDER_CONFIRM_MINUTES * 60 * 1000);
  await Order.updateMany(
    { ...query, orderStatus: 'pending', orderedAt: { $lte: cutoff } },
    { $set: { orderStatus: 'confirmed' } }
  );
};

const buildOrderFromCart = async (cart) => {
  const productIds = cart.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } })
    .select('price discountPrice thumbnail name')
    .lean();

  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  let subtotal = 0;
  let discount = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = productMap.get(item.productId.toString());
    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const basePrice = Number(product.price ?? 0);
    const appliedPrice = resolveAppliedPrice(product);
    const quantity = Number(item.quantity ?? 0);
    const lineSubtotal = basePrice * quantity;
    const lineDiscount = Math.max(basePrice - appliedPrice, 0) * quantity;
    const lineTotal = appliedPrice * quantity;

    subtotal += lineSubtotal;
    discount += lineDiscount;

    orderItems.push({
      productId: item.productId,
      productName: product.name || item.productName || '',
      thumbnail: product.thumbnail || item.thumbnail || '',
      quantity,
      price: appliedPrice,
      lineTotal
    });
  }

  return {
    items: orderItems,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2))
  };
};

const validateShippingAddress = (shippingAddress = {}) => {
  const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'country'];
  const missing = requiredFields.filter((field) => !shippingAddress[field]);
  if (missing.length > 0) {
    const error = new Error('INVALID_SHIPPING_ADDRESS');
    error.details = missing;
    throw error;
  }
};

const checkoutFromCart = async (userId, shippingAddress) => {
  validateShippingAddress(shippingAddress);

  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw new Error('CART_EMPTY');
  }

  const { items, subtotal, discount } = await buildOrderFromCart(cart);
  const shippingFee = 0;
  const totalPrice = Number((subtotal - discount + shippingFee).toFixed(2));

  const order = await Order.create({
    user: userId,
    items,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2 || '',
      city: shippingAddress.city,
      state: shippingAddress.state || '',
      postalCode: shippingAddress.postalCode || '',
      country: shippingAddress.country,
      note: shippingAddress.note || ''
    },
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    subtotal,
    shippingFee,
    discount,
    totalPrice,
    orderedAt: new Date()
  });

  cart.items = [];
  cart.subtotal = 0;
  cart.discount = 0;
  cart.total = 0;
  await cart.save();

  return order;
};

const getMyOrders = async (userId) => {
  await autoConfirmPendingOrders({ user: userId });
  const orders = await Order.find({ user: userId }).sort({ orderedAt: -1 }).lean();
  return orders.map(normalizeOrder);
};

const getOrderById = async (userId, orderId) => {
  await autoConfirmPendingOrders({ user: userId });
  const order = await Order.findOne({ _id: orderId, user: userId }).lean();
  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }
  return normalizeOrder(order);
};

const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }

  if (['cancelled', 'delivered'].includes(order.orderStatus)) {
    throw new Error('ORDER_FINAL');
  }

  const elapsedMs = Date.now() - new Date(order.orderedAt).getTime();
  const withinWindow = elapsedMs <= ORDER_CONFIRM_MINUTES * 60 * 1000;

  if (order.orderStatus === 'preparing') {
    order.orderStatus = 'cancel_requested';
  } else if (['pending', 'confirmed'].includes(order.orderStatus) && withinWindow) {
    order.orderStatus = 'cancelled';
  } else if (['shipping'].includes(order.orderStatus)) {
    throw new Error('ORDER_CANNOT_CANCEL');
  } else {
    throw new Error('ORDER_CANCEL_WINDOW_EXPIRED');
  }

  await order.save();
  return order;
};

const getAdminOrders = async ({ status, page = 1, limit = 10 } = {}) => {
  await autoConfirmPendingOrders();
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const query = {};

  if (status) {
    query.orderStatus = status;
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .sort({ orderedAt: -1 })
    .skip((normalizedPage - 1) * normalizedLimit)
    .limit(normalizedLimit)
    .lean();

  return {
    orders: orders.map(normalizeOrder),
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages: Math.max(Math.ceil(total / normalizedLimit), 1)
    }
  };
};

const confirmDelivered = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }

  if (order.orderStatus !== 'delivered') {
    throw new Error('ORDER_NOT_DELIVERED');
  }

  order.orderStatus = 'delivered';
  await order.save();
  return order;
};

const updateOrderStatus = async (orderId, status) => {
  const allowedStatuses = ['confirmed', 'preparing', 'shipping', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw new Error('INVALID_STATUS');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }

  if (['cancelled', 'delivered'].includes(order.orderStatus)) {
    throw new Error('ORDER_FINAL');
  }

  if (order.orderStatus === 'cancel_requested' && status !== 'cancelled') {
    throw new Error('ORDER_STATUS_LOCKED');
  }

  if (order.orderStatus === status) {
    throw new Error('ORDER_STATUS_SAME');
  }

  if (status === 'cancelled') {
    order.orderStatus = status;
    await order.save();
    return order;
  }

  const statusRank = {
    pending: 1,
    confirmed: 2,
    preparing: 3,
    shipping: 4,
    delivered: 5
  };

  const currentRank = statusRank[order.orderStatus] ?? 0;
  const nextRank = statusRank[status] ?? 0;

  if (nextRank <= currentRank) {
    throw new Error('ORDER_STATUS_ROLLBACK');
  }

  order.orderStatus = status;
  await order.save();
  return order;
};

module.exports = {
  checkoutFromCart,
  getMyOrders,
  getOrderById,
  cancelOrder,
  confirmDelivered,
  getAdminOrders,
  updateOrderStatus
};
