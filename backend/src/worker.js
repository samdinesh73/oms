const { Worker } = require('bullmq');
const { redisConnection } = require('./config');
const SyncService = require('./syncService');

// Worker for general jobs
const jobWorker = new Worker(
  'jobs',
  async job => {
    console.log(`Processing job ${job.id} with data`, job.data);
    // perform work here
    return { result: 'done' };
  },
  { connection: redisConnection }
);

jobWorker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

jobWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

// Worker for sync jobs
const syncWorker = new Worker(
  'sync',
  async job => {
    console.log(`Processing sync job ${job.id}: ${job.name}`);
    
    try {
      if (job.name === 'sync-orders') {
        const result = await SyncService.syncOrders();
        return { status: 'success', ...result };
      } else if (job.name === 'sync-inventory') {
        const result = await SyncService.syncInventory();
        return { status: 'success', ...result };
      }
      return { status: 'unknown_job' };
    } catch (error) {
      console.error(`Sync job ${job.id} error:`, error);
      throw error;
    }
  },
  { connection: redisConnection }
);

syncWorker.on('completed', job => {
  console.log(`Sync job ${job.id} completed with result:`, job.returnvalue);
});

syncWorker.on('failed', (job, err) => {
  console.error(`Sync job ${job.id} failed:`, err.message);
});

module.exports = { jobWorker, syncWorker };
