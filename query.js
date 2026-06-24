const db = require('./backend/src/config/database');
db('products')
  .leftJoin('product_images', function() {
    this.on('products.id', '=', 'product_images.product_id')
      .andOn('product_images.is_primary', '=', db.raw('true'));
  })
  .select('products.name', 'product_images.url as image_url')
  .where('products.id', 430)
  .then(console.log)
  .finally(() => process.exit(0));
