exports.up = function(knex) {
  return knex.schema
    // ─── Blog Posts ──────────────────────────────────────────
    .createTable('blog_posts', (table) => {
      table.increments('id').primary();
      table.string('title', 300).notNullable();
      table.string('slug', 350).notNullable().unique();
      table.text('content');
      table.text('excerpt');
      table.string('author', 100);
      table.string('image_url', 500);
      table.boolean('is_published').defaultTo(true);
      table.timestamps(true, true);
    })

    // ─── Newsletter Subscribers ──────────────────────────────
    .createTable('newsletter_subscribers', (table) => {
      table.increments('id').primary();
      table.string('email', 255).notNullable().unique();
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // ─── Gift Certificates ───────────────────────────────────
    .createTable('gift_certificates', (table) => {
      table.increments('id').primary();
      table.string('code', 50).notNullable().unique();
      table.decimal('amount', 10, 2).notNullable();
      table.decimal('balance', 10, 2).notNullable();
      table.string('sender_name', 100);
      table.string('sender_email', 255);
      table.string('recipient_name', 100);
      table.string('recipient_email', 255);
      table.text('message');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('gift_certificates')
    .dropTableIfExists('newsletter_subscribers')
    .dropTableIfExists('blog_posts');
};
