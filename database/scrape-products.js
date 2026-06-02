/**
 * Product data scraper - extracts product info from the cloned frontend HTML
 * Run with: node src/database/seeds/scrape-products.js
 */
const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(__dirname, '../../../stores.gymntonic.com');

function extractProducts() {
  const indexHtml = fs.readFileSync(path.join(STORE_DIR, 'index.html'), 'utf-8');
  const products = [];

  // Extract product listings from the homepage HTML
  const productRegex = /data-product="(\d+)"[\s\S]*?href="([^"]+)"[\s\S]*?<img src="([^"]+)"[\s\S]*?alt="([^"]*)"[\s\S]*?<\/em>/g;
  
  // Also scan product directories
  const dirs = fs.readdirSync(STORE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .filter(d => !['assets', 'product_images', 'custom', 'brands', 'blog', 'tags',
      'sitemap', 'compare', 'service', '-strse-template'].includes(d.name))
    .filter(d => !d.name.startsWith('cart') && !d.name.startsWith('login') &&
      !d.name.startsWith('search') && !d.name.startsWith('proxy'));

  // Category slugs from the frontend
  const categoryDirs = [
    'accessories-unique-items', 'beauty-skin-care', 'hair-care-items',
    'protein-bars-snacks-sample-sizes', 'sample-sizes', 'peptides-lab-tested',
    'growth-hormones', 'prohormones-and-muscle-builders', 'cologne-pheromone-based',
    'perfumes-for-her', 'fat-burners-thermogenics', 'joint-ache-remedies',
    'liver-and-organ-protectants', 'syringes-medical-supplies', 'sleep-aids',
    'mood-enhancers-nootropics', 'special-nootropics',
    'natural-testosterone-boosters-prohormone-alternatives',
    'post-cycle-therapies-pct', 'pre-workout-formulas', 'dmaa',
    'sexual-aids-enhancers', 'liquids', 'nootropic-1-selling-product',
    'about-us', 'contact-gymntonic', 'legal-disclaimers', 'privacy-policy',
    'shipping-returns', 'gymntonic-blog'
  ];

  const productDirs = dirs.filter(d => !categoryDirs.includes(d.name));

  for (const dir of productDirs) {
    const indexPath = path.join(STORE_DIR, dir.name, 'index.html');
    if (!fs.existsSync(indexPath)) continue;

    try {
      const html = fs.readFileSync(indexPath, 'utf-8');

      // Extract product name
      const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const name = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : dir.name.replace(/-/g, ' ');

      // Extract price
      const priceMatch = html.match(/\$(\d+\.\d{2})/);
      const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

      // Extract retail price
      const retailMatch = html.match(/RetailPriceValue[^>]*>\$(\d+\.\d{2})/);
      const retailPrice = retailMatch ? parseFloat(retailMatch[1]) : null;

      // Extract description
      const descMatch = html.match(/ProductDescriptionContainer[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i);
      const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 2000) : '';

      // Extract image
      const imgMatch = html.match(/ProductThumbImage[\s\S]*?src="([^"]+)"/);
      const image = imgMatch ? imgMatch[1] : null;

      // Extract brand
      const brandMatch = html.match(/Brand:[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
      const brand = brandMatch ? brandMatch[1].trim() : null;

      // Extract product ID from data-product attribute
      const idMatch = html.match(/data-product="(\d+)"/);
      const originalId = idMatch ? parseInt(idMatch[1]) : null;

      if (name && price > 0) {
        products.push({
          name: name.substring(0, 500),
          slug: dir.name,
          description,
          price,
          retail_price: retailPrice,
          brand,
          image,
          original_id: originalId,
          is_active: true,
        });
      }
    } catch (err) {
      // Skip files that can't be read
    }
  }

  console.log(`✅ Extracted ${products.length} products from frontend`);
  
  // Scrape categories to map products to categories
  const categoryMap = {};
  for (const catSlug of categoryDirs) {
    const catPath = path.join(STORE_DIR, catSlug, 'index.html');
    if (!fs.existsSync(catPath)) continue;
    
    try {
      const html = fs.readFileSync(catPath, 'utf-8');
      // Find all product links in this category
      const linkRegex = /<li[^>]*class="[^"]*product[^"]*"[\s\S]*?<a[^>]*href="[^"]*\/([^"/]+)\/"/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        const productSlug = match[1];
        categoryMap[productSlug] = catSlug;
      }
    } catch (err) {
      // Ignore
    }
  }

  // Assign categories to products
  for (const product of products) {
    product.category_slug = categoryMap[product.slug] || categoryDirs[0]; // fallback to first category
  }

  // Write to JSON for seeding
  const outputPath = path.join(__dirname, 'products-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
  console.log(`📄 Saved to ${outputPath}`);

  return products;
}

// Run if called directly
if (require.main === module) {
  extractProducts();
}

module.exports = extractProducts;
