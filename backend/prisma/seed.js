const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create sample products
  const product1 = await prisma.product.upsert({
    where: { wordpressId: 1 },
    update: {},
    create: {
      wordpressId: 1,
      sku: 'SKU-001',
      name: 'Laptop',
      description: 'High-performance laptop',
      price: 999.99,
      quantity: 50,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { wordpressId: 2 },
    update: {},
    create: {
      wordpressId: 2,
      sku: 'SKU-002',
      name: 'Mouse',
      description: 'Wireless mouse',
      price: 29.99,
      quantity: 200,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { wordpressId: 3 },
    update: {},
    create: {
      wordpressId: 3,
      sku: 'SKU-003',
      name: 'Keyboard',
      description: 'Mechanical keyboard',
      price: 149.99,
      quantity: 100,
    },
  });

  // Create sample orders
  const order1 = await prisma.orders.upsert({
    where: { wordpressId: 1001 },
    update: {},
    create: {
      wordpressId: 1001,
      orderNumber: '#1001',
      customerId: 100,
      customerEmail: 'john@example.com',
      customerName: 'John Doe',
      total: 1179.97,
      currency: 'USD',
      status: 'completed',
      paymentStatus: 'paid',
    },
  });

  const order2 = await prisma.orders.upsert({
    where: { wordpressId: 1002 },
    update: {},
    create: {
      wordpressId: 1002,
      orderNumber: '#1002',
      customerId: 101,
      customerEmail: 'jane@example.com',
      customerName: 'Jane Smith',
      total: 179.97,
      currency: 'USD',
      status: 'processing',
      paymentStatus: 'paid',
    },
  });

  const order3 = await prisma.orders.upsert({
    where: { wordpressId: 1003 },
    update: {},
    create: {
      wordpressId: 1003,
      orderNumber: '#1003',
      customerId: 102,
      customerEmail: 'bob@example.com',
      customerName: 'Bob Johnson',
      total: 59.98,
      currency: 'USD',
      status: 'pending',
      paymentStatus: 'unpaid',
    },
  });

  // Create order items
  await prisma.orderItem.upsert({
    where: { id: 1 },
    update: {},
    create: {
      orderId: order1.id,
      productId: product1.id,
      quantity: 1,
      price: 999.99,
      total: 999.99,
      sku: 'SKU-001',
    },
  });

  await prisma.orderItem.upsert({
    where: { id: 2 },
    update: {},
    create: {
      orderId: order1.id,
      productId: product2.id,
      quantity: 6,
      price: 29.99,
      total: 179.94,
      sku: 'SKU-002',
    },
  });

  await prisma.orderItem.upsert({
    where: { id: 3 },
    update: {},
    create: {
      orderId: order2.id,
      productId: product3.id,
      quantity: 1,
      price: 149.99,
      total: 149.99,
      sku: 'SKU-003',
    },
  });

  await prisma.orderItem.upsert({
    where: { id: 4 },
    update: {},
    create: {
      orderId: order2.id,
      productId: product2.id,
      quantity: 1,
      price: 29.99,
      total: 29.99,
      sku: 'SKU-002',
    },
  });

  await prisma.orderItem.upsert({
    where: { id: 5 },
    update: {},
    create: {
      orderId: order3.id,
      productId: product2.id,
      quantity: 2,
      price: 29.99,
      total: 59.98,
      sku: 'SKU-002',
    },
  });

  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
    },
  });

  console.log('Seed completed successfully!');
  console.log(`Created 3 orders and 3 products`);
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
