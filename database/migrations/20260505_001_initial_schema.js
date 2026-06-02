/**
 * Full database schema for GymNTonic eCommerce system
 */
exports.up = function (knex) {
  return knex.schema
    // ─── Users ────────────────────────────────────────────
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('phone', 20);
      table.enum('role', ['customer', 'admin']).defaultTo('customer');
      table.string('refresh_token', 500);
      table.string('reset_token', 255);
      table.timestamp('reset_token_expires');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // ─── Categories (nested via parent_id) ────────────────
    .createTable('categories', (table) => {
      table.increments('id').primary();
      table.string('name', 200).notNullable();
      table.string('slug', 250).notNullable().unique();
      table.text('description');
      table.string('image_url', 500);
      table.integer('parent_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
      table.integer('sort_order').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // ─── Products ─────────────────────────────────────────
    .createTable('products', (table) => {
      table.increments('id').primary();
      table.string('name', 500).notNullable();
      table.string('slug', 550).notNullable().unique();
      table.text('description');
      table.text('short_description');
      table.decimal('price', 10, 2).notNullable();
      table.decimal('retail_price', 10, 2); // original/retail price for showing discounts
      table.decimal('cost_price', 10, 2);
      table.string('sku', 100).unique();
      table.integer('stock_quantity').defaultTo(0);
      table.boolean('track_inventory').defaultTo(true);
      table.decimal('weight', 8, 2); // in grams
      table.string('brand', 200);
      table.boolean('is_featured').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('SET NULL');
      table.float('average_rating').defaultTo(0);
      table.integer('review_count').defaultTo(0);
      table.integer('total_sold').defaultTo(0);
      table.jsonb('meta'); // SEO meta, extra attributes
      table.timestamps(true, true);

      table.index(['category_id']);
      table.index(['is_featured']);
      table.index(['is_active']);
      table.index(['price']);
    })

    // ─── Product Variants ─────────────────────────────────
    .createTable('product_variants', (table) => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.string('name', 200).notNullable(); // e.g. "Fruit Punch", "30 servings"
      table.string('variant_type', 100); // e.g. "flavor", "size", "color"
      table.decimal('price_modifier', 10, 2).defaultTo(0); // adds/subtracts from base price
      table.string('sku', 100);
      table.integer('stock_quantity').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // ─── Product Images ───────────────────────────────────
    .createTable('product_images', (table) => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.string('url', 500).notNullable();
      table.string('alt_text', 300);
      table.boolean('is_primary').defaultTo(false);
      table.integer('sort_order').defaultTo(0);
      table.timestamps(true, true);
    })

    // ─── Shipping Addresses ───────────────────────────────
    .createTable('shipping_addresses', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('label', 100); // "Home", "Work"
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('address_line_1', 300).notNullable();
      table.string('address_line_2', 300);
      table.string('city', 100).notNullable();
      table.string('state', 100).notNullable();
      table.string('postal_code', 20).notNullable();
      table.string('country', 100).notNullable().defaultTo('US');
      table.string('phone', 20);
      table.boolean('is_default').defaultTo(false);
      table.timestamps(true, true);
    })

    // ─── Cart Items ───────────────────────────────────────
    .createTable('cart_items', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('session_id', 100); // for guest carts
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.integer('variant_id').unsigned().references('id').inTable('product_variants').onDelete('SET NULL');
      table.integer('quantity').notNullable().defaultTo(1);
      table.timestamps(true, true);

      table.index(['user_id']);
      table.index(['session_id']);
    })

    // ─── Coupons ──────────────────────────────────────────
    .createTable('coupons', (table) => {
      table.increments('id').primary();
      table.string('code', 50).notNullable().unique();
      table.enum('discount_type', ['percentage', 'fixed']).notNullable();
      table.decimal('discount_value', 10, 2).notNullable();
      table.decimal('min_order_amount', 10, 2).defaultTo(0);
      table.decimal('max_discount', 10, 2); // cap for percentage discounts
      table.integer('usage_limit');
      table.integer('times_used').defaultTo(0);
      table.timestamp('valid_from');
      table.timestamp('valid_until');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // ─── Orders ───────────────────────────────────────────
    .createTable('orders', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('RESTRICT');
      table.enum('status', [
        'pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
      ]).defaultTo('pending');
      table.decimal('subtotal', 10, 2).notNullable();
      table.decimal('shipping_cost', 10, 2).defaultTo(0);
      table.decimal('discount_amount', 10, 2).defaultTo(0);
      table.decimal('tax_amount', 10, 2).defaultTo(0);
      table.decimal('total_amount', 10, 2).notNullable();
      table.integer('coupon_id').unsigned().references('id').inTable('coupons').onDelete('SET NULL');
      table.string('shipping_method', 100);
      table.string('tracking_number', 200);
      table.text('notes');
      // Shipping address snapshot
      table.jsonb('shipping_address');
      table.timestamps(true, true);

      table.index(['user_id']);
      table.index(['status']);
    })

    // ─── Order Items ──────────────────────────────────────
    .createTable('order_items', (table) => {
      table.increments('id').primary();
      table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('RESTRICT');
      table.integer('variant_id').unsigned().references('id').inTable('product_variants').onDelete('SET NULL');
      table.string('product_name', 500).notNullable(); // snapshot
      table.string('variant_name', 200);
      table.decimal('unit_price', 10, 2).notNullable();
      table.integer('quantity').notNullable();
      table.decimal('total_price', 10, 2).notNullable();
      table.timestamps(true, true);
    })

    // ─── Payments ─────────────────────────────────────────
    .createTable('payments', (table) => {
      table.increments('id').primary();
      table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('RESTRICT');
      table.string('reference', 200).notNullable().unique();
      table.enum('method', ['paystack', 'crypto_btc', 'crypto_eth', 'crypto_usdt']).notNullable();
      table.enum('status', ['pending', 'success', 'failed', 'refunded']).defaultTo('pending');
      table.decimal('amount', 10, 2).notNullable();
      table.string('currency', 10).defaultTo('USD');
      table.jsonb('provider_response'); // raw response from payment provider
      table.string('crypto_tx_hash', 300); // for crypto payments
      table.timestamps(true, true);

      table.index(['order_id']);
      table.index(['reference']);
    })

    // ─── Wishlists ────────────────────────────────────────
    .createTable('wishlists', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.timestamps(true, true);

      table.unique(['user_id', 'product_id']);
    })

    // ─── Reviews ──────────────────────────────────────────
    .createTable('reviews', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.integer('rating').notNullable(); // 1-5
      table.string('title', 200);
      table.text('body');
      table.boolean('is_approved').defaultTo(false);
      table.timestamps(true, true);

      table.unique(['user_id', 'product_id']);
    })

    // ─── CMS Pages ────────────────────────────────────────
    .createTable('cms_pages', (table) => {
      table.increments('id').primary();
      table.string('title', 300).notNullable();
      table.string('slug', 350).notNullable().unique();
      table.text('content');
      table.boolean('is_published').defaultTo(true);
      table.timestamps(true, true);
    })

    // ─── Homepage Banners ─────────────────────────────────
    .createTable('banners', (table) => {
      table.increments('id').primary();
      table.string('title', 200);
      table.string('image_url', 500).notNullable();
      table.string('link_url', 500);
      table.integer('sort_order').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // ─── Recently Viewed ──────────────────────────────────
    .createTable('recently_viewed', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('session_id', 100);
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.timestamp('viewed_at').defaultTo(knex.fn.now());

      table.index(['user_id']);
      table.index(['session_id']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('recently_viewed')
    .dropTableIfExists('banners')
    .dropTableIfExists('cms_pages')
    .dropTableIfExists('reviews')
    .dropTableIfExists('wishlists')
    .dropTableIfExists('payments')
    .dropTableIfExists('order_items')
    .dropTableIfExists('orders')
    .dropTableIfExists('coupons')
    .dropTableIfExists('cart_items')
    .dropTableIfExists('shipping_addresses')
    .dropTableIfExists('product_images')
    .dropTableIfExists('product_variants')
    .dropTableIfExists('products')
    .dropTableIfExists('categories')
    .dropTableIfExists('users');
};
