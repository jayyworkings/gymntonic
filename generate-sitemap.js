/**
 * Sitemap Generator for storesgymntonic.com
 * Scans the frontend directory for all pages with index.html
 * and generates a sitemap.xml file in the frontend root.
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://storesgymntonic.com';
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const OUTPUT_FILE = path.join(FRONTEND_DIR, 'sitemap.xml');

// Directories to exclude (external CDN mirrors, image hosts, etc.)
const EXCLUDE_PATTERNS = [
  /^cdn\d*\./,
  /^[0-9]+\./,            // e.g. 1.bp.blogspot.com, 5.imimg.com
  /\.com$/,               // external domain mirrors like anabolicminds.com
  /\.net$/,
  /\.org$/,
  /\.co$/,
  /\.co\.uk$/,
  /\.in$/,
  /\.ua$/,
  /^[a-z]\d*\./,          // e.g. i.ebayimg.com, m.media-amazon.com
  /^images/,
  /^assets\./,
  /^store\./,
  /^box\./,
  /^domf/,
  /^d2/,
  /^3dtxp/,
  /^ecx\./,
  /^g-ecx\./,
  /^fimgs\./,
  /^gw\.cwa\./,
  /^gallery\./,
  /^hips\./,
  /^lib\./,
  /^media\./,
  /^pbs\./,
  /^fonts\./,
  /^product_images$/,
  /^assets$/,
];

// Category pages get higher priority
const CATEGORY_SLUGS = [
  'accessories-unique-items',
  'beauty-skin-care',
  'hair-care-items',
  'protein-bars-snacks-sample-sizes',
  'sample-sizes',
  'peptides-lab-tested',
  'growth-hormones',
  'prohormones-and-muscle-builders',
  'cologne-pheromone-based',
  'perfumes-for-her',
  'fat-burners-thermogenics',
  'joint-ache-remedies',
  'liver-and-organ-protectants',
  'syringes-medical-supplies',
  'sleep-aids',
  'mood-enhancers-nootropics',
  'special-nootropics',
  'natural-testosterone-boosters-prohormone-alternatives',
  'post-cycle-therapies-pct',
  'pre-workout-formulas',
  'dmaa',
  'sexual-aids-enhancers',
  'liquids',
  'new-nitro-boosters',
];

// Static pages
const STATIC_PAGES = [
  'about-us',
  'contact-gymntonic',
  'legal-disclaimers',
  'privacy-policy',
  'service',
  'shipping-returns',
  'gymntonic-blog',
  'brands',
  'blog',
];

function shouldExclude(dirName) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(dirName));
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function generateSitemap() {
  const today = getToday();
  const urls = [];

  // 1. Homepage
  urls.push({
    loc: `${SITE_URL}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0',
  });

  // 2. Scan all subdirectories of frontend that contain index.html
  const dirs = fs.readdirSync(FRONTEND_DIR, { withFileTypes: true });

  for (const dirent of dirs) {
    if (!dirent.isDirectory()) continue;
    if (shouldExclude(dirent.name)) continue;

    const indexPath = path.join(FRONTEND_DIR, dirent.name, 'index.html');
    if (!fs.existsSync(indexPath)) continue;

    let priority = '0.5';
    let changefreq = 'weekly';

    if (CATEGORY_SLUGS.includes(dirent.name)) {
      priority = '0.8';
      changefreq = 'weekly';
    } else if (STATIC_PAGES.includes(dirent.name)) {
      priority = '0.6';
      changefreq = 'monthly';
    }

    urls.push({
      loc: `${SITE_URL}/${dirent.name}/`,
      lastmod: today,
      changefreq,
      priority,
    });
  }

  // 3. Build the XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';

  fs.writeFileSync(OUTPUT_FILE, xml, 'utf-8');
  console.log(`✅ Sitemap generated with ${urls.length} URLs → ${OUTPUT_FILE}`);
}

generateSitemap();
