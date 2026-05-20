const orderService = require('../services/orderService');

const logControllerError = (operation, error) => {
  console.error(`[adminOrderController:${operation}]`, {
    message: error.message,
    stack: error.stack
  });
};

const respondSuccess = (res, message, data = {}) =>
  res.status(200).json({ success: true, message, data });

const respondError = (res, status, message, data = {}) =>
  res.status(status).json({ success: false, message, data });

const getAdminOrders = async (req, res) => {
  try {
    const { status, page, limit } = req.query || {};
    const result = await orderService.getAdminOrders({ status, page, limit });
    return respondSuccess(res, 'Orders loaded.', result);
  } catch (error) {
    logControllerError('getAdminOrders', error);
    return respondError(res, 500, 'Unable to load orders.');
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    return respondSuccess(res, 'Order status updated.', { order });
  } catch (error) {
    if (error.message === 'INVALID_STATUS') {
      return respondError(res, 400, 'Invalid order status.');
    }
    if (error.message === 'ORDER_NOT_FOUND') {
      return respondError(res, 404, 'Order not found.');
    }
    if (error.message === 'ORDER_FINAL') {
      return respondError(res, 409, 'Order status cannot be changed.');
    }
    if (error.message === 'ORDER_STATUS_LOCKED') {
      return respondError(res, 409, 'Order is waiting for cancellation approval.');
    }
    if (error.message === 'ORDER_STATUS_SAME') {
      return respondError(res, 409, 'Order already has this status.');
    }
    if (error.message === 'ORDER_STATUS_ROLLBACK') {
      return respondError(res, 409, 'Order status rollback is not allowed.');
    }

    logControllerError('updateOrderStatus', error);
    return respondError(res, 500, 'Unable to update order status.');
  }
};

module.exports = {
  getAdminOrders,
  updateOrderStatus
};
