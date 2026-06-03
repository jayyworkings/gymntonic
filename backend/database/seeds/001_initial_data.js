const bcrypt = require('bcryptjs');
const { slugify } = require('../../src/utils/helpers');

/**
 * Seed initial data: admin user, categories, and sample products
 */
exports.seed = async function (knex) {
  // ─── Admin User ────────────────────────────────────────
  const adminExists = await knex('users').where({ email: 'admin@gymntonic.com' }).first();
  if (!adminExists) {
    const hash = await bcrypt.hash('Admin@2026!', 12);
    await knex('users').insert({
      email: 'admin@gymntonic.com',
      password_hash: hash,
      first_name: 'GymNTonic',
      last_name: 'Admin',
      role: 'admin',
    });
    console.log('✅ Admin user created: admin@gymntonic.com / Admin@2026!');
  }

  // ─── Categories (from frontend analysis) ───────────────
  const categories = [
    { name: 'Accessories + Unique Items', slug: 'accessories-unique-items' },
    { name: 'Beauty + Skin Care', slug: 'beauty-skin-care' },
    { name: 'Hair Care Items', slug: 'hair-care-items', parent_slug: 'beauty-skin-care' },
    { name: 'Protein Bars + Snacks + Sample Sizes', slug: 'protein-bars-snacks-sample-sizes' },
    { name: 'Sample Sizes', slug: 'sample-sizes', parent_slug: 'protein-bars-snacks-sample-sizes' },
    { name: 'Peptides (Lab Tested)', slug: 'peptides-lab-tested' },
    { name: 'Growth Hormones', slug: 'growth-hormones' },
    { name: 'ProHormones and Muscle Builders', slug: 'prohormones-and-muscle-builders' },
    { name: 'Cologne - Pheromone Based', slug: 'cologne-pheromone-based' },
    { name: 'Perfumes For Her', slug: 'perfumes-for-her', parent_slug: 'cologne-pheromone-based' },
    { name: 'Fat Burners / Thermogenics', slug: 'fat-burners-thermogenics' },
    { name: 'Joint Repair', slug: 'joint-ache-remedies' },
    { name: 'Liver and Organ Protectants', slug: 'liver-and-organ-protectants' },
    { name: 'Syringes + Medical Supplies', slug: 'syringes-medical-supplies' },
    { name: 'Sleep Aids', slug: 'sleep-aids', parent_slug: 'syringes-medical-supplies' },
    { name: 'Mood Enhancers + Nootropics', slug: 'mood-enhancers-nootropics' },
    { name: 'Special Nootropics', slug: 'special-nootropics', parent_slug: 'mood-enhancers-nootropics' },
    { name: 'Natural Testosterone Boosters', slug: 'natural-testosterone-boosters-prohormone-alternatives' },
    { name: 'Post Cycle Therapies (PCT)', slug: 'post-cycle-therapies-pct' },
    { name: 'Pre-Workout Formulas', slug: 'pre-workout-formulas' },
    { name: 'DMAA', slug: 'dmaa', parent_slug: 'pre-workout-formulas' },
    { name: 'Sexual Aids / Enhancers', slug: 'sexual-aids-enhancers' },
    { name: 'Liquids', slug: 'liquids', parent_slug: 'sexual-aids-enhancers' },
  ];

  for (const cat of categories) {
    const exists = await knex('categories').where({ slug: cat.slug }).first();
    if (!exists) {
      let parent_id = null;
      if (cat.parent_slug) {
        const parent = await knex('categories').where({ slug: cat.parent_slug }).first();
        parent_id = parent ? parent.id : null;
      }
      await knex('categories').insert({
        name: cat.name,
        slug: cat.slug,
        parent_id,
        is_active: true,
      });
    }
  }
  console.log('✅ Categories seeded');

  // ─── Sample Products (top sellers from frontend) ───────
  const sampleProducts = [
    { name: 'SemaGlutide - 5mgs bottle (LAB TESTED - SUPER HIGH QUALITY)', slug: 'semaglutide-5mgs-bottle-lab-tested-super-high-quality-1-selling-brand-in-the-usa', price: 99.99, category_slug: 'peptides-lab-tested', brand: 'GymNtonic', is_featured: true, stock_quantity: 50 },
    { name: 'BAC Water aka Bacteriostatic water (30mL) by GYMnTONIC', slug: 'bac-water-aka-bacteriostatic-water-30ml-by-gymntonic', price: 11.00, category_slug: 'syringes-medical-supplies', brand: 'GymNtonic', is_featured: false, stock_quantity: 200 },
    { name: 'BPC-157 by GYMnTONIC Supplements', slug: 'bpc-157-by-gymntonic-supplements', price: 39.99, category_slug: 'peptides-lab-tested', brand: 'GymNtonic', is_featured: true, stock_quantity: 100 },
    { name: 'IMelt (Insane Fat Burner)', slug: 'imelt-insane-fat-burner', price: 69.99, retail_price: 99.99, category_slug: 'fat-burners-thermogenics', brand: 'Iron Mag Labs', is_featured: true, stock_quantity: 30 },
    { name: 'Methyl Blue by MA Labs (Nootropic / Stimulant)', slug: 'methyl-blue-by-ma-labs-nootropic-stimulant', price: 59.99, category_slug: 'mood-enhancers-nootropics', brand: 'MA Labs', is_featured: true, stock_quantity: 0 },
    { name: 'Brain Storm (Super Nootropic + Mood Enhancer) by KJ Labs', slug: 'brain-storm-super-nootropic-mood-enhancer-by-kj-labs-brand-new-may-2026', price: 59.99, category_slug: 'mood-enhancers-nootropics', brand: 'KJ Labs', is_featured: false, stock_quantity: 0 },
    { name: 'Smash AMF (Extreme PWO) by KJ LABS', slug: 'smash-amf-extreme-stim-pwo-by-kj-labs-new', price: 59.99, category_slug: 'pre-workout-formulas', brand: 'KJ Labs', is_featured: true, stock_quantity: 25 },
    { name: 'Liv-52 DS (Double Strength) by Himalaya', slug: 'liv-52-ds-double-strength-by-himalaya-from-india-documentation-provided', price: 13.99, retail_price: 19.99, category_slug: 'liver-and-organ-protectants', brand: 'Himalaya', is_featured: false, stock_quantity: 80 },
    { name: 'Test Battery (Testosterone Booster) by KJ Labs', slug: 'test-battery-testosterone-booster-by-kj-labs', price: 64.99, category_slug: 'natural-testosterone-boosters-prohormone-alternatives', brand: 'KJ Labs', is_featured: false, stock_quantity: 40 },
    { name: 'Incinerate (Fat Burner) AOD-9604', slug: 'incinerate-fat-burner-aod-9604', price: 69.99, category_slug: 'fat-burners-thermogenics', brand: 'GymNtonic', is_featured: true, stock_quantity: 35 },
  ];

  for (const prod of sampleProducts) {
    const exists = await knex('products').where({ slug: prod.slug }).first();
    if (!exists) {
      const category = await knex('categories').where({ slug: prod.category_slug }).first();
      await knex('products').insert({
        name: prod.name,
        slug: prod.slug,
        price: prod.price,
        retail_price: prod.retail_price || null,
        brand: prod.brand,
        category_id: category ? category.id : null,
        is_featured: prod.is_featured,
        stock_quantity: prod.stock_quantity,
        is_active: true,
        description: `${prod.name} - Available at GymNTonic Supplements.`,
      });
    }
  }
  console.log('✅ Sample products seeded');

  // ─── CMS Pages ────────────────────────────────────────
  const pages = [
    { title: 'About Us', slug: 'about-us', content: '<h1>About GymNTonic</h1><p>Your trusted supplement store since 2017.</p>' },
    { title: 'Legal + Disclaimers', slug: 'legal-disclaimers', content: '<h1>Legal Disclaimers</h1><p>All products are for research purposes only.</p>' },
    { title: 'Privacy Policy', slug: 'privacy-policy', content: '<h1>Privacy Policy</h1><p>We respect your privacy.</p>' },
    { title: 'Shipping & Returns', slug: 'shipping-returns', content: '<h1>Shipping & Returns</h1><p>Free shipping on orders over $100.</p>' },
  ];

  for (const page of pages) {
    const exists = await knex('cms_pages').where({ slug: page.slug }).first();
    if (!exists) await knex('cms_pages').insert(page);
  }
  console.log('✅ CMS pages seeded');

  // ─── Sample Coupon ────────────────────────────────────
  const couponExists = await knex('coupons').where({ code: 'WELCOME10' }).first();
  if (!couponExists) {
    await knex('coupons').insert({
      code: 'WELCOME10',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 25,
      max_discount: 50,
      valid_from: new Date(),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      is_active: true,
    });
    console.log('✅ Welcome coupon created: WELCOME10 (10% off)');
  }
};
