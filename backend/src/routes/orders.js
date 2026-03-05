const express = require('express');
const {
  getOrders,
  getOrderCount,
  getOrderById,
} = require('../controllers/ordersController');

const router = express.Router();
router.get('/', getOrders);
router.get('/count', getOrderCount);
router.get('/:id', getOrderById);

module.exports = router;