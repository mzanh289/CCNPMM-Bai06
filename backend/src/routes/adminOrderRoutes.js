const express = require('express');
const adminOrderController = require('../controllers/adminOrderController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/', adminOrderController.getAdminOrders);
router.patch('/:id/status', adminOrderController.updateOrderStatus);

module.exports = router;
