const Redis = require('ioredis');
const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');

// create queues here and export them so controllers/services can use
const jobQueue = new Queue('jobs', { connection: redisConnection });
const syncQueue = new Queue('sync', { connection: redisConnection });

module.exports = { jobQueue, syncQueue };