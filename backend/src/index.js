require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const { Queue } = require('bullmq');
const SyncService = require('./syncService');
// configuration modules (redis connection, etc.)
const { redisConnection } = require('./config/redis');
const { prisma } = require('./db');

// Redis instance (for general use)
const redis = new Redis(redisConnection);

// BullMQ queues (shared via queue/index.js when needed elsewhere)
const { jobQueue, syncQueue } = require('./queue');

const app = express();
const PORT = process.env.PORT || 4000;

// ========== MIDDLEWARE ==========
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ========== HEALTH CHECK ==========
app.get('/', (req, res) => {
  res.json({ message: 'Unicommerce Backend API', status: 'running' });
});

// routers
const ordersRouter = require('./routes/orders');
const inventoryRouter = require('./routes/inventory');
const syncRouter = require('./routes/sync');
const webhookRouter = require('./routes/webhook');

app.use('/orders', ordersRouter);
app.use('/inventory', inventoryRouter);
app.use('/sync', syncRouter);
app.use('/webhook', webhookRouter);

// ========== USER ROUTES ==========
app.post('/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await prisma.user.create({ data: { email, name } });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// NOTE: other functionality has been moved into dedicated routes/controllers.



// ========== INVENTORY ROUTES ==========
// Get all products/inventory
app.get('/inventory', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get single product
app.get('/inventory/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Update product stock
app.put('/inventory/:id/stock', async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { quantity },
    });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// ========== SYNC ROUTES ==========
// Sync orders from WordPress
app.post('/sync/orders', async (req, res) => {
  try {
    const job = await syncQueue.add('sync-orders', {});
    res.json({ message: 'Order sync job queued', jobId: job.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to queue sync job' });
  }
});

// Sync inventory from WordPress
app.post('/sync/inventory', async (req, res) => {
  try {
    const job = await syncQueue.add('sync-inventory', {});
    res.json({ message: 'Inventory sync job queued', jobId: job.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to queue sync job' });
  }
});

// Sync all (orders + inventory)
app.post('/sync/all', async (req, res) => {
  try {
    const orderJob = await syncQueue.add('sync-orders', {});
    const inventoryJob = await syncQueue.add('sync-inventory', {});
    res.json({ 
      message: 'Sync jobs queued', 
      orderJobId: orderJob.id,
      inventoryJobId: inventoryJob.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to queue sync jobs' });
  }
});

// webhook endpoint for WordPress order notifications
app.post('/webhook/orders', async (req, res) => {
  // optionally verify a signature header here if WP is configured
  try {
    const wpOrder = req.body;
    if (!wpOrder || !wpOrder.id) {
      return res.status(400).json({ error: 'invalid payload' });
    }

    // process single order immediately
    await SyncService.processOrder(wpOrder);
    res.json({ message: 'order processed' });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    res.status(500).json({ error: 'processing failed' });
  }
});

// Get sync logs
app.get('/sync/logs', async (req, res) => {
  try {
    const logs = await prisma.syncLog.findMany({
      orderBy: { syncedAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sync logs' });
  }
});

// ========== JOB QUEUE ROUTE ==========
app.post('/jobs', async (req, res) => {
  try {
    const job = await jobQueue.add('simple-job', req.body);
    res.json({ jobId: job.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add job' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Unicommerce backend running on http://localhost:${PORT}`);
});

module.exports = { app, prisma, redis, jobQueue, syncQueue, redisConnection };