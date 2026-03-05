const { prisma } = require('../db');

exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, pageSize = 20, sortField, sortOrder } = req.query;

    const where = {};
    if (status) {
      const statuses = Array.isArray(status)
        ? status
        : status.toString().split(',').map(s => s.trim());
      where.status = { in: statuses };
    }

    // build orderBy clause; default to createdAt desc
    let orderBy = { createdAt: 'desc' };
    if (sortField) {
      const direction = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
      orderBy = { [sortField]: direction };
    }

    const orders = await prisma.orders.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy,
      skip: (parseInt(page, 10) - 1) * parseInt(pageSize, 10),
      take: parseInt(pageSize, 10),
    });

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getOrderCount = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      const statuses = Array.isArray(status)
        ? status
        : status.toString().split(',').map(s => s.trim());
      where.status = { in: statuses };
    }

    const total = await prisma.orders.count({ where });
    res.json({ count: total });
  } catch (err) {
    console.error('Error fetching order count:', err);
    res.status(500).json({ error: 'Failed to fetch order count' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching order by id:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};