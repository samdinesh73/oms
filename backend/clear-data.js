const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearSampleData() {
  try {
    console.log('Clearing sample data...');
    
    // Delete all order items first (due to foreign key constraint)
    await prisma.orderItem.deleteMany({});
    console.log('Deleted all order items');
    
    // Delete all orders
    await prisma.orders.deleteMany({});
    console.log('Deleted all orders');
    
    // Delete all products
    await prisma.product.deleteMany({});
    console.log('Deleted all products');
    
    console.log('Sample data cleared successfully!');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSampleData();
