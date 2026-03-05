const { Queue } = require('bullmq');
const { redisConnection } = require('./index');

// exported queue for reuse
const jobQueue = new Queue('jobs', { connection: redisConnection });

module.exports = { jobQueue };
