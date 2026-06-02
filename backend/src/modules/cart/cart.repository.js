const db = require('../../config/database');

class CartRepository {
  async findItems(where) {
    return db('cart_items')
      .join('products', 'cart_items.product_id', 'products.id')
      .leftJoin('product_variants', 'cart_items.variant_id', 'product_variants.id')
      .leftJoin('product_images', function () {
        this.on('products.id', '=', 'product_images.product_id')
          .andOn('product_images.is_primary', '=', db.raw('true'));
      })
      .select(
        'cart_items.id',
        'cart_items.quantity',
        'products.id as product_id',
        'products.name as product_name',
        'products.slug as product_slug',
        'products.price',
        'products.stock_quantity',
        'product_variants.name as variant_name',
        'product_variants.price_modifier',
        'product_images.url as image_url'
      )
      .where(where);
  }

  async findExistingItem(where) {
    return db('cart_items').where(where).first();
  }

  async createItem(data) {
    return db('cart_items').insert(data);
  }

  async updateItemQuantity(id, quantity) {
    return db('cart_items').where({ id }).update({ quantity, updated_at: new Date() });
  }

  async deleteItem(where) {
    return db('cart_items').where(where).del();
  }

  async findCoupon(code) {
    return db('coupons')
      .where({ code: code.toUpperCase(), is_active: true })
      .where('valid_from', '<=', new Date())
      .where('valid_until', '>=', new Date())
      .first();
  }
}

module.exports = new CartRepository();
