const SyncService = require('../syncService');

exports.handleOrderWebhook = async (req, res) => {
  try {
    const wpOrder = req.body;
    if (!wpOrder || !wpOrder.id) {
      return res.status(400).json({ error: 'invalid payload' });
    }

    await SyncService.processOrder(wpOrder);
    res.json({ message: 'order processed' });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    res.status(500).json({ error: 'processing failed' });
  }
};