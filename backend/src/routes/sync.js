const express = require('express');
const {
  queueOrdersSync,
  queueInventorySync,
  queueAllSync,
  getSyncLogs,
} = require('../controllers/syncController');

const router = express.Router();
router.post('/orders', queueOrdersSync);
router.post('/inventory', queueInventorySync);
router.post('/all', queueAllSync);
router.get('/logs', getSyncLogs);

module.exports = router;