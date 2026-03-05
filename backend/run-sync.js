require('dotenv').config();
const SyncService = require('./src/syncService');

(async()=>{
  try {
    const res = await SyncService.syncOrders();
    console.log('sync result', res);
  } catch(err){
    console.error('sync error', err);
  } finally {
    process.exit(0);
  }
})();
