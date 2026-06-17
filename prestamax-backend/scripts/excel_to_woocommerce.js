#!/usr/bin/env node

/**
 * Excel to WooCommerce Product Importer Converter
 * 
 * This script converts an Excel inventory file to WooCommerce product import CSV format.
 * 
 * Usage:
 *   node excel_to_woocommerce.js --input inventory.xlsx --output woocommerce_products.csv
 * 
 * Options:
 *   --input, -i    Path to input Excel file (required)
 *   --output, -o   Path to output CSV file (default: woocommerce_products.csv)
 *   --help, -h     Show help
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// WooCommerce product import fields
const WOOCOMMERCE_FIELDS = [
  'ID',
  'Type',
  'SKU',
  'GTIN, UPC, EAN, or ISBN',
  'Name',
  'Published',
  'Is featured?',
  'Visibility in catalog',
  'Short description',
  'Description',
  'Date sale price starts',
  'Date sale price ends',
  'Tax status',
  'Tax class',
  'In stock?',
  'Stock',
  'Low stock amount',
  'Backorders allowed?',
  'Sold individually?',
  'Weight (kg)',
  'Length (cm)',
  'Width (cm)',
  'Height (cm)',
  'Allow customer reviews?',
  'Purchase note',
  'Sale price',
  'Regular price',
  'Categories',
  'Tags',
  'Shipping class',
  'Images',
  'Download limit',
  'Download expiry days',
  'Parent',
  'Grouped products',
  'Upsells',
  'Cross-sells',
  'External URL',
  'Button text',
  'Position',
  'Brands',
  'Attribute 1 name',
  'Attribute 1 value(s)',
  'Attribute 1 visible',
  'Attribute 1 global',
  'Attribute 2 name',
  'Attribute 2 value(s)',
  'Attribute 2 visible',
  'Attribute 2 global',
  'Attribute 3 name',
  'Attribute 3 value(s)',
  'Attribute 3 visible',
  'Attribute 3 global',
  'Meta: _min_variation_price',
  'Meta: _max_variation_price',
  'Meta: _min_variation_regular_price',
  'Meta: _max_variation_regular_price',
  'Meta: _min_variation_sale_price',
  'Meta: _max_variation_sale_price',
  'Meta: _tz_views',
  'Meta: slide_template',
  'Meta: _yoast_wpseo_primary_product_cat',
  'Meta: _yoast_wpseo_content_score',
  'Meta: _post_facebook_shares',
  'Meta: _post_twitter_shares',
  'Meta: _post_google_shares',
  'Meta: _post_pinterest_shares',
  'Meta: _post_vk_shares',
  'Meta: _post_mail_shares',
  'Meta: _wp_old_date',
  'Meta: chromium_post_custom_label',
  'Meta: mfn-post-love',
  'Attribute 1 default',
  'Attribute 4 name',
  'Attribute 4 value(s)',
  'Attribute 4 visible',
  'Attribute 4 global',
  'Meta: _post_linkedin_shares',
  'Meta: _post_tumblr_shares',
  'Meta: _wp_page_template',
  'Meta: _yoast_wpseo_primary_brand_year_model',
  'Meta: _yoast_wpseo_primary_tire_sizes',
  'Meta: _monsterinsights_sitenote_active',
  'Meta: _yoast_wpseo_estimated-reading-time-minutes'
];

/**
 * Default field mapping from common inventory fields to WooCommerce fields
 * Users can customize this mapping based on their Excel structure
 */
