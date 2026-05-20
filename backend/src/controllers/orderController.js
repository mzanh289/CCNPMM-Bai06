const orderService = require('../services/orderService');

const logControllerError = (operation, error) => {
  console.error(`[orderController:${operation}]`, {
    message: error.message,
    stack: error.stack
  });
};

const respondSuccess = (res, message, data = {}) =>
  res.status(200).json({ success: true, message, data });

const respondError = (res, status, message, data = {}) =>
  res.status(status).json({ success: false, message, data });

const checkout = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const order = await orderService.checkoutFromCart(req.user.id, shippingAddress || {});
    return respondSuccess(res, 'Checkout successful.', { order });
  } catch (error) {
    if (error.message === 'CART_EMPTY') {
      return respondError(res, 400, 'Cart is empty.');
    }
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return respondError(res, 404, 'Product not found.');
    }
    if (error.message === 'INVALID_SHIPPING_ADDRESS') {
      return respondError(res, 400, 'Shipping address is incomplete.', { fields: error.details || [] });
    }

    logControllerError('checkout', error);
    return respondError(res, 500, 'Unable to complete checkout.');
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    return respondSuccess(res, 'Orders loaded.', { orders });
  } catch (error) {
    logControllerError('getMyOrders', error);
    return respondError(res, 500, 'Unable to load orders.');
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.user.id, req.params.id);
    return respondSuccess(res, 'Order loaded.', { order });
  } catch (error) {
    if (error.message === 'ORDER_NOT_FOUND') {
      return respondError(res, 404, 'Order not found.');
    }

    logControllerError('getOrderDetail', error);
    return respondError(res, 500, 'Unable to load order.');
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.user.id, req.params.id);
    return respondSuccess(res, 'Cancel request submitted.', { order });
  } catch (error) {
    if (error.message === 'ORDER_NOT_FOUND') {
      return respondError(res, 404, 'Order not found.');
    }
    if (error.message === 'ORDER_FINAL') {
      return respondError(res, 409, 'Order can no longer be cancelled.');
    }
    if (error.message === 'ORDER_CANNOT_CANCEL') {
      return respondError(res, 409, 'Order is already shipping.');
    }
    if (error.message === 'ORDER_CANCEL_WINDOW_EXPIRED') {
      return respondError(res, 409, 'Cancellation window expired.');
    }

    logControllerError('cancelOrder', error);
    return respondError(res, 500, 'Unable to cancel order.');
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderDetail,
  cancelOrder
};
