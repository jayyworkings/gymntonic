const orderRepository = require('./order.repository');
const { sendOrderConfirmation } = require('../../utils/email');
const db = require('../../config/database');

class OrderService {
  async createOrder(userId, data) {
    const { shipping_address_id, shipping_method, coupon_code, notes } = data;

    const cartItems = await orderRepository.findCartItems(userId);
    if (cartItems.length === 0) throw Object.assign(new Error('Cart is empty'), { statusCode: 400 });

    let subtotal = 0;
    let totalWeightGrams = 0;
    const orderItems = cartItems.map(item => {
      const unitPrice = parseFloat(item.price) + (parseFloat(item.price_modifier) || 0);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;
      totalWeightGrams += (parseFloat(item.weight) || 0) * item.quantity;
      return {
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_name: item.variant_name,
        unit_price: unitPrice,
        quantity: item.quantity,
        total_price: totalPrice,
      };
    });

    let discountAmount = 0;
    let couponId = null;
    if (coupon_code) {
      const coupon = await orderRepository.findCoupon(coupon_code);
      if (!coupon) throw Object.assign(new Error('Invalid or expired coupon'), { statusCode: 400 });
      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) throw Object.assign(new Error('Coupon usage limit reached'), { statusCode: 400 });
      if (coupon.min_order_amount && subtotal < parseFloat(coupon.min_order_amount)) throw Object.assign(new Error(`Minimum order amount of $${coupon.min_order_amount} not met`), { statusCode: 400 });

      couponId = coupon.id;
      if (coupon.discount_type === 'percentage') {
        discountAmount = subtotal * (coupon.discount_value / 100);
        if (coupon.max_discount) discountAmount = Math.min(discountAmount, parseFloat(coupon.max_discount));
      } else {
        discountAmount = parseFloat(coupon.discount_value);
      }
      await orderRepository.incrementCouponUsage(coupon.id);
    }

    let baseShipping = 9.99;
    const totalWeightKg = totalWeightGrams / 1000;
    if (subtotal >= 100 && (!shipping_method || shipping_method === 'standard')) {
      baseShipping = 0;
    } else {
      baseShipping += Math.ceil(totalWeightKg) * 2.00;
    }
    
    let shippingCost = baseShipping;
    if (shipping_method === 'express') {
      shippingCost = baseShipping === 0 ? 15.00 : baseShipping + 15.00;
    }

    const totalAmount = subtotal - discountAmount + shippingCost;

    let shippingAddress = null;
    if (shipping_address_id) {
      shippingAddress = await orderRepository.findShippingAddress(shipping_address_id, userId);
    }

    const orderData = {
      user_id: userId,
      subtotal,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      coupon_id: couponId,
      shipping_method: shipping_method || 'standard',
      shipping_address: shippingAddress ? JSON.stringify(shippingAddress) : null,
      notes,
    };

    const newOrder = await orderRepository.createOrderTx(orderData, orderItems, cartItems, userId);

    const user = await db('users').where({ id: userId }).first();
    sendOrderConfirmation(user, newOrder).catch(console.error);

    return newOrder;
  }

  async getUserOrders(userId, pagination) {
    const count = await orderRepository.countUserOrders(userId);
    const orders = await orderRepository.findUserOrders(userId, pagination.limit, pagination.offset);
    return { orders, count };
  }

  async getOrderById(id, userId) {
    const order = await orderRepository.findOrderById(id, userId);
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

    order.items = await orderRepository.findOrderItems(order.id);
    order.payments = await orderRepository.findOrderPayments(order.id);
    return order;
  }

  async updateOrderStatus(id, data) {
    const { status, tracking_number } = data;
    const order = await orderRepository.findOrderByIdAdmin(id);
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

    const validTransitions = {
      pending: ['paid', 'cancelled'],
      paid: ['processing', 'refunded', 'cancelled'],
      processing: ['shipped', 'cancelled', 'refunded'],
      shipped: ['delivered', 'refunded', 'cancelled'],
      delivered: ['completed', 'refunded'],
      completed: ['refunded'],
      cancelled: [],
      refunded: []
    };

    if (order.status !== status && !validTransitions[order.status]?.includes(status)) {
      throw Object.assign(new Error(`Cannot transition order from ${order.status} to ${status}`), { statusCode: 400 });
    }

    const update = { status, updated_at: new Date() };
    if (tracking_number) update.tracking_number = tracking_number;

    return orderRepository.updateOrderStatusTx(id, update, status === 'cancelled', order.status);
  }

  async getAllOrders(status, pagination) {
    return orderRepository.findAllOrdersAdmin(status, pagination.limit, pagination.offset);
  }
}

module.exports = new OrderService();
