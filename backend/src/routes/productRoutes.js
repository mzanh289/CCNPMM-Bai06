const express = require('express');
const catalogController = require('../controllers/catalogController');

const router = express.Router();

router.get('/best-sellers', catalogController.getBestSellers);
router.get('/promotions', catalogController.getPromotions);
router.get('/most-viewed', catalogController.getMostViewed);

module.exports = router;
