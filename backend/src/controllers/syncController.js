const { syncQueue } = require('../queue');

exports.queueOrdersSync = async (req, res) => {
  try {
    const job = await syncQueue.add('sync-orders', {});
    res.json({ message: 'Order sync job queued', jobId: job.id });
  } catch (err) {
    console.error('Failed to queue order sync job', err);
    res.status(500).json({ error: 'Failed to queue sync job' });
  }
};

exports.queueInventorySync = async (req, res) => {
  try {
    const job = await syncQueue.add('sync-inventory', {});
    res.json({ message: 'Inventory sync job queued', jobId: job.id });
  } catch (err) {
    console.error('Failed to queue inventory sync job', err);
    res.status(500).json({ error: 'Failed to queue sync job' });
  }
};

exports.queueAllSync = async (req, res) => {
  try {
    const orderJob = await syncQueue.add('sync-orders', {});
    const inventoryJob = await syncQueue.add('sync-inventory', {});
    res.json({ 
      message: 'Sync jobs queued', 
      orderJobId: orderJob.id,
      inventoryJobId: inventoryJob.id
    });
  } catch (err) {
    console.error('Failed to queue sync jobs', err);
    res.status(500).json({ error: 'Failed to queue sync jobs' });
  }
};

exports.getSyncLogs = async (req, res) => {
  const { prisma } = require('../db');
  try {
    const logs = await prisma.syncLog.findMany({
      orderBy: { syncedAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching sync logs:', err);
    res.status(500).json({ error: 'Failed to fetch sync logs' });
  }
};