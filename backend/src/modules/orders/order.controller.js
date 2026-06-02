const orderService = require('./order.service');
const { parsePagination, paginationMeta } = require('../../utils/helpers');

class OrderController {
  // POST /api/v1/orders — Create order from cart
  async create(req, res, next) {
    try {
      const order = await orderService.createOrder(req.user.id, req.body);
      res.status(201).json({ data: order });
    } catch (error) { next(error); }
  }

  // GET /api/v1/orders — User's orders
  async getUserOrders(req, res, next) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const { orders, count } = await orderService.getUserOrders(req.user.id, { limit, offset });
      res.json({ data: orders, pagination: paginationMeta(count, page, limit) });
    } catch (error) { next(error); }
  }

  // GET /api/v1/orders/:id
  async getById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user.id);
      res.json({ data: order });
    } catch (error) { next(error); }
  }

  // PUT /api/v1/orders/:id/status (Admin)
  async updateStatus(req, res, next) {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body);
      res.json({ data: order });
    } catch (error) { next(error); }
  }

  // GET /api/v1/orders/admin/all (Admin)
  async getAllOrders(req, res, next) {
    try {
      const { page, limit, offset } = parsePagination(req.query);
      const { status } = req.query;
      const { orders, count } = await orderService.getAllOrders(status, { limit, offset });
      res.json({ data: orders, pagination: paginationMeta(count, page, limit) });
    } catch (error) { next(error); }
  }
}

module.exports = new OrderController();
