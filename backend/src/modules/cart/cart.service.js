const cartRepository = require('./cart.repository');
const db = require('../../config/database');

class CartService {
  async getCart(where) {
    if (!where.user_id && !where.session_id) {
      return { items: [], total: 0, item_count: 0 };
    }

    const items = await cartRepository.findItems(where);
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.price) + (parseFloat(item.price_modifier) || 0);
      return sum + price * item.quantity;
    }, 0);

    return { items, total: total.toFixed(2), item_count: items.length };
  }

  async addItem(data, whereCondition) {
    const { product_id, slug, variant_id, quantity = 1 } = data;

    // Try to find product by ID first, then fall back to slug lookup
    let product = null;
    if (product_id) {
      product = await db('products').where({ id: product_id, is_active: true }).first();
    }
    if (!product && slug) {
      product = await db('products').where({ slug: slug, is_active: true }).first();
    }
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    if (product.track_inventory && product.stock_quantity < quantity) {
      throw Object.assign(new Error('Insufficient stock'), { statusCode: 400 });
    }

    const itemData = {
      product_id: product.id,
      variant_id: variant_id || null,
      quantity,
      user_id: whereCondition.user_id || null,
      session_id: whereCondition.session_id || null,
    };

    const searchWhere = { product_id: product.id, variant_id: variant_id || null };
    if (whereCondition.user_id) searchWhere.user_id = whereCondition.user_id;
    else searchWhere.session_id = whereCondition.session_id;

    const existing = await cartRepository.findExistingItem(searchWhere);
    if (existing) {
      await cartRepository.updateItemQuantity(existing.id, existing.quantity + quantity);
    } else {
      await cartRepository.createItem(itemData);
    }
  }

  async updateItem(id, quantity, whereCondition) {
    if (quantity < 1) throw Object.assign(new Error('Quantity must be at least 1'), { statusCode: 400 });
    
    const where = { id };
    if (whereCondition.user_id) where.user_id = whereCondition.user_id;
    else where.session_id = whereCondition.session_id;

    const updated = await cartRepository.updateItemQuantity(id, quantity);
    if (!updated) throw Object.assign(new Error('Cart item not found'), { statusCode: 404 });
  }

  async removeItem(id, whereCondition) {
    const where = { id };
    if (whereCondition.user_id) where.user_id = whereCondition.user_id;
    else where.session_id = whereCondition.session_id;

    const deleted = await cartRepository.deleteItem(where);
    if (!deleted) throw Object.assign(new Error('Cart item not found'), { statusCode: 404 });
  }

  async applyCoupon(code) {
    const coupon = await cartRepository.findCoupon(code);
    if (!coupon) throw Object.assign(new Error('Invalid or expired coupon'), { statusCode: 404 });
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      throw Object.assign(new Error('Coupon usage limit reached'), { statusCode: 400 });
    }
    return coupon;
  }
}

module.exports = new CartService();
