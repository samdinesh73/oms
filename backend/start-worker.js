require('dotenv').config();

const redis = require('ioredis');
const { Worker } = require('bullmq');

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
};

const SyncService = require('./src/syncService');

console.log('Starting BullMQ Worker...');

// Worker for sync jobs
const syncWorker = new Worker(
  'sync',
  async job => {
    console.log(`[Worker] Processing sync job ${job.id}: ${job.name}`);
    
    try {
      if (job.name === 'sync-orders') {
        console.log('[Worker] Starting order sync...');
        const result = await SyncService.syncOrders();
        console.log('[Worker] Order sync completed:', result);
        return { status: 'success', ...result };
      } else if (job.name === 'sync-inventory') {
        console.log('[Worker] Starting inventory sync...');
        const result = await SyncService.syncInventory();
        console.log('[Worker] Inventory sync completed:', result);
        return { status: 'success', ...result };
      }
      return { status: 'unknown_job' };
    } catch (error) {
      console.error(`[Worker] Sync job ${job.id} error:`, error.message);
      throw error;
    }
  },
  { connection: redisConnection }
);

syncWorker.on('completed', job => {
  console.log(`[Worker] Sync job ${job.id} completed with result:`, job.returnvalue);
});

syncWorker.on('failed', (job, err) => {
  console.error(`[Worker] Sync job ${job.id} failed:`, err.message);
});

syncWorker.on('error', err => {
  console.error('[Worker] Worker error:', err);
});

console.log('Worker is listening for sync jobs...');
console.log('Press Ctrl+C to stop the worker');

// Keep worker running
process.on('SIGINT', async () => {
  console.log('\n[Worker] Shutting down worker...');
  await syncWorker.close();
  process.exit(0);
});
