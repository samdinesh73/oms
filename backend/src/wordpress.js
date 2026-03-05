const axios = require('axios');

class WordPressClient {
  constructor() {
    this.baseURL = process.env.WORDPRESS_URL;
    this.consumerKey = process.env.WORDPRESS_CONSUMER_KEY;
    this.consumerSecret = process.env.WORDPRESS_CONSUMER_SECRET;
    this.apiVersion = process.env.WORDPRESS_API_VERSION || 'wc/v3';

    this.client = axios.create({
      baseURL: `${this.baseURL}/wp-json/${this.apiVersion}`,
      auth: {
        username: this.consumerKey,
        password: this.consumerSecret,
      },
      timeout: 10000,
    });
  }

  /**
   * Fetch all orders from WordPress/WooCommerce
   */
  async fetchOrders(page = 1, perPage = 100, status = 'any') {
    try {
      const response = await this.client.get('/orders', {
        params: {
          page,
          per_page: perPage,
          status,
          _embed: true, // Include related data
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching WordPress orders:', error.message);
      throw error;
    }
  }

  /**
   * Fetch a single order by WordPress ID
   */
  async fetchOrder(orderId) {
    try {
      const response = await this.client.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching WordPress order ${orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch all products from WordPress/WooCommerce
   */
  async fetchProducts(page = 1, perPage = 100) {
    try {
      const response = await this.client.get('/products', {
        params: {
          page,
          per_page: perPage,
          status: 'publish',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching WordPress products:', error.message);
      throw error;
    }
  }

  /**
   * Fetch a single product by WordPress ID
   */
  async fetchProduct(productId) {
    try {
      const response = await this.client.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching WordPress product ${productId}:`, error.message);
      throw error;
    }
  }

  /**
   * Update product stock in WordPress
   */
  async updateProductStock(productId, quantity) {
    try {
      const response = await this.client.put(`/products/${productId}`, {
        stock_quantity: quantity,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating product stock ${productId}:`, error.message);
      throw error;
    }
  }

  /**
   * Update order status in WordPress
   */
  async updateOrderStatus(orderId, status) {
    try {
      const response = await this.client.put(`/orders/${orderId}`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating order status ${orderId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new WordPressClient();
