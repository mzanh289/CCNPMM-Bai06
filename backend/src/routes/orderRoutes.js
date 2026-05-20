const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('USER', 'ADMIN'));

router.post('/checkout', orderController.checkout);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderDetail);
router.patch('/:id/cancel', orderController.cancelOrder);
router.patch('/:id/confirm-delivered', orderController.confirmDelivered);

module.exports = router;