const DEFAULT_FIELD_MAPPING = {
  // Common inventory field names (lowercase) -> WooCommerce field name
  'id': 'ID',
  'sku': 'SKU',
  'codigo': 'SKU',
  'nombre': 'Name',
  'name': 'Name',
  'producto': 'Name',
  'descripcion': 'Description',
  'description': 'Description',
  'descripción': 'Description',
  'descripcion_corta': 'Short description',
  'short_description': 'Short description',
  'descripción_corta': 'Short description',
  'precio': 'Regular price',
  'price': 'Regular price',
  'precio_regular': 'Regular price',
  'regular_price': 'Regular price',
  'precio_venta': 'Sale price',
  'sale_price': 'Sale price',
  'stock': 'Stock',
  'cantidad': 'Stock',
  'quantity': 'Stock',
  'inventario': 'Stock',
  'categoria': 'Categories',
  'category': 'Categories',
  'categorias': 'Categories',
  'categories': 'Categories',
  'marca': 'Brands',
  'brand': 'Brands',
  'peso': 'Weight (kg)',
  'weight': 'Weight (kg)',
  'ancho': 'Width (cm)',
  'width': 'Width (cm)',
  'alto': 'Height (cm)',
  'height': 'Height (cm)',
  'largo': 'Length (cm)',
  'length': 'Length (cm)',
  'imagen': 'Images',
  'image': 'Images',
  'imagenes': 'Images',
  'images': 'Images',
  'etiquetas': 'Tags',
  'tags': 'Tags',
  'ean': 'GTIN, UPC, EAN, or ISBN',
  'upc': 'GTIN, UPC, EAN, or ISBN',
  'gtin': 'GTIN, UPC, EAN, or ISBN',
  'isbn': 'GTIN, UPC, EAN, or ISBN'
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    output: 'woocommerce_products.csv',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if ((arg === '--input' || arg === '-i') && i + 1 < args.length) {
      options.input = args[++i];
    } else if ((arg === '--output' || arg === '-o') && i + 1 < args.length) {
      options.output = args[++i];
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Excel to WooCommerce Product Importer Converter

Usage:
  node excel_to_woocommerce.js --input <excel-file> [--output <csv-file>]

Options:
  --input, -i    Path to input Excel file (required)
  --output, -o   Path to output CSV file (default: woocommerce_products.csv)
  --help, -h     Show this help message

Example:
  node excel_to_woocommerce.js -i inventory.xlsx -o products.csv

Field Mapping:
  The script automatically maps common inventory fields to WooCommerce format.
  Supported input fields include: SKU, Nombre, Precio, Stock, Categoría, etc.
  
  Default values:
  - Type: simple
  - Published: 1 (yes)
  - Visibility: visible
  - In stock?: 1 (yes) if Stock > 0
  - Tax status: taxable
  `);
}

/**
 * Read Excel file and return data as array of objects
 */
function readExcelFile(filePath) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    console.log(`Using sheet: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    
    console.log(`Found ${data.length} rows`);
    return data;
  } catch (error) {
    console.error(`Error reading Excel file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Normalize field name for matching
 */
function normalizeFieldName(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '_');
}

/**
 * Map inventory data to WooCommerce format
 */
function mapToWooCommerce(inventoryData) {
  console.log('Mapping data to WooCommerce format...');
  
  const woocommerceData = [];
  
  // Get input field names
  const inputFields = inventoryData.length > 0 ? Object.keys(inventoryData[0]) : [];
  console.log('Input fields:', inputFields.join(', '));
  
  // Create mapping from input fields to WooCommerce fields
  const fieldMapping = {};
  inputFields.forEach(field => {
    const normalizedField = normalizeFieldName(field);
    if (DEFAULT_FIELD_MAPPING[normalizedField]) {
      fieldMapping[field] = DEFAULT_FIELD_MAPPING[normalizedField];
    }
  });
  
  console.log('Field mapping:', JSON.stringify(fieldMapping, null, 2));
  
  inventoryData.forEach((row, index) => {
    const wooProduct = {};
    
    // Initialize all WooCommerce fields with empty values
    WOOCOMMERCE_FIELDS.forEach(field => {
      wooProduct[field] = '';
    });
    
    // Set default values
    wooProduct['Type'] = 'simple';
    wooProduct['Published'] = '1';
    wooProduct['Visibility in catalog'] = 'visible';
    wooProduct['Tax status'] = 'taxable';
    wooProduct['Allow customer reviews?'] = '1';
    
    // Map fields from inventory to WooCommerce
    Object.keys(row).forEach(inputField => {
      const wooField = fieldMapping[inputField];
      if (wooField) {
        wooProduct[wooField] = row[inputField];
      }
    });
    
    // Set stock status based on stock quantity
    if (wooProduct['Stock']) {
      const stock = parseFloat(wooProduct['Stock']) || 0;
      wooProduct['In stock?'] = stock > 0 ? '1' : '0';
    }
    
    // Ensure prices are formatted correctly (remove currency symbols, etc.)
    if (wooProduct['Regular price']) {
      wooProduct['Regular price'] = String(wooProduct['Regular price'])
        .replace(/[^\d.,]/g, '')
        .replace(',', '.');
    }
    if (wooProduct['Sale price']) {
      wooProduct['Sale price'] = String(wooProduct['Sale price'])
        .replace(/[^\d.,]/g, '')
        .replace(',', '.');
    }
    
    woocommerceData.push(wooProduct);
  });
  
  console.log(`Mapped ${woocommerceData.length} products`);
  return woocommerceData;
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data) {
  if (data.length === 0) {
    return '';
  }
  
  // Create CSV header
  const headers = WOOCOMMERCE_FIELDS;
  const csvRows = [headers.join(',')];
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Write CSV to file
 */
function writeCSVFile(csvContent, outputPath) {
  try {
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    console.log(`Successfully written to: ${outputPath}`);
  } catch (error) {
    console.error(`Error writing CSV file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  const options = parseArgs();
  
  if (options.help || !options.input) {
    showHelp();
    if (!options.input) {
      console.error('\nError: --input parameter is required');
      process.exit(1);
    }
    return;
  }
  
  // Check if input file exists
  if (!fs.existsSync(options.input)) {
    console.error(`Error: Input file not found: ${options.input}`);
    process.exit(1);
  }
  
  console.log('\n=== Excel to WooCommerce Converter ===\n');
  
  // Read Excel file
  const inventoryData = readExcelFile(options.input);
  
  if (inventoryData.length === 0) {
    console.error('Error: No data found in Excel file');
    process.exit(1);
  }
  
  // Map to WooCommerce format
  const woocommerceData = mapToWooCommerce(inventoryData);
  
  // Convert to CSV
  const csvContent = convertToCSV(woocommerceData);
  
  // Write output file
  writeCSVFile(csvContent, options.output);
  
  console.log('\n✓ Conversion completed successfully!');
  console.log(`\nNext steps:`);
  console.log(`1. Review the output file: ${options.output}`);
  console.log(`2. Import it to WooCommerce via Products > Import`);
  console.log(`3. Adjust any fields as needed in WooCommerce\n`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  readExcelFile,
  mapToWooCommerce,
  convertToCSV,
  WOOCOMMERCE_FIELDS,
  DEFAULT_FIELD_MAPPING
};
