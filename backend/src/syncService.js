const wordpressClient = require('./wordpress');
const { prisma } = require('./db');

class SyncService {
  /**
   * Helper used by both bulk sync and webhooks; upserts a single order object
   */
  static async processOrder(wpOrder) {
    // create or update the order record itself
    const existingOrder = await prisma.orders.findUnique({
      where: { wordpressId: wpOrder.id },
    });

    let orderRecord;
    if (existingOrder) {
      orderRecord = await prisma.orders.update({
        where: { id: existingOrder.id },
        data: {
          status: wpOrder.status,
          paymentStatus: wpOrder.payment_method_title,
          total: parseFloat(wpOrder.total) || 0,
          updatedAt: new Date(),
        },
      });
    } else {
      orderRecord = await prisma.orders.create({
        data: {
          wordpressId: wpOrder.id,
          orderNumber: wpOrder.number,
          customerId: wpOrder.customer_id,
          customerEmail: wpOrder.billing.email,
          customerName: wpOrder.billing.first_name + ' ' + wpOrder.billing.last_name,
          total: parseFloat(wpOrder.total) || 0,
          currency: wpOrder.currency,
          status: wpOrder.status,
          paymentStatus: wpOrder.payment_method_title || 'unpaid',
        },
      });
    }

    // upsert line items (simple approach: delete existing items then recreate)
    await prisma.orderItem.deleteMany({ where: { orderId: orderRecord.id } });

    for (const item of wpOrder.line_items) {
      // ensure product exists locally
      let product = await prisma.product.findUnique({
        where: { wordpressId: item.product_id },
      });

      if (!product) {
        const wpProduct = await wordpressClient.fetchProduct(item.product_id);
        product = await prisma.product.create({
          data: {
            wordpressId: wpProduct.id,
            sku: wpProduct.sku || `SKU-${wpProduct.id}`,
            name: wpProduct.name,
            description: wpProduct.description,
            price: parseFloat(wpProduct.price) || 0,
            quantity: wpProduct.stock_quantity || 0,
          },
        });
      }

      await prisma.orderItem.create({
        data: {
          orderId: orderRecord.id,
          productId: product.id,
          quantity: item.quantity,
          price: parseFloat(item.price) || 0,
          total: parseFloat(item.total) || 0,
          sku: item.sku || product.sku,
        },
      });
    }

    return orderRecord;
  }

  /**
   * Sync orders from WordPress to database
   */
  static async syncOrders() {
    try {
      console.log('Starting order sync...');
      let page = 1;
      const perPage = 100;
      let syncedCount = 0;
      const errors = [];

      while (true) {
        const wpOrders = await wordpressClient.fetchOrders(page, perPage);
        if (!wpOrders || wpOrders.length === 0) break;

        for (const wpOrder of wpOrders) {
          try {
            await this.processOrder(wpOrder);
            syncedCount++;
          } catch (itemError) {
            errors.push(`Order ${wpOrder.id}: ${itemError.message}`);
          }
        }

        // if we received less than perPage, we're done
        if (wpOrders.length < perPage) break;
        page++;
      }

      // Log sync result
      await prisma.syncLog.create({
        data: {
          type: 'orders',
          status: errors.length === 0 ? 'success' : 'partial',
          message: `Synced ${syncedCount} orders`,
          errorMsg: errors.length > 0 ? errors.join('; ') : null,
        },
      });

      console.log(`Order sync completed: ${syncedCount} orders synced`);
      return { syncedCount, errors };
    } catch (error) {
      console.error('Order sync failed:', error);
      
      await prisma.syncLog.create({
        data: {
          type: 'orders',
          status: 'failed',
          errorMsg: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Sync inventory (products) from WordPress to database
   */
  static async syncInventory() {
    try {
      console.log('Starting inventory sync...');
      const wpProducts = await wordpressClient.fetchProducts(1, 1000);
      
      let syncedCount = 0;
      const errors = [];

      for (const wpProduct of wpProducts) {
        try {
          const existingProduct = await prisma.product.findUnique({
            where: { wordpressId: wpProduct.id },
          });

          if (existingProduct) {
            // Update existing product
            await prisma.product.update({
              where: { id: existingProduct.id },
              data: {
                quantity: wpProduct.stock_quantity || 0,
                price: parseFloat(wpProduct.price) || 0,
                updatedAt: new Date(),
              },
            });
          } else {
            // Create new product
            await prisma.product.create({
              data: {
                wordpressId: wpProduct.id,
                sku: wpProduct.sku || `SKU-${wpProduct.id}`,
                name: wpProduct.name,
                description: wpProduct.description,
                price: parseFloat(wpProduct.price) || 0,
                quantity: wpProduct.stock_quantity || 0,
              },
            });
          }
          syncedCount++;
        } catch (productError) {
          errors.push(`Product ${wpProduct.id}: ${productError.message}`);
        }
      }

      // Log sync result
      await prisma.syncLog.create({
        data: {
          type: 'inventory',
          status: errors.length === 0 ? 'success' : 'partial',
          message: `Synced ${syncedCount} products`,
          errorMsg: errors.length > 0 ? errors.join('; ') : null,
        },
      });

      console.log(`Inventory sync completed: ${syncedCount} products synced`);
      return { syncedCount, errors };
    } catch (error) {
      console.error('Inventory sync failed:', error);

      await prisma.syncLog.create({
        data: {
          type: 'inventory',
          status: 'failed',
          errorMsg: error.message,
        },
      });

      throw error;
    }
  }
}

module.exports = SyncService;
