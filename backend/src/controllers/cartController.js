const cartService = require('../services/cartService');

const logControllerError = (operation, error) => {
  console.error(`[cartController:${operation}]`, {
    message: error.message,
    stack: error.stack
  });
};

const respondSuccess = (res, message, data = {}) =>
  res.status(200).json({ success: true, message, data });

const respondError = (res, status, message, data = {}) =>
  res.status(status).json({ success: false, message, data });

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCartByUser(req.user.id);
    return respondSuccess(res, 'Cart loaded.', { cart });
  } catch (error) {
    logControllerError('getCart', error);
    return respondError(res, 500, 'Unable to load cart.');
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return respondError(res, 400, 'Product is required.');
    }

    const normalizedQty = Number(quantity ?? 1);
    if (!Number.isFinite(normalizedQty) || normalizedQty <= 0) {
      return respondError(res, 400, 'Quantity must be greater than 0.');
    }

    const cart = await cartService.addItemToCart(req.user.id, productId, normalizedQty);
    return respondSuccess(res, 'Item added to cart.', { cart });
  } catch (error) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      return respondError(res, 404, 'Product not found.');
    }
    if (error.message === 'INVALID_QUANTITY') {
      return respondError(res, 400, 'Quantity must be greater than 0.');
    }

    logControllerError('addToCart', error);
    return respondError(res, 500, 'Unable to add item to cart.');
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const normalizedQty = Number(quantity);

    if (!Number.isFinite(normalizedQty) || normalizedQty < 0) {
      return respondError(res, 400, 'Quantity must be 0 or greater.');
    }

    const cart = await cartService.updateCartItem(req.user.id, itemId, normalizedQty);
    return respondSuccess(res, 'Cart item updated.', { cart });
  } catch (error) {
    if (error.message === 'CART_ITEM_NOT_FOUND') {
      return respondError(res, 404, 'Cart item not found.');
    }

    if (error.message === 'PRODUCT_NOT_FOUND') {
      return respondError(res, 404, 'Product not found.');
    }

    if (error.message === 'INVALID_QUANTITY') {
      return respondError(res, 400, 'Quantity must be 0 or greater.');
    }

    logControllerError('updateCartItem', error);
    return respondError(res, 500, 'Unable to update cart item.');
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await cartService.removeCartItem(req.user.id, itemId);
    return respondSuccess(res, 'Cart item removed.', { cart });
  } catch (error) {
    if (error.message === 'CART_ITEM_NOT_FOUND') {
      return respondError(res, 404, 'Cart item not found.');
    }

    logControllerError('removeCartItem', error);
    return respondError(res, 500, 'Unable to remove cart item.');
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    return respondSuccess(res, 'Cart cleared.', { cart });
  } catch (error) {
    logControllerError('clearCart', error);
    return respondError(res, 500, 'Unable to clear cart.');
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
