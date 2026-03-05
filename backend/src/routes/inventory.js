const express = require('express');
const {
  getAllProducts,
  getProductById,
  updateProductStock,
} = require('../controllers/inventoryController');

const router = express.Router();
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id/stock', updateProductStock);

module.exports = router;