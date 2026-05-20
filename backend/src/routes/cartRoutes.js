const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('USER', 'ADMIN'));

router.post('/add', cartController.addToCart);
router.get('/', cartController.getCart);
router.put('/item/:itemId', cartController.updateCartItem);
router.delete('/item/:itemId', cartController.removeCartItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;
