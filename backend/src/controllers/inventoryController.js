const { prisma } = require('../db');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

exports.updateProductStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { quantity },
    });
    res.json(product);
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};