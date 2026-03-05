const express = require('express');
const { handleOrderWebhook } = require('../controllers/webhookController');

const router = express.Router();
router.post('/orders', handleOrderWebhook);

module.exports = router;