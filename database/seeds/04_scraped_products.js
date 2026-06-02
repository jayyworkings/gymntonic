const fs = require('fs');
const path = require('path');

exports.seed = async function(knex) {
  // Read the scraped products
  const dataPath = path.join(__dirname, '../products-data.json');
  if (!fs.existsSync(dataPath)) {
    console.log('No scraped products found. Run scraper first.');
    return;
  }

  const productsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`Seeding ${productsData.length} scraped products...`);

  // Get all categories to map slugs to IDs
  const categories = await knex('categories').select('id', 'slug');
  const categoryMap = {};
  for (const cat of categories) {
    categoryMap[cat.slug] = cat.id;
  }

  // Find a fallback category ID (the first one)
  const fallbackCategoryId = categories[0] ? categories[0].id : null;

  // Track existing products to avoid duplicates
  const existingProducts = await knex('products').select('slug');
  const existingSlugs = new Set(existingProducts.map(p => p.slug));

  let insertedCount = 0;

  // Insert in chunks of 50 to avoid massive queries
  const chunkSize = 50;
  for (let i = 0; i < productsData.length; i += chunkSize) {
    const chunk = productsData.slice(i, i + chunkSize);
    
    for (const item of chunk) {
      if (existingSlugs.has(item.slug)) continue;

      // Ensure price is numeric
      const price = parseFloat(item.price) || 0;
      if (price <= 0) continue;

      const category_id = categoryMap[item.category_slug] || fallbackCategoryId;

      try {
        // Insert product
        const [insertedProduct] = await knex('products').insert({
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: price,
          category_id: category_id,
          brand: item.brand,
          sku: `SKU-${Math.floor(Math.random() * 1000000)}`,
          stock_quantity: 100,
          is_active: item.is_active,
        }).returning('id');

        // Insert image if it exists
        if (item.image) {
          // Fix relative URL to something the frontend will load
          let imageUrl = item.image;
          // The image URL is something like "../../cdn1.bigcommerce.com/..."
          // We can just strip the leading "../../" to make it protocol-relative
          if (imageUrl.startsWith('../../')) {
            imageUrl = 'https://' + imageUrl.substring(6);
          }

          await knex('product_images').insert({
            product_id: insertedProduct.id,
            url: imageUrl,
            is_primary: true,
            sort_order: 0
          });
        }
        
        insertedCount++;
        existingSlugs.add(item.slug);
      } catch (error) {
        console.error(`Failed to insert product ${item.slug}:`, error.message);
      }
    }
  }

  console.log(`Successfully seeded ${insertedCount} new products.`);
};
