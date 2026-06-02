const db = require('../../config/database');
const { parsePagination, paginationMeta } = require('../../utils/helpers');

class AdminController {
  // GET /api/v1/admin/dashboard
  async dashboard(req, res, next) {
    try {
      const [totalOrders] = await db('orders').count('id as count');
      const [totalRevenue] = await db('orders').where('status', '!=', 'cancelled').sum('total_amount as total');
      const [totalProducts] = await db('products').count('id as count');
      const [totalUsers] = await db('users').where({ role: 'customer' }).count('id as count');
      const [pendingOrders] = await db('orders').where({ status: 'pending' }).count('id as count');

      // Recent orders
      const recentOrders = await db('orders')
        .join('users', 'orders.user_id', 'users.id')
        .select('orders.*', 'users.email', 'users.first_name', 'users.last_name')
        .orderBy('orders.created_at', 'desc')
        .limit(10);

      // Top selling products
      const topProducts = await db('products')
        .orderBy('total_sold', 'desc')
        .limit(10)
        .select('id', 'name', 'slug', 'price', 'total_sold', 'stock_quantity');

      // Monthly revenue (last 12 months)
      const monthlyRevenue = await db('orders')
        .where('status', '!=', 'cancelled')
        .where('created_at', '>=', db.raw("NOW() - INTERVAL '12 months'"))
        .select(db.raw("DATE_TRUNC('month', created_at) as month"))
        .sum('total_amount as revenue')
        .count('id as order_count')
        .groupByRaw("DATE_TRUNC('month', created_at)")
        .orderBy('month', 'desc');

      res.json({
        data: {
          stats: {
            total_orders: parseInt(totalOrders.count),
            total_revenue: parseFloat(totalRevenue.total) || 0,
            total_products: parseInt(totalProducts.count),
            total_customers: parseInt(totalUsers.count),
            pending_orders: parseInt(pendingOrders.count),
          },
          recent_orders: recentOrders,
          top_products: topProducts,
          monthly_revenue: monthlyRevenue,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/admin/users
  async getUsers(req, res, next) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const [{ count }] = await db('users').count('id as count');

      const users = await db('users')
        .select('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(limit).offset(offset);

      res.json({ data: users, pagination: paginationMeta(parseInt(count), page, limit) });
    } catch (error) { next(error); }
  }

  // PUT /api/v1/admin/users/:id/role
  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      if (!['customer', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      const [user] = await db('users').where({ id: req.params.id })
        .update({ role }).returning(['id', 'email', 'role']);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ data: user });
    } catch (error) { next(error); }
  }

  // GET /api/v1/admin/analytics
  async analytics(req, res, next) {
    try {
      // Orders by status
      const ordersByStatus = await db('orders')
        .select('status')
        .count('id as count')
        .groupBy('status');

      // Revenue by payment method
      const revenueByMethod = await db('payments')
        .where({ status: 'success' })
        .select('method')
        .sum('amount as total')
        .count('id as count')
        .groupBy('method');

      // Top categories
      const topCategories = await db('products')
        .join('categories', 'products.category_id', 'categories.id')
        .select('categories.name')
        .sum('products.total_sold as total_sold')
        .groupBy('categories.name')
        .orderBy('total_sold', 'desc')
        .limit(10);

      // Low stock products
      const lowStock = await db('products')
        .where('stock_quantity', '<', 10)
        .where({ is_active: true, track_inventory: true })
        .select('id', 'name', 'stock_quantity')
        .orderBy('stock_quantity');

      res.json({
        data: { ordersByStatus, revenueByMethod, topCategories, lowStock },
      });
    } catch (error) { next(error); }
  }
}

module.exports = new AdminController();
